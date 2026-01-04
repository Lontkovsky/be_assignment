export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "User Management API",
    version: "1.0.0",
    description: "REST API for user and group management",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        summary: "Get users with pagination",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                  required: ["data", "pagination"],
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/users/statuses": {
      patch: {
        summary: "Bulk update user statuses",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkStatusUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated count",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    updated: { type: "integer", example: 2 },
                  },
                  required: ["updated"],
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/groups": {
      get: {
        summary: "Get groups with pagination",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "List of groups",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Group" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                  required: ["data", "pagination"],
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/groups/{groupId}/users/{userId}": {
      delete: {
        summary: "Remove a user from a group",
        parameters: [
          {
            name: "groupId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "204": { description: "Removed" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          status: {
            type: "string",
            enum: ["pending", "active", "blocked"],
            example: "pending",
          },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "email", "status", "createdAt"],
      },
      Group: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Admins" },
          status: {
            type: "string",
            enum: ["empty", "notEmpty"],
            example: "notEmpty",
          },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "status", "createdAt"],
      },
      Pagination: {
        type: "object",
        properties: {
          limit: { type: "integer", example: 20 },
          offset: { type: "integer", example: 0 },
          total: { type: "integer", example: 2 },
        },
        required: ["limit", "offset", "total"],
      },
      BulkStatusUpdate: {
        type: "object",
        properties: {
          updates: {
            type: "array",
            minItems: 1,
            maxItems: 500,
            items: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                status: {
                  type: "string",
                  enum: ["pending", "active", "blocked"],
                  example: "active",
                },
              },
              required: ["id", "status"],
            },
          },
        },
        required: ["updates"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "object" },
        },
        required: ["error"],
      },
    },
    responses: {
      BadRequest: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
};
