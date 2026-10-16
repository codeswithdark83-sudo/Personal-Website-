import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const opt = (max: number) => text(max).optional().transform((v) => v || null);

export const PROJECT_TYPES = ["Business website", "Web application", "E-commerce store", "API / integration", "Maintenance or fixes", "Not sure yet"] as const;
export const BUDGETS = ["Under ₹25,000", "₹25,000 – ₹75,000", "₹75,000 – ₹2,00,000", "Above ₹2,00,000", "Not sure yet"] as const;
export const TIMELINES = ["As soon as possible", "Within 1 month", "1–3 months", "Flexible"] as const;
export const CONTACT_METHODS = ["email", "whatsapp", "phone"] as const;

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().toLowerCase().min(3, "Please enter your email").max(254).pipe(z.email("Enter a valid email address")),
  company: opt(160),
  phone: opt(40).refine((v) => v === null || /^[0-9+()\-\s]{6,40}$/.test(v), "Enter a valid phone number"),
  project_type: z.enum(PROJECT_TYPES, { error: "Choose a project type" }),
  project_title: opt(200),
  budget_range: z.enum(BUDGETS).nullable().optional().transform((v) => v ?? null),
  timeline: z.enum(TIMELINES).nullable().optional().transform((v) => v ?? null),
  brief: z.string().trim().min(10, "Please describe your project in at least a few words").max(5000),
  preferred_contact: z.enum(CONTACT_METHODS).default("email"),
  // Honeypot: real users never see or fill this field.
  website: z.string().max(0).optional(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;
