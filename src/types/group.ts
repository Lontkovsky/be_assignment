export const groupStatusValues = ["empty", "notEmpty"] as const;

export type GroupStatus = (typeof groupStatusValues)[number];

export interface Group {
  id: number;
  name: string;
  status: GroupStatus;
  createdAt: Date;
}
