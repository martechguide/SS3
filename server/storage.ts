import {
  users,
  batches,
  courses,
  subjects,
  videos,
  multiPlatformVideos,
  userProgress,
  adSettings,
  whitelistedEmails,
  brandPromotions,
  brandAdPlacements,
  brandPromotionAnalytics,
  bannerAdSettings,
  type User,
  type UpsertUser,
  type Batch,
  type Course,
  type Subject,
  type Video,
  type MultiPlatformVideo,
  type UserProgress,
  type AdSettings,
  type WhitelistedEmail,
  type BrandPromotion,
  type BrandAdPlacement,
  type BrandPromotionAnalytics,
  type BannerAdSettings,
  type InsertBatch,
  type InsertCourse,
  type InsertSubject,
  type InsertVideo,
  type InsertMultiPlatformVideo,
  type InsertWhitelistedEmail,
  type InsertUserProgress,
  type InsertBrandPromotion,
  type InsertBrandAdPlacement,
  type InsertBrandPromotionAnalytics,
  type InsertBannerAdSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these are mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Email whitelist operations
  isEmailWhitelisted(email: string): Promise<boolean>;
  getWhitelistedEmails(): Promise<WhitelistedEmail[]>;
  addWhitelistedEmail(email: InsertWhitelistedEmail): Promise<WhitelistedEmail>;
  removeWhitelistedEmail(email: string): Promise<void>;
  
  // Batch operations
  getBatches(): Promise<Batch[]>;
  getBatch(id: string): Promise<Batch | undefined>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: string, batch: Partial<InsertBatch>): Promise<Batch>;
  deleteBatch(id: string): Promise<void>;
  
  // Course operations
  getCoursesByBatch(batchId: string): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Subject operations
  getSubjectsByCourse(courseId: string): Promise<Subject[]>;
  getSubjectsByBatch(batchId: string): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;
  
  // Video operations  
  getVideosBySubject(subjectId: string): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  
  // Multi-platform video operations
  getMultiPlatformVideosBySubject(subjectId: string): Promise<MultiPlatformVideo[]>;
  getMultiPlatformVideo(id: string): Promise<MultiPlatformVideo | undefined>;
  createMultiPlatformVideo(video: InsertMultiPlatformVideo): Promise<MultiPlatformVideo>;
  updateMultiPlatformVideo(id: string, video: Partial<InsertMultiPlatformVideo>): Promise<MultiPlatformVideo>;
  deleteMultiPlatformVideo(id: string): Promise<void>;
  
  // User progress operations
  getUserProgress(userId: string, videoId: string): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressBySubject(userId: string, subjectId: string): Promise<UserProgress[]>;
  
  // Ad settings operations
  getAdSettings(): Promise<AdSettings>;
  updateAdSettings(settings: Partial<AdSettings>): Promise<AdSettings>;

  // Brand promotion operations
  getBrandPromotions(): Promise<BrandPromotion[]>;
  getBrandPromotion(id: string): Promise<BrandPromotion | undefined>;
  createBrandPromotion(promotion: InsertBrandPromotion): Promise<BrandPromotion>;
  updateBrandPromotion(id: string, promotion: Partial<InsertBrandPromotion>): Promise<BrandPromotion>;
  deleteBrandPromotion(id: string): Promise<void>;
  getActiveBrandPromotions(): Promise<BrandPromotion[]>;
  updateBrandPromotionStats(id: string, impressions: number, clicks: number): Promise<void>;

  // Brand ad placement operations
  getBrandAdPlacements(promotionId: string): Promise<BrandAdPlacement[]>;
  createBrandAdPlacement(placement: InsertBrandAdPlacement): Promise<BrandAdPlacement>;
  getActiveBrandAdsByPlacement(placementType: string, videoId?: string, subjectId?: string, batchId?: string): Promise<BrandPromotion[]>;

  // Brand promotion analytics operations
  trackBrandPromotionView(analytics: InsertBrandPromotionAnalytics): Promise<void>;
  getBrandPromotionAnalytics(promotionId: string, startDate?: Date, endDate?: Date): Promise<BrandPromotionAnalytics[]>;

  // Banner ad settings operations
  getBannerAdSettings(): Promise<BannerAdSettings | undefined>;
  updateBannerAdSettings(settings: Partial<InsertBannerAdSettings>): Promise<BannerAdSettings>;
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

  // Email whitelist operations
  async isEmailWhitelisted(email: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(whitelistedEmails)
      .where(eq(whitelistedEmails.email, email));
    return !!result;
  }

  async getWhitelistedEmails(): Promise<WhitelistedEmail[]> {
    return await db.select().from(whitelistedEmails);
  }

  async addWhitelistedEmail(emailData: InsertWhitelistedEmail): Promise<WhitelistedEmail> {
    const [email] = await db
      .insert(whitelistedEmails)
      .values(emailData)
      .returning();
    return email;
  }

  async removeWhitelistedEmail(email: string): Promise<void> {
    await db.delete(whitelistedEmails).where(eq(whitelistedEmails.email, email));
  }

  // Batch operations
  async getBatches(): Promise<Batch[]> {
    return await db.select().from(batches).where(eq(batches.isActive, true));
  }

  async getBatch(id: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch;
  }

  async createBatch(batchData: InsertBatch): Promise<Batch> {
    const [batch] = await db.insert(batches).values(batchData).returning();
    return batch;
  }

  async updateBatch(id: string, batchData: Partial<InsertBatch>): Promise<Batch> {
    const [batch] = await db
      .update(batches)
      .set({ ...batchData, updatedAt: new Date() })
      .where(eq(batches.id, id))
      .returning();
    return batch;
  }

  async deleteBatch(id: string): Promise<void> {
    await db.update(batches)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(batches.id, id));
  }

  // Course operations
  async getCoursesByBatch(batchId: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.batchId, batchId))
      .orderBy(courses.orderIndex);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }

  async updateCourse(id: string, courseData: Partial<InsertCourse>): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.update(courses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(courses.id, id));
  }

  // Subject operations
  async getSubjectsByCourse(courseId: string): Promise<(Subject & { videoCount: number })[]> {
    const subjectsWithCount = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        description: subjects.description,
        batchId: subjects.batchId,
        courseId: subjects.courseId,
        orderIndex: subjects.orderIndex,
        icon: subjects.icon,
        color: subjects.color,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
        videoCount: sql<number>`COALESCE(COUNT(${videos.id}), 0)`.as('videoCount')
      })
      .from(subjects)
      .leftJoin(videos, and(eq(videos.subjectId, subjects.id), eq(videos.isActive, true)))
      .where(eq(subjects.courseId, courseId))
      .groupBy(subjects.id)
      .orderBy(subjects.orderIndex);
    
    return subjectsWithCount;
  }
  
  async getSubjectsByBatch(batchId: string): Promise<(Subject & { videoCount: number })[]> {
    const subjectsWithCount = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        description: subjects.description,
        batchId: subjects.batchId,
        courseId: subjects.courseId,
        orderIndex: subjects.orderIndex,
        icon: subjects.icon,
        color: subjects.color,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
        videoCount: sql<number>`COALESCE(COUNT(${videos.id}), 0)`.as('videoCount')
      })
      .from(subjects)
      .leftJoin(videos, and(eq(videos.subjectId, subjects.id), eq(videos.isActive, true)))
      .where(and(eq(subjects.batchId, batchId), isNull(subjects.courseId)))
      .groupBy(subjects.id)
      .orderBy(subjects.orderIndex);
    
    return subjectsWithCount;
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subjectData: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(subjectData).returning();
    return subject;
  }

  async updateSubject(id: string, subjectData: Partial<InsertSubject>): Promise<Subject> {
    const [subject] = await db
      .update(subjects)
      .set({ ...subjectData, updatedAt: new Date() })
      .where(eq(subjects.id, id))
      .returning();
    return subject;
  }

  async deleteSubject(id: string): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Video operations
  async getVideosBySubject(subjectId: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(and(eq(videos.subjectId, subjectId), eq(videos.isActive, true)))
      .orderBy(videos.orderIndex);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(videoData).returning();
    return video;
  }

  async updateVideo(id: string, videoData: Partial<InsertVideo>): Promise<Video> {
    const [video] = await db
      .update(videos)
      .set({ ...videoData, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.update(videos)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(videos.id, id));
  }

  // Multi-platform video operations
  async getMultiPlatformVideosBySubject(subjectId: string): Promise<MultiPlatformVideo[]> {
    return await db
      .select()
      .from(multiPlatformVideos)
      .where(and(eq(multiPlatformVideos.subjectId, subjectId), eq(multiPlatformVideos.isActive, true)))
      .orderBy(multiPlatformVideos.orderIndex);
  }

  async getMultiPlatformVideo(id: string): Promise<MultiPlatformVideo | undefined> {
    const [video] = await db.select().from(multiPlatformVideos).where(eq(multiPlatformVideos.id, id));
    return video;
  }

  async createMultiPlatformVideo(videoData: InsertMultiPlatformVideo): Promise<MultiPlatformVideo> {
    const [video] = await db.insert(multiPlatformVideos).values(videoData).returning();
    return video;
  }

  async updateMultiPlatformVideo(id: string, videoData: Partial<InsertMultiPlatformVideo>): Promise<MultiPlatformVideo> {
    const [video] = await db
      .update(multiPlatformVideos)
      .set({ ...videoData, updatedAt: new Date() })
      .where(eq(multiPlatformVideos.id, id))
      .returning();
    return video;
  }

  async deleteMultiPlatformVideo(id: string): Promise<void> {
    await db.update(multiPlatformVideos)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(multiPlatformVideos.id, id));
  }

  // User progress operations
  async getUserProgress(userId: string, videoId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.videoId, videoId)));
    return progress;
  }

  async updateUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.videoId],
        set: {
          ...progressData,
          lastWatchedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  async getUserProgressBySubject(userId: string, subjectId: string): Promise<UserProgress[]> {
    const result = await db
      .select({
        id: userProgress.id,
        userId: userProgress.userId,
        videoId: userProgress.videoId,
        completed: userProgress.completed,
        watchTimeSeconds: userProgress.watchTimeSeconds,
        lastWatchedAt: userProgress.lastWatchedAt,
      })
      .from(userProgress)
      .innerJoin(videos, eq(userProgress.videoId, videos.id))
      .where(and(eq(userProgress.userId, userId), eq(videos.subjectId, subjectId)));
    
    return result;
  }

  // Ad settings operations
  async getAdSettings(): Promise<AdSettings> {
    const [settings] = await db.select().from(adSettings);
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(adSettings)
        .values({
          rewardedAdsEnabled: true,
          bannerAdsEnabled: true,
          interstitialAdsEnabled: false,
        })
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateAdSettings(settingsData: Partial<AdSettings>): Promise<AdSettings> {
    const existing = await this.getAdSettings();
    const [settings] = await db
      .update(adSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(adSettings.id, existing.id))
      .returning();
    return settings;
  }

  // Brand promotion operations
  async getBrandPromotions(): Promise<BrandPromotion[]> {
    return await db.select().from(brandPromotions).orderBy(desc(brandPromotions.createdAt));
  }

  async getBrandPromotion(id: string): Promise<BrandPromotion | undefined> {
    const [promotion] = await db.select().from(brandPromotions).where(eq(brandPromotions.id, id));
    return promotion;
  }

  async createBrandPromotion(promotionData: InsertBrandPromotion): Promise<BrandPromotion> {
    const [promotion] = await db.insert(brandPromotions).values(promotionData).returning();
    return promotion;
  }

  async updateBrandPromotion(id: string, promotionData: Partial<InsertBrandPromotion>): Promise<BrandPromotion> {
    const [promotion] = await db
      .update(brandPromotions)
      .set({ ...promotionData, updatedAt: new Date() })
      .where(eq(brandPromotions.id, id))
      .returning();
    return promotion;
  }

  async deleteBrandPromotion(id: string): Promise<void> {
    await db.delete(brandPromotions).where(eq(brandPromotions.id, id));
  }

  async getActiveBrandPromotions(): Promise<BrandPromotion[]> {
    return await db
      .select()
      .from(brandPromotions)
      .where(and(eq(brandPromotions.isActive, true), eq(brandPromotions.isApproved, true)))
      .orderBy(desc(brandPromotions.priority), desc(brandPromotions.createdAt));
  }

  async updateBrandPromotionStats(id: string, impressions: number, clicks: number): Promise<void> {
    await db
      .update(brandPromotions)
      .set({ impressions, clicks, updatedAt: new Date() })
      .where(eq(brandPromotions.id, id));
  }

  // Brand ad placement operations
  async getBrandAdPlacements(promotionId: string): Promise<BrandAdPlacement[]> {
    return await db
      .select()
      .from(brandAdPlacements)
      .where(eq(brandAdPlacements.promotionId, promotionId));
  }

  async createBrandAdPlacement(placementData: InsertBrandAdPlacement): Promise<BrandAdPlacement> {
    const [placement] = await db.insert(brandAdPlacements).values(placementData).returning();
    return placement;
  }

  async getActiveBrandAdsByPlacement(
    placementType: string,
    videoId?: string,
    subjectId?: string,
    batchId?: string
  ): Promise<BrandPromotion[]> {
    // This is a complex query that finds active brand promotions based on placement criteria
    // For now, we'll return all active promotions and filter in the application layer
    return await this.getActiveBrandPromotions();
  }

  // Brand promotion analytics operations
  async trackBrandPromotionView(analyticsData: InsertBrandPromotionAnalytics): Promise<void> {
    await db.insert(brandPromotionAnalytics).values(analyticsData);
  }

  async getBrandPromotionAnalytics(
    promotionId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BrandPromotionAnalytics[]> {
    let query = db
      .select()
      .from(brandPromotionAnalytics)
      .where(eq(brandPromotionAnalytics.promotionId, promotionId));

    // Note: Date range filtering would be implemented here when needed

    return await query.orderBy(desc(brandPromotionAnalytics.timestamp));
  }

  // Banner ad settings operations
  async getBannerAdSettings(): Promise<BannerAdSettings | undefined> {
    const [settings] = await db.select().from(bannerAdSettings).limit(1);
    return settings;
  }

  async updateBannerAdSettings(settingsData: Partial<InsertBannerAdSettings>): Promise<BannerAdSettings> {
    // Check if settings exist
    const existing = await this.getBannerAdSettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(bannerAdSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(bannerAdSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(bannerAdSettings)
        .values(settingsData as InsertBannerAdSettings)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
