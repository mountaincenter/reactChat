"use client";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

export const useUserMutation = () => {
  const { status } = useSession(); // Sessionのステータスを取得
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = api.user.getUserById.useQuery(undefined, {
    enabled: status === "authenticated", // 認証されている場合にのみクエリを有効にする
  });

  const {
    data: users,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = api.user.listUserExcludingSelf.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const isLoading = isUserLoading || isUsersLoading;

  return {
    user,
    users,
    refetchUser,
    refetchUsers,
    isLoading,
  };
};
