import { Request, Response } from "express";
import { z } from "zod";
import { paginationSchema } from "../validators/pagination";
import { getGroups } from "../services/groupService";
import { removeUserFromGroup } from "../services/membershipService";
import { BadRequestError } from "../errors/httpErrors";

const removeMembershipSchema = z.object({
  groupId: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
});

export async function listGroups(req: Request, res: Response) {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new BadRequestError(
      "Invalid pagination parameters",
      parsed.error.flatten()
    );
  }

  const { limit, offset } = parsed.data;
  const { data, total } = await getGroups(limit, offset);

  res.json({
    data,
    pagination: { limit, offset, total },
  });
}

export async function removeUserFromGroupHandler(req: Request, res: Response) {
  const parsed = removeMembershipSchema.safeParse(req.params);
  if (!parsed.success) {
    throw new BadRequestError(
      "Invalid path parameters",
      parsed.error.flatten()
    );
  }

  const { groupId, userId } = parsed.data;
  await removeUserFromGroup(userId, groupId);
  res.status(204).send();
}
