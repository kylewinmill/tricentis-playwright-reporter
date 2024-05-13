import { z } from "zod";

export const envSchema = z.object({
  JIRA_KEY: z.string(),
  JIRA_URL: z.string(),
  PROJECT_KEY: z.string(),
  PROJECT_NAME: z.string(),
  VERSION: z.string().optional().nullable(),
});
