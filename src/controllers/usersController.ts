import { Request, Response } from "express";
import { z } from "zod";
import { paginationSchema } from "../validators/pagination";
import { bulkUpdateUserStatuses, getUsers } from "../services/userService";
import { userStatusValues } from "../types/user";
import { BadRequestError } from "../errors/httpErrors";

const bulkUpdateSchema = z
  .object({
    updates: z
      .array(
        z.object({
          id: z.coerce.number().int().positive(),
          status: z.enum(userStatusValues),
        })
      )
      .min(1)
      .max(500),
  })
  .refine(
    (payload) => {
      const ids = payload.updates.map((update) => update.id);
      return new Set(ids).size === ids.length;
    },
    { message: "Duplicate user IDs are not allowed", path: ["updates"] }
  );

export async function listUsers(req: Request, res: Response) {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new BadRequestError(
      "Invalid pagination parameters",
      parsed.error.flatten()
    );
  }

  const { limit, offset } = parsed.data;
  const { data, total } = await getUsers(limit, offset);

  res.json({
    data,
    pagination: { limit, offset, total },
  });
}

export async function updateUserStatuses(req: Request, res: Response) {
  const parsed = bulkUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new BadRequestError("Invalid request body", parsed.error.flatten());
  }

  const result = await bulkUpdateUserStatuses(parsed.data.updates);
  res.json(result);
}
