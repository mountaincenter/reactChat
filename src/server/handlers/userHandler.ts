import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const userHandler = {
  // ユーザーIDでユーザー情報を取得
  getUserById: async (userId: string) => {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          conversations: {
            include: {
              participants: true, // 会話に参加しているユーザーの情報も含める
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Could not fetch user");
    }
  },

  // 自分以外のユーザーリストを取得
  listUserExcludingSelf: async (userId: string) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          id: { not: userId },
        },
        include: {
          conversations: {
            include: {
              participants: true,
            },
          },
        },
      });
      return users;
    } catch (error) {
      console.error("Error listing users:", error);
      throw new Error("Could not list users");
    }
  },
};
