import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const conversationHandler = {
  getConversationById: async (id: string) => {
    try {
      return await prisma.conversation.findUnique({
        where: { id },
        include: { participants: true, messages: true },
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw new Error("Could not fetch conversation");
    }
  },

  // 特定のユーザーが参加している会話を取得
  getConversationsByUser: async (userId: string) => {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId }, // ユーザーが参加している会話
        },
      },
      include: { participants: true, messages: true },
    });
  },

  createConversation: async (
    creatorId: string,
    {
      name,
      isGroup,
      participantIds,
    }: { name?: string; isGroup: boolean; participantIds: string[] },
  ) => {
    try {
      return await prisma.conversation.create({
        data: {
          name,
          isGroup,
          participants: {
            connect: participantIds.map((id) => ({ id })),
          },
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
