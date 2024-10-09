import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { conversationRouter } from "./routers/conversation";
import { messageRouter } from "./routers/message";
import { groupRouter } from "./routers/group";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  conversation: conversationRouter,
  message: messageRouter,
  group: groupRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
