import { PrismaClient, type User, type Status } from "@prisma/client";
import { pusher } from "~/server/service/pusher";

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
        include: {
          conversations: true,
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
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
      });

      void pusher.trigger("user-channel", "status-update", {
        userId: updatedUser.id,
        status: updatedUser.status,
      });

      // statusフィールドのみを更新
      return updatedUser;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error("Could not update user status");
    }
  },

  updateUserSettings: async (
    userId: string,
    idleTimeout: number,
    defaultStatus: Status,
  ) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { idleTimeout, defaultStatus },
      });

      return updatedUser;
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw new Error("Could not update user settings");
    }
  },
};
