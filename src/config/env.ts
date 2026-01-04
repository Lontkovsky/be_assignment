import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().optional().default(3000),
  DB_HOST: z.string().optional().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().optional().default(3306),
  DB_USER: z.string().optional().default("user"),
  DB_PASSWORD: z.string().optional().default("password"),
  DB_NAME: z.string().optional().default("mydatabase"),
  DB_POOL_SIZE: z.coerce.number().int().positive().optional().default(10),
});

export const env = envSchema.parse(process.env);
