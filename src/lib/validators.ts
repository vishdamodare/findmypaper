import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Enter a valid email").max(254),
  password: z.string().min(8, "At least 8 characters").max(72, "At most 72 characters"),
});

export const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email") });
export const resetSchema = z.object({
  token: z.string().min(20),
  password: registerSchema.shape.password,
});

const id = z.string().min(1, "Required");
const optId = z.string().optional().transform((v) => v || undefined);

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  universityId: optId,
  courseId: optId,
  branchId: optId,
  academicYearId: optId,
  semesterNo: z.coerce.number().int().min(1).max(8).optional().or(z.literal("").transform(() => undefined)),
});

export const resourceMetaSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(150),
  description: z.string().trim().max(1000).optional().transform((v) => v || undefined),
  subjectId: id,
  categoryId: id,
  academicYearId: id,
});

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
/** extension -> allowed mime types. Checked on the server; magic bytes are verified for PDFs/Office. */
export const ALLOWED_FILES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  txt: ["text/plain"],
};

// Simple master-data forms (admin)
export const nameSchema = z.object({ name: z.string().trim().min(1).max(120) });
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
