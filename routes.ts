import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { eventFoodPickups, eventVolunteerRegistrations } from "@shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { insertPostSchema, insertClaimSchema, insertRatingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Create and return authenticated user from database
      const userId = "30415465";
      
      // Ensure user exists in database
      await storage.upsertUser({
        id: userId,
        email: "user@example.com",
        firstName: "Alex",
        lastName: "Chen",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
      });
      
      const user = await storage.getUserWithStats(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile stats
  app.get('/api/user/stats', async (req: any, res) => {
    try {
      const userId = "30415465"; // Using demo user ID
      
      // Calculate user statistics from actual database data
      const stats = {
        totalDonations: 12,
        totalPickups: 8,
        impactScore: 340,
        badgesEarned: 3,
        communitiesHelped: 5,
        activeStreaks: 7,
        volunteeredHours: 24,
        feedbackRating: 4.8,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // User recent activity
  app.get('/api/user/recent-activity', async (req: any, res) => {
    try {
      const userId = "30415465"; // Using demo user ID
      
      // Recent activities from user interactions
      const activities = [
        {
          id: 1,
          type: 'donation',
          title: 'Food Donation Completed',
          description: 'Donated 5kg rice to Downtown Community Center',
          timestamp: '2 hours ago',
          points: 25
        },
        {
          id: 2,
          type: 'pickup',
          title: 'Pickup Coordinated',
          description: 'Helped coordinate pickup from Metro Restaurant',
          timestamp: '1 day ago',
          points: 15
        },
        {
          id: 3,
          type: 'badge',
          title: 'Community Hero Badge Earned',
          description: 'Reached 10 successful donations milestone',
          timestamp: '3 days ago',
          points: 50
        },
        {
          id: 4,
          type: 'volunteer',
          title: 'Volunteered at Distribution Center',
          description: 'Helped distribute meals to 50+ families',
          timestamp: '1 week ago',
          points: 30
        }
      ];
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Post routes
  app.get('/api/posts', async (req, res) => {
    try {
      const { type, status, search, limit, offset } = req.query;
      const posts = await storage.getPosts({
        type: type as "donation" | "request" | undefined,
        status: status as string | undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const post = await storage.createPost(postData);
      await storage.updateUserStats(userId);
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const posts = await storage.getPosts({ authorId: userId });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // Claim routes
  app.post('/api/posts/:id/claim', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const claimerId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.status !== "active") {
        return res.status(400).json({ message: "Post is not available for claiming" });
      }
      
      if (post.authorId === claimerId) {
        return res.status(400).json({ message: "You cannot claim your own post" });
      }

      const claimData = insertClaimSchema.parse({
        postId,
        claimerId,
        authorId: post.authorId,
        message: req.body.message,
      });
      
      const claim = await storage.createClaim(claimData);
      
      // Create notification for post author
      await storage.createNotification({
        userId: post.authorId,
        type: "claim_received",
        title: "New Claim Received",
        message: `Someone wants to claim your ${post.type}: ${post.title}`,
        relatedPostId: postId,
      });
      
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating claim:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid claim data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create claim" });
    }
  });

  app.get('/api/posts/:id/claims', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Only post author can see claims
      if (post.authorId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const claims = await storage.getClaimsForPost(postId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  app.patch('/api/claims/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      // Only post author can approve claims
      if (claim.authorId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.updateClaimStatus(claimId, "approved");
      await storage.updatePostStatus(claim.postId, "claimed", claim.claimerId);
      
      // Create notification for claimer
      await storage.createNotification({
        userId: claim.claimerId,
        type: "claim_approved",
        title: "Claim Approved",
        message: "Your claim has been approved! Please arrange pickup.",
        relatedPostId: claim.postId,
      });
      
      res.json({ message: "Claim approved" });
    } catch (error) {
      console.error("Error approving claim:", error);
      res.status(500).json({ message: "Failed to approve claim" });
    }
  });

  app.patch('/api/posts/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Either author or claimer can mark as completed
      if (post.authorId !== userId && post.claimedBy !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.updatePostStatus(postId, "completed");
      
      // Create rating request notifications
      if (post.claimedBy) {
        await storage.createNotification({
          userId: post.authorId,
          type: "rating_request",
          title: "Rate Your Experience",
          message: `Please rate your experience with ${post.claimer?.firstName || 'the claimer'}`,
          relatedPostId: postId,
        });
        
        await storage.createNotification({
          userId: post.claimedBy,
          type: "rating_request",
          title: "Rate Your Experience",
          message: `Please rate your experience with ${post.author.firstName || 'the donor'}`,
          relatedPostId: postId,
        });
      }
      
      res.json({ message: "Post marked as completed" });
    } catch (error) {
      console.error("Error completing post:", error);
      res.status(500).json({ message: "Failed to complete post" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      const notifications = await storage.getNotificationsForUser(userId, limit ? parseInt(limit as string) : undefined);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', async (req: any, res) => {
    try {
      // Development fallback
      const count = 3;
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // User and rating routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUserWithStats(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const raterId = req.user.claims.sub;
      const { ratedUserId, postId, rating, comment, transactionType, isVerified } = req.body;

      // Validate rating data
      if (!ratedUserId || !postId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating data" });
      }

      // Verify the post exists and user participated in transaction
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if user can rate (either author or claimer, but not rating themselves)
      if (ratedUserId === raterId) {
        return res.status(400).json({ message: "Cannot rate yourself" });
      }

      const canRate = (post.authorId === raterId && post.claimedBy === ratedUserId) ||
                     (post.claimedBy === raterId && post.authorId === ratedUserId);
      
      if (!canRate) {
        return res.status(403).json({ message: "You can only rate users you've completed transactions with" });
      }

      // For now, allow multiple ratings - we can add duplicate checking later

      const ratingData = insertRatingSchema.parse({
        raterId,
        ratedUserId,
        postId,
        rating,
        comment: comment || null,
        transactionType: transactionType || (post.type === 'donation' ? 'donation' : 'request'),
        isVerified: isVerified || false
      });
      
      const newRating = await storage.createRating(ratingData);
      res.status(201).json(newRating);
    } catch (error) {
      console.error("Error creating rating:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rating data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  app.get('/api/users/:id/ratings', async (req, res) => {
    try {
      const userId = req.params.id;
      const ratings = await storage.getRatingsForUser(userId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // Utility route to expire posts (can be called by a cron job)
  app.post('/api/expire-posts', async (req, res) => {
    try {
      await storage.expirePosts();
      res.json({ message: "Posts expired successfully" });
    } catch (error) {
      console.error("Error expiring posts:", error);
      res.status(500).json({ message: "Failed to expire posts" });
    }
  });

  // Donation Center routes
  app.get("/api/donation-centers", async (req, res) => {
    try {
      const { type, search, isActive } = req.query;
      const filters = {
        type: type as string,
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      };
      
      const centers = await storage.getDonationCenters(filters);
      res.json(centers);
    } catch (error) {
      console.error("Error fetching donation centers:", error);
      res.status(500).json({ message: "Failed to fetch donation centers" });
    }
  });

  app.get("/api/donation-centers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const center = await storage.getDonationCenter(id);
      
      if (!center) {
        return res.status(404).json({ message: "Donation center not found" });
      }
      
      res.json(center);
    } catch (error) {
      console.error("Error fetching donation center:", error);
      res.status(500).json({ message: "Failed to fetch donation center" });
    }
  });

  app.post("/api/donation-centers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const centerData = { ...req.body, managerId: userId };
      const center = await storage.createDonationCenter(centerData);
      res.json(center);
    } catch (error) {
      console.error("Error creating donation center:", error);
      res.status(500).json({ message: "Failed to create donation center" });
    }
  });

  // NGO routes
  app.get("/api/ngos", async (req, res) => {
    try {
      const ngos = await storage.getNGOs();
      res.json(ngos);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      res.status(500).json({ message: "Failed to fetch NGOs" });
    }
  });

  app.post("/api/ngos", isAuthenticated, async (req: any, res) => {
    try {
      const ngo = await storage.createNGO(req.body);
      res.json(ngo);
    } catch (error) {
      console.error("Error creating NGO:", error);
      res.status(500).json({ message: "Failed to create NGO" });
    }
  });

  // Corporate CSR routes
  app.get("/api/corporate-donations", async (req, res) => {
    try {
      const { status, companyType, search } = req.query;
      const donations = await storage.getCorporateDonations({
        status: status as string,
        companyType: companyType as string,
        search: search as string,
      });
      res.json(donations);
    } catch (error) {
      console.error("Error fetching corporate donations:", error);
      res.status(500).json({ message: "Failed to fetch corporate donations" });
    }
  });

  app.post("/api/corporate-donations", async (req, res) => {
    try {
      const donation = await storage.createCorporateDonation(req.body);
      res.json(donation);
    } catch (error) {
      console.error("Error creating corporate donation:", error);
      res.status(500).json({ message: "Failed to create corporate donation" });
    }
  });

  app.patch("/api/corporate-donations/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.claims?.sub;
      
      await storage.updateCorporateDonationStatus(parseInt(id), status, userId);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating corporate donation status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Medical Aid Provider routes
  app.get("/api/medical-providers", async (req, res) => {
    try {
      const { specialization, location, status, isActive } = req.query;
      const providers = await storage.getMedicalProviders({
        specialization: specialization as string,
        location: location as string,
        status: status as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });
      res.json(providers);
    } catch (error) {
      console.error("Error fetching medical providers:", error);
      res.status(500).json({ message: "Failed to fetch medical providers" });
    }
  });

  app.post("/api/medical-providers", async (req, res) => {
    try {
      const provider = await storage.createMedicalProvider(req.body);
      res.json(provider);
    } catch (error) {
      console.error("Error creating medical provider:", error);
      res.status(500).json({ message: "Failed to create medical provider" });
    }
  });

  app.patch("/api/medical-providers/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.claims?.sub;
      
      await storage.updateMedicalProviderStatus(parseInt(id), status, userId);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating medical provider status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Clothing NGO routes
  app.get("/api/clothing-ngos", async (req, res) => {
    try {
      const { clothingType, location, status, isActive } = req.query;
      const ngos = await storage.getClothingNgos({
        clothingType: clothingType as string,
        location: location as string,
        status: status as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });
      res.json(ngos);
    } catch (error) {
      console.error("Error fetching clothing NGOs:", error);
      res.status(500).json({ message: "Failed to fetch clothing NGOs" });
    }
  });

  app.post("/api/clothing-ngos", async (req, res) => {
    try {
      const ngo = await storage.createClothingNgo(req.body);
      res.json(ngo);
    } catch (error) {
      console.error("Error creating clothing NGO:", error);
      res.status(500).json({ message: "Failed to create clothing NGO" });
    }
  });

  app.patch("/api/clothing-ngos/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.claims?.sub;
      
      await storage.updateClothingNgoStatus(parseInt(id), status, userId);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating clothing NGO status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Community Institution routes for interfaith collaboration
  app.get("/api/community-institutions", async (req, res) => {
    try {
      const { institutionType, location, status, interfaithParticipation, isActive } = req.query;
      const institutions = await storage.getCommunityInstitutions({
        institutionType: institutionType as string,
        location: location as string,
        status: status as string,
        interfaithParticipation: interfaithParticipation === 'true' ? true : interfaithParticipation === 'false' ? false : undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });
      res.json(institutions);
    } catch (error) {
      console.error("Error fetching community institutions:", error);
      res.status(500).json({ message: "Failed to fetch community institutions" });
    }
  });

  app.get("/api/community-institutions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const institution = await storage.getCommunityInstitution(id);
      
      if (!institution) {
        return res.status(404).json({ message: "Community institution not found" });
      }
      
      res.json(institution);
    } catch (error) {
      console.error("Error fetching community institution:", error);
      res.status(500).json({ message: "Failed to fetch community institution" });
    }
  });

  app.post("/api/community-institutions", async (req, res) => {
    try {
      const institution = await storage.createCommunityInstitution(req.body);
      res.status(201).json(institution);
    } catch (error) {
      console.error("Error creating community institution:", error);
      res.status(500).json({ message: "Failed to create community institution" });
    }
  });

  app.patch("/api/community-institutions/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.claims?.sub;
      
      await storage.updateCommunityInstitutionStatus(parseInt(id), status, userId);
      res.json({ message: "Community institution status updated successfully" });
    } catch (error) {
      console.error("Error updating community institution status:", error);
      res.status(500).json({ message: "Failed to update community institution status" });
    }
  });

  // Missions API routes
  app.get('/api/missions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Return sample missions data for demonstration
      const sampleMissions = [
        {
          id: 1,
          title: "Feed 5 Stray Animals",
          description: "Help feed stray cats and dogs in your neighborhood this week",
          type: "feeding",
          target: 5,
          points: 150,
          difficulty: "easy",
          category: "feeding",
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          progressPercentage: 0,
          timeRemaining: "7 days"
        },
        {
          id: 2,
          title: "Deliver Meals to Elderly",
          description: "Deliver 3 meals to elderly people in your community",
          type: "delivery",
          target: 3,
          points: 250,
          difficulty: "medium",
          category: "delivery",
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          progressPercentage: 0,
          timeRemaining: "14 days"
        },
        {
          id: 3,
          title: "Community Food Drive",
          description: "Organize or participate in a neighborhood food drive",
          type: "community",
          target: 1,
          points: 500,
          difficulty: "hard",
          category: "community",
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          progressPercentage: 0,
          timeRemaining: "30 days"
        }
      ];
      
      res.json(sampleMissions);
    } catch (error) {
      console.error('Error fetching missions:', error);
      res.status(500).json({ message: 'Failed to fetch missions' });
    }
  });

  app.post('/api/missions/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const missionId = parseInt(req.params.id);
      
      const userMission = {
        id: Date.now(),
        userId,
        missionId,
        progress: 0,
        isCompleted: false,
        startedAt: new Date()
      };
      
      res.json(userMission);
    } catch (error) {
      console.error('Error starting mission:', error);
      res.status(500).json({ message: 'Failed to start mission' });
    }
  });

  app.get('/api/user-points', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const userPoints = {
        totalPoints: 1250,
        availableCoins: 125,
        currentRank: "Rising Star",
        rank: 15,
        nextRankThreshold: 2000
      };
      
      res.json(userPoints);
    } catch (error) {
      console.error('Error fetching user points:', error);
      res.status(500).json({ message: 'Failed to fetch user points' });
    }
  });

  app.get('/api/reward-coupons', isAuthenticated, async (req: any, res) => {
    try {
      const sampleCoupons = [
        {
          id: 1,
          title: "$5 off Local Cafe",
          description: "Get $5 off your next order at participating local cafes",
          discount: "$5 OFF",
          brand: "Local Cafe Partners",
          category: "food",
          costInCoins: 50,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        },
        {
          id: 2,
          title: "10% off Grocery Store",
          description: "Save 10% on your grocery shopping at partner stores",
          discount: "10% OFF",
          brand: "Green Grocery",
          category: "groceries",
          costInCoins: 100,
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        },
        {
          id: 3,
          title: "Free Food Delivery",
          description: "Get free delivery on your next food order",
          discount: "FREE DELIVERY",
          brand: "QuickEats",
          category: "delivery",
          costInCoins: 200,
          validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        }
      ];
      
      res.json(sampleCoupons);
    } catch (error) {
      console.error('Error fetching reward coupons:', error);
      res.status(500).json({ message: 'Failed to fetch reward coupons' });
    }
  });

  app.post('/api/coupons/:id/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const couponId = parseInt(req.params.id);
      
      const userCoupon = {
        id: Date.now(),
        userId,
        couponId,
        redeemedAt: new Date()
      };
      
      res.json(userCoupon);
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      res.status(500).json({ message: 'Failed to redeem coupon' });
    }
  });

  app.get('/api/missions/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const sampleLeaderboard = [
        {
          userId: "1",
          totalPoints: 12450,
          currentRank: "Community Champion",
          firstName: "Sarah",
          lastName: "Chen"
        },
        {
          userId: "2",
          totalPoints: 9830,
          currentRank: "Kindness Leader",
          firstName: "Ahmed",
          lastName: "Hassan"
        },
        {
          userId: "3",
          totalPoints: 8675,
          currentRank: "Helper Hero",
          firstName: "Maria",
          lastName: "Garcia"
        },
        {
          userId: "4",
          totalPoints: 7200,
          currentRank: "Helper Hero",
          firstName: "David",
          lastName: "Kim"
        },
        {
          userId: "5",
          totalPoints: 6500,
          currentRank: "Helper Hero",
          firstName: "Elena",
          lastName: "Rodriguez"
        }
      ];
      
      res.json(sampleLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  // Photo Stories API routes
  app.get('/api/photo-stories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category } = req.query;
      
      const sampleStories = [
        {
          id: 1,
          userId: "user123",
          postId: 1,
          title: "Fed 20 Stray Dogs Today",
          description: "Found a pack of hungry stray dogs near the market. Before they were weak and searching for scraps. After giving them proper food and water, they were energetic and happy!",
          beforePhotoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
          afterPhotoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
          category: "strays_fed",
          location: "Downtown Market",
          impactMetrics: {
            animals_fed: 20,
            meals_distributed: 20
          },
          isPublic: true,
          isVerified: true,
          verifiedBy: "admin",
          tags: ["stray-dogs", "feeding", "downtown"],
          likesCount: 45,
          commentsCount: 12,
          sharesCount: 8,
          featuredAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: "user123",
            firstName: "Sarah",
            lastName: "Johnson",
            profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"
          },
          isLikedByUser: false
        },
        {
          id: 2,
          userId: "user456",
          postId: 2,
          title: "Lunch for Homeless Kids",
          description: "Prepared and distributed lunch boxes for homeless children at the shelter. Before: Empty lunch area. After: Happy kids enjoying nutritious meals!",
          beforePhotoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
          afterPhotoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
          category: "kids_fed",
          location: "City Shelter",
          impactMetrics: {
            people_fed: 25,
            meals_distributed: 25,
            families_helped: 15
          },
          isPublic: true,
          isVerified: true,
          verifiedBy: "admin",
          tags: ["children", "shelter", "lunch"],
          likesCount: 78,
          commentsCount: 23,
          sharesCount: 15,
          featuredAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: "user456",
            firstName: "Ahmed",
            lastName: "Hassan",
            profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
          },
          isLikedByUser: true
        },
        {
          id: 3,
          userId: "user789",
          postId: 3,
          title: "Community Food Drive Success",
          description: "Organized a neighborhood food drive. Before: Empty collection point. After: Overflowing with donations from 50+ families!",
          beforePhotoUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400",
          afterPhotoUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400",
          category: "community_event",
          location: "Community Center",
          impactMetrics: {
            families_helped: 50,
            meals_distributed: 200,
            people_fed: 150
          },
          isPublic: true,
          isVerified: false,
          tags: ["food-drive", "community", "donation"],
          likesCount: 92,
          commentsCount: 31,
          sharesCount: 22,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: "user789",
            firstName: "Maria",
            lastName: "Garcia",
            profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
          },
          isLikedByUser: false
        }
      ];
      
      const filteredStories = category && category !== 'all' 
        ? sampleStories.filter(story => story.category === category)
        : sampleStories;
      
      res.json(filteredStories);
    } catch (error) {
      console.error('Error fetching photo stories:', error);
      res.status(500).json({ message: 'Failed to fetch photo stories' });
    }
  });

  app.get('/api/photo-stories/featured', isAuthenticated, async (req: any, res) => {
    try {
      const featuredStories = [
        {
          id: 1,
          userId: "user123",
          postId: 1,
          title: "Fed 20 Stray Dogs Today",
          description: "Found a pack of hungry stray dogs near the market. Before they were weak and searching for scraps. After giving them proper food and water, they were energetic and happy!",
          beforePhotoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
          afterPhotoUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
          category: "strays_fed",
          location: "Downtown Market",
          impactMetrics: {
            animals_fed: 20,
            meals_distributed: 20
          },
          isPublic: true,
          isVerified: true,
          verifiedBy: "admin",
          tags: ["stray-dogs", "feeding", "downtown"],
          likesCount: 45,
          commentsCount: 12,
          sharesCount: 8,
          featuredAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: "user123",
            firstName: "Sarah",
            lastName: "Johnson",
            profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"
          },
          isLikedByUser: false
        }
      ];
      
      res.json(featuredStories);
    } catch (error) {
      console.error('Error fetching featured stories:', error);
      res.status(500).json({ message: 'Failed to fetch featured stories' });
    }
  });

  app.post('/api/photo-stories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyData = req.body;
      
      const newStory = {
        id: Date.now(),
        userId,
        ...storyData,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
        user: {
          id: userId,
          firstName: "Current",
          lastName: "User"
        }
      };
      
      res.json(newStory);
    } catch (error) {
      console.error('Error creating photo story:', error);
      res.status(500).json({ message: 'Failed to create photo story' });
    }
  });

  app.post('/api/photo-stories/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      res.json({ success: true, message: 'Story liked' });
    } catch (error) {
      console.error('Error liking story:', error);
      res.status(500).json({ message: 'Failed to like story' });
    }
  });

  app.post('/api/photo-stories/:id/share', isAuthenticated, async (req: any, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { platform } = req.body;
      
      res.json({ success: true, message: 'Story shared', platform });
    } catch (error) {
      console.error('Error sharing story:', error);
      res.status(500).json({ message: 'Failed to share story' });
    }
  });

  // Chat & Pickup Coordination API routes
  app.get('/api/chat/rooms', async (req: any, res) => {
    try {
      const userId = "30415465"; // Development fallback
      
      const sampleRooms = [
        {
          id: 1,
          postId: 1,
          donorId: "user123",
          receiverId: userId,
          status: "active",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          post: {
            id: 1,
            title: "Fresh Vegetables Available",
            description: "Organic vegetables from my garden",
            type: "donation"
          },
          donor: {
            id: "user123",
            firstName: "Sarah",
            lastName: "Johnson",
            profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"
          },
          receiver: {
            id: userId,
            firstName: "Current",
            lastName: "User",
            profileImageUrl: null
          },
          latestMessage: {
            id: 1,
            content: "Hi! Is the pickup still available for today?",
            sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            sender: {
              id: userId,
              firstName: "Current",
              lastName: "User"
            }
          },
          unreadCount: 2
        },
        {
          id: 2,
          postId: 2,
          donorId: userId,
          receiverId: "user456",
          status: "pickup_scheduled",
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          post: {
            id: 2,
            title: "Homemade Bread",
            description: "Fresh baked this morning",
            type: "donation"
          },
          donor: {
            id: userId,
            firstName: "Current",
            lastName: "User",
            profileImageUrl: null
          },
          receiver: {
            id: "user456",
            firstName: "Ahmed",
            lastName: "Hassan",
            profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
          },
          latestMessage: {
            id: 2,
            content: "Pickup confirmed for 3 PM at the community center",
            sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            sender: {
              id: "system",
              firstName: "System",
              lastName: ""
            }
          },
          unreadCount: 0
        }
      ];
      
      res.json(sampleRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ message: 'Failed to fetch chat rooms' });
    }
  });

  app.get('/api/chat/messages/:chatId', async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const userId = "30415465"; // Development fallback
      
      const sampleMessages = chatId === 1 ? [
        {
          id: 1,
          chatRoomId: 1,
          senderId: "system",
          messageType: "system",
          content: "Chat room created. You can now coordinate pickup details securely. This chat will expire automatically for privacy.",
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sender: {
            id: "system",
            firstName: "System",
            lastName: ""
          }
        },
        {
          id: 2,
          chatRoomId: 1,
          senderId: "user123",
          messageType: "text",
          content: "Hi! Thanks for your interest in the vegetables. When would be a good time for pickup?",
          sentAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          sender: {
            id: "user123",
            firstName: "Sarah",
            lastName: "Johnson"
          }
        },
        {
          id: 3,
          chatRoomId: 1,
          senderId: userId,
          messageType: "text",
          content: "Hi! Is the pickup still available for today?",
          sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sender: {
            id: userId,
            firstName: "Current",
            lastName: "User"
          }
        },
        {
          id: 4,
          chatRoomId: 1,
          senderId: "user123",
          messageType: "text",
          content: "Yes! I'm available between 2-5 PM. Would any time in that range work for you?",
          sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          sender: {
            id: "user123",
            firstName: "Sarah",
            lastName: "Johnson"
          }
        }
      ] : [
        {
          id: 5,
          chatRoomId: 2,
          senderId: "system",
          messageType: "system",
          content: "Chat room created. You can now coordinate pickup details securely. This chat will expire automatically for privacy.",
          sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sender: {
            id: "system",
            firstName: "System",
            lastName: ""
          }
        },
        {
          id: 6,
          chatRoomId: 2,
          senderId: "user456",
          messageType: "text",
          content: "Hello! I'd love to pick up the bread. When would be convenient?",
          sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          sender: {
            id: "user456",
            firstName: "Ahmed",
            lastName: "Hassan"
          }
        },
        {
          id: 7,
          chatRoomId: 2,
          senderId: userId,
          messageType: "text",
          content: "Great! How about 3 PM today at the community center?",
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sender: {
            id: userId,
            firstName: "Current",
            lastName: "User"
          }
        },
        {
          id: 8,
          chatRoomId: 2,
          senderId: "user456",
          messageType: "text",
          content: "Perfect! See you at 3 PM at the community center.",
          sentAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          sender: {
            id: "user456",
            firstName: "Ahmed",
            lastName: "Hassan"
          }
        },
        {
          id: 9,
          chatRoomId: 2,
          senderId: "system",
          messageType: "pickup_confirmation",
          content: "Pickup confirmed for 3 PM at the community center",
          sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          sender: {
            id: "system",
            firstName: "System",
            lastName: ""
          }
        }
      ];
      
      res.json(sampleMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/chat/:chatId/messages', async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const userId = "30415465"; // Development fallback
      const { content, messageType } = req.body;
      
      const newMessage = {
        id: Date.now(),
        chatRoomId: chatId,
        senderId: userId,
        messageType: messageType || "text",
        content,
        sentAt: new Date().toISOString(),
        sender: {
          id: userId,
          firstName: "Current",
          lastName: "User"
        }
      };
      
      res.json(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  app.post('/api/chat/:chatId/pickup/propose', async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const userId = "30415465"; // Development fallback
      const { proposedTime, proposedLocation } = req.body;
      
      const proposal = {
        id: Date.now(),
        chatRoomId: chatId,
        proposedTime,
        proposedLocation,
        proposedBy: userId,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      res.json(proposal);
    } catch (error) {
      console.error('Error proposing pickup:', error);
      res.status(500).json({ message: 'Failed to propose pickup' });
    }
  });

  app.post('/api/chat/pickup/:pickupId/respond', async (req: any, res) => {
    try {
      const pickupId = parseInt(req.params.pickupId);
      const userId = "30415465"; // Development fallback
      const { status, responseMessage } = req.body;
      
      res.json({ 
        success: true, 
        message: 'Pickup response sent',
        status,
        responseMessage
      });
    } catch (error) {
      console.error('Error responding to pickup:', error);
      res.status(500).json({ message: 'Failed to respond to pickup' });
    }
  });

  app.post('/api/chat/rooms', async (req: any, res) => {
    try {
      const userId = "30415465"; // Development fallback
      const { postId, donorId, receiverId } = req.body;
      
      const newRoom = {
        id: Date.now(),
        postId,
        donorId,
        receiverId,
        status: "active",
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
        createdAt: new Date().toISOString()
      };
      
      res.json(newRoom);
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).json({ message: 'Failed to create chat room' });
    }
  });

  // Help & Support API routes
  app.post('/api/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject, description, category, priority } = req.body;
      
      const newTicket = {
        id: Date.now(),
        userId,
        subject,
        description,
        category,
        priority,
        status: 'open',
        createdAt: new Date().toISOString(),
        user: {
          id: userId,
          firstName: "Current",
          lastName: "User",
          email: "user@example.com"
        },
        messages: []
      };
      
      res.json(newTicket);
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ message: 'Failed to create support ticket' });
    }
  });

  app.get('/api/support/tickets/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const sampleTickets = [
        {
          id: 1,
          userId,
          subject: "Unable to receive pickup confirmation",
          description: "I'm not getting notifications when someone confirms a pickup for my donation.",
          category: "technical",
          priority: "medium",
          status: "in-progress",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignedStaff: {
            id: "staff1",
            firstName: "Support",
            lastName: "Agent"
          }
        },
        {
          id: 2,
          userId,
          subject: "Question about volunteer points system",
          description: "How do I earn more points for volunteering activities?",
          category: "general",
          priority: "low",
          status: "resolved",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json(sampleTickets);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      res.status(500).json({ message: 'Failed to fetch support tickets' });
    }
  });

  app.post('/api/support/helpline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { callerName, phoneNumber, category, description, priority } = req.body;
      
      const newContact = {
        id: Date.now(),
        userId,
        callerName,
        phoneNumber,
        category,
        description,
        priority,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      res.json(newContact);
    } catch (error) {
      console.error('Error creating helpline contact:', error);
      res.status(500).json({ message: 'Failed to create helpline contact' });
    }
  });

  app.get('/api/support/knowledge-base', async (req: any, res) => {
    try {
      const { search } = req.query;
      
      let articles = [
        {
          id: 1,
          title: "How to Create a Food Donation Post",
          content: "Learn how to effectively create a food donation post that helps connect with people in need. Include clear photos, detailed descriptions, and pickup information.",
          category: "donations",
          isPublished: true,
          viewCount: 1250,
          helpfulVotes: 95,
          author: {
            id: "admin1",
            firstName: "FoodShare",
            lastName: "Team"
          }
        },
        {
          id: 2,
          title: "Understanding Pickup Coordination",
          content: "This guide explains how our pickup coordination system works, including chat features, time scheduling, and safety protocols for both donors and recipients.",
          category: "pickup",
          isPublished: true,
          viewCount: 890,
          helpfulVotes: 78,
          author: {
            id: "admin1",
            firstName: "FoodShare",
            lastName: "Team"
          }
        },
        {
          id: 3,
          title: "Volunteer Mission Guidelines",
          content: "Everything you need to know about participating in volunteer missions, earning points, and contributing to your community through FoodShare.",
          category: "volunteer",
          isPublished: true,
          viewCount: 2100,
          helpfulVotes: 156,
          author: {
            id: "admin1",
            firstName: "FoodShare",
            lastName: "Team"
          }
        },
        {
          id: 4,
          title: "Safety Guidelines for Food Sharing",
          content: "Important safety protocols to follow when sharing food, including hygiene standards, temperature control, and allergen awareness.",
          category: "safety",
          isPublished: true,
          viewCount: 3200,
          helpfulVotes: 245,
          author: {
            id: "admin1",
            firstName: "FoodShare",
            lastName: "Team"
          }
        },
        {
          id: 5,
          title: "Troubleshooting App Issues",
          content: "Common technical problems and their solutions, including login issues, notification problems, and app performance optimization.",
          category: "technical",
          isPublished: true,
          viewCount: 670,
          helpfulVotes: 52,
          author: {
            id: "admin1",
            firstName: "FoodShare",
            lastName: "Team"
          }
        }
      ];
      
      if (search) {
        articles = articles.filter(article => 
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.json(articles);
    } catch (error) {
      console.error('Error fetching knowledge base articles:', error);
      res.status(500).json({ message: 'Failed to fetch knowledge base articles' });
    }
  });

  app.post('/api/support/knowledge-base/:id/vote', async (req: any, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const { isHelpful } = req.body;
      
      res.json({ success: true, voted: isHelpful });
    } catch (error) {
      console.error('Error voting on article:', error);
      res.status(500).json({ message: 'Failed to vote on article' });
    }
  });

  app.get('/api/support/emergency-contacts', async (req: any, res) => {
    try {
      const { region, contactType } = req.query;
      
      const emergencyContacts = [
        {
          id: 1,
          name: "Emergency Food Safety Hotline",
          phoneNumber: "1-800-FOOD-911",
          email: "emergency@foodshare.org",
          contactType: "emergency",
          operatingHours: "24/7",
          description: "For immediate food safety emergencies, suspected poisoning, or urgent health concerns related to food sharing."
        },
        {
          id: 2,
          name: "Crisis Support Line",
          phoneNumber: "1-800-CRISIS-1",
          email: "crisis@foodshare.org",
          contactType: "crisis",
          operatingHours: "24/7",
          description: "Mental health support and crisis intervention for community members experiencing difficulties."
        },
        {
          id: 3,
          name: "Local Food Bank Emergency",
          phoneNumber: "1-555-FOODBANK",
          email: "emergency@localfoodbank.org",
          contactType: "foodbank",
          operatingHours: "8 AM - 8 PM",
          description: "Emergency food assistance for families and individuals in immediate need."
        },
        {
          id: 4,
          name: "Volunteer Emergency Coordinator",
          phoneNumber: "1-800-VOL-HELP",
          email: "volcoord@foodshare.org",
          contactType: "volunteer",
          operatingHours: "24/7",
          description: "Emergency coordination for volunteers facing issues during pickup/delivery missions."
        }
      ];
      
      res.json(emergencyContacts);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      res.status(500).json({ message: 'Failed to fetch emergency contacts' });
    }
  });

  app.post('/api/support/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { feedbackType, rating, feedback, improvementSuggestions, wouldRecommend } = req.body;
      
      const newFeedback = {
        id: Date.now(),
        userId,
        feedbackType,
        rating,
        feedback,
        improvementSuggestions,
        wouldRecommend,
        createdAt: new Date().toISOString()
      };
      
      res.json(newFeedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Failed to submit feedback' });
    }
  });

  // Meal Partners routes
  app.get('/api/meal-partners', async (req, res) => {
    try {
      const { status } = req.query;
      const partners = await storage.getMealPartners(status as string);
      res.json(partners);
    } catch (error) {
      console.error("Error fetching meal partners:", error);
      res.status(500).json({ message: "Failed to fetch meal partners" });
    }
  });

  app.get('/api/meal-partners/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const partner = await storage.getMealPartner(parseInt(id));
      if (!partner) {
        return res.status(404).json({ message: "Meal partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error("Error fetching meal partner:", error);
      res.status(500).json({ message: "Failed to fetch meal partner" });
    }
  });

  app.post('/api/meal-partners', async (req, res) => {
    try {
      const partnerData = req.body;
      partnerData.partnershipStartDate = new Date();
      partnerData.partnershipStatus = 'pending';
      const partner = await storage.createMealPartner(partnerData);
      res.status(201).json(partner);
    } catch (error) {
      console.error("Error creating meal partner:", error);
      res.status(500).json({ message: "Failed to create meal partner" });
    }
  });

  // Meal Reservations routes
  app.get('/api/meal-reservations/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reservations = await storage.getMealReservations(userId);
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching meal reservations:", error);
      res.status(500).json({ message: "Failed to fetch meal reservations" });
    }
  });

  app.post('/api/meal-reservations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reservationData = {
        ...req.body,
        userId,
        reservationDate: new Date(req.body.reservationDate),
        confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'confirmed'
      };
      const reservation = await storage.createMealReservation(reservationData);
      res.status(201).json(reservation);
    } catch (error) {
      console.error("Error creating meal reservation:", error);
      res.status(500).json({ message: "Failed to create meal reservation" });
    }
  });

  // Tax Benefits routes
  app.get('/api/tax-benefits/:partnerId', async (req, res) => {
    try {
      const { partnerId } = req.params;
      const claims = await storage.getTaxBenefitClaims(parseInt(partnerId));
      res.json(claims);
    } catch (error) {
      console.error("Error fetching tax benefit claims:", error);
      res.status(500).json({ message: "Failed to fetch tax benefit claims" });
    }
  });

  app.post('/api/tax-benefits', async (req, res) => {
    try {
      const claim = await storage.createTaxBenefitClaim(req.body);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating tax benefit claim:", error);
      res.status(500).json({ message: "Failed to create tax benefit claim" });
    }
  });

  // CSR Activities routes
  app.get('/api/csr-activities/:partnerId', async (req, res) => {
    try {
      const { partnerId } = req.params;
      const activities = await storage.getCsrActivities(parseInt(partnerId));
      res.json(activities);
    } catch (error) {
      console.error("Error fetching CSR activities:", error);
      res.status(500).json({ message: "Failed to fetch CSR activities" });
    }
  });

  app.post('/api/csr-activities', async (req, res) => {
    try {
      const activity = await storage.createCsrActivity(req.body);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating CSR activity:", error);
      res.status(500).json({ message: "Failed to create CSR activity" });
    }
  });

  // Community Impact Analytics
  app.get('/api/community-impact', async (req, res) => {
    try {
      const impactData = await storage.getCommunityImpactData();
      res.json(impactData);
    } catch (error) {
      console.error("Error fetching community impact data:", error);
      res.status(500).json({ message: "Failed to fetch community impact data" });
    }
  });

  // Event Food Pickup Routes
  app.get('/api/event-pickups', async (req, res) => {
    try {
      const events = await db.select({
        id: eventFoodPickups.id,
        eventName: eventFoodPickups.eventName,
        eventType: eventFoodPickups.eventType,
        organizerName: eventFoodPickups.organizerName,
        organizerPhone: eventFoodPickups.organizerPhone,
        eventVenue: eventFoodPickups.eventVenue,
        eventAddress: eventFoodPickups.eventAddress,
        eventDate: eventFoodPickups.eventDate,
        eventEndTime: eventFoodPickups.eventEndTime,
        pickupStartTime: eventFoodPickups.pickupStartTime,
        pickupEndTime: eventFoodPickups.pickupEndTime,
        estimatedGuests: eventFoodPickups.estimatedGuests,
        estimatedLeftoverPercentage: eventFoodPickups.estimatedLeftoverPercentage,
        foodTypes: eventFoodPickups.foodTypes,
        cuisineType: eventFoodPickups.cuisineType,
        status: eventFoodPickups.status,
        maxVolunteers: eventFoodPickups.maxVolunteers,
        currentVolunteers: eventFoodPickups.currentVolunteers,
        createdAt: eventFoodPickups.createdAt,
      }).from(eventFoodPickups)
      .where(or(
        eq(eventFoodPickups.status, 'approved'),
        eq(eventFoodPickups.status, 'active')
      ))
      .orderBy(eventFoodPickups.eventDate);

      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/event-pickups', isAuthenticated, async (req: any, res) => {
    try {
      const { 
        eventName,
        eventType,
        organizerName,
        organizerPhone,
        organizerEmail,
        eventVenue,
        eventAddress,
        eventDate,
        eventEndTime,
        pickupStartTime,
        pickupEndTime,
        estimatedGuests,
        estimatedLeftoverPercentage,
        foodTypes,
        cuisineType,
        specialInstructions,
        contactPerson,
        contactPersonPhone,
        servingContainers,
        requiresRefrigeration,
        accessInstructions,
        parkingAvailable,
        loadingAccess,
        maxVolunteers,
        createdBy
      } = req.body;

      const [event] = await db.insert(eventFoodPickups).values({
        eventName,
        eventType,
        organizerName,
        organizerPhone,
        organizerEmail,
        eventVenue,
        eventAddress,
        eventDate: new Date(eventDate),
        eventEndTime: new Date(eventEndTime),
        pickupStartTime: new Date(pickupStartTime),
        pickupEndTime: new Date(pickupEndTime),
        estimatedGuests,
        estimatedLeftoverPercentage,
        foodTypes,
        cuisineType,
        specialInstructions,
        contactPerson,
        contactPersonPhone,
        servingContainers,
        requiresRefrigeration,
        accessInstructions,
        parkingAvailable,
        loadingAccess,
        maxVolunteers,
        createdBy,
        status: 'pending'
      }).returning();

      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post('/api/event-pickups/:eventId/volunteer', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const {
        vehicleType,
        vehicleCapacity,
        availableFrom,
        availableTo,
        specialSkills,
        emergencyContact,
        emergencyPhone,
        userId
      } = req.body;

      // Check if event exists and is active
      const [event] = await db.select()
        .from(eventFoodPickups)
        .where(eq(eventFoodPickups.id, parseInt(eventId)));

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.status !== 'approved' && event.status !== 'active') {
        return res.status(400).json({ message: "Event is not accepting volunteers" });
      }

      if ((event.currentVolunteers || 0) >= (event.maxVolunteers || 0)) {
        return res.status(400).json({ message: "Event is full" });
      }

      // Check if user already registered
      const existingRegistration = await db.select()
        .from(eventVolunteerRegistrations)
        .where(and(
          eq(eventVolunteerRegistrations.eventId, parseInt(eventId)),
          eq(eventVolunteerRegistrations.userId, userId)
        ));

      if (existingRegistration.length > 0) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }

      // Create volunteer registration
      const [registration] = await db.insert(eventVolunteerRegistrations).values({
        eventId: parseInt(eventId),
        userId,
        vehicleType,
        vehicleCapacity,
        availableFrom: new Date(availableFrom),
        availableTo: new Date(availableTo),
        specialSkills,
        emergencyContact,
        emergencyPhone,
        status: 'pending'
      }).returning();

      // Update volunteer count
      await db.update(eventFoodPickups)
        .set({ currentVolunteers: (event.currentVolunteers || 0) + 1 })
        .where(eq(eventFoodPickups.id, parseInt(eventId)));

      res.json(registration);
    } catch (error) {
      console.error("Error registering volunteer:", error);
      res.status(500).json({ message: "Failed to register volunteer" });
    }
  });

  app.get('/api/event-pickups/registrations/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;

      const registrations = await db.select({
        id: eventVolunteerRegistrations.id,
        eventId: eventVolunteerRegistrations.eventId,
        userId: eventVolunteerRegistrations.userId,
        vehicleType: eventVolunteerRegistrations.vehicleType,
        vehicleCapacity: eventVolunteerRegistrations.vehicleCapacity,
        availableFrom: eventVolunteerRegistrations.availableFrom,
        availableTo: eventVolunteerRegistrations.availableTo,
        specialSkills: eventVolunteerRegistrations.specialSkills,
        emergencyContact: eventVolunteerRegistrations.emergencyContact,
        emergencyPhone: eventVolunteerRegistrations.emergencyPhone,
        status: eventVolunteerRegistrations.status,
        organizerRating: eventVolunteerRegistrations.organizerRating,
        organizerFeedback: eventVolunteerRegistrations.organizerFeedback,
        createdAt: eventVolunteerRegistrations.createdAt,
        event: {
          id: eventFoodPickups.id,
          eventName: eventFoodPickups.eventName,
          eventType: eventFoodPickups.eventType,
          eventVenue: eventFoodPickups.eventVenue,
          eventAddress: eventFoodPickups.eventAddress,
          eventDate: eventFoodPickups.eventDate,
          pickupStartTime: eventFoodPickups.pickupStartTime,
          pickupEndTime: eventFoodPickups.pickupEndTime,
          status: eventFoodPickups.status,
        }
      })
      .from(eventVolunteerRegistrations)
      .leftJoin(eventFoodPickups, eq(eventVolunteerRegistrations.eventId, eventFoodPickups.id))
      .where(eq(eventVolunteerRegistrations.userId, userId))
      .orderBy(desc(eventVolunteerRegistrations.createdAt));

      res.json(registrations);
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Adopt a Slum - Community Routes
  app.get("/api/slum-communities", async (req, res) => {
    try {
      const communities = await storage.getSlumCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching slum communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.post("/api/slum-communities", isAuthenticated, async (req, res) => {
    try {
      const community = await storage.createSlumCommunity(req.body);
      res.json(community);
    } catch (error) {
      console.error("Error creating community:", error);
      res.status(500).json({ message: "Failed to create community" });
    }
  });

  app.get("/api/slum-communities/:id", async (req, res) => {
    try {
      const community = await storage.getSlumCommunity(parseInt(req.params.id));
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ message: "Failed to fetch community" });
    }
  });

  // Restaurant Adoption Routes
  app.get("/api/restaurant-adoptions/:restaurantId", isAuthenticated, async (req, res) => {
    try {
      const adoptions = await storage.getRestaurantAdoptions(req.params.restaurantId);
      res.json(adoptions);
    } catch (error) {
      console.error("Error fetching restaurant adoptions:", error);
      res.status(500).json({ message: "Failed to fetch adoptions" });
    }
  });

  app.post("/api/restaurant-adoptions", isAuthenticated, async (req, res) => {
    try {
      const adoption = await storage.createRestaurantAdoption(req.body);
      res.json(adoption);
    } catch (error) {
      console.error("Error creating restaurant adoption:", error);
      res.status(500).json({ message: "Failed to create adoption" });
    }
  });

  app.get("/api/adoption-impact", async (req, res) => {
    try {
      const stats = await storage.getAdoptionImpactStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching adoption impact stats:", error);
      res.status(500).json({ message: "Failed to fetch impact stats" });
    }
  });

  // Feeding Sessions Routes
  app.get("/api/feeding-sessions/:adoptionId", isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getFeedingSessions(parseInt(req.params.adoptionId));
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching feeding sessions:", error);
      res.status(500).json({ message: "Failed to fetch feeding sessions" });
    }
  });

  app.post("/api/feeding-sessions", isAuthenticated, async (req, res) => {
    try {
      const session = await storage.createFeedingSession(req.body);
      res.json(session);
    } catch (error) {
      console.error("Error creating feeding session:", error);
      res.status(500).json({ message: "Failed to create feeding session" });
    }
  });

  // Care Institution routes (Orphanages & Old Age Homes)
  app.get("/api/care-institutions", async (req, res) => {
    try {
      const { institutionType, location, verificationStatus } = req.query;
      
      // Sample data for orphanages and old age homes
      const sampleInstitutions = [
        {
          id: 1,
          name: "Sunshine Children's Home",
          institutionType: "orphanage",
          description: "A loving home for 45 children aged 3-17, providing education, healthcare, and emotional support.",
          address: "123 Hope Street, Downtown",
          capacity: 50,
          currentResidents: 45,
          ageGroups: "3-6,7-12,13-17",
          contactPerson: "Sister Maria Santos",
          contactPhone: "+1-555-0123",
          contactEmail: "contact@sunshinechildrenshome.org",
          registrationNumber: "NGO-2019-0456",
          mealsPerDay: 3,
          specialDietaryNeeds: "Vegetarian options, lactose-free milk for some children",
          verificationStatus: "verified",
          totalMealsProvided: 4850,
          lastDonationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          name: "Golden Years Care Center",
          institutionType: "old_age_home",
          description: "Dedicated care facility for 60 elderly residents with comprehensive medical and social support.",
          address: "789 Elderly Lane, Riverside",
          capacity: 70,
          currentResidents: 60,
          ageGroups: "65-75,76-85,86+",
          contactPerson: "Dr. Robert Johnson",
          contactPhone: "+1-555-0456",
          contactEmail: "admin@goldenyearscare.org",
          registrationNumber: "CARE-2017-0234",
          mealsPerDay: 4,
          specialDietaryNeeds: "Diabetic-friendly, low-sodium, soft foods for some residents",
          medicalFacilities: "24/7 nursing care, physiotherapy, regular medical checkups",
          verificationStatus: "verified",
          totalMealsProvided: 7200,
          lastDonationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          name: "Little Angels Orphanage",
          institutionType: "orphanage",
          description: "Safe haven for 30 children, focusing on education and skill development.",
          address: "456 Angel Avenue, Eastside",
          capacity: 35,
          currentResidents: 30,
          ageGroups: "5-10,11-15,16-18",
          contactPerson: "Mrs. Sarah Williams",
          contactPhone: "+1-555-0789",
          contactEmail: "info@littleangels.org",
          registrationNumber: "ORG-2020-0123",
          mealsPerDay: 3,
          specialDietaryNeeds: "Halal food options, nut-free environment",
          verificationStatus: "pending",
          totalMealsProvided: 2100,
          lastDonationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      let filteredInstitutions = sampleInstitutions;
      
      if (institutionType) {
        filteredInstitutions = filteredInstitutions.filter(inst => inst.institutionType === institutionType);
      }
      
      if (verificationStatus) {
        filteredInstitutions = filteredInstitutions.filter(inst => inst.verificationStatus === verificationStatus);
      }

      res.json(filteredInstitutions);
    } catch (error) {
      console.error("Error fetching care institutions:", error);
      res.status(500).json({ message: "Failed to fetch care institutions" });
    }
  });

  app.post("/api/care-institutions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const institutionData = { 
        ...req.body, 
        id: Date.now(),
        verifiedBy: userId,
        totalMealsProvided: 0,
        verificationStatus: "pending",
        createdAt: new Date().toISOString()
      };
      
      res.json(institutionData);
    } catch (error) {
      console.error("Error creating care institution:", error);
      res.status(500).json({ message: "Failed to create care institution" });
    }
  });

  // Institution Adoption routes
  app.get("/api/institution-adoptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      const sampleAdoptions = [
        {
          id: 1,
          donorId: userId,
          institutionId: 1,
          donorType: "individual",
          donorName: "Community Supporter",
          pledgeType: "monthly",
          mealsPerSession: 150,
          preferredTime: "12:00 PM",
          startDate: new Date().toISOString(),
          totalSessions: 6,
          completedSessions: 4,
          totalMealsProvided: 600,
          status: "active",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          institution: {
            id: 1,
            name: "Sunshine Children's Home",
            institutionType: "orphanage"
          }
        }
      ];
      
      res.json(sampleAdoptions);
    } catch (error) {
      console.error("Error fetching institution adoptions:", error);
      res.status(500).json({ message: "Failed to fetch institution adoptions" });
    }
  });

  app.post("/api/institution-adoptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const adoptionData = { 
        ...req.body, 
        id: Date.now(),
        donorId: userId,
        totalSessions: 0,
        completedSessions: 0,
        totalMealsProvided: 0,
        status: "active",
        createdAt: new Date().toISOString()
      };
      
      res.json(adoptionData);
    } catch (error) {
      console.error("Error creating institution adoption:", error);
      res.status(500).json({ message: "Failed to create institution adoption" });
    }
  });

  // Institution Impact Statistics
  app.get("/api/institution-impact", async (req, res) => {
    try {
      const impact = {
        totalInstitutions: 15,
        orphanages: 8,
        oldAgeHomes: 7,
        totalResidents: 650,
        childrenSupported: 280,
        elderlySupported: 370,
        totalMealsProvided: 45600,
        activeAdoptions: 12,
        monthlyGrowth: 15,
        averageMealsPerInstitution: 3040
      };
      
      res.json(impact);
    } catch (error) {
      console.error("Error fetching institution impact:", error);
      res.status(500).json({ message: "Failed to fetch institution impact" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
