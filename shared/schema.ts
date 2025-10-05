import { z } from "zod";
import { pgTable, serial, varchar, text, timestamp, integer, boolean, time, date, json, index, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Air Quality Level enum
export const AirQualityLevel = z.enum([
  "excellent",
  "moderate",
  "unhealthy",
  "hazardous",
  "critical"
]);

export type AirQualityLevel = z.infer<typeof AirQualityLevel>;

// Pollutant types
export const PollutantType = z.enum(["NO2", "O3", "PM25", "PM10"]);
export type PollutantType = z.infer<typeof PollutantType>;

// Air Quality Data Point
export const airQualityDataSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  timestamp: z.string().datetime(),
  aqi: z.number().min(0).max(500),
  level: AirQualityLevel,
  pollutants: z.object({
    NO2: z.number().optional(),
    O3: z.number().optional(),
    PM25: z.number().optional(),
    PM10: z.number().optional(),
  }),
  primaryPollutant: PollutantType,
  airTattoo: z.string(), // emoji representation
});

export type AirQualityData = z.infer<typeof airQualityDataSchema>;

// Location
export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(), // Korean name
  latitude: z.number(),
  longitude: z.number(),
  country: z.string(),
  region: z.string(),
});

export type Location = z.infer<typeof locationSchema>;

// Historical Data Point (for charts)
export const historicalDataPointSchema = z.object({
  timestamp: z.string().datetime(),
  aqi: z.number(),
  level: AirQualityLevel,
  pollutantValue: z.number().optional(),
});

export type HistoricalDataPoint = z.infer<typeof historicalDataPointSchema>;

// Forecast Data
export const forecastDataSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  date: z.string(), // YYYY-MM-DD format
  predictedAqi: z.number(),
  predictedLevel: AirQualityLevel,
  confidence: z.number().min(0).max(100), // percentage
  airTattoo: z.string(),
  weatherIcon: z.string().optional(),
});

export type ForecastData = z.infer<typeof forecastDataSchema>;

// Alert
export const alertSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  level: AirQualityLevel,
  message: z.string(),
  messageKo: z.string(),
  timestamp: z.string().datetime(),
  active: z.boolean(),
  pollutant: PollutantType.optional(),
});

export type Alert = z.infer<typeof alertSchema>;

// Health Advisory
export const healthAdvisorySchema = z.object({
  level: AirQualityLevel,
  generalPublic: z.string(),
  generalPublicKo: z.string(),
  vulnerableGroups: z.string(),
  vulnerableGroupsKo: z.string(),
  activities: z.array(z.string()),
  activitiesKo: z.array(z.string()),
});

export type HealthAdvisory = z.infer<typeof healthAdvisorySchema>;

// API Response types
export const airQualityResponseSchema = z.object({
  current: airQualityDataSchema,
  location: locationSchema,
  historical: z.array(historicalDataPointSchema),
  forecast: z.array(forecastDataSchema),
  alerts: z.array(alertSchema),
});

export type AirQualityResponse = z.infer<typeof airQualityResponseSchema>;

// User Profile for personalized health advisories
export const UserType = z.enum(["student", "elderly", "worker", "general"]);
export type UserType = z.infer<typeof UserType>;

export const userProfileSchema = z.object({
  userType: UserType,
  age: z.number().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// ==================== DATABASE TABLES ====================

// Session storage table (REQUIRED for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (REQUIRED for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  healthInfo: one(userHealthInfo, {
    fields: [users.id],
    references: [userHealthInfo.userId],
  }),
  notificationSettings: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
  notificationSchedules: many(notificationSchedules),
  notificationTokens: many(notificationTokens),
  notificationHistory: many(notificationHistory),
}));

// User Profiles table
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  residence: varchar("residence", { length: 255 }),
  occupation: varchar("occupation", { length: 255 }),
  occupationCustom: varchar("occupation_custom", { length: 255 }),
  outdoorExposure: varchar("outdoor_exposure", { length: 50 }),
  outdoorSchedulePattern: json("outdoor_schedule_pattern").$type<{ day: string; start: string; end: string }[]>(),
  commuteStartTime: time("commute_start_time"),
  commuteEndTime: time("commute_end_time"),
  hobbies: json("hobbies").$type<string[]>(),
  runningDetails: json("running_details").$type<{
    frequency: number;
    preferredTime: string;
    averageDistance: number;
    routes: string[];
  }>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// User Health Info table
export const userHealthInfo = pgTable("user_health_info", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ageGroup: varchar("age_group", { length: 50 }),
  healthConditions: json("health_conditions").$type<string[]>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userHealthInfoRelations = relations(userHealthInfo, ({ one }) => ({
  user: one(users, {
    fields: [userHealthInfo.userId],
    references: [users.id],
  }),
}));

// Outdoor Schedules table
export const outdoorSchedules = pgTable("outdoor_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  activityType: varchar("activity_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outdoorSchedulesRelations = relations(outdoorSchedules, ({ one }) => ({
  user: one(users, {
    fields: [outdoorSchedules.userId],
    references: [users.id],
  }),
}));

// Notification Settings table
export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channels: json("channels").$type<string[]>(),
  morningBriefingTime: time("morning_briefing_time"),
  eveningPreviewTime: time("evening_preview_time"),
  topics: json("topics").$type<string[]>(),
  privacyConsent: json("privacy_consent").$type<{
    health: boolean;
    location: boolean;
    schedule: boolean;
    calendar: boolean;
  }>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}));

// AI Generated Alerts table
export const aiGeneratedAlerts = pgTable("ai_generated_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  alertContent: text("alert_content").notNull(),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: json("metadata").$type<{
    weatherData?: any;
    airQualityData?: any;
    userContext?: any;
  }>(),
});

