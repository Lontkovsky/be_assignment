import { withTransaction } from "../db/transaction";
import { NotFoundError } from "../errors/httpErrors";
import { GroupStatus } from "../types/group";
import {
  findGroupById,
  updateGroupStatus,
} from "../repositories/groupRepository";
import { findUserById } from "../repositories/userRepository";
import {
  countGroupMembers,
  deleteUserFromGroup,
} from "../repositories/userGroupRepository";

export async function removeUserFromGroup(userId: number, groupId: number) {
  return withTransaction(async (connection) => {
    const group = await findGroupById(groupId, connection);
    const user = await findUserById(userId, connection);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const removed = await deleteUserFromGroup(userId, groupId, connection);
    if (removed === 0) {
      throw new NotFoundError("User is not assigned to the group");
    }

    const memberCount = await countGroupMembers(groupId, connection);
    const nextStatus: GroupStatus = memberCount === 0 ? "empty" : "notEmpty";

    if (group.status !== nextStatus) {
      await updateGroupStatus(groupId, nextStatus, connection);
    }
  });
}
