import {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { pool } from "../db/pool";

type DbExecutor = Pool | PoolConnection;

type CountRow = RowDataPacket & { count: number };

function getExecutor(connection?: PoolConnection): DbExecutor {
  return connection ?? pool;
}

export async function deleteUserFromGroup(
  userId: number,
  groupId: number,
  connection?: PoolConnection
): Promise<number> {
  const executor = getExecutor(connection);
  const [result] = await executor.execute<ResultSetHeader>(
    "DELETE FROM user_groups WHERE user_id = ? AND group_id = ?",
    [userId, groupId]
  );

  return result.affectedRows;
}

export async function countGroupMembers(
  groupId: number,
  connection?: PoolConnection
): Promise<number> {
  const executor = getExecutor(connection);
  const [rows] = await executor.query<CountRow[]>(
    "SELECT COUNT(*) as count FROM user_groups WHERE group_id = ?",
    [groupId]
  );

  return Number(rows[0]?.count ?? 0);
}
