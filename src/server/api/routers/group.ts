import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { groupHandler } from "~/server/handlers/groupHandler";
import { z } from "zod";

// グループ作成に必要なスキーマ定義
const createGroupSchema = z.object({
  name: z.string().min(1, "グループ名は必須です"),
  isPrivate: z.boolean().optional(), // プライベートかどうか
  image: z.string().optional(),
  memberIds: z.array(z.string()).min(1, "少なくとも1人のメンバーが必要です"), // メンバーIDリスト
});

// グループ名の更新に必要なスキーマ定義
const updateGroupSchema = z.object({
  groupId: z.string(),
  newName: z.string().min(1, "新しいグループ名は必須です"),
  image: z.string().optional(),
});

// グループ削除に必要なスキーマ定義
const deleteGroupSchema = z.object({
  groupId: z.string(),
});

export const groupRouter = createTRPCRouter({
  // グループを作成する処理
  createGroup: protectedProcedure
    .input(createGroupSchema)
    .mutation(async ({ input }) => {
      const { name, isPrivate, memberIds, image } = input;

      // image が undefined の場合、デフォルトの画像を設定
      const groupImage =
        image ?? process.env.NEXT_PUBLIC_DEFAULT_GROUP_AVATAR_URL;

      if (!groupImage) {
        throw new Error("デフォルトのグループ画像 URL が定義されていません");
      }

      // グループを作成
      const newGroup = await groupHandler.createGroup({
        name,
        isPrivate: isPrivate ?? false,
        memberIds,
        image: groupImage, // ここで groupImage を渡す
      });

      return newGroup;
    }),

  // グループ名を更新する処理
  updateGroupName: protectedProcedure
    .input(updateGroupSchema)
    .mutation(async ({ input }) => {
      const { groupId, newName, image } = input;

      // image が undefined の場合、デフォルトの画像を設定
      const groupImage =
        image ?? process.env.NEXT_PUBLIC_DEFAULT_GROUP_AVATAR_URL;

      if (!groupImage) {
        throw new Error("デフォルトのグループ画像 URL が定義されていません");
      }

      // グループ名を更新
      const updatedGroup = await groupHandler.updateGroupName(
        groupId,
        newName,
        groupImage, // ここで groupImage を渡す
      );

      return updatedGroup;
    }),

  // グループを削除する処理、その他はそのまま
  deleteGroup: protectedProcedure
    .input(deleteGroupSchema)
    .mutation(async ({ input }) => {
      const { groupId } = input;
      await groupHandler.deleteGroup(groupId);
      return { success: true };
    }),

  // 自分が所属するすべてのグループを取得する処理
  getMyGroups: protectedProcedure.query(async ({ ctx }) => {
    const groups = await groupHandler.getGroupsByUserId(ctx.session.user.id);
    return groups;
  }),
});
