import {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { pool } from "../db/pool";
import { placeholders } from "../db/sql";
import { User, UserStatus } from "../types/user";

type DbExecutor = Pool | PoolConnection;

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  created_at: Date;
};

type IdRow = RowDataPacket & { id: number };

type CountRow = RowDataPacket & { count: number };

function getExecutor(connection?: PoolConnection): DbExecutor {
  return connection ?? pool;
}

export async function listUsers(
  limit: number,
  offset: number,
  connection?: PoolConnection
): Promise<User[]> {
  const executor = getExecutor(connection);
  const [rows] = await executor.query<UserRow[]>(
    "SELECT id, name, email, status, created_at FROM users ORDER BY id LIMIT ? OFFSET ?",
    [limit, offset]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function countUsers(connection?: PoolConnection): Promise<number> {
  const executor = getExecutor(connection);
  const [rows] = await executor.query<CountRow[]>(
    "SELECT COUNT(*) as count FROM users"
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findUserById(
  id: number,
  connection?: PoolConnection
): Promise<User | null> {
  const executor = getExecutor(connection);
  const [rows] = await executor.query<UserRow[]>(
    "SELECT id, name, email, status, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function findExistingUserIds(
  ids: number[],
  connection?: PoolConnection
): Promise<number[]> {
  if (ids.length === 0) {
    return [];
  }

  const executor = getExecutor(connection);
  const inPlaceholders = placeholders(ids.length);
  const [rows] = await executor.query<IdRow[]>(
    `SELECT id FROM users WHERE id IN (${inPlaceholders})`,
    ids
  );

  return rows.map((row) => row.id);
}

export async function updateUserStatuses(
  updates: Array<{ id: number; status: UserStatus }>,
  connection?: PoolConnection
): Promise<number> {
  if (updates.length === 0) {
    return 0;
  }

  const executor = getExecutor(connection);
  const ids = updates.map((update) => update.id);
  const caseFragments = updates.map(() => "WHEN ? THEN ?").join(" ");
  const params = updates.flatMap((update) => [update.id, update.status]);
  const inPlaceholders = placeholders(ids.length);

  const sql = `UPDATE users SET status = CASE id ${caseFragments} END WHERE id IN (${inPlaceholders})`;
  const [result] = await executor.execute<ResultSetHeader>(sql, [
    ...params,
    ...ids,
  ]);

  return result.affectedRows;
}
