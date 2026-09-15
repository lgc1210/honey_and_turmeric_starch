import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),

	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

	NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
