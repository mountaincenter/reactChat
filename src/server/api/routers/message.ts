import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { messageHandler } from "~/server/handlers/messageHandler";
import { z } from "zod";
import Pusher from "pusher";

// Pusher設定
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// メッセージとファイル情報のバリデーションスキーマを定義
const fileSchema = z.object({
  url: z.string(), // ファイルのURL
  fileType: z.enum(["IMAGE", "DOCUMENT", "PDF", "VIDEO", "AUDIO"]), // ファイルタイプ
});

const messageCreateSchema = z.object({
  content: z.string().optional(),
  conversationId: z.string(),
  files: z.array(fileSchema).optional(),
});

export const messageRouter = createTRPCRouter({
  // メッセージを取得
  getByConversationId: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await messageHandler.getMessagesByConversationId(input);
    }),

  // メッセージを作成
  create: protectedProcedure
    .input(messageCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // メッセージをDBに保存
      const newMessage = await messageHandler.createMessage({
        content: input.content ?? "",
        conversationId: input.conversationId,
        senderId: ctx.session.user.id,
        files: input.files,
      });

      // Pusherでクライアントにメッセージ送信を通知
      await pusher.trigger(
        `conversation-${input.conversationId}`,
        "new-message",
        {
          message: {
            ...newMessage,
            sender: newMessage.sender, // 送信者情報を含める
          },
        },
      );

      // 未読件数の更新を他のユーザーに通知
      try {
        const participantIds: string[] =
          await messageHandler.getConversationParticipantIds(
            input.conversationId,
          );
        for (const participantId of participantIds) {
          if (participantId !== ctx.session.user.id) {
            await pusher.trigger(
              `user-${participantId}`,
              "unread-count-update",
              {
                conversationId: input.conversationId,
              },
            );
          }
        }
      } catch (error) {
        console.error("Error fetching participant IDs:", error);
        throw new Error("Could not fetch participant IDs");
      }

      return newMessage;
    }),

  // メッセージを更新
  update: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await messageHandler.updateMessage(input.messageId, input.content);
    }),

  // メッセージを削除
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return await messageHandler.deleteMessage(input);
  }),

  // メッセージを既読としてマーク
  // メッセージを既読としてマーク
  markAsRead: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { messageId, conversationId } = input;
      const userId = ctx.session.user.id;

      // メッセージを既読としてマーク
      const updatedMessage = await messageHandler.markMessageAsRead(
        messageId,
        userId,
      );

      // Pusherで既読状態を通知
      await pusher.trigger(`conversation-${conversationId}`, "message-read", {
        messageId,
        userId,
      });

      // 未読件数の更新を他のユーザーに通知
      try {
        const participantIds: string[] =
          await messageHandler.getConversationParticipantIds(conversationId);
        for (const participantId of participantIds) {
          await pusher.trigger(`user-${participantId}`, "unread-count-update", {
            conversationId,
          });
        }
      } catch (error) {
        console.error("Error fetching participant IDs:", error);
        throw new Error("Could not fetch participant IDs");
      }

      return updatedMessage;
    }),

  // 未読メッセージの数を取得
  getUnreadMessagesCount: protectedProcedure
    .input(z.string()) // ユーザーIDを入力とする
    .query(async ({ input: userId }) => {
      // 未読件数を取得
      return await messageHandler.getUnreadMessagesCount(userId);
    }),
});
