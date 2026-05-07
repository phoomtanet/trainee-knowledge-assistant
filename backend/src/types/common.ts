export interface ApiResponse<T = null> {
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface RequestWithUser extends Express.Request {
  user?: {
    id: string;
    email: string;
  };
}
