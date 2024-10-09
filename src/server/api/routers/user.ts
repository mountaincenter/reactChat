import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { userHandler } from "~/server/handlers/userHandler";

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
});
