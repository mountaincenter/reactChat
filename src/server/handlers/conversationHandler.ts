import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const conversationHandler = {
  // 会話IDを使用して特定の会話を取得
  getConversationById: async (conversationId: string) => {
    try {
      return await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true, messages: true },
      });
    } catch (error) {
      console.error("Error fetching conversation by ID:", error);
      throw new Error("Could not fetch conversation by ID");
    }
  },

  // 特定のユーザーが参加しているすべての会話を取得
  getConversationsByUser: async (userId: string) => {
    try {
      return await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        include: { participants: true, messages: true },
      });
    } catch (error) {
      console.error("Error fetching user's conversations:", error);
      throw new Error("Could not fetch user's conversations");
    }
  },

  // 1対1またはグループ会話の取得
  getConversationByParticipants: async (
    participantIds: string[],
    isGroup: boolean,
    groupId?: string,
  ) => {
    try {
      if (isGroup) {
        // グループの場合、グループに関連付けられた会話を取得
        return await prisma.conversation.findFirst({
          where: {
            isGroup: true,
            groupId: groupId,
          },
          include: { participants: true, messages: true },
        });
      } else {
        // 1対1の会話の場合、参加者IDをソートして検索
        participantIds.sort(); // 並び順を統一して一意に特定

        return await prisma.conversation.findFirst({
          where: {
            isGroup: false,
            participants: {
              every: {
                id: { in: participantIds },
              },
            },
          },
          include: { participants: true, messages: true },
        });
      }
    } catch (error) {
      console.error("Error fetching conversation by participants:", error);
      throw new Error("Could not fetch conversation by participants");
    }
  },

  // 既存の1対1会話をチェックするメソッドの追加
  getExistingConversationByParticipants: async (participantIds: string[]) => {
    try {
      participantIds.sort(); // 並び順を統一して一意に特定
      return await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              id: { in: participantIds },
            },
          },
        },
        include: { participants: true, messages: true },
      });
    } catch (error) {
      console.error("Error fetching existing conversation:", error);
      throw new Error("Could not fetch existing conversation");
    }
  },

  createConversation: async ({
    name,
    isGroup,
    participantIds,
    groupId,
  }: {
    name?: string;
    isGroup: boolean;
    participantIds: string[];
    groupId?: string;
  }) => {
    try {
      // 既存の会話を検索
      const existingConversation =
        await conversationHandler.getConversationByParticipants(
          participantIds,
          isGroup,
          groupId,
        );
      if (existingConversation) {
        return existingConversation; // 既存の会話があればそれを返す
      }

      // グループ会話の場合、グループの全メンバーを参加者に追加
      if (isGroup && groupId) {
        const group = await prisma.group.findUnique({
          where: { id: groupId },
          include: { members: true }, // グループのメンバーを取得
        });
        if (!group) {
          throw new Error("グループが見つかりませんでした");
        }
        // グループメンバーを`participantIds`に追加（重複を除外）
        participantIds = [
          ...new Set([
            ...participantIds,
            ...group.members.map((member) => member.id),
          ]),
        ];
      }

      // 会話の作成
      return await prisma.conversation.create({
        data: {
          name,
          isGroup,
          participants: {
            connect: participantIds.map((id) => ({ id })),
          },
          group: groupId ? { connect: { id: groupId } } : undefined,
        },
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw new Error("Could not create conversation");
    }
  },

  updateConversation: async (
    id: string,
    { name, participantIds }: { name?: string; participantIds: string[] },
  ) => {
    try {
      return await prisma.conversation.update({
        where: { id },
        data: {
          name,
          participants: {
            set: participantIds.map((id) => ({ id })),
          },
        },
      });
    } catch (error) {
      console.error("Error updating conversation:", error);
      throw new Error("Could not update conversation");
    }
  },

  deleteConversation: async (id: string) => {
    try {
      return await prisma.conversation.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw new Error("Could not delete conversation");
    }
  },
};
