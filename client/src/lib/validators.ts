import { z } from "zod";

export const credentialsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").refine(
    (email) => email.endsWith("@gmail.com"),
    "Only Gmail addresses are supported"
  ),
  password: z.string().min(1, "Password is required"),
});

export type CredentialsSchema = z.infer<typeof credentialsSchema>;
