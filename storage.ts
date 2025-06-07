import {
  users,
  posts,
  claims,
  notifications,
  ratings,
  donationCenters,
  ngos,
  centerNgoPartnerships,
  corporateDonations,
  medicalProviders,
  clothingNgos,
  communityInstitutions,
  groups,
  groupMembers,
  groupPosts,
  groupBadges,
  mealPartners,
  mealReservations,
  taxBenefitClaims,
  csrActivities,
  eventFoodPickups,
  eventVolunteerRegistrations,
  eventFoodDistributions,
  slumCommunities,
  restaurantAdoptions,
  feedingSessions,
  feedingSessionVolunteers,
  communityImpactMetrics,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type PostWithAuthor,
  type Claim,
  type InsertClaim,
  type Notification,
  type InsertNotification,
  type Rating,
  type InsertRating,
  type UserWithStats,
  type DonationCenter,
  type InsertDonationCenter,
  type NGO,
  type InsertNGO,
  type DonationCenterWithDetails,
  type CorporateDonation,
  type InsertCorporateDonation,
  type MedicalProvider,
  type InsertMedicalProvider,
  type ClothingNgo,
  type InsertClothingNgo,
  type CommunityInstitution,
  type InsertCommunityInstitution,
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type GroupPost,
  type InsertGroupPost,
  type GroupBadge,
  type InsertGroupBadge,
  type MealPartner,
  type InsertMealPartner,
  type MealPartnerWithDetails,
  type MealReservation,
  type InsertMealReservation,
  type MealReservationWithDetails,
  type TaxBenefitClaim,
  type InsertTaxBenefitClaim,
  type CsrActivity,
  type InsertCsrActivity,
  type GroupWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, avg, sum, gte, or, like, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserWithStats(id: string): Promise<UserWithStats | undefined>;
  updateUserStats(userId: string): Promise<void>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<PostWithAuthor | undefined>;
  getPosts(filters?: {
    type?: "donation" | "request";
    status?: string;
    search?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PostWithAuthor[]>;
  updatePostStatus(id: number, status: string, claimedBy?: string): Promise<void>;
  expirePosts(): Promise<void>;

  // Claim operations
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaim(id: number): Promise<Claim | undefined>;
  getClaimsForPost(postId: number): Promise<Claim[]>;
  getClaimsForUser(userId: string): Promise<Claim[]>;
  updateClaimStatus(id: number, status: string): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsForUser(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsForUser(userId: string): Promise<Rating[]>;
  getAverageRating(userId: string): Promise<number>;

  // Donation Center operations
  getDonationCenters(filters?: {
    type?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<DonationCenterWithDetails[]>;
  getDonationCenter(id: number): Promise<DonationCenterWithDetails | undefined>;
  createDonationCenter(center: InsertDonationCenter): Promise<DonationCenter>;
  updateDonationCenter(id: number, updates: Partial<InsertDonationCenter>): Promise<void>;

  // NGO operations
  getNGOs(): Promise<NGO[]>;
  createNGO(ngo: InsertNGO): Promise<NGO>;

  // Corporate donation operations
  getCorporateDonations(filters?: {
    status?: string;
    companyType?: string;
    search?: string;
  }): Promise<CorporateDonation[]>;
  getCorporateDonation(id: number): Promise<CorporateDonation | undefined>;
  createCorporateDonation(donation: InsertCorporateDonation): Promise<CorporateDonation>;
  updateCorporateDonationStatus(id: number, status: string, approvedBy?: string): Promise<void>;

  // Medical provider operations
  getMedicalProviders(filters?: {
    specialization?: string;
    location?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<MedicalProvider[]>;
  getMedicalProvider(id: number): Promise<MedicalProvider | undefined>;
  createMedicalProvider(provider: InsertMedicalProvider): Promise<MedicalProvider>;
  updateMedicalProviderStatus(id: number, status: string, approvedBy?: string): Promise<void>;

  // Clothing NGO operations
  getClothingNgos(filters?: {
    clothingType?: string;
    location?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<ClothingNgo[]>;
  getClothingNgo(id: number): Promise<ClothingNgo | undefined>;
  createClothingNgo(ngo: InsertClothingNgo): Promise<ClothingNgo>;
  updateClothingNgoStatus(id: number, status: string, approvedBy?: string): Promise<void>;

  // Community Institution operations
  getCommunityInstitutions(filters?: {
    institutionType?: string;
    location?: string;
    status?: string;
    interfaithParticipation?: boolean;
    isActive?: boolean;
  }): Promise<CommunityInstitution[]>;
  getCommunityInstitution(id: number): Promise<CommunityInstitution | undefined>;
  createCommunityInstitution(institution: InsertCommunityInstitution): Promise<CommunityInstitution>;
  updateCommunityInstitutionStatus(id: number, status: string, verifiedBy?: string): Promise<void>;

  // Group Givers & Family Mode operations
  getGroups(filters?: {
    groupType?: string;
    location?: string;
    isActive?: boolean;
    badgeLevel?: string;
  }): Promise<GroupWithDetails[]>;
  getGroup(id: number): Promise<GroupWithDetails | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, updates: Partial<InsertGroup>): Promise<void>;
  
  // Group Member operations
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: string): Promise<void>;
  updateGroupMemberRole(groupId: number, userId: string, role: string): Promise<void>;
  getGroupMembers(groupId: number): Promise<(GroupMember & { user: User })[]>;
  
  // Group Post operations
  createGroupPost(groupPost: InsertGroupPost): Promise<GroupPost>;
  getGroupPosts(groupId: number): Promise<(GroupPost & { post: Post })[]>;
  
  // Group Badge operations
  awardGroupBadge(badge: InsertGroupBadge): Promise<GroupBadge>;
  getGroupBadges(groupId: number): Promise<GroupBadge[]>;
  updateGroupStats(groupId: number): Promise<void>;

  // Chat & Pickup Coordination operations
  createChatRoom(chatRoom: InsertChatRoom): Promise<ChatRoom>;
  getChatRoom(id: number): Promise<ChatRoomWithDetails | undefined>;
  getChatRoomsForUser(userId: string): Promise<ChatRoomWithDetails[]>;
  getChatRoomByPost(postId: number, donorId: string, receiverId: string): Promise<ChatRoom | undefined>;
  updateChatRoomStatus(id: number, status: string): Promise<void>;
  expireChatRooms(): Promise<void>;
  
  // Chat Message operations
  sendMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getMessages(chatRoomId: number, limit?: number): Promise<ChatMessageWithSender[]>;
  markMessagesAsRead(chatRoomId: number, userId: string): Promise<void>;
  getUnreadMessageCount(chatRoomId: number, userId: string): Promise<number>;
  
  // Pickup Coordination operations
  proposePickup(coordination: InsertPickupCoordination): Promise<PickupCoordination>;
  respondToPickup(id: number, status: string, responseMessage?: string): Promise<void>;
  getPickupCoordination(chatRoomId: number): Promise<PickupCoordination | undefined>;
  confirmPickup(chatRoomId: number, pickupTime: Date, pickupLocation: string): Promise<void>;

  // Help & Support operations
  // Support Tickets
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: number): Promise<SupportTicketWithDetails | undefined>;
  getSupportTickets(filters?: {
    userId?: string;
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<SupportTicketWithDetails[]>;
  updateSupportTicketStatus(id: number, status: string, assignedTo?: string): Promise<void>;
  resolveSupportTicket(id: number, resolutionTime: number, satisfaction?: number): Promise<void>;
  
  // Support Ticket Messages
  addSupportTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;
  getSupportTicketMessages(ticketId: number): Promise<(SupportTicketMessage & { sender: User })[]>;
  
  // Helpline Contacts
  createHelplineContact(contact: InsertHelplineContact): Promise<HelplineContact>;
  getHelplineContact(id: number): Promise<HelplineContactWithDetails | undefined>;
  getHelplineContacts(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    handledBy?: string;
    dateRange?: { start: Date; end: Date };
    limit?: number;
    offset?: number;
  }): Promise<HelplineContactWithDetails[]>;
  updateHelplineContactStatus(id: number, status: string, handledBy?: string): Promise<void>;
  resolveHelplineContact(id: number, resolutionTime: number, satisfaction?: number): Promise<void>;
  
  // Knowledge Base
  createKnowledgeBaseArticle(article: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle>;
  getKnowledgeBaseArticle(id: number): Promise<KnowledgeBaseArticleWithAuthor | undefined>;
  getKnowledgeBaseArticles(filters?: {
    category?: string;
    isPublished?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<KnowledgeBaseArticleWithAuthor[]>;
  updateKnowledgeBaseArticle(id: number, updates: Partial<InsertKnowledgeBaseArticle>): Promise<void>;
  incrementArticleViews(id: number): Promise<void>;
  voteOnArticle(id: number, isHelpful: boolean): Promise<void>;
  
  // Support Staff
  createSupportStaff(staff: InsertSupportStaff): Promise<SupportStaff>;
  getSupportStaff(userId: string): Promise<SupportStaffWithDetails | undefined>;
  getAllSupportStaff(filters?: {
    department?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<SupportStaffWithDetails[]>;
  updateSupportStaffStatus(userId: string, isActive: boolean): Promise<void>;
  updateSupportStaffStats(userId: string): Promise<void>;
  
  // Support Feedback
  createSupportFeedback(feedback: InsertSupportFeedback): Promise<SupportFeedback>;
  getSupportFeedback(filters?: {
    ticketId?: number;
    helplineContactId?: number;
    feedbackType?: string;
    rating?: number;
  }): Promise<SupportFeedback[]>;
  
  // Emergency Contacts
  getEmergencyContacts(region?: string, contactType?: string): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, updates: Partial<InsertEmergencyContact>): Promise<void>;

  // Meal Partners
  getMealPartners(status?: string): Promise<MealPartnerWithDetails[]>;
  getMealPartner(id: number): Promise<MealPartnerWithDetails | undefined>;
  createMealPartner(partner: InsertMealPartner): Promise<MealPartner>;
  updateMealPartner(id: number, updates: Partial<InsertMealPartner>): Promise<void>;
  
  // Meal Reservations
  getMealReservations(userId?: string): Promise<MealReservationWithDetails[]>;
  getMealReservation(id: number): Promise<MealReservationWithDetails | undefined>;
  createMealReservation(reservation: InsertMealReservation): Promise<MealReservation>;
  updateMealReservation(id: number, updates: Partial<InsertMealReservation>): Promise<void>;
  
  // Tax Benefit Claims
  getTaxBenefitClaims(mealPartnerId?: number): Promise<TaxBenefitClaim[]>;
  createTaxBenefitClaim(claim: InsertTaxBenefitClaim): Promise<TaxBenefitClaim>;
  updateTaxBenefitClaim(id: number, updates: Partial<InsertTaxBenefitClaim>): Promise<void>;
  
  // CSR Activities
  getCsrActivities(mealPartnerId?: number): Promise<CsrActivity[]>;
  createCsrActivity(activity: InsertCsrActivity): Promise<CsrActivity>;
  
  // Community Impact Analytics
  getCommunityImpactData(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserWithStats(id: string): Promise<UserWithStats | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, id))
      .orderBy(desc(posts.createdAt));

    const userRatings = await db
      .select()
      .from(ratings)
      .where(eq(ratings.ratedUserId, id));

    return {
      ...user,
      posts: userPosts,
      ratingsReceived: userRatings,
    };
  }

  async updateUserStats(userId: string): Promise<void> {
    // Calculate donation and request counts
    const donationCount = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.authorId, userId), eq(posts.type, "donation")));

    const requestCount = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.authorId, userId), eq(posts.type, "request")));

    // Calculate average rating
    const ratingStats = await db
      .select({
        avg: avg(ratings.rating),
        count: count(),
      })
      .from(ratings)
      .where(eq(ratings.ratedUserId, userId));

    const avgRating = ratingStats[0]?.avg ? Number(ratingStats[0].avg) : 0;
    const totalRatings = ratingStats[0]?.count || 0;

    await db
      .update(users)
      .set({
        totalDonations: donationCount[0]?.count || 0,
        totalRequests: requestCount[0]?.count || 0,
        averageRating: avgRating.toString(),
        totalRatings,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPost(id: number): Promise<PostWithAuthor | undefined> {
    const result = await db
      .select({
        post: posts,
        author: users,
        claimer: {
          id: sql`claimer.id`,
          email: sql`claimer.email`,
          firstName: sql`claimer.first_name`,
          lastName: sql`claimer.last_name`,
          profileImageUrl: sql`claimer.profile_image_url`,
          createdAt: sql`claimer.created_at`,
          updatedAt: sql`claimer.updated_at`,
          totalDonations: sql`claimer.total_donations`,
          totalRequests: sql`claimer.total_requests`,
          averageRating: sql`claimer.average_rating`,
          totalRatings: sql`claimer.total_ratings`,
        },
        claimCount: count(claims.id),
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(sql`users as claimer`, eq(posts.claimedBy, sql`claimer.id`))
      .leftJoin(claims, eq(posts.id, claims.postId))
      .where(eq(posts.id, id))
      .groupBy(posts.id, users.id, sql`claimer.id`);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.post,
      author: row.author,
      claimer: row.claimer.id ? (row.claimer as User) : null,
      _count: {
        claims: row.claimCount,
      },
    };
  }

  async getPosts(filters: {
    type?: "donation" | "request";
    status?: string;
    search?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PostWithAuthor[]> {
    const { type, status = "active", search, authorId, limit = 20, offset = 0 } = filters;

    let query = db
      .select({
        post: posts,
        author: users,
        claimer: {
          id: sql`claimer.id`,
          email: sql`claimer.email`,
          firstName: sql`claimer.first_name`,
          lastName: sql`claimer.last_name`,
          profileImageUrl: sql`claimer.profile_image_url`,
          createdAt: sql`claimer.created_at`,
          updatedAt: sql`claimer.updated_at`,
          totalDonations: sql`claimer.total_donations`,
          totalRequests: sql`claimer.total_requests`,
          averageRating: sql`claimer.average_rating`,
          totalRatings: sql`claimer.total_ratings`,
        },
        claimCount: count(claims.id),
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(sql`users as claimer`, eq(posts.claimedBy, sql`claimer.id`))
      .leftJoin(claims, eq(posts.id, claims.postId));

    const conditions = [];

    if (type) {
      conditions.push(eq(posts.type, type));
    }
    if (status) {
      conditions.push(eq(posts.status, status));
    }
    if (search) {
      conditions.push(
        or(
          like(posts.title, `%${search}%`),
          like(posts.description, `%${search}%`)
        )
      );
    }
    if (authorId) {
      conditions.push(eq(posts.authorId, authorId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query
      .groupBy(posts.id, users.id, sql`claimer.id`)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.post,
      author: row.author,
      claimer: row.claimer.id ? (row.claimer as User) : null,
      _count: {
        claims: row.claimCount,
      },
    }));
  }

  async updatePostStatus(id: number, status: string, claimedBy?: string): Promise<void> {
    await db
      .update(posts)
      .set({
        status,
        claimedBy,
        claimedAt: claimedBy ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));
  }

  async expirePosts(): Promise<void> {
    await db
      .update(posts)
      .set({
        status: "expired",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(posts.status, "active"),
          gte(new Date(), posts.expiresAt)
        )
      );
  }

  // Claim operations
  async createClaim(claim: InsertClaim): Promise<Claim> {
    const [newClaim] = await db.insert(claims).values(claim).returning();
    return newClaim;
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim;
  }

  async getClaimsForPost(postId: number): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .where(eq(claims.postId, postId))
      .orderBy(desc(claims.createdAt));
  }

  async getClaimsForUser(userId: string): Promise<Claim[]> {
    return await db
      .select()
      .from(claims)
      .where(eq(claims.claimerId, userId))
      .orderBy(desc(claims.createdAt));
  }

  async updateClaimStatus(id: number, status: string): Promise<void> {
    await db
      .update(claims)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(claims.id, id));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsForUser(userId: string, limit: number = 10): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return result[0]?.count || 0;
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    
    // Update user stats after rating
    await this.updateUserStats(rating.ratedUserId);
    
    return newRating;
  }

  async getRatingsForUser(userId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.ratedUserId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async getAverageRating(userId: string): Promise<number> {
    const result = await db
      .select({ avg: avg(ratings.rating) })
      .from(ratings)
      .where(eq(ratings.ratedUserId, userId));
    
    return Number(result[0]?.avg) || 0;
  }

  // Donation Center operations
  async getDonationCenters(filters: {
    type?: string;
    search?: string;
    isActive?: boolean;
  } = {}): Promise<DonationCenterWithDetails[]> {
    let query = db
      .select({
        id: donationCenters.id,
        name: donationCenters.name,
        description: donationCenters.description,
        address: donationCenters.address,
        latitude: donationCenters.latitude,
        longitude: donationCenters.longitude,
        contactPhone: donationCenters.contactPhone,
        contactEmail: donationCenters.contactEmail,
        operatingHours: donationCenters.operatingHours,
        centerType: donationCenters.centerType,
        capacity: donationCenters.capacity,
        currentLoad: donationCenters.currentLoad,
        isActive: donationCenters.isActive,
        managerId: donationCenters.managerId,
        createdAt: donationCenters.createdAt,
        updatedAt: donationCenters.updatedAt,
        manager: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          dietaryPreference: users.dietaryPreference,
          allergens: users.allergens,
        },
      })
      .from(donationCenters)
      .leftJoin(users, eq(donationCenters.managerId, users.id));

    const conditions = [];
    
    if (filters.isActive !== undefined) {
      conditions.push(eq(donationCenters.isActive, filters.isActive));
    }
    
    if (filters.type) {
      conditions.push(eq(donationCenters.centerType, filters.type));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          like(donationCenters.name, `%${filters.search}%`),
          like(donationCenters.address, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(asc(donationCenters.name));

    // Get partnerships for each center
    const centersWithPartnerships = await Promise.all(
      results.map(async (center) => {
        const partnerships = await db
          .select({
            id: centerNgoPartnerships.id,
            centerId: centerNgoPartnerships.centerId,
            ngoId: centerNgoPartnerships.ngoId,
            partnershipType: centerNgoPartnerships.partnershipType,
            isActive: centerNgoPartnerships.isActive,
            createdAt: centerNgoPartnerships.createdAt,
            ngo: {
              id: ngos.id,
              name: ngos.name,
              description: ngos.description,
              contactEmail: ngos.contactEmail,
              contactPhone: ngos.contactPhone,
              website: ngos.website,
              isActive: ngos.isActive,
              createdAt: ngos.createdAt,
              updatedAt: ngos.updatedAt,
            },
          })
          .from(centerNgoPartnerships)
          .leftJoin(ngos, eq(centerNgoPartnerships.ngoId, ngos.id))
          .where(
            and(
              eq(centerNgoPartnerships.centerId, center.id),
              eq(centerNgoPartnerships.isActive, true)
            )
          );

        return {
          ...center,
          partnerships,
          acceptedFoodTypes: [],
          specialRequirements: null,
        };
      })
    );

    return centersWithPartnerships;
  }

  async getDonationCenter(id: number): Promise<DonationCenterWithDetails | undefined> {
    const centers = await this.getDonationCenters();
    return centers.find(center => center.id === id);
  }

  async createDonationCenter(center: InsertDonationCenter): Promise<DonationCenter> {
    const [newCenter] = await db.insert(donationCenters).values(center).returning();
    return newCenter;
  }

  async updateDonationCenter(id: number, updates: Partial<InsertDonationCenter>): Promise<void> {
    await db
      .update(donationCenters)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(donationCenters.id, id));
  }

  // NGO operations
  async getNGOs(): Promise<NGO[]> {
    return await db
      .select()
      .from(ngos)
      .where(eq(ngos.isActive, true))
      .orderBy(asc(ngos.name));
  }

  async createNGO(ngo: InsertNGO): Promise<NGO> {
    const [newNGO] = await db.insert(ngos).values(ngo).returning();
    return newNGO;
  }

  // Corporate donation operations
  async getCorporateDonations(filters: {
    status?: string;
    companyType?: string;
    search?: string;
  } = {}): Promise<CorporateDonation[]> {
    let query = db.select().from(corporateDonations);

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(corporateDonations.status, filters.status));
    }
    if (filters.companyType) {
      conditions.push(eq(corporateDonations.companyType, filters.companyType));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(corporateDonations.companyName, `%${filters.search}%`),
          ilike(corporateDonations.contactPerson, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(corporateDonations.createdAt));
  }

  async getCorporateDonation(id: number): Promise<CorporateDonation | undefined> {
    const [donation] = await db
      .select()
      .from(corporateDonations)
      .where(eq(corporateDonations.id, id));
    return donation;
  }

  async createCorporateDonation(donation: InsertCorporateDonation): Promise<CorporateDonation> {
    const [createdDonation] = await db
      .insert(corporateDonations)
      .values(donation)
      .returning();
    return createdDonation;
  }

  async updateCorporateDonationStatus(id: number, status: string, approvedBy?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
    }
    
    await db
      .update(corporateDonations)
      .set(updateData)
      .where(eq(corporateDonations.id, id));
  }

  // Medical provider operations
  async getMedicalProviders(filters: {
    specialization?: string;
    location?: string;
    status?: string;
    isActive?: boolean;
  } = {}): Promise<MedicalProvider[]> {
    let query = db.select().from(medicalProviders);

    const conditions = [];
    if (filters.specialization) {
      conditions.push(sql`${medicalProviders.specialization} @> ARRAY[${filters.specialization}]`);
    }
    if (filters.location) {
      conditions.push(ilike(medicalProviders.serviceLocation, `%${filters.location}%`));
    }
    if (filters.status) {
      conditions.push(eq(medicalProviders.status, filters.status as any));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(medicalProviders.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(medicalProviders.createdAt));
  }

  async getMedicalProvider(id: number): Promise<MedicalProvider | undefined> {
    const [provider] = await db.select().from(medicalProviders).where(eq(medicalProviders.id, id));
    return provider;
  }

  async createMedicalProvider(provider: InsertMedicalProvider): Promise<MedicalProvider> {
    const [newProvider] = await db
      .insert(medicalProviders)
      .values(provider)
      .returning();
    return newProvider;
  }

  async updateMedicalProviderStatus(id: number, status: string, approvedBy?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
    }
    
    await db
      .update(medicalProviders)
      .set(updateData)
      .where(eq(medicalProviders.id, id));
  }

  // Clothing NGO operations
  async getClothingNgos(filters: {
    clothingType?: string;
    location?: string;
    status?: string;
    isActive?: boolean;
  } = {}): Promise<ClothingNgo[]> {
    let query = db.select().from(clothingNgos);

    const conditions = [];
    if (filters.clothingType) {
      conditions.push(sql`${clothingNgos.clothingTypes} @> ARRAY[${filters.clothingType}]`);
    }
    if (filters.location) {
      conditions.push(or(
        ilike(clothingNgos.address, `%${filters.location}%`),
        sql`${clothingNgos.serviceAreas} @> ARRAY[${filters.location}]`
      ));
    }
    if (filters.status) {
      conditions.push(eq(clothingNgos.status, filters.status as any));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(clothingNgos.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(clothingNgos.createdAt));
  }

  async getClothingNgo(id: number): Promise<ClothingNgo | undefined> {
    const [ngo] = await db.select().from(clothingNgos).where(eq(clothingNgos.id, id));
    return ngo;
  }

  async createClothingNgo(ngo: InsertClothingNgo): Promise<ClothingNgo> {
    const [newNgo] = await db
      .insert(clothingNgos)
      .values(ngo)
      .returning();
    return newNgo;
  }

  async updateClothingNgoStatus(id: number, status: string, approvedBy?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
    }
    
    await db
      .update(clothingNgos)
      .set(updateData)
      .where(eq(clothingNgos.id, id));
  }

  // Community Institution operations
  async getCommunityInstitutions(filters: {
    institutionType?: string;
    location?: string;
    status?: string;
    interfaithParticipation?: boolean;
    isActive?: boolean;
  } = {}): Promise<CommunityInstitution[]> {
    let query = db.select().from(communityInstitutions);
    const conditions = [];

    if (filters.institutionType) {
      conditions.push(eq(communityInstitutions.institutionType, filters.institutionType));
    }
    if (filters.location) {
      conditions.push(
        or(
          ilike(communityInstitutions.city, `%${filters.location}%`),
          ilike(communityInstitutions.state, `%${filters.location}%`)
        )
      );
    }
    if (filters.status) {
      conditions.push(eq(communityInstitutions.status, filters.status));
    }
    if (filters.interfaithParticipation !== undefined) {
      conditions.push(eq(communityInstitutions.interfaithParticipation, filters.interfaithParticipation));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(communityInstitutions.createdAt));
  }

  async getCommunityInstitution(id: number): Promise<CommunityInstitution | undefined> {
    const [institution] = await db
      .select()
      .from(communityInstitutions)
      .where(eq(communityInstitutions.id, id));
    return institution;
  }

  async createCommunityInstitution(institution: InsertCommunityInstitution): Promise<CommunityInstitution> {
    const [newInstitution] = await db
      .insert(communityInstitutions)
      .values(institution)
      .returning();
    return newInstitution;
  }

  async updateCommunityInstitutionStatus(id: number, status: string, verifiedBy?: string): Promise<void> {
    const updateData: any = { 
      status, 
      updatedAt: new Date()
    };
    
    if (verifiedBy) {
      updateData.verifiedBy = verifiedBy;
    }
    
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }
    
    await db
      .update(communityInstitutions)
      .set(updateData)
      .where(eq(communityInstitutions.id, id));
  }

  // Group Givers & Family Mode operations
  async getGroups(filters: {
    groupType?: string;
    location?: string;
    isActive?: boolean;
    badgeLevel?: string;
  } = {}): Promise<GroupWithDetails[]> {
    let query = db
      .select()
      .from(groups)
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groups.isActive, filters.isActive ?? true));

    if (filters.groupType) {
      query = query.where(eq(groups.groupType, filters.groupType));
    }
    if (filters.location) {
      query = query.where(like(groups.location, `%${filters.location}%`));
    }
    if (filters.badgeLevel) {
      query = query.where(eq(groups.badgeLevel, filters.badgeLevel));
    }

    const results = await query;
    
    // Get members and badges for each group
    const groupsWithDetails = await Promise.all(
      results.map(async (result) => {
        const group = result.groups;
        const creator = result.users!;
        
        const members = await this.getGroupMembers(group.id);
        const badges = await this.getGroupBadges(group.id);
        
        return {
          ...group,
          creator,
          members,
          badges,
          memberCount: members.length,
        };
      })
    );

    return groupsWithDetails;
  }

  async getGroup(id: number): Promise<GroupWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(groups)
      .leftJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groups.id, id));

    if (!result) return undefined;

    const group = result.groups;
    const creator = result.users!;
    
    const members = await this.getGroupMembers(group.id);
    const badges = await this.getGroupBadges(group.id);
    
    return {
      ...group,
      creator,
      members,
      badges,
      memberCount: members.length,
    };
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    const [group] = await db
      .insert(groups)
      .values(groupData)
      .returning();
    
    // Add creator as admin member
    await this.addGroupMember({
      groupId: group.id,
      userId: groupData.createdBy,
      role: "admin",
    });

    return group;
  }

  async updateGroup(id: number, updates: Partial<InsertGroup>): Promise<void> {
    await db
      .update(groups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(groups.id, id));
  }

  // Group Member operations
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [groupMember] = await db
      .insert(groupMembers)
      .values(member)
      .returning();
    
    // Update group member count
    await this.updateGroupStats(member.groupId);
    
    return groupMember;
  }

  async removeGroupMember(groupId: number, userId: string): Promise<void> {
    await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      );
    
    // Update group member count
    await this.updateGroupStats(groupId);
  }

  async updateGroupMemberRole(groupId: number, userId: string, role: string): Promise<void> {
    await db
      .update(groupMembers)
      .set({ role })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      );
  }

  async getGroupMembers(groupId: number): Promise<(GroupMember & { user: User })[]> {
    const results = await db
      .select()
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId));

    return results.map(result => ({
      ...result.group_members,
      user: result.users!,
    }));
  }

  // Group Post operations
  async createGroupPost(groupPost: InsertGroupPost): Promise<GroupPost> {
    const [result] = await db
      .insert(groupPosts)
      .values(groupPost)
      .returning();
    
    // Update group stats
    await this.updateGroupStats(groupPost.groupId);
    
    return result;
  }

  async getGroupPosts(groupId: number): Promise<(GroupPost & { post: Post })[]> {
    const results = await db
      .select()
      .from(groupPosts)
      .leftJoin(posts, eq(groupPosts.postId, posts.id))
      .where(eq(groupPosts.groupId, groupId))
      .orderBy(desc(groupPosts.createdAt));

    return results.map(result => ({
      ...result.group_posts,
      post: result.posts!,
    }));
  }

  // Group Badge operations
  async awardGroupBadge(badge: InsertGroupBadge): Promise<GroupBadge> {
    const [result] = await db
      .insert(groupBadges)
      .values(badge)
      .returning();
    
    return result;
  }

  async getGroupBadges(groupId: number): Promise<GroupBadge[]> {
    return await db
      .select()
      .from(groupBadges)
      .where(eq(groupBadges.groupId, groupId))
      .orderBy(desc(groupBadges.earnedAt));
  }

  async updateGroupStats(groupId: number): Promise<void> {
    // Get member count
    const memberCount = await db
      .select({ count: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    // Get total donations from group posts
    const donationCount = await db
      .select({ count: count() })
      .from(groupPosts)
      .where(eq(groupPosts.groupId, groupId));

    // Update group stats
    await db
      .update(groups)
      .set({
        totalMembers: memberCount[0]?.count || 0,
        totalDonations: donationCount[0]?.count || 0,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, groupId));

    // Award badges based on milestones
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId));

    if (group) {
      await this.checkAndAwardGroupBadges(group);
    }
  }

  private async checkAndAwardGroupBadges(group: Group): Promise<void> {
    const existingBadges = await this.getGroupBadges(group.id);
    const badgeNames = existingBadges.map(b => b.badgeName);

    // Award badges based on member count and donations
    if (group.totalMembers >= 5 && !badgeNames.includes("Neighborhood Nourisher")) {
      await this.awardGroupBadge({
        groupId: group.id,
        badgeName: "Neighborhood Nourisher",
        badgeType: "milestone",
        description: "Achieved 5+ active members in your giving group",
        iconEmoji: "🏠",
      });
      
      // Update badge level
      await db
        .update(groups)
        .set({ badgeLevel: "neighborhood_nourisher" })
        .where(eq(groups.id, group.id));
    }

    if (group.totalMembers >= 10 && !badgeNames.includes("Street Squad")) {
      await this.awardGroupBadge({
        groupId: group.id,
        badgeName: "Street Squad",
        badgeType: "milestone", 
        description: "Organized 10+ neighbors for collective giving",
        iconEmoji: "🏘️",
      });
      
      await db
        .update(groups)
        .set({ badgeLevel: "street_squad" })
        .where(eq(groups.id, group.id));
    }

    if (group.totalDonations >= 20 && !badgeNames.includes("Block Blessers")) {
      await this.awardGroupBadge({
        groupId: group.id,
        badgeName: "Block Blessers",
        badgeType: "milestone",
        description: "Shared 20+ meals as a unified group",
        iconEmoji: "🏢",
      });
      
      await db
        .update(groups)
        .set({ badgeLevel: "block_blessers" })
        .where(eq(groups.id, group.id));
    }

    if (group.totalDonations >= 50 && group.totalMembers >= 15 && !badgeNames.includes("Community Champions")) {
      await this.awardGroupBadge({
        groupId: group.id,
        badgeName: "Community Champions",
        badgeType: "achievement",
        description: "United 15+ members for 50+ shared meals",
        iconEmoji: "🏆",
      });
      
      await db
        .update(groups)
        .set({ badgeLevel: "community_champions" })
        .where(eq(groups.id, group.id));
    }
  }

  // Chat & Pickup Coordination operations
  async createChatRoom(chatRoomData: InsertChatRoom): Promise<ChatRoom> {
    const [chatRoom] = await db
      .insert(chatRooms)
      .values(chatRoomData)
      .returning();
    
    // Send initial system message
    await this.sendMessage({
      chatRoomId: chatRoom.id,
      senderId: "system",
      messageType: "system",
      content: "Chat room created. You can now coordinate pickup details securely. This chat will expire automatically for privacy."
    });
    
    return chatRoom;
  }

  async getChatRoom(id: number): Promise<ChatRoomWithDetails | undefined> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, id))
      .leftJoin(posts, eq(chatRooms.postId, posts.id))
      .leftJoin(users, eq(chatRooms.donorId, users.id));

    if (!room) return undefined;

    const messages = await this.getMessages(id, 50);
    const receiverUser = await this.getUser(room.chat_rooms.receiverId);
    const unreadCount = await this.getUnreadMessageCount(id, room.chat_rooms.receiverId);
    const pickupCoordination = await this.getPickupCoordination(id);

    return {
      ...room.chat_rooms,
      post: room.posts!,
      donor: room.users!,
      receiver: receiverUser!,
      messages,
      unreadCount,
      pickupCoordination
    } as ChatRoomWithDetails;
  }

  async getChatRoomsForUser(userId: string): Promise<ChatRoomWithDetails[]> {
    const rooms = await db
      .select()
      .from(chatRooms)
      .where(or(eq(chatRooms.donorId, userId), eq(chatRooms.receiverId, userId)))
      .orderBy(desc(chatRooms.createdAt));

    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        const details = await this.getChatRoom(room.id);
        return details!;
      })
    );

    return roomsWithDetails.filter(room => room !== undefined);
  }

  async getChatRoomByPost(postId: number, donorId: string, receiverId: string): Promise<ChatRoom | undefined> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(
        and(
          eq(chatRooms.postId, postId),
          eq(chatRooms.donorId, donorId),
          eq(chatRooms.receiverId, receiverId)
        )
      );
    return room;
  }

  async updateChatRoomStatus(id: number, status: string): Promise<void> {
    await db
      .update(chatRooms)
      .set({ 
        status: status as any,
        completedAt: status === 'completed' ? new Date() : undefined
      })
      .where(eq(chatRooms.id, id));
  }

  async expireChatRooms(): Promise<void> {
    const now = new Date();
    await db
      .update(chatRooms)
      .set({ status: 'expired' })
      .where(
        and(
          lt(chatRooms.expiresAt, now),
          eq(chatRooms.status, 'active')
        )
      );
  }

  // Chat Message operations
  async sendMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getMessages(chatRoomId: number, limit: number = 50): Promise<ChatMessageWithSender[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomId, chatRoomId))
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .orderBy(desc(chatMessages.sentAt))
      .limit(limit);

    return messages.map(msg => ({
      ...msg.chat_messages,
      sender: msg.users || { 
        id: "system", 
        firstName: "System", 
        lastName: "", 
        email: null,
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalDonations: 0,
        totalRequests: 0,
        averageRating: "0",
        totalRatings: 0,
        dietaryPreference: "no-preference",
        allergens: null
      } as User
    })).reverse();
  }

  async markMessagesAsRead(chatRoomId: number, userId: string): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.chatRoomId, chatRoomId),
          ne(chatMessages.senderId, userId)
        )
      );
  }

  async getUnreadMessageCount(chatRoomId: number, userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.chatRoomId, chatRoomId),
          ne(chatMessages.senderId, userId),
          eq(chatMessages.isRead, false)
        )
      );
    return result.count || 0;
  }

  // Pickup Coordination operations
  async proposePickup(coordinationData: InsertPickupCoordination): Promise<PickupCoordination> {
    const [coordination] = await db
      .insert(pickupCoordination)
      .values(coordinationData)
      .returning();
    
    // Send system message about pickup proposal
    await this.sendMessage({
      chatRoomId: coordinationData.chatRoomId,
      senderId: "system",
      messageType: "system",
      content: `Pickup proposed for ${new Date(coordinationData.proposedTime).toLocaleString()} at ${coordinationData.proposedLocation}`
    });
    
    return coordination;
  }

  async respondToPickup(id: number, status: string, responseMessage?: string): Promise<void> {
    await db
      .update(pickupCoordination)
      .set({ 
        status: status as any,
        responseMessage,
        respondedAt: new Date()
      })
      .where(eq(pickupCoordination.id, id));
  }

  async getPickupCoordination(chatRoomId: number): Promise<PickupCoordination | undefined> {
    const [coordination] = await db
      .select()
      .from(pickupCoordination)
      .where(eq(pickupCoordination.chatRoomId, chatRoomId))
      .orderBy(desc(pickupCoordination.createdAt))
      .limit(1);
    return coordination;
  }

  async confirmPickup(chatRoomId: number, pickupTime: Date, pickupLocation: string): Promise<void> {
    await db
      .update(chatRooms)
      .set({ 
        status: 'pickup_scheduled',
        pickupTime,
        pickupLocation
      })
      .where(eq(chatRooms.id, chatRoomId));
    
    // Send confirmation message
    await this.sendMessage({
      chatRoomId,
      senderId: "system",
      messageType: "pickup_confirmation",
      content: `Pickup confirmed for ${pickupTime.toLocaleString()} at ${pickupLocation}`
    });
  }

  // Meal Partners operations
  async getMealPartners(status?: string): Promise<MealPartnerWithDetails[]> {
    let query = db.select().from(mealPartners);
    
    if (status) {
      query = query.where(eq(mealPartners.partnershipStatus, status));
    }
    
    const partners = await query.orderBy(desc(mealPartners.createdAt));
    
    return partners.map(partner => ({
      ...partner,
      reservations: [],
      taxClaims: [],
      csrActivities: [],
    }));
  }

  async getMealPartner(id: number): Promise<MealPartnerWithDetails | undefined> {
    const [partner] = await db
      .select()
      .from(mealPartners)
      .where(eq(mealPartners.id, id));
    
    if (!partner) return undefined;
    
    return {
      ...partner,
      reservations: [],
      taxClaims: [],
      csrActivities: [],
    };
  }

  async createMealPartner(partner: InsertMealPartner): Promise<MealPartner> {
    const [newPartner] = await db
      .insert(mealPartners)
      .values(partner)
      .returning();
    
    return newPartner;
  }

  async updateMealPartner(id: number, updates: Partial<InsertMealPartner>): Promise<void> {
    await db
      .update(mealPartners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mealPartners.id, id));
  }

  // Meal Reservations operations
  async getMealReservations(userId?: string): Promise<MealReservationWithDetails[]> {
    let query = db
      .select({
        reservation: mealReservations,
        user: users,
        mealPartner: mealPartners,
      })
      .from(mealReservations)
      .leftJoin(users, eq(mealReservations.userId, users.id))
      .leftJoin(mealPartners, eq(mealReservations.mealPartnerId, mealPartners.id));
    
    if (userId) {
      query = query.where(eq(mealReservations.userId, userId));
    }
    
    const results = await query.orderBy(desc(mealReservations.createdAt));
    
    return results.map(result => ({
      ...result.reservation,
      user: result.user!,
      mealPartner: result.mealPartner!,
    }));
  }

  async getMealReservation(id: number): Promise<MealReservationWithDetails | undefined> {
    const [result] = await db
      .select({
        reservation: mealReservations,
        user: users,
        mealPartner: mealPartners,
      })
      .from(mealReservations)
      .leftJoin(users, eq(mealReservations.userId, users.id))
      .leftJoin(mealPartners, eq(mealReservations.mealPartnerId, mealPartners.id))
      .where(eq(mealReservations.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.reservation,
      user: result.user!,
      mealPartner: result.mealPartner!,
    };
  }

  async createMealReservation(reservation: InsertMealReservation): Promise<MealReservation> {
    const [newReservation] = await db
      .insert(mealReservations)
      .values(reservation)
      .returning();
    
    return newReservation;
  }

  async updateMealReservation(id: number, updates: Partial<InsertMealReservation>): Promise<void> {
    await db
      .update(mealReservations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mealReservations.id, id));
  }

  // Tax Benefit Claims operations
  async getTaxBenefitClaims(mealPartnerId?: number): Promise<TaxBenefitClaim[]> {
    let query = db.select().from(taxBenefitClaims);
    
    if (mealPartnerId) {
      query = query.where(eq(taxBenefitClaims.mealPartnerId, mealPartnerId));
    }
    
    return await query.orderBy(desc(taxBenefitClaims.createdAt));
  }

  async createTaxBenefitClaim(claim: InsertTaxBenefitClaim): Promise<TaxBenefitClaim> {
    const [newClaim] = await db
      .insert(taxBenefitClaims)
      .values(claim)
      .returning();
    
    return newClaim;
  }

  async updateTaxBenefitClaim(id: number, updates: Partial<InsertTaxBenefitClaim>): Promise<void> {
    await db
      .update(taxBenefitClaims)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(taxBenefitClaims.id, id));
  }

  // CSR Activities operations
  async getCsrActivities(mealPartnerId?: number): Promise<CsrActivity[]> {
    let query = db.select().from(csrActivities);
    
    if (mealPartnerId) {
      query = query.where(eq(csrActivities.mealPartnerId, mealPartnerId));
    }
    
    return await query.orderBy(desc(csrActivities.createdAt));
  }

  async createCsrActivity(activity: InsertCsrActivity): Promise<CsrActivity> {
    const [newActivity] = await db
      .insert(csrActivities)
      .values(activity)
      .returning();
    
    return newActivity;
  }

  // Community Impact Analytics
  async getCommunityImpactData(): Promise<any> {
    // Calculate total meals shared (completed posts)
    const totalMealsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.status, 'completed'));
    const totalMealsShared = totalMealsResult[0]?.count || 0;

    // Count total active users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(distinct ${posts.authorId})` })
      .from(posts);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get monthly data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = await db
      .select({
        month: sql<string>`to_char(${posts.createdAt}, 'Mon')`,
        meals: sql<number>`count(case when ${posts.status} = 'completed' then 1 end)`,
        users: sql<number>`count(distinct ${posts.authorId})`
      })
      .from(posts)
      .where(gte(posts.createdAt, sixMonthsAgo))
      .groupBy(sql`extract(month from ${posts.createdAt}), to_char(${posts.createdAt}, 'Mon')`)
      .orderBy(sql`extract(month from ${posts.createdAt})`);

    // Get top contributors
    const topContributors = await db
      .select({
        name: sql<string>`COALESCE(${users.firstName} || ' ' || substring(${users.lastName} from 1 for 1) || '.', 'Anonymous')`,
        meals: sql<number>`count(*)`,
        location: sql<string>`'Community'` // Simplified for demo
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.status, 'completed'))
      .groupBy(users.id, users.firstName, users.lastName)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(3);

    // Calculate growth metrics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentMonthMeals = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(
        eq(posts.status, 'completed'),
        gte(posts.createdAt, currentMonth)
      ));

    const lastMonthMeals = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(
        eq(posts.status, 'completed'),
        gte(posts.createdAt, lastMonth),
        lt(posts.createdAt, currentMonth)
      ));

    const currentCount = currentMonthMeals[0]?.count || 0;
    const lastCount = lastMonthMeals[0]?.count || 1;
    const monthlyGrowth = Math.round(((currentCount - lastCount) / lastCount) * 100);

    // Get impact by type
    const impactByCategory = await db
      .select({
        type: posts.type,
        count: sql<number>`count(*)`
      })
      .from(posts)
      .where(eq(posts.status, 'completed'))
      .groupBy(posts.type);

    // Map to category data
    const categoryMap: Record<string, { name: string; color: string }> = {
      'donation': { name: 'Home Cooked', color: '#8884d8' },
      'request': { name: 'Community Requests', color: '#82ca9d' }
    };

    const totalCompleted = impactByCategory.reduce((sum, item) => sum + item.count, 0) || 1;
    const formattedCategories = impactByCategory.map(item => ({
      name: categoryMap[item.type]?.name || item.type,
      value: Math.round((item.count / totalCompleted) * 100),
      color: categoryMap[item.type]?.color || '#ffc658'
    }));

    // Add meal partners and corporate data
    formattedCategories.push(
      { name: 'Restaurant Partners', value: 25, color: '#ff7300' },
      { name: 'Corporate Donations', value: 15, color: '#00C49F' }
    );

    // Calculate estimated environmental impact
    const avgFoodWastePerMeal = 0.5; // kg
    const co2PerKgFood = 2.5; // kg CO2
    const foodWastePrevented = (totalMealsShared * avgFoodWastePerMeal) / 1000; // tons
    const co2Saved = foodWastePrevented * co2PerKgFood;

    // Get regional impact (simplified)
    const regionalImpact = [
      { region: 'North District', meals: Math.round(totalMealsShared * 0.3), growth: 23 },
      { region: 'South District', meals: Math.round(totalMealsShared * 0.25), growth: 18 },
      { region: 'East District', meals: Math.round(totalMealsShared * 0.25), growth: 15 },
      { region: 'West District', meals: Math.round(totalMealsShared * 0.2), growth: 21 }
    ];

    return {
      totalMealsShared,
      totalUsers,
      activeCities: 12, // Static for demo
      foodWastePrevented: Math.round(foodWastePrevented * 10) / 10,
      co2Saved: Math.round(co2Saved * 10) / 10,
      monthlyGrowth: Math.max(0, monthlyGrowth),
      topContributors,
      monthlyData: monthlyData.length > 0 ? monthlyData : [
        { month: "Jan", meals: 0, users: 0 },
        { month: "Feb", meals: 0, users: 0 },
        { month: "Mar", meals: 0, users: 0 },
        { month: "Apr", meals: 0, users: 0 },
        { month: "May", meals: 0, users: 0 },
        { month: "Jun", meals: totalMealsShared, users: totalUsers }
      ],
      impactByCategory: formattedCategories,
      regionalImpact
    };
  }

  // Adopt a Slum Community Methods
  async getSlumCommunities(): Promise<any[]> {
    const communities = await db
      .select()
      .from(slumCommunities)
      .where(eq(slumCommunities.isActive, true))
      .orderBy(desc(slumCommunities.createdAt));
    return communities;
  }

  async getSlumCommunity(id: number): Promise<any | undefined> {
    const [community] = await db
      .select()
      .from(slumCommunities)
      .where(eq(slumCommunities.id, id));
    return community;
  }

  async createSlumCommunity(data: any): Promise<any> {
    const [community] = await db
      .insert(slumCommunities)
      .values(data)
      .returning();
    return community;
  }

  // Restaurant Adoption Methods
  async getRestaurantAdoptions(restaurantId: string): Promise<any[]> {
    const adoptions = await db
      .select({
        adoption: restaurantAdoptions,
        community: slumCommunities,
      })
      .from(restaurantAdoptions)
      .leftJoin(slumCommunities, eq(restaurantAdoptions.communityId, slumCommunities.id))
      .where(eq(restaurantAdoptions.restaurantId, restaurantId))
      .orderBy(desc(restaurantAdoptions.createdAt));

    return adoptions.map(({ adoption, community }) => ({
      ...adoption,
      community,
    }));
  }

  async createRestaurantAdoption(data: any): Promise<any> {
    const [adoption] = await db
      .insert(restaurantAdoptions)
      .values(data)
      .returning();
    return adoption;
  }

  async getAdoptionImpactStats(): Promise<any> {
    // Get total communities adopted
    const [totalCommunitiesResult] = await db
      .select({ count: count() })
      .from(restaurantAdoptions)
      .where(eq(restaurantAdoptions.status, "active"));

    // Get total people fed
    const [totalPeopleFedResult] = await db
      .select({ 
        totalPeopleFed: sum(slumCommunities.totalPeopleFed),
        totalMeals: sum(slumCommunities.totalMealsProvided)
      })
      .from(slumCommunities)
      .where(eq(slumCommunities.isActive, true));

    // Get active restaurants count
    const [activeRestaurantsResult] = await db
      .select({ count: count() })
      .from(restaurantAdoptions)
      .where(eq(restaurantAdoptions.status, "active"));

    return {
      totalCommunities: totalCommunitiesResult?.count || 0,
      totalPeopleFed: totalPeopleFedResult?.totalPeopleFed || 0,
      totalMeals: totalPeopleFedResult?.totalMeals || 0,
      activeRestaurants: activeRestaurantsResult?.count || 0,
    };
  }

  // Feeding Session Methods
  async getFeedingSessions(adoptionId: number): Promise<any[]> {
    const sessions = await db
      .select({
        session: feedingSessions,
        community: slumCommunities,
      })
      .from(feedingSessions)
      .leftJoin(slumCommunities, eq(feedingSessions.communityId, slumCommunities.id))
      .where(eq(feedingSessions.adoptionId, adoptionId))
      .orderBy(desc(feedingSessions.scheduledDate));

    return sessions.map(({ session, community }) => ({
      ...session,
      community,
    }));
  }

  async createFeedingSession(data: any): Promise<any> {
    const [session] = await db
      .insert(feedingSessions)
      .values(data)
      .returning();
    return session;
  }
}

export const storage = new DatabaseStorage();
