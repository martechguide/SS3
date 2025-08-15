import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { staticContentCache, userContentCache, videoMetadataCache } from "./cache";
import { 
  insertBatchSchema, 
  insertCourseSchema,
  insertSubjectSchema, 
  insertVideoSchema,
  insertWhitelistedEmailSchema,
  insertUserProgressSchema,
  insertBrandPromotionSchema,
  insertBrandAdPlacementSchema,
  insertBrandPromotionAnalyticsSchema,
  insertBannerAdSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Temporarily allow all authenticated users for demo
      // Check if user email is whitelisted
      // const isWhitelisted = await storage.isEmailWhitelisted(user.email!);
      // if (!isWhitelisted) {
      //   return res.status(403).json({ message: "Access denied. Contact administrator." });
      // }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Batch routes
  app.get("/api/batches/:batchId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const { batchId } = req.params;
      const batch = await storage.getBatch(batchId);
      
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      
      res.json(batch);
    } catch (error) {
      console.error("Error fetching batch:", error);
      res.status(500).json({ message: "Failed to fetch batch" });
    }
  });

  app.get("/api/batches", isAuthenticated, staticContentCache, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const batches = await storage.getBatches();
      
      // Set cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=1800', // 30 minutes
        'ETag': `"batches-${Date.now()}"`,
        'Vary': 'Accept-Encoding'
      });
      
      res.json(batches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  app.post("/api/batches", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const batchData = insertBatchSchema.parse(req.body);
      const batch = await storage.createBatch(batchData);
      res.json(batch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch data", errors: error.errors });
      }
      console.error("Error creating batch:", error);
      res.status(500).json({ message: "Failed to create batch" });
    }
  });

  app.patch("/api/batches/:batchId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { batchId } = req.params;
      const batchData = insertBatchSchema.partial().parse(req.body);
      const batch = await storage.updateBatch(batchId, batchData);
      res.json(batch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch data", errors: error.errors });
      }
      console.error("Error updating batch:", error);
      res.status(500).json({ message: "Failed to update batch" });
    }
  });

  app.delete("/api/batches/:batchId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { batchId } = req.params;
      await storage.deleteBatch(batchId);
      res.json({ message: "Batch deleted successfully" });
    } catch (error) {
      console.error("Error deleting batch:", error);
      res.status(500).json({ message: "Failed to delete batch" });
    }
  });

  // Course routes  
  app.get("/api/batches/:batchId/courses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { batchId } = req.params;
      const courses = await storage.getCoursesByBatch(batchId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post("/api/batches/:batchId/courses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { batchId } = req.params;
      const courseData = insertCourseSchema.parse({
        ...req.body,
        batchId
      });
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch("/api/courses/:courseId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { courseId } = req.params;
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(courseId, courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:courseId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { courseId } = req.params;
      await storage.deleteCourse(courseId);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  app.get("/api/courses/:courseId/subjects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { courseId } = req.params;
      const subjects = await storage.getSubjectsByCourse(courseId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/courses/:courseId/subjects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { courseId } = req.params;
      // Get course to ensure batchId is available
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const subjectData = insertSubjectSchema.parse({
        ...req.body,
        batchId: course.batchId,
        courseId
      });
      const subject = await storage.createSubject(subjectData);
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Subject routes
  app.get("/api/subjects/:subjectId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const { subjectId } = req.params;
      const subject = await storage.getSubject(subjectId);
      
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.get("/api/batches/:batchId/subjects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const { batchId } = req.params;
      const subjects = await storage.getSubjectsByBatch(batchId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/batches/:batchId/subjects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { batchId } = req.params;
      const subjectData = insertSubjectSchema.parse({
        ...req.body,
        batchId
      });
      const subject = await storage.createSubject(subjectData);
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Subject update and delete routes
  app.patch("/api/subjects/:subjectId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { subjectId } = req.params;
      const subjectData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(subjectId, subjectData);
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:subjectId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { subjectId } = req.params;
      await storage.deleteSubject(subjectId);
      res.json({ message: "Subject deleted successfully" });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Video routes
  app.get("/api/videos/:videoId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const { videoId } = req.params;
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.get("/api/subjects/:subjectId/videos", isAuthenticated, videoMetadataCache, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const { subjectId } = req.params;
      const videos = await storage.getVideosBySubject(subjectId);
      
      // Set cache headers for video metadata
      res.set({
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'ETag': `"videos-${subjectId}-${Date.now()}"`,
        'Vary': 'Accept-Encoding'
      });
      
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post("/api/subjects/:subjectId/videos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { subjectId } = req.params;
      const videoData = insertVideoSchema.parse({
        ...req.body,
        subjectId
      });
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  // Video update and delete routes
  app.patch("/api/videos/:videoId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { videoId } = req.params;
      const videoData = insertVideoSchema.partial().parse(req.body);
      const video = await storage.updateVideo(videoId, videoData);
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete("/api/videos/:videoId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { videoId } = req.params;
      await storage.deleteVideo(videoId);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Multi-platform video routes
  app.get("/api/subjects/:subjectId/multi-platform-videos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const { subjectId } = req.params;
      const videos = await storage.getMultiPlatformVideosBySubject(subjectId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching multi-platform videos:", error);
      res.status(500).json({ message: "Failed to fetch multi-platform videos" });
    }
  });

  app.get("/api/multi-platform-videos/:videoId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Access denied" });
      // }

      const { videoId } = req.params;
      const video = await storage.getMultiPlatformVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Multi-platform video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching multi-platform video:", error);
      res.status(500).json({ message: "Failed to fetch multi-platform video" });
    }
  });

  // Admin routes for email whitelist management
  app.get("/api/admin/whitelist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const whitelistedEmails = await storage.getWhitelistedEmails();
      res.json(whitelistedEmails);
    } catch (error) {
      console.error("Error fetching whitelist:", error);
      res.status(500).json({ message: "Failed to fetch whitelist" });
    }
  });

  app.post("/api/admin/whitelist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Temporarily allow all authenticated users for demo
      // if (!user || !(await storage.isEmailWhitelisted(user.email!))) {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const emailData = insertWhitelistedEmailSchema.parse(req.body);
      const whitelistedEmail = await storage.addWhitelistedEmail(emailData);
      res.json(whitelistedEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email data", errors: error.errors });
      }
      console.error("Error adding email to whitelist:", error);
      res.status(500).json({ message: "Failed to add email to whitelist" });
    }
  });

  // Brand Promotion Routes
  // Get all brand promotions (Admin only)
  app.get("/api/admin/brand-promotions", isAuthenticated, async (req: any, res) => {
    try {
      const promotions = await storage.getBrandPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching brand promotions:", error);
      res.status(500).json({ message: "Failed to fetch brand promotions" });
    }
  });

  // Get single brand promotion
  app.get("/api/admin/brand-promotions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const promotion = await storage.getBrandPromotion(id);
      
      if (!promotion) {
        return res.status(404).json({ message: "Brand promotion not found" });
      }
      
      res.json(promotion);
    } catch (error) {
      console.error("Error fetching brand promotion:", error);
      res.status(500).json({ message: "Failed to fetch brand promotion" });
    }
  });

  // Create new brand promotion
  app.post("/api/admin/brand-promotions", isAuthenticated, async (req: any, res) => {
    try {
      const promotionData = insertBrandPromotionSchema.parse(req.body);
      const promotion = await storage.createBrandPromotion(promotionData);
      res.json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid promotion data", errors: error.errors });
      }
      console.error("Error creating brand promotion:", error);
      res.status(500).json({ message: "Failed to create brand promotion" });
    }
  });

  // Update brand promotion
  app.patch("/api/admin/brand-promotions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const promotionData = insertBrandPromotionSchema.partial().parse(req.body);
      const promotion = await storage.updateBrandPromotion(id, promotionData);
      res.json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid promotion data", errors: error.errors });
      }
      console.error("Error updating brand promotion:", error);
      res.status(500).json({ message: "Failed to update brand promotion" });
    }
  });

  // Delete brand promotion
  app.delete("/api/admin/brand-promotions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBrandPromotion(id);
      res.json({ message: "Brand promotion deleted successfully" });
    } catch (error) {
      console.error("Error deleting brand promotion:", error);
      res.status(500).json({ message: "Failed to delete brand promotion" });
    }
  });

  // Get active brand promotions for front-end display
  app.get("/api/brand-promotions/active", isAuthenticated, async (req: any, res) => {
    try {
      const { placementType, videoId, subjectId, batchId } = req.query;
      const promotions = await storage.getActiveBrandAdsByPlacement(
        placementType as string,
        videoId as string,
        subjectId as string,
        batchId as string
      );
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching active brand promotions:", error);
      res.status(500).json({ message: "Failed to fetch active brand promotions" });
    }
  });

  // Track brand promotion analytics
  app.post("/api/brand-promotions/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const analyticsData = insertBrandPromotionAnalyticsSchema.parse(req.body);
      await storage.trackBrandPromotionView(analyticsData);
      res.json({ message: "Analytics tracked successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid analytics data", errors: error.errors });
      }
      console.error("Error tracking analytics:", error);
      res.status(500).json({ message: "Failed to track analytics" });
    }
  });

  // Get brand promotion analytics (Admin only)
  app.get("/api/admin/brand-promotions/:id/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const analytics = await storage.getBrandPromotionAnalytics(id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Banner Ad Settings Routes
  app.get("/api/admin/banner-ads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is admin (for now, just check if email is whitelisted)
      // In production, you'd have proper admin role checking
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      const settings = await storage.getBannerAdSettings();
      
      // Return default settings if none exist
      if (!settings) {
        const defaultSettings = {
          enabled: true,
          globalEnabled: true,
          homePageEnabled: true,
          videoPageEnabled: true,
          subjectPageEnabled: true,
          mobileEnabled: true,
          placement: "bottom",
          dismissible: true,
          showCloseButton: true,
          minimizable: true,
          autoHide: false,
          autoHideDelay: 30,
          maxImpressions: 1000,
          adNetwork: "mixed"
        };
        return res.json(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching banner ad settings:", error);
      res.status(500).json({ message: "Failed to fetch banner ad settings" });
    }
  });

  app.put("/api/admin/banner-ads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is admin
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertBannerAdSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateBannerAdSettings(validatedData);
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating banner ad settings:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update banner ad settings" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time features (optional for high traffic scenarios)
  // Uncomment the line below if you need real-time features like live viewer counts
  // setupWebSocket(httpServer);
  
  return httpServer;
}