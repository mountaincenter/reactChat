import { PrismaClient, type User, type Status } from "@prisma/client";

const prisma = new PrismaClient();

export const userHandler = {
  getUserById: async (userId: string) => {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Could not fetch user");
    }
  },

  listUserExcludingSelf: async (userId: string): Promise<User[]> => {
    try {
      const users = await prisma.user.findMany({
        where: {
          id: { not: userId },
        },
      });
      return users;
    } catch (error) {
      console.error("Error listing users:", error);
      throw new Error("Could not list users");
    }
  },

  updateStatus: async (userId: string, status: Status) => {
    try {
      // statusフィールドのみを更新
      return await prisma.user.update({
        where: { id: userId },
        data: {
          status: status, // Statusだけを更新
        },
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error("Could not update user status");
    }
  },
};
