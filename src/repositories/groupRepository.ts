import {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { pool } from "../db/pool";
import { Group, GroupStatus } from "../types/group";

type DbExecutor = Pool | PoolConnection;

type GroupRow = RowDataPacket & {
  id: number;
  name: string;
  status: GroupStatus;
  created_at: Date;
};

type CountRow = RowDataPacket & { count: number };

function getExecutor(connection?: PoolConnection): DbExecutor {
  return connection ?? pool;
}

export async function listGroups(
  limit: number,
  offset: number,
  connection?: PoolConnection
): Promise<Group[]> {
  const executor = getExecutor(connection);
  const [rows] = await executor.query<GroupRow[]>(
    "SELECT id, name, status, created_at FROM `groups` ORDER BY id LIMIT ? OFFSET ?",
    [limit, offset]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function countGroups(
  connection?: PoolConnection
): Promise<number> {
  const executor = getExecutor(connection);
  const [rows] = await executor.query<CountRow[]>(
    "SELECT COUNT(*) as count FROM `groups`"
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findGroupById(
  id: number,
  connection?: PoolConnection
): Promise<Group | null> {
  const executor = getExecutor(connection);
  const [rows] = await executor.query<GroupRow[]>(
    "SELECT id, name, status, created_at FROM `groups` WHERE id = ? LIMIT 1",
    [id]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function updateGroupStatus(
  id: number,
  status: GroupStatus,
  connection?: PoolConnection
): Promise<number> {
  const executor = getExecutor(connection);
  const [result] = await executor.execute<ResultSetHeader>(
    "UPDATE `groups` SET status = ? WHERE id = ?",
    [status, id]
  );

  return result.affectedRows;
}
