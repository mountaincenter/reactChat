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

const messageCreateSchema = z.object({
  content: z.string(),
  conversationId: z.string(),
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
        ...input,
        senderId: ctx.session.user.id,
      });

      // Pusherでクライアントにメッセージ送信を通知
      await pusher.trigger(
        `conversation-${input.conversationId}`,
        "new-message",
        {
          message: newMessage,
        },
      );

      return newMessage;
    }),

  // メッセージを更新
  update: protectedProcedure
    .input(messageCreateSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await messageHandler.updateMessage(input.id, input.content);
    }),

  // メッセージを削除
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return await messageHandler.deleteMessage(input);
  }),
});
