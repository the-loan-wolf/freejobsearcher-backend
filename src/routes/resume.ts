import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { addResumeHandler } from "../controllers/resume";
import {
  verifyFirebaseAuth,
  VerifyFirebaseAuthConfig,
} from "@hono/firebase-auth";
import { AppEnv } from "../lib/types";

const config: VerifyFirebaseAuthConfig = {
  // specify your firebase project ID.
  projectId: "freejob-abedb",
};

export const resume = new OpenAPIHono<{ Bindings: AppEnv }>();

// ------------------------------
// openAPI example
// ------------------------------
const example = {
  profile: {
    name: "example",
    role: "UI & UX Designer",
    location: "Mumbai, India",
    salary: "₹25,000",
    image: "/ui-designer-headshot.png",
    experience: "3+ years",
    bio: "Passionate UI/UX designer",
  },
  contact: [{ phone: "+91 98765 43210" }, { email: "example@gmail.com" }],
  education: [
    {
      degree: "Bachelor of Design",
      institution: "NID",
      year: "2020",
    },
    {
      degree: "UX Certification",
      institution: "Google",
      year: "2021",
    },
  ],
  workHistory: [
    {
      company: "TechCorp",
      position: "Senior UI Designer",
      duration: "2022 - Present",
    },
    {
      company: "StartupXYZ",
      position: "UI/UX Designer",
      duration: "2021 - 2022",
    },
  ],
  achievements: [
    "Led design for app with 100K+ downloads",
    "Improved user engagement by 40%",
    "Winner of Best Design Award 2023",
  ],
  skills: ["JavaScript", "node js", "php"],
};

// ------------------------------
// Zod Schemas
// ------------------------------
const profileSchema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  salary: z.string(),
  image: z.string(),
  experience: z.string(),
  bio: z.string(),
});

const contactSchema = z.union([
  z.object({ phone: z.string() }),
  z.object({ email: z.email() }),
]);

const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
});

const workSchema = z.object({
  company: z.string(),
  position: z.string(),
  duration: z.string(),
});

// ------------------------------
// Resume Schema
// ------------------------------
export const resumeSchema = z.object({
  profile: profileSchema,
  contact: z.array(contactSchema),
  education: z.array(educationSchema),
  workHistory: z.array(workSchema),
  achievements: z.array(z.string()),
  skills: z.array(z.string()),
});

// ------------------------------
// OpenAPI Route Definition
// ------------------------------
export const createResumeRoute = createRoute({
  method: "post",
  path: "/resume",
  description: `This route adds or update logged in user's resume.
    Add your idToken in header as following to work:
    Authorization: Bearer idToken`,
  request: {
    headers: z.object({
      Authorization: z.string().describe("Bearer token for authentication"),
    }),
    body: {
      content: {
        "application/json": {
          schema: resumeSchema,
          example: example,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Resume uploaded successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    400: { description: "Invalid input" },
    500: { description: "Server error" },
  },
  tags: ["Resume"],
});

// ------------------------------
// Register Handler
// ------------------------------
resume.use("/resume", verifyFirebaseAuth(config));
resume.openapi(createResumeRoute, addResumeHandler);
