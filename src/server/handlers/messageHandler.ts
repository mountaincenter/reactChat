import { PrismaClient } from "@prisma/client";
import type { FileType } from "@prisma/client";

const prisma = new PrismaClient();

export const messageHandler = {
  getMessagesByConversationId: async (conversationId: string) => {
    try {
      return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: "asc" },
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Could not fetch messages");
    }
  },

  createMessage: async (messageData: {
    content: string;
    conversationId: string;
    senderId: string;
    files?: { url: string; fileType: FileType }[]; // ファイル情報を追加
  }) => {
    try {
      return await prisma.message.create({
        data: {
          ...messageData,
          files: {
            create: messageData.files?.map((file) => ({
              url: file.url,
              fileType: file.fileType,
            })),
          },
        },
        include: {
          files: true, // ファイルを含める
        },
      });
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Could not create message");
    }
  },

  updateMessage: async (id: string, content: string) => {
    try {
      return await prisma.message.update({
        where: { id },
        data: { content },
      });
    } catch (error) {
      console.error("Error updating message:", error);
      throw new Error("Could not update message");
    }
  },

  deleteMessage: async (id: string) => {
    try {
      return await prisma.message.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Could not delete message");
    }
  },
};
