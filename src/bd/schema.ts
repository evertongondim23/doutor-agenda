import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: uuid("user_id").references(() => usersTable.id),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(apponmentTable),
  usersToClinics: many(usersToClinicsTable),
}));

export const doctorsTable = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatarImage: text("avatar_image_url"),
  //
  specialty: text("specialty").notNull(),
  availabilityFromWeekday: text("availability_from_weekday").notNull(), //monday, tuesday, wednesday, thursday, friday, saturday, sunday
  availabilityToWeekday: text("availability_to_weekday").notNull(), //monday, tuesday, wednesday, thursday, friday, saturday, sunday
  availabilityFromTime: timestamp("availability_from_time").notNull(), //00:00:00
  availabilityToTime: timestamp("availability_to_time").notNull(), //00:00:00
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(), //1000000 = 10000.00
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTableRelations = relations(doctorsTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [doctorsTable.clinicId],
    references: [clinicsTable.id],
  }),
}));

export const apponmentTable = pgTable("apponment", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").references(() => doctorsTable.id, {
    onDelete: "cascade",
  }),
  patientId: uuid("patient_id").references(() => patientsTable.id, {
    onDelete: "cascade",
  }),
  date: timestamp("date").notNull(),
  time: timestamp("time").notNull(),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, {
    onDelete: "cascade",
  }),
  status: text("status").notNull(), //pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const apponmentTableRelations = relations(apponmentTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [apponmentTable.clinicId],
    references: [clinicsTable.id],
  }),
  patient: one(patientsTable, {
    fields: [apponmentTable.patientId],
    references: [patientsTable.id],
  }),
  doctor: one(doctorsTable, {
    fields: [apponmentTable.doctorId],
    references: [doctorsTable.id],
  }),
}));

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  sex: patientSexEnum("sex").notNull(),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(patientsTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [patientsTable.clinicId],
    references: [clinicsTable.id],
  }),
}));
