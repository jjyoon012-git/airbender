// Reference: blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserProfileSchema, 
  insertUserHealthInfoSchema,
  insertAlertPreferencesSchema,
  insertNotificationScheduleSchema,
  insertNotificationTokenSchema
} from "@shared/schema";
import express from "express";
import path from "path";
import { AlertService } from "./services/alertService";
import { pushService } from "./push-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve video files before other routes to prevent Vite middleware from catching them
  const videosPath = path.resolve(import.meta.dirname, '..', 'client', 'public', 'videos');
  app.use('/videos', express.static(videosPath));

  // Setup Replit Auth
  await setupAuth(app);

  // Initialize alert service
  const apiToken = process.env.HUGGINGFACE_API_TOKEN;
  if (!apiToken) {
    throw new Error("HUGGINGFACE_API_TOKEN environment variable is required");
  }
  const alertService = new AlertService(storage, apiToken);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes (protected)
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body with userId from auth token
      const dataWithUserId = {
        ...req.body,
        userId, // Force userId from auth token
      };
      
      const validatedData = insertUserProfileSchema.parse(dataWithUserId);
      
      const profile = await storage.createUserProfile(validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(500).json({ 
        message: "Failed to create user profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Remove userId from request body to prevent hijacking
      const { userId: _, ...safeData } = req.body;
      
      // Validate allowed fields only
      const validatedData = insertUserProfileSchema.partial().parse(safeData);
      
      const profile = await storage.updateUserProfile(userId, validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ 
        message: "Failed to update user profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // User health info routes (protected)
  app.get('/api/health-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const healthInfo = await storage.getUserHealthInfo(userId);
      res.json(healthInfo || null);
    } catch (error) {
      console.error("Error fetching health info:", error);
      res.status(500).json({ message: "Failed to fetch health info" });
    }
  });

  app.post('/api/health-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body with userId from auth token
      const dataWithUserId = {
        ...req.body,
        userId, // Force userId from auth token
      };
      
      const validatedData = insertUserHealthInfoSchema.parse(dataWithUserId);
      
      const healthInfo = await storage.createUserHealthInfo(validatedData);
      res.json(healthInfo);
    } catch (error) {
      console.error("Error creating health info:", error);
      res.status(500).json({ 
        message: "Failed to create health info",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch('/api/health-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Remove userId from request body to prevent hijacking
      const { userId: _, ...safeData } = req.body;
      
      // Validate allowed fields only
      const validatedData = insertUserHealthInfoSchema.partial().parse(safeData);
      
      const healthInfo = await storage.updateUserHealthInfo(userId, validatedData);
      res.json(healthInfo);
    } catch (error) {
      console.error("Error updating health info:", error);
      res.status(500).json({ 
        message: "Failed to update health info",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Alert routes (protected)
  app.post('/api/alerts/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { language = "en" } = req.body;

      const alert = await alertService.generateDailyAlert(userId, language);
      res.json(alert);
    } catch (error) {
      console.error("Error generating alert:", error);
      res.status(500).json({ 
        message: "Failed to generate alert",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;

      const alerts = await alertService.getUserAlerts(userId, limit);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ 
        message: "Failed to fetch alerts",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/alerts/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await alertService.getAlertPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching alert preferences:", error);
      res.status(500).json({ 
        message: "Failed to fetch alert preferences",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch('/api/alerts/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const updates: { language?: string; topics?: string[] } = {};
      if (req.body.language !== undefined) {
        updates.language = req.body.language;
      }
      if (req.body.topics !== undefined) {
        updates.topics = req.body.topics;
      }
      
      const preferences = await alertService.updateAlertPreferences(userId, updates);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating alert preferences:", error);
      res.status(500).json({ 
        message: "Failed to update alert preferences",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get comprehensive air quality data for a location
  app.get("/api/air-quality", async (req, res) => {
    try {
      const locationId = (req.query.locationId as string) || "newyork";
      const data = await storage.getAirQualityResponse(locationId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      res.status(500).json({ 
        error: "Failed to fetch air quality data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get current air quality for a specific location
  app.get("/api/air-quality/current/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      const data = await storage.getCurrentAirQuality(locationId);
      
      if (!data) {
        return res.status(404).json({ error: "Air quality data not found" });
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching current air quality:", error);
      res.status(500).json({ error: "Failed to fetch current air quality" });
    }
  });

  // Get historical data for a location
  app.get("/api/air-quality/historical/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      const hours = parseInt(req.query.hours as string) || 24;
      const data = await storage.getHistoricalData(locationId, hours);
      res.json(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  // Get forecast for a location
  app.get("/api/air-quality/forecast/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      const days = parseInt(req.query.days as string) || 3;
      const data = await storage.getForecast(locationId, days);
      res.json(data);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });

  // Real-time NYC air quality and weather data (protected)
  app.get("/api/realtime/nyc", isAuthenticated, async (req: any, res) => {
    try {
      const NYC_LAT = 40.7128;
      const NYC_LON = -74.0060;
      const AIRNOW_KEY = process.env.AIRNOW_API_KEY;

      if (!AIRNOW_KEY) {
        return res.status(500).json({ error: "AirNow API key not configured" });
      }

      // Fetch weather data from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${NYC_LAT}&longitude=${NYC_LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=ms&timezone=America%2FNew_York`;
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      const weatherJson = await weatherResponse.json();
      const weatherData = weatherJson.current;

      // Fetch air quality data from AirNow
      const airUrl = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${NYC_LAT}&longitude=${NYC_LON}&distance=25&API_KEY=${AIRNOW_KEY}`;
      const airResponse = await fetch(airUrl);
      if (!airResponse.ok) {
        throw new Error(`AirNow API error: ${airResponse.status}`);
      }
      const airData = await airResponse.json();

      // Process AirNow data
      const processedAir: Record<string, any> = {};
      for (const item of airData) {
        const name = item.ParameterName;
        processedAir[name] = {
          AQI: item.AQI,
          Category: item.Category?.Name,
          Concentration: item.Concentration
        };
      }

      res.json({
        datetime_local: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
        weather: {
          temp: weatherData.temperature_2m,
          humidity: weatherData.relative_humidity_2m,
          wind: weatherData.wind_speed_10m,
          time: weatherData.time
        },
        air_quality: processedAir
      });
    } catch (error: any) {
      console.error("Error fetching real-time NYC data:", error);
      res.status(500).json({ 
        error: "Failed to fetch real-time NYC data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get active alerts for a location
  app.get("/api/air-quality/alerts/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      const data = await storage.getActiveAlerts(locationId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Get all locations
  app.get("/api/locations", async (_req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  // Get specific location
  app.get("/api/locations/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({ error: "Failed to fetch location" });
    }
  });

  // Push notification routes (protected)
  
  // Get VAPID public key for client-side subscription
  app.get('/api/push/vapid-public-key', (_req, res) => {
    res.json({ publicKey: pushService.getPublicKey() });
  });

  // Subscribe to push notifications
  app.post('/api/push/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const dataWithUserId = {
        ...req.body,
        userId,
      };
      
      const validatedData = insertNotificationTokenSchema.parse(dataWithUserId);
      
      const existingToken = await storage.getNotificationTokenByEndpoint(validatedData.endpoint);
      if (existingToken) {
        return res.json(existingToken);
      }
      
      const token = await storage.createNotificationToken(validatedData);
      res.json(token);
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      res.status(500).json({ 
        message: "Failed to subscribe to push notifications",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Unsubscribe from push notifications
  app.post('/api/push/unsubscribe', isAuthenticated, async (req: any, res) => {
    try {
      const { endpoint } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint is required" });
      }
      
      await storage.revokeNotificationToken(endpoint);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      res.status(500).json({ 
        message: "Failed to unsubscribe from push notifications",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user's notification schedules
  app.get('/api/push/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schedules = await storage.getUserNotificationSchedules(userId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching notification schedules:", error);
      res.status(500).json({ message: "Failed to fetch notification schedules" });
    }
  });

  // Create notification schedule
  app.post('/api/push/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const dataWithUserId = {
        ...req.body,
        userId,
      };
      
      const validatedData = insertNotificationScheduleSchema.parse(dataWithUserId);
      
      const schedule = await storage.createNotificationSchedule(validatedData);
      res.json(schedule);
    } catch (error) {
      console.error("Error creating notification schedule:", error);
      res.status(500).json({ 
        message: "Failed to create notification schedule",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update notification schedule
  app.patch('/api/push/schedules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { userId: _, ...safeData } = req.body;
      
      const validatedData = insertNotificationScheduleSchema.partial().parse(safeData);
      
      const schedule = await storage.updateNotificationSchedule(parseInt(id), validatedData);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating notification schedule:", error);
      res.status(500).json({ 
        message: "Failed to update notification schedule",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete notification schedule
  app.delete('/api/push/schedules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotificationSchedule(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification schedule:", error);
      res.status(500).json({ 
        message: "Failed to delete notification schedule",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get notification history
  app.get('/api/push/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const history = await storage.getUserNotificationHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching notification history:", error);
      res.status(500).json({ message: "Failed to fetch notification history" });
    }
  });

  // Test push notification (for debugging)
  app.post('/api/push/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, body } = req.body;
      
      const tokens = await storage.getActiveNotificationTokens(userId);
      
      if (tokens.length === 0) {
        return res.json({ message: "No active push subscriptions found" });
      }
      
      const result = await pushService.sendBulkNotifications(tokens, {
        title: title || "Test Notification",
        body: body || "This is a test notification from AIRBENDER",
        icon: "/icon-192x192.png"
      });
      
      for (const endpoint of result.expired) {
        await storage.revokeNotificationToken(endpoint);
      }
      
      await storage.createNotificationHistory({
        userId,
        type: "test",
        payload: {
          title: title || "Test Notification",
          body: body || "This is a test notification from AIRBENDER"
        },
        status: "sent"
      });
      
      res.json({
        sent: result.successful,
        failed: result.failed,
        expired: result.expired.length
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ 
        message: "Failed to send test notification",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "TEMPO Air Quality API"
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
