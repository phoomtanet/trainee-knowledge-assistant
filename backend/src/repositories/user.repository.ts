import { User, IUser } from "../models/user.model";

export const userRepository = {
  findByUsername: (username: string) =>
    User.findOne({ username }).select("+password"),

  create: (data: Pick<IUser, "username" | "password" | "role">) =>
    User.create(data),

  existsByUsername: (username: string) =>
    User.exists({ username }),

  findByRefreshToken: (refreshToken: string) =>
    User.findOne({ refreshToken }),

  updateRefreshToken: (userId: string, refreshToken: string | null) =>
    User.findByIdAndUpdate(userId, { refreshToken }),
};
