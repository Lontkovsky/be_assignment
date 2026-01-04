export const userStatusValues = ["pending", "active", "blocked"] as const;

export type UserStatus = (typeof userStatusValues)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
}
