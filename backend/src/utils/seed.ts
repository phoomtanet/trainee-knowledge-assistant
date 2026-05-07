import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";

export const seedAdminUser = async (): Promise<void> => {
  const exists = await userRepository.existsByUsername("admin");
  if (exists) return;

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await userRepository.create({
    username: "admin",
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin user seeded");
};