export const aiGeneratedAlertsRelations = relations(aiGeneratedAlerts, ({ one }) => ({
  user: one(users, {
    fields: [aiGeneratedAlerts.userId],
    references: [users.id],
  }),
}));

// Alert Preferences table
export const alertPreferences = pgTable("alert_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  topics: json("topics").$type<string[]>().default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const alertPreferencesRelations = relations(alertPreferences, ({ one }) => ({
  user: one(users, {
    fields: [alertPreferences.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = Partial<User> & Pick<User, 'id'>;

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, updatedAt: true });
export const selectUserProfileSchema = createSelectSchema(userProfiles);
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfileDB = z.infer<typeof selectUserProfileSchema>;

export const insertUserHealthInfoSchema = createInsertSchema(userHealthInfo).omit({ id: true, updatedAt: true });
export const selectUserHealthInfoSchema = createSelectSchema(userHealthInfo);
export type InsertUserHealthInfo = z.infer<typeof insertUserHealthInfoSchema>;
export type UserHealthInfo = z.infer<typeof selectUserHealthInfoSchema>;

export const insertOutdoorScheduleSchema = createInsertSchema(outdoorSchedules).omit({ id: true, createdAt: true });
export const selectOutdoorScheduleSchema = createSelectSchema(outdoorSchedules);
export type InsertOutdoorSchedule = z.infer<typeof insertOutdoorScheduleSchema>;
export type OutdoorSchedule = z.infer<typeof selectOutdoorScheduleSchema>;

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({ id: true, updatedAt: true });
export const selectNotificationSettingsSchema = createSelectSchema(notificationSettings);
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationSettings = z.infer<typeof selectNotificationSettingsSchema>;

export const insertAiGeneratedAlertSchema = createInsertSchema(aiGeneratedAlerts).omit({ id: true, generatedAt: true });
export const selectAiGeneratedAlertSchema = createSelectSchema(aiGeneratedAlerts);
export type InsertAiGeneratedAlert = z.infer<typeof insertAiGeneratedAlertSchema>;
export type AiGeneratedAlert = z.infer<typeof selectAiGeneratedAlertSchema>;

export const insertAlertPreferencesSchema = createInsertSchema(alertPreferences).omit({ id: true, updatedAt: true });
export const selectAlertPreferencesSchema = createSelectSchema(alertPreferences);
export type InsertAlertPreferences = z.infer<typeof insertAlertPreferencesSchema>;
export type AlertPreferences = z.infer<typeof selectAlertPreferencesSchema>;

// Push Notification Schedules table
export const notificationSchedules = pgTable("notification_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull().default("daily"),
  triggerTime: time("trigger_time").notNull(),
  timezone: varchar("timezone", { length: 100 }).notNull().default("America/New_York"),
  enabled: boolean("enabled").notNull().default(true),
  lastSentAt: timestamp("last_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_notification_schedules_user_id").on(table.userId),
]);

export const notificationSchedulesRelations = relations(notificationSchedules, ({ one }) => ({
  user: one(users, {
    fields: [notificationSchedules.userId],
    references: [users.id],
  }),
}));

// Push Notification Tokens table (Web Push subscriptions)
export const notificationTokens = pgTable("notification_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  auth: text("auth").notNull(),
  p256dh: text("p256dh").notNull(),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  platform: varchar("platform", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
}, (table) => [
  index("idx_notification_tokens_user_id").on(table.userId),
]);

export const notificationTokensRelations = relations(notificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [notificationTokens.userId],
    references: [users.id],
  }),
}));

// Push Notification History table
export const notificationHistory = pgTable("notification_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduleId: integer("schedule_id").references(() => notificationSchedules.id, { onDelete: "set null" }),
  type: varchar("type", { length: 50 }).notNull(),
  payload: jsonb("payload").$type<{
    title: string;
    body: string;
    icon?: string;
    data?: any;
  }>().notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull().default("sent"),
}, (table) => [
  index("idx_notification_history_user_id").on(table.userId),
  index("idx_notification_history_schedule_id").on(table.scheduleId),
]);

export const notificationHistoryRelations = relations(notificationHistory, ({ one }) => ({
  user: one(users, {
    fields: [notificationHistory.userId],
    references: [users.id],
  }),
  schedule: one(notificationSchedules, {
    fields: [notificationHistory.scheduleId],
    references: [notificationSchedules.id],
  }),
}));

// Zod schemas for push notification tables
export const insertNotificationScheduleSchema = createInsertSchema(notificationSchedules).omit({ id: true, createdAt: true, updatedAt: true });
export const selectNotificationScheduleSchema = createSelectSchema(notificationSchedules);
export type InsertNotificationSchedule = z.infer<typeof insertNotificationScheduleSchema>;
export type NotificationSchedule = z.infer<typeof selectNotificationScheduleSchema>;

export const insertNotificationTokenSchema = createInsertSchema(notificationTokens).omit({ id: true, createdAt: true });
export const selectNotificationTokenSchema = createSelectSchema(notificationTokens);
export type InsertNotificationToken = z.infer<typeof insertNotificationTokenSchema>;
export type NotificationToken = z.infer<typeof selectNotificationTokenSchema>;

export const insertNotificationHistorySchema = createInsertSchema(notificationHistory).omit({ id: true, sentAt: true });
export const selectNotificationHistorySchema = createSelectSchema(notificationHistory);
export type InsertNotificationHistory = z.infer<typeof insertNotificationHistorySchema>;
export type NotificationHistoryRecord = z.infer<typeof selectNotificationHistorySchema>;
