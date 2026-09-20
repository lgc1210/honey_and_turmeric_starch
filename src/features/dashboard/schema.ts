import { z } from "zod";

export const dashboardQuerySchema = z.object({
	days: z.coerce.number().int().min(1, "Tối thiểu 1 ngày").max(365, "Tối đa 365 ngày").default(30),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
