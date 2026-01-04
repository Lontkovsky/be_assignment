import request from "supertest";
import { app } from "../src/app";
import { NotFoundError } from "../src/errors/httpErrors";
import * as groupService from "../src/services/groupService";
import * as membershipService from "../src/services/membershipService";

jest.mock("../src/services/groupService", () => ({
  getGroups: jest.fn(),
}));

jest.mock("../src/services/membershipService", () => ({
  removeUserFromGroup: jest.fn(),
}));

describe("Groups routes", () => {
  it("GET /groups returns paginated groups", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    (groupService.getGroups as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 1,
          name: "Admins",
          status: "notEmpty",
          createdAt,
        },
      ],
      total: 1,
    });

    const response = await request(app).get("/groups");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      limit: 20,
      offset: 0,
      total: 1,
    });
    expect(response.body.data[0]).toEqual({
      id: 1,
      name: "Admins",
      status: "notEmpty",
      createdAt: createdAt.toISOString(),
    });
    expect(groupService.getGroups).toHaveBeenCalledWith(20, 0);
  });

  it("GET /groups validates pagination", async () => {
    const response = await request(app).get("/groups?offset=-5");

    expect(response.status).toBe(400);
    expect(groupService.getGroups).not.toHaveBeenCalled();
  });

  it("DELETE /groups/:groupId/users/:userId removes membership", async () => {
    (membershipService.removeUserFromGroup as jest.Mock).mockResolvedValue(
      undefined
    );

    const response = await request(app).delete("/groups/2/users/3");

    expect(response.status).toBe(204);
    expect(membershipService.removeUserFromGroup).toHaveBeenCalledWith(3, 2);
  });

  it("DELETE /groups/:groupId/users/:userId validates IDs", async () => {
    const response = await request(app).delete("/groups/0/users/3");

    expect(response.status).toBe(400);
    expect(membershipService.removeUserFromGroup).not.toHaveBeenCalled();
  });

  it("DELETE /groups/:groupId/users/:userId returns 404 when missing", async () => {
    (membershipService.removeUserFromGroup as jest.Mock).mockRejectedValue(
      new NotFoundError("Group not found")
    );

    const response = await request(app).delete("/groups/999/users/3");

    expect(response.status).toBe(404);
  });
});
