"use client";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import type { Group, User, Message, Conversation } from "@prisma/client";

type GroupWithMembers = Group & {
  members: User[];
  messages: Message[];
  conversations: Conversation[]; // 正しいスペルに修正
};

// useGroupMutationフックの実装
export const useGroupMutation = () => {
  const { status } = useSession(); // セッション情報を取得

  // ユーザーが所属するグループを取得するクエリ
  const {
    data: groups = [],
    isLoading: isGroupsLoading,
    refetch: refetchGroups,
  } = api.group.getMyGroups.useQuery<GroupWithMembers[]>(undefined, {
    enabled: status === "authenticated", // 認証されている場合のみクエリを有効にする
  });

  // グループを作成するミューテーション
  const createGroupMutation = api.group.createGroup.useMutation({
    onSuccess: () => {
      void refetchGroups(); // グループ作成後にグループ情報を再取得
    },
  });

  // グループ名を更新するミューテーション
  const updateGroupNameMutation = api.group.updateGroupName.useMutation({
    onSuccess: () => {
      void refetchGroups(); // グループ名更新後にグループ情報を再取得
    },
  });

  // グループを削除するミューテーション
  const deleteGroupMutation = api.group.deleteGroup.useMutation({
    onSuccess: () => {
      void refetchGroups(); // グループ削除後にグループ情報を再取得
    },
  });

  // ローディング状態を統合
  const isLoading = isGroupsLoading;

  // グループを作成する関数
  const createGroup = async (
    name: string,
    isPrivate: boolean,
    memberIds: string[],
  ) => {
    try {
      const newGroup = await createGroupMutation.mutateAsync({
        name,
        isPrivate,
        memberIds,
      });
      return newGroup;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  // グループ名を更新する関数
  const updateGroupName = (groupId: string, newName: string) => {
    updateGroupNameMutation.mutate({
      groupId,
      newName,
    });
  };

  // グループを削除する関数
  const deleteGroup = (groupId: string) => {
    deleteGroupMutation.mutate({
      groupId,
    });
  };

  return {
    groups,
    createGroup,
    updateGroupName,
    deleteGroup,
    isLoading,
    refetchGroups,
  };
};
