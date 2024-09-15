import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { userHandler } from "~/server/handlers/userHandler";
import { Status } from "@prisma/client";
import { z } from "zod";

// Updateに必要なスキーマ定義
const userUpdateSchema = z.object({
  status: z.nativeEnum(Status),
});

export const userRouter = createTRPCRouter({
  getUserById: protectedProcedure.query(async ({ ctx }) => {
    const user = await userHandler.getUserById(ctx.session.user.id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }),

  listUserExcludingSelf: protectedProcedure.query(async ({ ctx }) => {
    const users = await userHandler.listUserExcludingSelf(ctx.session.user.id);
    return users;
  }),

  update: protectedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await userHandler.updateStatus(
        ctx.session.user.id,
        input.status,
      );
      return updatedUser;
    }),
});
