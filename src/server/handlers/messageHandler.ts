import { PrismaClient } from "@prisma/client";
import type { FileType } from "@prisma/client";

const prisma = new PrismaClient();

export const messageHandler = {
  // 会話IDでメッセージを取得
  getMessagesByConversationId: async (conversationId: string) => {
    try {
      return await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: true, // メッセージの送信者情報を含める
          files: true, // ファイルも含める
        },
        orderBy: { timestamp: "asc" },
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Could not fetch messages");
    }
  },

  // メッセージの作成
  createMessage: async (messageData: {
    content: string;
    conversationId: string;
    senderId: string;
    files?: { url: string; fileType: FileType }[];
  }) => {
    try {
      // 会話を取得して、1対1会話かグループ会話かを確認
      const conversation = await prisma.conversation.findUnique({
        where: { id: messageData.conversationId },
        include: { participants: true, group: true },
      });

      if (!conversation) {
        throw new Error("会話が見つかりませんでした");
      }

      // メッセージの作成
      const newMessage = await prisma.message.create({
        data: {
          content: messageData.content,
          sender: { connect: { id: messageData.senderId } },
          conversation: { connect: { id: messageData.conversationId } },
          files: {
            create: messageData.files?.map((file) => ({
              url: file.url,
              fileType: file.fileType,
            })),
          },
        },
        include: {
          files: true, // ファイルも含める
          sender: true, // 送信者情報を含める
        },
      });

      return newMessage;
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Could not create message");
    }
  },

  // メッセージの更新
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

  // メッセージの削除
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
