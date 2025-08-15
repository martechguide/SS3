import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Whitelisted emails for access control
export const whitelistedEmails = pgTable("whitelisted_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Batches (e.g., "Batch 2025", "Advanced Batch")
export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses within batches (e.g., "JEE Main", "NEET Preparation")
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subjects within courses (e.g., "Mathematics", "Physics")
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  courseId: varchar("course_id").references(() => courses.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").default("fas fa-book"),
  color: varchar("color").default("blue"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Videos within subjects
// YouTube videos table (keep existing)
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  courseId: varchar("course_id").references(() => courses.id, { onDelete: "cascade" }),
  batchId: varchar("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  youtubeVideoId: varchar("youtube_video_id").notNull(),
  duration: integer("duration_seconds"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Multi-platform videos table (new)
export const multiPlatformVideos = pgTable("multi_platform_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  courseId: varchar("course_id").references(() => courses.id, { onDelete: "cascade" }),
  batchId: varchar("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 50 }).notNull(), // vimeo, facebook, dailymotion, twitch, peertube, rumble
  videoUrl: varchar("video_url").notNull(), // original URL
  videoId: varchar("video_id").notNull(), // extracted video ID for embedding
  thumbnail: varchar("thumbnail"), // thumbnail URL
  duration: integer("duration_seconds"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false),
  watchTimeSeconds: integer("watch_time_seconds").default(0),
  lastWatchedAt: timestamp("last_watched_at").defaultNow(),
});

// Ad settings for admin control
export const adSettings = pgTable("ad_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rewardedAdsEnabled: boolean("rewarded_ads_enabled").default(true),
  bannerAdsEnabled: boolean("banner_ads_enabled").default(true),
  interstitialAdsEnabled: boolean("interstitial_ads_enabled").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand promotions table for custom brand video ads
export const brandPromotions = pgTable("brand_promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandName: varchar("brand_name").notNull(),
  brandLogo: varchar("brand_logo"), // URL to brand logo
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  productName: varchar("product_name").notNull(),
  productDescription: text("product_description"),
  targetAudience: varchar("target_audience"), // e.g., "Students", "Professionals", "All"
  campaignBudget: integer("campaign_budget"), // in rupees
  campaignDuration: integer("campaign_duration_days").default(30),
  videoUrl: varchar("video_url"), // Brand's promotional video URL
  websiteUrl: varchar("website_url"), // Brand's website
  callToAction: varchar("call_to_action").default("Learn More"), // "Buy Now", "Visit Website", etc.
  isActive: boolean("is_active").default(false),
  isApproved: boolean("is_approved").default(false),
  priority: integer("priority").default(1), // 1-5, higher = more priority
  impressions: integer("impressions").default(0), // Track views
  clicks: integer("clicks").default(0), // Track clicks
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand ad placements - where to show brand ads
export const brandAdPlacements = pgTable("brand_ad_placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promotionId: varchar("promotion_id").notNull().references(() => brandPromotions.id, { onDelete: "cascade" }),
  placementType: varchar("placement_type").notNull(), // "pre-roll", "mid-roll", "post-roll", "banner", "overlay"
  targetVideos: text("target_videos").array(), // Array of video IDs where this ad should show
  targetSubjects: text("target_subjects").array(), // Array of subject IDs
  targetBatches: text("target_batches").array(), // Array of batch IDs
  showFrequency: integer("show_frequency").default(3), // Show every X videos
  maxDailyShows: integer("max_daily_shows").default(50), // Maximum shows per day
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Brand promotion analytics
export const brandPromotionAnalytics = pgTable("brand_promotion_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promotionId: varchar("promotion_id").notNull().references(() => brandPromotions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  videoId: varchar("video_id").references(() => videos.id, { onDelete: "set null" }),
  actionType: varchar("action_type").notNull(), // "view", "click", "skip", "complete"
  timestamp: timestamp("timestamp").defaultNow(),
  deviceType: varchar("device_type"), // "mobile", "desktop", "tablet"
  userAgent: text("user_agent"),
});

// Relations
export const batchesRelations = relations(batches, ({ many }) => ({
  courses: many(courses),
  subjects: many(subjects),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  batch: one(batches, {
    fields: [courses.batchId],
    references: [batches.id],
  }),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  batch: one(batches, {
    fields: [subjects.batchId],
    references: [batches.id],
  }),
  course: one(courses, {
    fields: [subjects.courseId],
    references: [courses.id],
  }),
  videos: many(videos),
  multiPlatformVideos: many(multiPlatformVideos),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [videos.subjectId],
    references: [subjects.id],
  }),
  userProgress: many(userProgress),
}));

export const multiPlatformVideosRelations = relations(multiPlatformVideos, ({ one }) => ({
  subject: one(subjects, {
    fields: [multiPlatformVideos.subjectId],
    references: [subjects.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [userProgress.videoId],
    references: [videos.id],
  }),
}));

export const brandPromotionsRelations = relations(brandPromotions, ({ many }) => ({
  placements: many(brandAdPlacements),
  analytics: many(brandPromotionAnalytics),
}));

export const brandAdPlacementsRelations = relations(brandAdPlacements, ({ one }) => ({
  promotion: one(brandPromotions, {
    fields: [brandAdPlacements.promotionId],
    references: [brandPromotions.id],
  }),
}));

export const brandPromotionAnalyticsRelations = relations(brandPromotionAnalytics, ({ one }) => ({
  promotion: one(brandPromotions, {
    fields: [brandPromotionAnalytics.promotionId],
    references: [brandPromotions.id],
  }),
  user: one(users, {
    fields: [brandPromotionAnalytics.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [brandPromotionAnalytics.videoId],
    references: [videos.id],
  }),
}));

export const bannerAdSettings = pgTable("banner_ad_settings", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  enabled: boolean("enabled").default(true),
  globalEnabled: boolean("global_enabled").default(true),
  homePageEnabled: boolean("home_page_enabled").default(true),
  videoPageEnabled: boolean("video_page_enabled").default(true),
  subjectPageEnabled: boolean("subject_page_enabled").default(true),
  mobileEnabled: boolean("mobile_enabled").default(true),
  placement: text("placement").default("bottom"), // bottom, top, floating
  dismissible: boolean("dismissible").default(true),
  showCloseButton: boolean("show_close_button").default(true),
  minimizable: boolean("minimizable").default(true),
  autoHide: boolean("auto_hide").default(false),
  autoHideDelay: integer("auto_hide_delay").default(30), // seconds
  maxImpressions: integer("max_impressions").default(1000),
  adNetwork: text("ad_network").default("mixed"), // adsense, adsterra, brand-promotions, mixed
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Schemas for validation
export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMultiPlatformVideoSchema = createInsertSchema(multiPlatformVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhitelistedEmailSchema = createInsertSchema(whitelistedEmails).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertBrandPromotionSchema = createInsertSchema(brandPromotions).omit({
  id: true,
  impressions: true,
  clicks: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandAdPlacementSchema = createInsertSchema(brandAdPlacements).omit({
  id: true,
  createdAt: true,
});

export const insertBrandPromotionAnalyticsSchema = createInsertSchema(brandPromotionAnalytics).omit({
  id: true,
  timestamp: true,
});

export const insertAdSettingsSchema = createInsertSchema(adSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBannerAdSettingsSchema = createInsertSchema(bannerAdSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Batch = typeof batches.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type MultiPlatformVideo = typeof multiPlatformVideos.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type AdSettings = typeof adSettings.$inferSelect;
export type WhitelistedEmail = typeof whitelistedEmails.$inferSelect;
export type BrandPromotion = typeof brandPromotions.$inferSelect;
export type BrandAdPlacement = typeof brandAdPlacements.$inferSelect;
export type BrandPromotionAnalytics = typeof brandPromotionAnalytics.$inferSelect;
export type BannerAdSettings = typeof bannerAdSettings.$inferSelect;

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertMultiPlatformVideo = z.infer<typeof insertMultiPlatformVideoSchema>;
export type InsertWhitelistedEmail = z.infer<typeof insertWhitelistedEmailSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertBrandPromotion = z.infer<typeof insertBrandPromotionSchema>;
export type InsertBrandAdPlacement = z.infer<typeof insertBrandAdPlacementSchema>;
export type InsertBrandPromotionAnalytics = z.infer<typeof insertBrandPromotionAnalyticsSchema>;
export type InsertAdSettings = z.infer<typeof insertAdSettingsSchema>;
export type InsertBannerAdSettings = z.infer<typeof insertBannerAdSettingsSchema>;
