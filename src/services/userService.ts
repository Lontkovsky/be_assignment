import { withTransaction } from "../db/transaction";
import { NotFoundError } from "../errors/httpErrors";
import { UserStatus } from "../types/user";
import {
  countUsers,
  findExistingUserIds,
  listUsers,
  updateUserStatuses,
} from "../repositories/userRepository";

export async function getUsers(limit: number, offset: number) {
  const [data, total] = await Promise.all([
    listUsers(limit, offset),
    countUsers(),
  ]);

  return { data, total };
}

export async function bulkUpdateUserStatuses(
  updates: Array<{ id: number; status: UserStatus }>
) {
  return withTransaction(async (connection) => {
    const ids = updates.map((update) => update.id);
    const existingIds = await findExistingUserIds(ids, connection);

    if (existingIds.length !== ids.length) {
      const existingSet = new Set(existingIds);
      const missingIds = ids.filter((id) => !existingSet.has(id));
      throw new NotFoundError("Some users were not found", { missingIds });
    }

    const updated = await updateUserStatuses(updates, connection);
    return { updated };
  });
}
