"use client";
import { useEffect } from "react";
// import Pusher from "pusher-js";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import type { Status } from "@prisma/client";

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

  const updateUserMutation = api.user.update.useMutation();

  const updateUserSettingMutation = api.user.updateUserSettings.useMutation();

  // Pusherの設定
  useEffect(() => {
    if (status !== "authenticated") return; // 認証されていない場合は何もしない

    // const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    //   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    // });

    // const channel = pusher.subscribe("user-channel");

    // const handleStatusUpdate = async (data: {
    //   userId: string;
    //   status: Status;
    // }) => {
    //   if (user?.id === data.userId) {
    //     await refetchUser();
    //   }
    // };

    // channel.bind("status-update", handleStatusUpdate);

    // return () => {
    //   channel.unbind("status-update", handleStatusUpdate);
    //   pusher.unsubscribe("user-channel");
    // };
  }, [user, refetchUser, status]);

  const isLoading = isUserLoading || isUsersLoading;

  // 任意のステータスを更新
  const updateStatus = (newStatus: Status) => {
    if (user?.id) {
      updateUserMutation.mutate({ status: newStatus });
    }
  };

  const updateUserSettings = (settings: {
    idleTimeout: number;
    defaultStatus: Status;
  }) => {
    if (user?.id) {
      updateUserSettingMutation.mutate(settings);
    }
  };

  return {
    user,
    users,
    updateStatus,
    updateUserSettings,
    refetchUser,
    refetchUsers,
    isLoading,
  };
};
