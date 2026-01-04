import request from "supertest";
import { app } from "../src/app";
import { NotFoundError } from "../src/errors/httpErrors";
import * as userService from "../src/services/userService";

jest.mock("../src/services/userService", () => ({
  getUsers: jest.fn(),
  bulkUpdateUserStatuses: jest.fn(),
}));

describe("Users routes", () => {
  it("GET /users returns paginated users", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    (userService.getUsers as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          status: "pending",
          createdAt,
        },
      ],
      total: 1,
    });

    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      limit: 20,
      offset: 0,
      total: 1,
    });
    expect(response.body.data[0]).toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "pending",
      createdAt: createdAt.toISOString(),
    });
    expect(userService.getUsers).toHaveBeenCalledWith(20, 0);
  });

  it("GET /users validates pagination", async () => {
    const response = await request(app).get("/users?limit=-1");

    expect(response.status).toBe(400);
    expect(userService.getUsers).not.toHaveBeenCalled();
  });

  it("PATCH /users/statuses updates statuses", async () => {
    (userService.bulkUpdateUserStatuses as jest.Mock).mockResolvedValue({
      updated: 2,
    });

    const response = await request(app)
      .patch("/users/statuses")
      .send({
        updates: [
          { id: 1, status: "active" },
          { id: 2, status: "blocked" },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ updated: 2 });
  });

  it("PATCH /users/statuses validates duplicate IDs", async () => {
    const response = await request(app)
      .patch("/users/statuses")
      .send({
        updates: [
          { id: 1, status: "active" },
          { id: 1, status: "blocked" },
        ],
      });

    expect(response.status).toBe(400);
    expect(userService.bulkUpdateUserStatuses).not.toHaveBeenCalled();
  });

  it("PATCH /users/statuses returns 404 when user missing", async () => {
    (userService.bulkUpdateUserStatuses as jest.Mock).mockRejectedValue(
      new NotFoundError("Some users were not found")
    );

    const response = await request(app)
      .patch("/users/statuses")
      .send({
        updates: [{ id: 999, status: "active" }],
      });

    expect(response.status).toBe(404);
  });
});
