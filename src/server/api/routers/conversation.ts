import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { conversationHandler } from "~/server/handlers/conversationHandler";
import { z } from "zod";

// CreateとUpdateに必要なスキーマ定義
const conversationCreateSchema = z.object({
  title: z.string().optional(),
  isGroup: z.boolean().default(false),
  participantIds: z.array(z.string()), // 参加者のID配列
});

export const conversationRouter = createTRPCRouter({
  // 会話を取得
  getById: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return await conversationHandler.getConversationById(input);
  }),

  // 現在のユーザーが参加している会話を取得
  getConversationsByUser: protectedProcedure.query(async ({ ctx }) => {
    return await conversationHandler.getConversationsByUser(
      ctx.session.user.id,
    );
  }),

  // 会話を作成
  create: protectedProcedure
    .input(conversationCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return await conversationHandler.createConversation(
        ctx.session.user.id,
        input,
      );
    }),

  // 会話を更新
  update: protectedProcedure
    .input(conversationCreateSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await conversationHandler.updateConversation(input.id, input);
    }),

  // 会話を削除
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return await conversationHandler.deleteConversation(input);
  }),
});
