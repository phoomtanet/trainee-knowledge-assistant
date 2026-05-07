export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  data: AuthUser;
}
