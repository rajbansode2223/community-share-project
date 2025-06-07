import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  real,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Additional fields for reputation
  totalDonations: integer("total_donations").default(0),
  totalRequests: integer("total_requests").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  // Dietary preferences
  dietaryPreference: varchar("dietary_preference", { enum: ["vegetarian", "non-vegetarian", "vegan", "no-preference"] }).default("no-preference"),
  allergens: text("allergens"), // JSON string array of user's allergens
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  type: varchar("type", { enum: ["donation", "request"] }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  quantity: varchar("quantity").notNull(),
  location: varchar("location").notNull(),
  imageUrl: varchar("image_url"),
  status: varchar("status", { enum: ["active", "claimed", "completed", "expired"] }).default("active"),
  dietaryType: varchar("dietary_type", { enum: ["vegetarian", "non-vegetarian", "vegan", "mixed"] }).default("mixed"),
  allergens: text("allergens"), // JSON string array of allergens
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  claimedBy: varchar("claimed_by").references(() => users.id),
  claimedAt: timestamp("claimed_at"),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  claimerId: varchar("claimer_id").notNull().references(() => users.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["pending", "approved", "rejected", "completed"] }).default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { enum: ["claim_approved", "claim_received", "pickup_reminder", "rating_request", "new_post_nearby"] }).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  relatedPostId: integer("related_post_id").references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  raterId: varchar("rater_id").notNull().references(() => users.id),
  ratedUserId: varchar("rated_user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donation Centers and NGO Partnerships
export const donationCenters = pgTable("donation_centers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  operatingHours: text("operating_hours"), // JSON string
  capacity: integer("capacity").default(100),
  currentLoad: integer("current_load").default(0),
  isActive: boolean("is_active").default(true),
  centerType: varchar("center_type", { enum: ["collection", "distribution", "both"] }).default("both"),
  acceptedFoodTypes: text("accepted_food_types"), // JSON array
  specialRequirements: text("special_requirements"),
  managerId: varchar("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ngos = pgTable("ngos", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  registrationNumber: varchar("registration_number", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  address: text("address"),
  website: varchar("website", { length: 500 }),
  serviceAreas: text("service_areas"), // JSON array of areas they serve
  specialization: text("specialization"), // Types of help they provide
  verificationStatus: varchar("verification_status", { enum: ["pending", "verified", "rejected"] }).default("pending"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const centerNgoPartnerships = pgTable("center_ngo_partnerships", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull().references(() => donationCenters.id),
  ngoId: integer("ngo_id").notNull().references(() => ngos.id),
  partnershipType: varchar("partnership_type", { enum: ["collection", "distribution", "both"] }).default("both"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Track donations to centers
export const centerDonations = pgTable("center_donations", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  centerId: integer("center_id").notNull().references(() => donationCenters.id),
  donorId: varchar("donor_id").notNull().references(() => users.id),
  quantity: varchar("quantity").notNull(),
  status: varchar("status", { enum: ["scheduled", "delivered", "processed", "distributed"] }).default("scheduled"),
  scheduledPickup: timestamp("scheduled_pickup"),
  actualPickup: timestamp("actual_pickup"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical Aid Providers - Independent doctors offering free services
export const medicalProviders = pgTable("medical_providers", {
  id: serial("id").primaryKey(),
  doctorName: varchar("doctor_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  medicalLicense: varchar("medical_license", { length: 100 }).notNull(),
  specialization: text("specialization").array().notNull(), // Array of specializations
  qualifications: text("qualifications"), // Medical degrees and certifications
  experienceYears: integer("experience_years"),
  availableHours: text("available_hours"), // JSON string of availability
  serviceLocation: text("service_location").notNull(), // Address or area
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  serviceRadius: integer("service_radius").default(10), // km radius
  servicesOffered: text("services_offered").array().notNull(), // Types of medical services
  languagesSpoken: text("languages_spoken").array(),
  consultationMode: varchar("consultation_mode", { enum: ["in_person", "virtual", "both"] }).default("both"),
  isVerified: boolean("is_verified").default(false),
  verificationDocuments: text("verification_documents").array(),
  totalConsultations: integer("total_consultations").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  status: varchar("status", { enum: ["pending", "approved", "suspended", "rejected"] }).default("pending"),
  approvedBy: varchar("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clothing Donation NGOs - Organizations accepting clothing donations
export const clothingNgos = pgTable("clothing_ngos", {
  id: serial("id").primaryKey(),
  organizationName: varchar("organization_name", { length: 255 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  serviceAreas: text("service_areas").array(), // Areas they serve
  clothingTypes: text("clothing_types").array().notNull(), // Types of clothing accepted
  targetBeneficiaries: text("target_beneficiaries").array(), // Who they help
  collectionSchedule: text("collection_schedule"), // When they collect donations
  dropOffLocations: text("drop_off_locations").array(),
  pickupAvailable: boolean("pickup_available").default(false),
  clothingConditions: text("clothing_conditions").array(), // New, gently used, etc.
  seasonalNeeds: text("seasonal_needs"), // Current urgent needs
  totalCollections: integer("total_collections").default(0),
  totalBeneficiaries: integer("total_beneficiaries").default(0),
  websiteUrl: varchar("website_url", { length: 255 }),
  socialMediaLinks: text("social_media_links").array(),
  isVerified: boolean("is_verified").default(false),
  certifications: text("certifications").array(), // NGO certifications
  isActive: boolean("is_active").default(true),
  status: varchar("status", { enum: ["pending", "approved", "suspended", "rejected"] }).default("pending"),
  approvedBy: varchar("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Corporate Social Responsibility - Company donations
export const corporateDonations = pgTable("corporate_donations", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  companyType: varchar("company_type", { enum: ["restaurant", "grocery", "catering", "food_manufacturer", "retail", "other"] }).notNull(),
  donationType: varchar("donation_type", { enum: ["regular", "surplus", "emergency", "event"] }).default("regular"),
  foodItems: text("food_items").array().notNull(), // Array of food items
  estimatedQuantity: varchar("estimated_quantity").notNull(),
  estimatedCalories: integer("estimated_calories"), // Total estimated calories
  frequency: varchar("frequency", { enum: ["daily", "weekly", "monthly", "occasional"] }).default("occasional"),
  pickupLocation: text("pickup_location").notNull(),
  pickupTimes: text("pickup_times"), // Available pickup times
  specialInstructions: text("special_instructions"),
  certifications: text("certifications").array(), // Food safety certifications
  status: varchar("status", { enum: ["pending", "approved", "active", "suspended", "completed"] }).default("pending"),
  approvedBy: varchar("approved_by"),
  preferredCenterId: integer("preferred_center_id").references(() => donationCenters.id),
  totalDonations: integer("total_donations").default(0),
  totalCaloriesContributed: integer("total_calories_contributed").default(0),
  lastDonationDate: timestamp("last_donation_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Institutions for Social Harmony
export const communityInstitutions = pgTable("community_institutions", {
  id: serial("id").primaryKey(),
  institutionName: varchar("institution_name").notNull(),
  institutionType: varchar("institution_type").notNull(), // "school", "mosque", "temple", "church", "synagogue", "community_center"
  contactPerson: varchar("contact_person").notNull(),
  contactTitle: varchar("contact_title"), // "Principal", "Imam", "Priest", "Rabbi", "Director"
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  postalCode: varchar("postal_code").notNull(),
  coordinates: varchar("coordinates"), // "lat,lng" for mapping
  capacity: integer("capacity"), // Number of people served/accommodated
  establishedYear: integer("established_year"),
  servicesOffered: text("services_offered").array(), // ["food_distribution", "educational_programs", "community_events", "interfaith_dialogue"]
  operatingHours: varchar("operating_hours").notNull(),
  specialPrograms: text("special_programs").array(), // ["ramadan_iftar", "christmas_meal", "thanksgiving_dinner", "educational_workshops"]
  targetCommunity: text("target_community").notNull(), // Description of community served
  collaborationAreas: text("collaboration_areas").array(), // ["food_sharing", "educational_outreach", "interfaith_events", "community_service"]
  facilitiesAvailable: text("facilities_available").array(), // ["kitchen", "dining_hall", "meeting_rooms", "parking", "playground"]
  accessibilityFeatures: text("accessibility_features").array(), // ["wheelchair_accessible", "braille_signage", "hearing_loop", "ramps"]
  languagesSupported: text("languages_supported").array(), // ["english", "spanish", "arabic", "hindi", "mandarin"]
  culturalConsiderations: text("cultural_considerations"),
  dietaryAccommodations: text("dietary_accommodations").array(), // ["halal", "kosher", "vegetarian", "vegan", "gluten_free"]
  volunteerCapacity: integer("volunteer_capacity"),
  donationPreferences: text("donation_preferences").array(), // ["non_perishable", "fresh_produce", "cooked_meals", "educational_materials"]
  pickupAvailable: boolean("pickup_available").default(false),
  deliveryAvailable: boolean("delivery_available").default(false),
  storageCapacity: varchar("storage_capacity"), // "small", "medium", "large"
  refrigerationAvailable: boolean("refrigeration_available").default(false),
  registrationNumber: varchar("registration_number"),
  taxExemptStatus: varchar("tax_exempt_status"), // "501c3", "religious_exemption", "educational_exemption"
  participationLevel: varchar("participation_level").default("basic"), // "basic", "active", "partner", "coordinator"
  interfaithParticipation: boolean("interfaith_participation").default(true),
  youthPrograms: boolean("youth_programs").default(false),
  seniorPrograms: boolean("senior_programs").default(false),
  familyPrograms: boolean("family_programs").default(false),
  educationalLevel: varchar("educational_level"), // For schools: "elementary", "middle", "high", "university"
  denomination: varchar("denomination"), // For religious institutions
  status: varchar("status").default("pending"), // "pending", "approved", "rejected", "active", "inactive"
  verifiedBy: varchar("verified_by"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  claims: many(claims),
  notifications: many(notifications),
  ratingsGiven: many(ratings, { relationName: "raterRatings" }),
  ratingsReceived: many(ratings, { relationName: "ratedUserRatings" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  claimer: one(users, {
    fields: [posts.claimedBy],
    references: [users.id],
  }),
  claims: many(claims),
  ratings: many(ratings),
}));

export const claimsRelations = relations(claims, ({ one }) => ({
  post: one(posts, {
    fields: [claims.postId],
    references: [posts.id],
  }),
  claimer: one(users, {
    fields: [claims.claimerId],
    references: [users.id],
  }),
  author: one(users, {
    fields: [claims.authorId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedPost: one(posts, {
    fields: [notifications.relatedPostId],
    references: [posts.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  post: one(posts, {
    fields: [ratings.postId],
    references: [posts.id],
  }),
  rater: one(users, {
    fields: [ratings.raterId],
    references: [users.id],
    relationName: "raterRatings",
  }),
  ratedUser: one(users, {
    fields: [ratings.ratedUserId],
    references: [users.id],
    relationName: "ratedUserRatings",
  }),
}));

export const donationCentersRelations = relations(donationCenters, ({ one, many }) => ({
  manager: one(users, {
    fields: [donationCenters.managerId],
    references: [users.id],
  }),
  partnerships: many(centerNgoPartnerships),
  donations: many(centerDonations),
}));

export const ngosRelations = relations(ngos, ({ many }) => ({
  partnerships: many(centerNgoPartnerships),
}));

export const centerNgoPartnershipsRelations = relations(centerNgoPartnerships, ({ one }) => ({
  center: one(donationCenters, {
    fields: [centerNgoPartnerships.centerId],
    references: [donationCenters.id],
  }),
  ngo: one(ngos, {
    fields: [centerNgoPartnerships.ngoId],
    references: [ngos.id],
  }),
}));

export const centerDonationsRelations = relations(centerDonations, ({ one }) => ({
  post: one(posts, {
    fields: [centerDonations.postId],
    references: [posts.id],
  }),
  center: one(donationCenters, {
    fields: [centerDonations.centerId],
    references: [donationCenters.id],
  }),
  donor: one(users, {
    fields: [centerDonations.donorId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  claimedBy: true,
  claimedAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertCorporateDonationSchema = createInsertSchema(corporateDonations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalDonations: true,
  totalCaloriesContributed: true,
  lastDonationDate: true,
});

export const insertMedicalProviderSchema = createInsertSchema(medicalProviders).omit({
  id: true,
  totalConsultations: true,
  averageRating: true,
  isVerified: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClothingNgoSchema = createInsertSchema(clothingNgos).omit({
  id: true,
  totalCollections: true,
  totalBeneficiaries: true,
  isVerified: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityInstitutionSchema = createInsertSchema(communityInstitutions).omit({
  id: true,
  verifiedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
// Adopt a Slum Communities table
export const slumCommunities = pgTable("slum_communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  estimatedPopulation: integer("estimated_population"),
  contactPerson: varchar("contact_person", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  accessInstructions: text("access_instructions"),
  bestFeedingTimes: text("best_feeding_times"),
  specialNeeds: text("special_needs"), // dietary restrictions, elderly, children
  safetyConsiderations: text("safety_considerations"),
  isActive: boolean("is_active").default(true),
  verificationStatus: varchar("verification_status", { 
    enum: ["pending", "verified", "suspended", "rejected"] 
  }).default("pending"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  totalPeopleFed: integer("total_people_fed").default(0),
  totalMealsProvided: integer("total_meals_provided").default(0),
  lastFeedingDate: timestamp("last_feeding_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Restaurant Adoption Pledges table
export const restaurantAdoptions = pgTable("restaurant_adoptions", {
  id: serial("id").primaryKey(),
  restaurantId: varchar("restaurant_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => slumCommunities.id),
  pledgeType: varchar("pledge_type", { 
    enum: ["weekly", "bi_weekly", "monthly", "custom"] 
  }).notNull(),
  targetMeals: integer("target_meals").notNull(),
  preferredDay: varchar("preferred_day", { 
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] 
  }),
  preferredTime: varchar("preferred_time", { 
    enum: ["morning", "afternoon", "evening"] 
  }),
  status: varchar("status", { 
    enum: ["active", "paused", "completed", "cancelled"] 
  }).default("active"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null for ongoing
  totalMealsDelivered: integer("total_meals_delivered").default(0),
  totalPeopleFed: integer("total_people_fed").default(0),
  feedingCount: integer("feeding_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  lastFeedingDate: timestamp("last_feeding_date"),
  nextScheduledFeeding: timestamp("next_scheduled_feeding"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feeding Sessions table
export const feedingSessions = pgTable("feeding_sessions", {
  id: serial("id").primaryKey(),
  adoptionId: integer("adoption_id").notNull().references(() => restaurantAdoptions.id),
  communityId: integer("community_id").notNull().references(() => slumCommunities.id),
  restaurantId: varchar("restaurant_id").notNull().references(() => users.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  actualDate: timestamp("actual_date"),
  mealsPlanned: integer("meals_planned").notNull(),
  mealsServed: integer("meals_served"),
  peopleFed: integer("people_fed"),
  foodItems: text("food_items"), // JSON array of food items
  volunteers: text("volunteers"), // JSON array of volunteer IDs
  status: varchar("status", { 
    enum: ["scheduled", "in_progress", "completed", "cancelled", "postponed"] 
  }).default("scheduled"),
  communityRating: integer("community_rating"), // 1-5 rating from community
  communityFeedback: text("community_feedback"),
  restaurantNotes: text("restaurant_notes"),
  challenges: text("challenges"),
  photos: text("photos"), // JSON array of photo URLs
  verificationPhotos: text("verification_photos"), // JSON array of verification photo URLs
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  donationValue: decimal("donation_value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feeding Session Volunteers table
export const feedingSessionVolunteers = pgTable("feeding_session_volunteers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => feedingSessions.id),
  volunteerId: varchar("volunteer_id").notNull().references(() => users.id),
  role: varchar("role", { 
    enum: ["driver", "server", "coordinator", "photographer", "helper"] 
  }),
  status: varchar("status", { 
    enum: ["assigned", "confirmed", "completed", "no_show", "cancelled"] 
  }).default("assigned"),
  checkedInAt: timestamp("checked_in_at"),
  checkedOutAt: timestamp("checked_out_at"),
  hoursServed: decimal("hours_served", { precision: 4, scale: 2 }),
  rating: integer("rating"), // 1-5 rating for volunteer performance
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Impact Metrics table
export const communityImpactMetrics = pgTable("community_impact_metrics", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => slumCommunities.id),
  date: timestamp("date").notNull(),
  totalMealsServed: integer("total_meals_served").default(0),
  uniquePeopleFed: integer("unique_people_fed").default(0),
  childrenFed: integer("children_fed").default(0),
  elderlyFed: integer("elderly_fed").default(0),
  pregnantWomenFed: integer("pregnant_women_fed").default(0),
  restaurantsParticipated: integer("restaurants_participated").default(0),
  volunteersParticipated: integer("volunteers_participated").default(0),
  averageMealQuality: decimal("average_meal_quality", { precision: 3, scale: 2 }),
  communityMorale: integer("community_morale"), // 1-10 scale
  healthImprovements: text("health_improvements"), // qualitative notes
  educationalActivities: text("educational_activities"),
  communityFeedback: text("community_feedback"),
  monthlyTrends: text("monthly_trends"), // JSON data
  createdAt: timestamp("created_at").defaultNow(),
});

// Care Institutions (Orphanages & Old Age Homes) table
export const careInstitutions = pgTable("care_institutions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  institutionType: varchar("institution_type", { 
    enum: ["orphanage", "old_age_home", "rehabilitation_center", "shelter_home"] 
  }).notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  capacity: integer("capacity"), // number of residents
  currentResidents: integer("current_residents"),
  ageGroups: text("age_groups"), // "0-5,6-12,13-18" for orphanages, "60-70,70-80,80+" for old age homes
  contactPerson: varchar("contact_person", { length: 100 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  contactEmail: varchar("contact_email", { length: 100 }),
  registrationNumber: varchar("registration_number", { length: 50 }),
  licensingAuthority: varchar("licensing_authority", { length: 100 }),
  managedBy: varchar("managed_by", { length: 100 }), // NGO name, trust, government
  visitingHours: text("visiting_hours"),
  mealsPerDay: integer("meals_per_day").default(3),
  specialDietaryNeeds: text("special_dietary_needs"),
  medicalFacilities: text("medical_facilities"),
  emergencyContact: varchar("emergency_contact", { length: 20 }),
  isActive: boolean("is_active").default(true),
  verificationStatus: varchar("verification_status", { 
    enum: ["pending", "verified", "suspended", "rejected"] 
  }).default("pending"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  totalDonationsReceived: integer("total_donations_received").default(0),
  totalMealsProvided: integer("total_meals_provided").default(0),
  lastDonationDate: timestamp("last_donation_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Institution Adoptions (similar to restaurant adoptions but for care institutions)
export const institutionAdoptions = pgTable("institution_adoptions", {
  id: serial("id").primaryKey(),
  donorId: varchar("donor_id").references(() => users.id).notNull(),
  institutionId: integer("institution_id").references(() => careInstitutions.id).notNull(),
  donorType: varchar("donor_type", { 
    enum: ["individual", "restaurant", "corporate", "ngo", "community_group"] 
  }).notNull(),
  donorName: varchar("donor_name", { length: 200 }).notNull(),
  donorContact: varchar("donor_contact", { length: 20 }),
  pledgeType: varchar("pledge_type", { 
    enum: ["daily", "weekly", "monthly", "festival", "one_time"] 
  }).notNull(),
  mealsPerSession: integer("meals_per_session").notNull(),
  preferredTime: varchar("preferred_time", { length: 50 }),
  specialRequests: text("special_requests"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  totalSessions: integer("total_sessions").default(0),
  completedSessions: integer("completed_sessions").default(0),
  totalMealsProvided: integer("total_meals_provided").default(0),
  totalAmountDonated: integer("total_amount_donated").default(0),
  isActive: boolean("is_active").default(true),
  status: varchar("status", { 
    enum: ["active", "paused", "completed", "cancelled"] 
  }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Institution Feeding Sessions
export const institutionFeedingSessions = pgTable("institution_feeding_sessions", {
  id: serial("id").primaryKey(),
  adoptionId: integer("adoption_id").references(() => institutionAdoptions.id).notNull(),
  institutionId: integer("institution_id").references(() => careInstitutions.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  actualDate: timestamp("actual_date"),
  mealsPlanned: integer("meals_planned").notNull(),
  mealsServed: integer("meals_served"),
  beneficiaries: integer("beneficiaries"), // actual number who received meals
  menuItems: text("menu_items"),
  volunteerCount: integer("volunteer_count").default(0),
  feedbackFromInstitution: text("feedback_from_institution"),
  photos: text("photos").array(), // photo URLs
  notes: text("notes"),
  status: varchar("status", { 
    enum: ["scheduled", "in_progress", "completed", "cancelled", "rescheduled"] 
  }).default("scheduled"),
  completedBy: varchar("completed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Institution Session Volunteers
export const institutionSessionVolunteers = pgTable("institution_session_volunteers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => institutionFeedingSessions.id).notNull(),
  volunteerId: varchar("volunteer_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).default("volunteer"), // coordinator, server, cleaner, etc.
  hoursContributed: integer("hours_contributed").default(0),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 rating of the experience
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// Extended types with relations
export type PostWithAuthor = Post & {
  author: User;
  claimer?: User | null;
  _count?: {
    claims: number;
  };
};

export type UserWithStats = User & {
  posts?: Post[];
  ratingsReceived?: Rating[];
};

// Donation Center and NGO types
export type DonationCenter = typeof donationCenters.$inferSelect;
export type InsertDonationCenter = typeof donationCenters.$inferInsert;
export type NGO = typeof ngos.$inferSelect;
export type InsertNGO = typeof ngos.$inferInsert;
export type CenterNgoPartnership = typeof centerNgoPartnerships.$inferSelect;
export type InsertCenterNgoPartnership = typeof centerNgoPartnerships.$inferInsert;
export type CenterDonation = typeof centerDonations.$inferSelect;
export type InsertCenterDonation = typeof centerDonations.$inferInsert;

export type DonationCenterWithDetails = DonationCenter & {
  manager?: User;
  partnerships?: (CenterNgoPartnership & { ngo: NGO })[];
  donations?: CenterDonation[];
  distance?: number; // For location-based sorting
  acceptedFoodTypes?: string[];
  specialRequirements?: string;
};

// Corporate donation types
export type CorporateDonation = typeof corporateDonations.$inferSelect;
export type InsertCorporateDonation = typeof corporateDonations.$inferInsert;

export type MedicalProvider = typeof medicalProviders.$inferSelect;
export type InsertMedicalProvider = z.infer<typeof insertMedicalProviderSchema>;

export type ClothingNgo = typeof clothingNgos.$inferSelect;
export type InsertClothingNgo = z.infer<typeof insertClothingNgoSchema>;

export type CommunityInstitution = typeof communityInstitutions.$inferSelect;
export type InsertCommunityInstitution = z.infer<typeof insertCommunityInstitutionSchema>;

// Care Institution types
export type CareInstitution = typeof careInstitutions.$inferSelect;
export type InsertCareInstitution = typeof careInstitutions.$inferInsert;
export type InstitutionAdoption = typeof institutionAdoptions.$inferSelect;
export type InsertInstitutionAdoption = typeof institutionAdoptions.$inferInsert;
export type InstitutionFeedingSession = typeof institutionFeedingSessions.$inferSelect;
export type InsertInstitutionFeedingSession = typeof institutionFeedingSessions.$inferInsert;

export type CareInstitutionWithDetails = CareInstitution & {
  adoptions?: InstitutionAdoption[];
  upcomingSessions?: InstitutionFeedingSession[];
  totalVolunteers?: number;
};

// Community Events table for interfaith collaboration events
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // food_drive, interfaith_dialogue, cultural_exchange, educational_workshop
  description: text("description"),
  hostInstitutionId: integer("host_institution_id").references(() => communityInstitutions.id),
  partnerInstitutionIds: text("partner_institution_ids"), // JSON array of partner institution IDs
  eventDate: timestamp("event_date").notNull(),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  venue: varchar("venue", { length: 255 }),
  address: varchar("address", { length: 500 }),
  expectedAttendees: integer("expected_attendees"),
  registrationRequired: boolean("registration_required").default(false),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  eventGoals: text("event_goals"), // JSON array
  foodProvided: boolean("food_provided").default(false),
  dietaryAccommodations: text("dietary_accommodations"), // JSON array
  donationGoals: text("donation_goals"), // JSON object with targets
  volunteerNeeds: text("volunteer_needs"), // JSON array
  eventImage: varchar("event_image", { length: 500 }),
  status: varchar("status", { length: 20 }).default("planned"), // planned, active, completed, cancelled
  createdBy: varchar("created_by", { length: 255 }), // User ID
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  actualAttendees: integer("actual_attendees"),
  donationsCollected: text("donations_collected"), // JSON object with actual donations
  feedbackSummary: text("feedback_summary"),
  impactMetrics: text("impact_metrics"), // JSON object
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Registration table
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => communityEvents.id),
  userId: varchar("user_id", { length: 255 }), // User ID
  registrationDate: timestamp("registration_date").defaultNow(),
  attendeeType: varchar("attendee_type", { length: 50 }), // individual, family, group, institution
  numberOfAttendees: integer("number_of_attendees").default(1),
  specialRequests: text("special_requests"),
  dietaryRestrictions: text("dietary_restrictions"), // JSON array
  volunteerInterest: boolean("volunteer_interest").default(false),
  status: varchar("status", { length: 20 }).default("confirmed"), // confirmed, cancelled, attended, no_show
  checkInTime: timestamp("check_in_time"),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 stars
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityEventSchema = createInsertSchema(communityEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registrationDate: true,
  updatedAt: true,
});

// Relations for events
export const communityEventsRelations = relations(communityEvents, ({ one, many }) => ({
  hostInstitution: one(communityInstitutions, {
    fields: [communityEvents.hostInstitutionId],
    references: [communityInstitutions.id],
  }),
  creator: one(users, {
    fields: [communityEvents.createdBy],
    references: [users.id],
  }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(communityEvents, {
    fields: [eventRegistrations.eventId],
    references: [communityEvents.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
}));

export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

// Volunteer Delivery System
export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  vehicleType: varchar("vehicle_type", { enum: ["bike", "scooter", "car", "van", "walking"] }).notNull(),
  availabilityZone: varchar("availability_zone").notNull(),
  maxDistance: integer("max_distance").default(10),
  phoneNumber: varchar("phone_number").notNull(),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  rating: real("rating").default(5.0),
  totalDeliveries: integer("total_deliveries").default(0),
  availableFrom: time("available_from"),
  availableTo: time("available_to"),
  workingDays: varchar("working_days").array().default([]),
  emergencyContact: varchar("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deliveryRequests = pgTable("delivery_requests", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => volunteers.id),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  pickupCoordinates: varchar("pickup_coordinates"),
  deliveryCoordinates: varchar("delivery_coordinates"),
  estimatedDistance: real("estimated_distance"),
  status: varchar("status", { 
    enum: ["pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"] 
  }).default("pending"),
  urgencyLevel: varchar("urgency_level", { enum: ["low", "medium", "high", "emergency"] }).default("medium"),
  specialInstructions: text("special_instructions"),
  pickupTimeWindow: varchar("pickup_time_window"),
  deliveryFee: real("delivery_fee").default(0),
  scheduledPickupTime: timestamp("scheduled_pickup_time"),
  actualPickupTime: timestamp("actual_pickup_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  contactNumber: varchar("contact_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const volunteerRatings = pgTable("volunteer_ratings", {
  id: serial("id").primaryKey(),
  deliveryRequestId: integer("delivery_request_id").references(() => deliveryRequests.id).notNull(),
  raterId: varchar("rater_id").references(() => users.id).notNull(),
  volunteerId: integer("volunteer_id").references(() => volunteers.id).notNull(),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gamified Volunteer Missions System
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'weekly', 'monthly', 'daily', 'special'
  target: integer("target").notNull(), // number to achieve
  points: integer("points").notNull(), // reward points
  difficulty: varchar("difficulty").notNull(), // 'easy', 'medium', 'hard'
  category: varchar("category").notNull(), // 'feeding', 'delivery', 'donation', 'community'
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Food Pickup System
export const eventFoodPickups = pgTable("event_food_pickups", {
  id: serial("id").primaryKey(),
  eventName: varchar("event_name", { length: 200 }).notNull(),
  eventType: varchar("event_type", { 
    enum: ["wedding", "corporate", "birthday", "anniversary", "conference", "festival", "community", "religious", "graduation", "other"] 
  }).notNull(),
  organizerName: varchar("organizer_name", { length: 100 }).notNull(),
  organizerPhone: varchar("organizer_phone", { length: 20 }).notNull(),
  organizerEmail: varchar("organizer_email", { length: 100 }),
  eventVenue: varchar("event_venue", { length: 200 }).notNull(),
  eventAddress: text("event_address").notNull(),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  eventDate: timestamp("event_date").notNull(),
  eventEndTime: timestamp("event_end_time").notNull(),
  pickupStartTime: timestamp("pickup_start_time").notNull(),
  pickupEndTime: timestamp("pickup_end_time").notNull(),
  estimatedGuests: integer("estimated_guests").notNull(),
  estimatedLeftoverPercentage: integer("estimated_leftover_percentage").default(30),
  foodTypes: text("food_types").notNull(), // JSON array of food categories
  cuisineType: varchar("cuisine_type", { length: 100 }),
  specialInstructions: text("special_instructions"),
  contactPerson: varchar("contact_person", { length: 100 }),
  contactPersonPhone: varchar("contact_person_phone", { length: 20 }),
  servingContainers: boolean("serving_containers").default(false),
  requiresRefrigeration: boolean("requires_refrigeration").default(false),
  accessInstructions: text("access_instructions"),
  parkingAvailable: boolean("parking_available").default(true),
  loadingAccess: boolean("loading_access").default(true),
  status: varchar("status", { 
    enum: ["pending", "approved", "active", "completed", "cancelled", "expired"] 
  }).default("pending"),
  maxVolunteers: integer("max_volunteers").default(10),
  currentVolunteers: integer("current_volunteers").default(0),
  verificationRequired: boolean("verification_required").default(true),
  createdBy: varchar("created_by"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventVolunteerRegistrations = pgTable("event_volunteer_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => eventFoodPickups.id).notNull(),
  userId: varchar("user_id").notNull(),
  registrationDate: timestamp("registration_date").defaultNow(),
  vehicleType: varchar("vehicle_type", { 
    enum: ["car", "suv", "van", "truck", "bicycle", "motorcycle", "walking"] 
  }),
  vehicleCapacity: varchar("vehicle_capacity", { length: 50 }),
  availableFrom: timestamp("available_from").notNull(),
  availableTo: timestamp("available_to").notNull(),
  specialSkills: text("special_skills"), // refrigerated transport, heavy lifting, etc
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  status: varchar("status", { 
    enum: ["pending", "confirmed", "checked_in", "completed", "cancelled", "no_show"] 
  }).default("pending"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  foodCollected: text("food_collected"), // JSON description of items collected
  organizerRating: integer("organizer_rating"), // 1-5 rating from organizer
  organizerFeedback: text("organizer_feedback"),
  volunteerRating: integer("volunteer_rating"), // 1-5 rating from volunteer
  volunteerFeedback: text("volunteer_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventFoodDistributions = pgTable("event_food_distributions", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => eventFoodPickups.id).notNull(),
  volunteerId: varchar("volunteer_id").notNull(),
  distributionType: varchar("distribution_type", { 
    enum: ["donation_center", "direct_distribution", "food_bank", "shelter", "community_kitchen", "individual"] 
  }).notNull(),
  recipientName: varchar("recipient_name", { length: 100 }),
  recipientLocation: varchar("recipient_location", { length: 200 }),
  quantityDistributed: varchar("quantity_distributed", { length: 100 }),
  foodItems: text("food_items"), // JSON array of distributed items
  distributionDate: timestamp("distribution_date").notNull(),
  recipientFeedback: text("recipient_feedback"),
  impactMetrics: text("impact_metrics"), // meals served, people fed, etc
  photos: text("photos"), // JSON array of photo URLs
  verificationStatus: varchar("verification_status", { 
    enum: ["pending", "verified", "disputed"] 
  }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userMissions = pgTable("user_missions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  missionId: integer("mission_id").notNull().references(() => missions.id),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  startedAt: timestamp("started_at").defaultNow(),
});

export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalPoints: integer("total_points").default(0),
  availableCoins: integer("available_coins").default(0), // kindness coins
  lifetimePoints: integer("lifetime_points").default(0),
  currentRank: varchar("current_rank").default("Newcomer"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  type: varchar("type").notNull(), // 'earned', 'spent', 'bonus'
  source: varchar("source").notNull(), // 'mission', 'donation', 'delivery', 'coupon'
  sourceId: integer("source_id"), // reference to mission, donation, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewardCoupons = pgTable("reward_coupons", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  discount: varchar("discount").notNull(), // "10%", "$5 off", etc.
  brand: varchar("brand").notNull(),
  category: varchar("category").notNull(), // 'food', 'grocery', 'restaurant', 'retail'
  costInCoins: integer("cost_in_coins").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").default(true),
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCoupons = pgTable("user_coupons", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  couponId: integer("coupon_id").notNull().references(() => rewardCoupons.id),
  code: varchar("code").notNull().unique(),
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Relations
export const volunteersRelations = relations(volunteers, ({ one, many }) => ({
  user: one(users, { fields: [volunteers.userId], references: [users.id] }),
  deliveryRequests: many(deliveryRequests),
  ratings: many(volunteerRatings),
}));

export const deliveryRequestsRelations = relations(deliveryRequests, ({ one }) => ({
  post: one(posts, { fields: [deliveryRequests.postId], references: [posts.id] }),
  requester: one(users, { fields: [deliveryRequests.requesterId], references: [users.id] }),
  volunteer: one(volunteers, { fields: [deliveryRequests.volunteerId], references: [volunteers.id] }),
  rating: one(volunteerRatings, { fields: [deliveryRequests.id], references: [volunteerRatings.deliveryRequestId] }),
}));

export const volunteerRatingsRelations = relations(volunteerRatings, ({ one }) => ({
  deliveryRequest: one(deliveryRequests, { fields: [volunteerRatings.deliveryRequestId], references: [deliveryRequests.id] }),
  rater: one(users, { fields: [volunteerRatings.raterId], references: [users.id] }),
  volunteer: one(volunteers, { fields: [volunteerRatings.volunteerId], references: [volunteers.id] }),
}));

// Missions Relations
export const missionsRelations = relations(missions, ({ many }) => ({
  userMissions: many(userMissions),
}));

export const userMissionsRelations = relations(userMissions, ({ one }) => ({
  user: one(users, { fields: [userMissions.userId], references: [users.id] }),
  mission: one(missions, { fields: [userMissions.missionId], references: [missions.id] }),
}));

export const userPointsRelations = relations(userPoints, ({ one, many }) => ({
  user: one(users, { fields: [userPoints.userId], references: [users.id] }),
  transactions: many(pointTransactions),
}));

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  user: one(users, { fields: [pointTransactions.userId], references: [users.id] }),
}));

export const rewardCouponsRelations = relations(rewardCoupons, ({ many }) => ({
  userCoupons: many(userCoupons),
}));

export const userCouponsRelations = relations(userCoupons, ({ one }) => ({
  user: one(users, { fields: [userCoupons.userId], references: [users.id] }),
  coupon: one(rewardCoupons, { fields: [userCoupons.couponId], references: [rewardCoupons.id] }),
}));

// Insert schemas
export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalDeliveries: true,
  rating: true,
  isVerified: true,
});

export const insertDeliveryRequestSchema = createInsertSchema(deliveryRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  volunteerId: true,
  actualPickupTime: true,
  actualDeliveryTime: true,
});

export const insertVolunteerRatingSchema = createInsertSchema(volunteerRatings).omit({
  id: true,
  createdAt: true,
});

// Types
export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type DeliveryRequest = typeof deliveryRequests.$inferSelect;
export type InsertDeliveryRequest = z.infer<typeof insertDeliveryRequestSchema>;
export type VolunteerRating = typeof volunteerRatings.$inferSelect;
export type InsertVolunteerRating = z.infer<typeof insertVolunteerRatingSchema>;

export type VolunteerWithStats = Volunteer & {
  user: User;
  totalRatings: number;
  averageRating: number;
  recentDeliveries: DeliveryRequest[];
};

export type DeliveryRequestWithDetails = DeliveryRequest & {
  post: Post;
  requester: User;
  volunteer?: Volunteer & { user: User };
  rating?: VolunteerRating;
};

// Missions insert schemas and types
export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
});

export const insertUserMissionSchema = createInsertSchema(userMissions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertRewardCouponSchema = createInsertSchema(rewardCoupons).omit({
  id: true,
  createdAt: true,
  currentRedemptions: true,
});

export const insertUserCouponSchema = createInsertSchema(userCoupons).omit({
  id: true,
  redeemedAt: true,
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type UserMission = typeof userMissions.$inferSelect;
export type InsertUserMission = z.infer<typeof insertUserMissionSchema>;
export type UserPoints = typeof userPoints.$inferSelect;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type RewardCoupon = typeof rewardCoupons.$inferSelect;
export type InsertRewardCoupon = z.infer<typeof insertRewardCouponSchema>;
export type UserCoupon = typeof userCoupons.$inferSelect;
export type InsertUserCoupon = z.infer<typeof insertUserCouponSchema>;

export type MissionWithProgress = Mission & {
  userMission?: UserMission;
  progressPercentage: number;
  timeRemaining: string;
};

export type UserPointsWithRank = UserPoints & {
  rank: number;
  nextRankThreshold: number;
};

// Group Givers & Family Mode Tables
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  groupType: varchar("group_type", { 
    length: 50 
  }).$type<"family" | "housing_society" | "neighborhood" | "workplace" | "school" | "friends" | "other">().default("family"),
  location: varchar("location", { length: 200 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  isActive: boolean("is_active").default(true),
  totalMembers: integer("total_members").default(1),
  totalDonations: integer("total_donations").default(0),
  totalMealsShared: integer("total_meals_shared").default(0),
  badgeLevel: varchar("badge_level", { 
    length: 50 
  }).$type<"new_group" | "neighborhood_nourisher" | "street_squad" | "block_blessers" | "community_champions" | "unity_leaders">().default("new_group"),
  createdBy: varchar("created_by", { length: 255 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  role: varchar("role", { 
    length: 30 
  }).$type<"admin" | "moderator" | "member">().default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const groupPosts = pgTable("group_posts", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  contributionAmount: varchar("contribution_amount", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupBadges = pgTable("group_badges", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  badgeName: varchar("badge_name", { length: 100 }).notNull(),
  badgeType: varchar("badge_type", { 
    length: 50 
  }).$type<"milestone" | "achievement" | "seasonal" | "special">().default("milestone"),
  description: text("description"),
  iconEmoji: varchar("icon_emoji", { length: 10 }),
  earnedAt: timestamp("earned_at").defaultNow(),
  isVisible: boolean("is_visible").default(true),
});

// Relations for Group Givers
export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, { fields: [groups.createdBy], references: [users.id] }),
  members: many(groupMembers),
  posts: many(groupPosts),
  badges: many(groupBadges),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}));

export const groupPostsRelations = relations(groupPosts, ({ one }) => ({
  group: one(groups, { fields: [groupPosts.groupId], references: [groups.id] }),
  post: one(posts, { fields: [groupPosts.postId], references: [posts.id] }),
}));

export const groupBadgesRelations = relations(groupBadges, ({ one }) => ({
  group: one(groups, { fields: [groupBadges.groupId], references: [groups.id] }),
}));

// Insert schemas for Group Givers
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupPostSchema = createInsertSchema(groupPosts).omit({
  id: true,
  createdAt: true,
});

export const insertGroupBadgeSchema = createInsertSchema(groupBadges).omit({
  id: true,
  earnedAt: true,
});

// Types for Group Givers
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupPost = typeof groupPosts.$inferSelect;
export type InsertGroupPost = z.infer<typeof insertGroupPostSchema>;
export type GroupBadge = typeof groupBadges.$inferSelect;
export type InsertGroupBadge = z.infer<typeof insertGroupBadgeSchema>;

// Event Food Pickup Relations
export const eventFoodPickupsRelations = relations(eventFoodPickups, ({ one, many }) => ({
  creator: one(users, {
    fields: [eventFoodPickups.createdBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [eventFoodPickups.approvedBy],
    references: [users.id],
  }),
  volunteers: many(eventVolunteerRegistrations),
  distributions: many(eventFoodDistributions),
}));

export const eventVolunteerRegistrationsRelations = relations(eventVolunteerRegistrations, ({ one }) => ({
  event: one(eventFoodPickups, {
    fields: [eventVolunteerRegistrations.eventId],
    references: [eventFoodPickups.id],
  }),
  volunteer: one(users, {
    fields: [eventVolunteerRegistrations.userId],
    references: [users.id],
  }),
}));

export const eventFoodDistributionsRelations = relations(eventFoodDistributions, ({ one }) => ({
  event: one(eventFoodPickups, {
    fields: [eventFoodDistributions.eventId],
    references: [eventFoodPickups.id],
  }),
  volunteer: one(users, {
    fields: [eventFoodDistributions.volunteerId],
    references: [users.id],
  }),
}));

// Event Food Pickup Insert Schemas
export const insertEventFoodPickupSchema = createInsertSchema(eventFoodPickups).omit({
  id: true,
  currentVolunteers: true,
  approvedBy: true,
  approvedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventVolunteerRegistrationSchema = createInsertSchema(eventVolunteerRegistrations).omit({
  id: true,
  registrationDate: true,
  checkInTime: true,
  checkOutTime: true,
  organizerRating: true,
  organizerFeedback: true,
  volunteerRating: true,
  volunteerFeedback: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventFoodDistributionSchema = createInsertSchema(eventFoodDistributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Event Food Pickup Types
export type EventFoodPickup = typeof eventFoodPickups.$inferSelect;
export type InsertEventFoodPickup = z.infer<typeof insertEventFoodPickupSchema>;
export type EventVolunteerRegistration = typeof eventVolunteerRegistrations.$inferSelect;
export type InsertEventVolunteerRegistration = z.infer<typeof insertEventVolunteerRegistrationSchema>;
export type EventFoodDistribution = typeof eventFoodDistributions.$inferSelect;
export type InsertEventFoodDistribution = z.infer<typeof insertEventFoodDistributionSchema>;

// Event Food Pickup with Details Types
export type EventFoodPickupWithDetails = EventFoodPickup & {
  creator?: User;
  approver?: User;
  volunteers: (EventVolunteerRegistration & { volunteer: User })[];
  distributions: (EventFoodDistribution & { volunteer: User })[];
};

export type GroupWithDetails = Group & {
  creator: User;
  members: (GroupMember & { user: User })[];
  badges: GroupBadge[];
  recentPosts?: (GroupPost & { post: Post })[];
  memberCount: number;
};

// Before/After Photo Stories Tables
export const photoStories = pgTable("photo_stories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  postId: integer("post_id"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  beforePhotoUrl: varchar("before_photo_url"),
  afterPhotoUrl: varchar("after_photo_url").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // meal_pickup, kids_fed, strays_fed, community_event
  location: varchar("location"),
  impactMetrics: jsonb("impact_metrics"), // { people_fed: 5, meals_distributed: 12, etc }
  isPublic: boolean("is_public").default(true),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by"),
  tags: text("tags").array(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  featuredAt: timestamp("featured_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storyLikes = pgTable("story_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyComments = pgTable("story_comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storyShares = pgTable("story_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  platform: varchar("platform", { length: 50 }), // internal, facebook, twitter, whatsapp
  createdAt: timestamp("created_at").defaultNow(),
});

// Photo Stories Relations
export const photoStoriesRelations = relations(photoStories, ({ one, many }) => ({
  user: one(users, { fields: [photoStories.userId], references: [users.id] }),
  post: one(posts, { fields: [photoStories.postId], references: [posts.id] }),
  likes: many(storyLikes),
  comments: many(storyComments),
  shares: many(storyShares),
}));

export const storyLikesRelations = relations(storyLikes, ({ one }) => ({
  user: one(users, { fields: [storyLikes.userId], references: [users.id] }),
  story: one(photoStories, { fields: [storyLikes.storyId], references: [photoStories.id] }),
}));

export const storyCommentsRelations = relations(storyComments, ({ one, many }) => ({
  user: one(users, { fields: [storyComments.userId], references: [users.id] }),
  story: one(photoStories, { fields: [storyComments.storyId], references: [photoStories.id] }),
  parentComment: one(storyComments, { fields: [storyComments.parentCommentId], references: [storyComments.id] }),
  replies: many(storyComments),
}));

export const storySharesRelations = relations(storyShares, ({ one }) => ({
  user: one(users, { fields: [storyShares.userId], references: [users.id] }),
  story: one(photoStories, { fields: [storyShares.storyId], references: [photoStories.id] }),
}));

// Insert schemas for photo stories
export const insertPhotoStorySchema = createInsertSchema(photoStories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  isVerified: true,
  verifiedBy: true,
  featuredAt: true,
});

export const insertStoryCommentSchema = createInsertSchema(storyComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Photo Stories Types
export type PhotoStory = typeof photoStories.$inferSelect;
export type InsertPhotoStory = z.infer<typeof insertPhotoStorySchema>;
export type StoryLike = typeof storyLikes.$inferSelect;
export type StoryComment = typeof storyComments.$inferSelect;
export type InsertStoryComment = z.infer<typeof insertStoryCommentSchema>;
export type StoryShare = typeof storyShares.$inferSelect;

export type PhotoStoryWithDetails = PhotoStory & {
  user: User;
  post?: Post;
  likes: StoryLike[];
  comments: (StoryComment & { user: User; replies?: StoryComment[] })[];
  shares: StoryShare[];
  isLikedByUser?: boolean;
};

// Chat & Pickup Coordination System
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  donorId: varchar("donor_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { 
    enum: ["active", "pickup_scheduled", "completed", "expired", "cancelled"] 
  }).default("active"),
  pickupTime: timestamp("pickup_time"),
  pickupLocation: text("pickup_location"),
  specialInstructions: text("special_instructions"),
  expiresAt: timestamp("expires_at").notNull(), // Chat auto-expires for privacy
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").references(() => chatRooms.id, { onDelete: "cascade" }).notNull(),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  messageType: varchar("message_type", { 
    enum: ["text", "location", "pickup_confirmation", "system"] 
  }).default("text"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const pickupCoordination = pgTable("pickup_coordination", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").references(() => chatRooms.id, { onDelete: "cascade" }).notNull(),
  proposedTime: timestamp("proposed_time").notNull(),
  proposedLocation: text("proposed_location").notNull(),
  proposedBy: varchar("proposed_by").references(() => users.id).notNull(),
  status: varchar("status", { 
    enum: ["pending", "accepted", "rejected", "modified"] 
  }).default("pending"),
  responseMessage: text("response_message"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Relations
export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  post: one(posts, { fields: [chatRooms.postId], references: [posts.id] }),
  donor: one(users, { fields: [chatRooms.donorId], references: [users.id] }),
  receiver: one(users, { fields: [chatRooms.receiverId], references: [users.id] }),
  messages: many(chatMessages),
  pickupCoordinations: many(pickupCoordination),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chatRoom: one(chatRooms, { fields: [chatMessages.chatRoomId], references: [chatRooms.id] }),
  sender: one(users, { fields: [chatMessages.senderId], references: [users.id] }),
}));

export const pickupCoordinationRelations = relations(pickupCoordination, ({ one }) => ({
  chatRoom: one(chatRooms, { fields: [pickupCoordination.chatRoomId], references: [chatRooms.id] }),
  proposer: one(users, { fields: [pickupCoordination.proposedBy], references: [users.id] }),
}));

// Insert schemas for chat system
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  sentAt: true,
  isRead: true,
});

export const insertPickupCoordinationSchema = createInsertSchema(pickupCoordination).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

// Chat Types
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type PickupCoordination = typeof pickupCoordination.$inferSelect;
export type InsertPickupCoordination = z.infer<typeof insertPickupCoordinationSchema>;

export type ChatRoomWithDetails = ChatRoom & {
  post: Post;
  donor: User;
  receiver: User;
  messages: (ChatMessage & { sender: User })[];
  latestMessage?: ChatMessage & { sender: User };
  unreadCount: number;
  pickupCoordination?: PickupCoordination & { proposer: User };
};

export type ChatMessageWithSender = ChatMessage & {
  sender: User;
};

// Help & Support System Tables
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { 
    enum: ["technical", "account", "donation", "pickup", "volunteer", "general", "billing", "safety"] 
  }).notNull(),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
  status: varchar("status", { 
    enum: ["open", "in-progress", "resolved", "closed", "escalated"] 
  }).default("open"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolutionTime: integer("resolution_time_hours"), // in hours
  customerSatisfaction: integer("customer_satisfaction"), // 1-5 rating
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isStaffReply: boolean("is_staff_reply").default(false),
  attachmentUrl: varchar("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const helplineContacts = pgTable("helpline_contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  callerName: varchar("caller_name", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  category: varchar("category", { 
    enum: ["emergency", "technical", "volunteer", "donation", "general", "complaint", "feedback"] 
  }).notNull(),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
  description: text("description"),
  status: varchar("status", { 
    enum: ["received", "in-progress", "resolved", "callback-required", "escalated"] 
  }).default("received"),
  handledBy: varchar("handled_by").references(() => users.id),
  callDuration: integer("call_duration_minutes"),
  resolutionTime: integer("resolution_time_hours"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  satisfactionRating: integer("satisfaction_rating"), // 1-5 rating
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const knowledgeBaseArticles = pgTable("knowledge_base_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { 
    enum: ["getting-started", "donations", "volunteering", "technical", "safety", "policies", "faq"] 
  }).notNull(),
  tags: text("tags"), // JSON array of tags
  isPublished: boolean("is_published").default(false),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  viewCount: integer("view_count").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  unhelpfulVotes: integer("unhelpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportStaff = pgTable("support_staff", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role", { 
    enum: ["agent", "supervisor", "manager", "admin"] 
  }).default("agent"),
  department: varchar("department", { 
    enum: ["general", "technical", "volunteer", "emergency", "billing"] 
  }).notNull(),
  isActive: boolean("is_active").default(true),
  specializations: text("specializations"), // JSON array
  maxConcurrentTickets: integer("max_concurrent_tickets").default(5),
  avgResolutionTime: real("avg_resolution_time"), // in hours
  customerSatisfactionRating: real("customer_satisfaction_rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportFeedback = pgTable("support_feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  helplineContactId: integer("helpline_contact_id").references(() => helplineContacts.id),
  feedbackType: varchar("feedback_type", { 
    enum: ["ticket", "helpline", "general", "suggestion", "complaint"] 
  }).notNull(),
  rating: integer("rating").notNull(), // 1-5 rating
  feedback: text("feedback"),
  improvementSuggestions: text("improvement_suggestions"),
  wouldRecommend: boolean("would_recommend"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  contactType: varchar("contact_type", { 
    enum: ["police", "fire", "medical", "food-safety", "crisis-helpline"] 
  }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  region: varchar("region", { length: 50 }),
  isActive: boolean("is_active").default(true),
  operatingHours: varchar("operating_hours"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meal Partners - Restaurants offering free meals for tax/CSR benefits
export const mealPartners = pgTable("meal_partners", {
  id: serial("id").primaryKey(),
  restaurantName: varchar("restaurant_name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  cuisineType: varchar("cuisine_type", { length: 100 }), // indian, chinese, continental, etc.
  businessLicense: varchar("business_license", { length: 100 }),
  gstNumber: varchar("gst_number", { length: 50 }),
  
  // Meal offering details
  mealsPerDay: integer("meals_per_day").default(0), // number of free meals offered daily
  mealTypes: text("meal_types").array(), // breakfast, lunch, dinner, snacks
  operatingHours: varchar("operating_hours", { length: 255 }),
  specialDietaryOptions: text("special_dietary_options").array(), // vegan, vegetarian, gluten-free, etc.
  
  // Partnership details
  partnershipStartDate: timestamp("partnership_start_date"),
  partnershipStatus: varchar("partnership_status", { length: 50 }).default("pending"), // pending, active, suspended, terminated
  taxBenefitsClaimed: decimal("tax_benefits_claimed", { precision: 10, scale: 2 }).default("0"),
  csrComplianceScore: integer("csr_compliance_score").default(0), // 0-100 rating
  
  // Verification and compliance
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  lastInspectionDate: timestamp("last_inspection_date"),
  complianceNotes: text("compliance_notes"),
  
  // Statistics
  totalMealsServed: integer("total_meals_served").default(0),
  monthlyMealsServed: integer("monthly_meals_served").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meal reservations by users
export const mealReservations = pgTable("meal_reservations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  mealPartnerId: integer("meal_partner_id").notNull().references(() => mealPartners.id),
  reservationDate: timestamp("reservation_date").notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(), // breakfast, lunch, dinner, snacks
  numberOfPeople: integer("number_of_people").default(1),
  specialRequests: text("special_requests"),
  
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, served, cancelled, no-show
  confirmationCode: varchar("confirmation_code", { length: 20 }),
  servedAt: timestamp("served_at"),
  
  // Feedback
  rating: integer("rating"), // 1-5 rating
  feedbackComments: text("feedback_comments"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax benefit tracking for restaurants
export const taxBenefitClaims = pgTable("tax_benefit_claims", {
  id: serial("id").primaryKey(),
  mealPartnerId: integer("meal_partner_id").notNull().references(() => mealPartners.id),
  claimPeriod: varchar("claim_period", { length: 20 }).notNull(), // e.g., "2024-Q1", "2024-01"
  totalMealsServed: integer("total_meals_served").notNull(),
  mealValue: decimal("meal_value", { precision: 10, scale: 2 }).notNull(), // value per meal
  totalClaimAmount: decimal("total_claim_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Documentation
  supportingDocuments: text("supporting_documents").array(), // URLs to uploaded documents
  submissionDate: timestamp("submission_date").defaultNow(),
  approvalStatus: varchar("approval_status", { length: 50 }).default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by", { length: 255 }),
  approvalDate: timestamp("approval_date"),
  approvalNotes: text("approval_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CSR compliance tracking
export const csrActivities = pgTable("csr_activities", {
  id: serial("id").primaryKey(),
  mealPartnerId: integer("meal_partner_id").notNull().references(() => mealPartners.id),
  activityType: varchar("activity_type", { length: 100 }).notNull(), // free_meals, community_event, food_drive, etc.
  activityDescription: text("activity_description").notNull(),
  beneficiariesCount: integer("beneficiaries_count").default(0),
  activityDate: timestamp("activity_date").notNull(),
  
  // Impact measurement
  impactMetrics: text("impact_metrics"), // JSON string with various metrics
  socialValue: decimal("social_value", { precision: 10, scale: 2 }).default("0"),
  environmentalImpact: text("environmental_impact"),
  
  // Documentation
  photos: text("photos").array(), // URLs to activity photos
  certificates: text("certificates").array(), // URLs to certificates/recognition
  mediaCoverage: text("media_coverage").array(), // URLs to news articles, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Help & Support Relations
export const supportTicketRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  assignedStaff: one(users, { fields: [supportTickets.assignedTo], references: [users.id] }),
  messages: many(supportTicketMessages),
  feedback: one(supportFeedback),
}));

export const supportTicketMessageRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, { fields: [supportTicketMessages.ticketId], references: [supportTickets.id] }),
  sender: one(users, { fields: [supportTicketMessages.senderId], references: [users.id] }),
}));

export const helplineContactRelations = relations(helplineContacts, ({ one, many }) => ({
  user: one(users, { fields: [helplineContacts.userId], references: [users.id] }),
  handler: one(users, { fields: [helplineContacts.handledBy], references: [users.id] }),
  feedback: many(supportFeedback),
}));

export const knowledgeBaseArticleRelations = relations(knowledgeBaseArticles, ({ one }) => ({
  author: one(users, { fields: [knowledgeBaseArticles.authorId], references: [users.id] }),
}));

export const supportStaffRelations = relations(supportStaff, ({ one, many }) => ({
  user: one(users, { fields: [supportStaff.userId], references: [users.id] }),
  assignedTickets: many(supportTickets),
  handledCalls: many(helplineContacts),
}));

export const supportFeedbackRelations = relations(supportFeedback, ({ one }) => ({
  user: one(users, { fields: [supportFeedback.userId], references: [users.id] }),
  ticket: one(supportTickets, { fields: [supportFeedback.ticketId], references: [supportTickets.id] }),
  helplineContact: one(helplineContacts, { fields: [supportFeedback.helplineContactId], references: [helplineContacts.id] }),
}));

// Help & Support Insert Schemas
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  resolutionTime: true,
  customerSatisfaction: true,
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
});

export const insertHelplineContactSchema = createInsertSchema(helplineContacts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
  resolutionTime: true,
});

export const insertKnowledgeBaseArticleSchema = createInsertSchema(knowledgeBaseArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  helpfulVotes: true,
  unhelpfulVotes: true,
});

export const insertSupportStaffSchema = createInsertSchema(supportStaff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  avgResolutionTime: true,
  customerSatisfactionRating: true,
});

export const insertSupportFeedbackSchema = createInsertSchema(supportFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Help & Support Types
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;
export type HelplineContact = typeof helplineContacts.$inferSelect;
export type InsertHelplineContact = z.infer<typeof insertHelplineContactSchema>;
export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;
export type InsertKnowledgeBaseArticle = z.infer<typeof insertKnowledgeBaseArticleSchema>;
export type SupportStaff = typeof supportStaff.$inferSelect;
export type InsertSupportStaff = z.infer<typeof insertSupportStaffSchema>;
export type SupportFeedback = typeof supportFeedback.$inferSelect;
export type InsertSupportFeedback = z.infer<typeof insertSupportFeedbackSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;

export type SupportTicketWithDetails = SupportTicket & {
  user: User;
  assignedStaff?: User;
  messages: (SupportTicketMessage & { sender: User })[];
  feedback?: SupportFeedback;
};

export type HelplineContactWithDetails = HelplineContact & {
  user?: User;
  handler?: User;
  feedback?: SupportFeedback[];
};

export type KnowledgeBaseArticleWithAuthor = KnowledgeBaseArticle & {
  author: User;
};

export type SupportStaffWithDetails = SupportStaff & {
  user: User;
  currentTickets: number;
  completedTickets: number;
};

// Meal Partners Relations
export const mealPartnersRelations = relations(mealPartners, ({ many }) => ({
  reservations: many(mealReservations),
  taxClaims: many(taxBenefitClaims),
  csrActivities: many(csrActivities),
}));

export const mealReservationsRelations = relations(mealReservations, ({ one }) => ({
  user: one(users, { fields: [mealReservations.userId], references: [users.id] }),
  mealPartner: one(mealPartners, { fields: [mealReservations.mealPartnerId], references: [mealPartners.id] }),
}));

export const taxBenefitClaimsRelations = relations(taxBenefitClaims, ({ one }) => ({
  mealPartner: one(mealPartners, { fields: [taxBenefitClaims.mealPartnerId], references: [mealPartners.id] }),
}));

export const csrActivitiesRelations = relations(csrActivities, ({ one }) => ({
  mealPartner: one(mealPartners, { fields: [csrActivities.mealPartnerId], references: [mealPartners.id] }),
}));

// Meal Partners Insert Schemas
export const insertMealPartnerSchema = createInsertSchema(mealPartners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalMealsServed: true,
  monthlyMealsServed: true,
  averageRating: true,
  totalRatings: true,
  taxBenefitsClaimed: true,
  csrComplianceScore: true,
  verificationDate: true,
  lastInspectionDate: true,
});

export const insertMealReservationSchema = createInsertSchema(mealReservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  confirmationCode: true,
  servedAt: true,
});

export const insertTaxBenefitClaimSchema = createInsertSchema(taxBenefitClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submissionDate: true,
  approvalDate: true,
  approvedBy: true,
});

export const insertCsrActivitySchema = createInsertSchema(csrActivities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Meal Partners Types
export type MealPartner = typeof mealPartners.$inferSelect;
export type InsertMealPartner = z.infer<typeof insertMealPartnerSchema>;
export type MealReservation = typeof mealReservations.$inferSelect;
export type InsertMealReservation = z.infer<typeof insertMealReservationSchema>;
export type TaxBenefitClaim = typeof taxBenefitClaims.$inferSelect;
export type InsertTaxBenefitClaim = z.infer<typeof insertTaxBenefitClaimSchema>;
export type CsrActivity = typeof csrActivities.$inferSelect;
export type InsertCsrActivity = z.infer<typeof insertCsrActivitySchema>;

export type MealPartnerWithDetails = MealPartner & {
  reservations?: (MealReservation & { user: User })[];
  taxClaims?: TaxBenefitClaim[];
  csrActivities?: CsrActivity[];
  distance?: number;
  availableSlots?: number;
  nextAvailableTime?: string;
};

export type MealReservationWithDetails = MealReservation & {
  user: User;
  mealPartner: MealPartner;
};
