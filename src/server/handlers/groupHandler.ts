import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const groupHandler = {
  // グループを作成する関数
  createGroup: async ({
    name,
    isPrivate,
    image,
    memberIds,
  }: {
    name: string;
    isPrivate: boolean;
    image: string;
    memberIds: string[];
  }) => {
    try {
      const newGroup = await prisma.group.create({
        data: {
          name,
          isPrivate,
          image,
          createdAt: new Date(),
          updatedAt: new Date(),
          members: {
            connect: memberIds.map((id) => ({ id })), // メンバーをグループに追加
          },
        },
      });
      return newGroup;
    } catch (error) {
      console.error("グループの作成に失敗しました:", error);
      throw new Error("グループの作成に失敗しました");
    }
  },

  // グループ名を更新する関数
  updateGroupName: async (groupId: string, newName: string, image?: string) => {
    try {
      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: {
          name: newName,
          updatedAt: new Date(),
          ...(image && { image }),
        },
      });
      return updatedGroup;
    } catch (error) {
      console.error("グループ名の更新に失敗しました:", error);
      throw new Error("グループ名の更新に失敗しました");
    }
  },

  // グループを削除する関数
  deleteGroup: async (groupId: string) => {
    try {
      await prisma.group.delete({
        where: { id: groupId },
      });
    } catch (error) {
      console.error("グループの削除に失敗しました:", error);
      throw new Error("グループの削除に失敗しました");
    }
  },

  // ユーザーIDからグループを取得する関数
  getGroupsByUserId: async (userId: string) => {
    try {
      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          members: true, // メンバー情報も取得
          messages: true, // メッセージ情報も取得
          conversations: true, //会話情報も取得
        },
      });
      return groups;
    } catch (error) {
      console.error("グループの取得に失敗しました:", error);
      throw new Error("グループの取得に失敗しました");
    }
  },
};
