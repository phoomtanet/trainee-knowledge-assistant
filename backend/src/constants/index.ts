export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
} as const;

export const MESSAGES = {
  SUCCESS: "Success",
  CREATED: "Created successfully",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  INTERNAL_ERROR: "Internal server error",
  INVALID_CREDENTIALS: "Invalid credentials",
} as const;
