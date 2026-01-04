import { countGroups, listGroups } from "../repositories/groupRepository";

export async function getGroups(limit: number, offset: number) {
  const [data, total] = await Promise.all([
    listGroups(limit, offset),
    countGroups(),
  ]);

  return { data, total };
}
