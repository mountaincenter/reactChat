"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import type { UserWithDetails } from "~/app/types";

export const useUserMutation = () => {
  const { data: session } = useSession();
  const [usersWithUnread, setUsersWithUnread] = useState<UserWithDetails[]>([]);

  // 現在のユーザー情報を取得するクエリ
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = api.user.getUserById.useQuery(undefined, {
    enabled: !!session?.user?.id, // 認証されている場合にのみクエリを有効にする
  });

  // 自分以外のユーザーリストを取得するクエリ
  const {
    data: users,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = api.user.listUserExcludingSelf.useQuery(undefined, {
    enabled: !!session?.user?.id,
  });

  // 未読メッセージ数を取得するクエリ
  const {
    data: unreadCounts,
    isLoading: isUnreadLoading,
    refetch: refetchUnreadCounts,
  } = api.message.getUnreadMessagesCount.useQuery(session?.user?.id ?? "", {
    enabled: !!session?.user?.id,
  });

  // Pusherのセットアップ
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user-${session.user.id}`);

    const handleUnreadUpdate = () => {
      // 未読メッセージ数のリフェッチとユーザーリストのリフェッチ
      void refetchUnreadCounts();
      void refetchUsers();
    };

    channel.bind("unread-count-update", handleUnreadUpdate);

    return () => {
      channel.unbind("unread-count-update", handleUnreadUpdate);
      pusher.unsubscribe(`user-${session.user.id}`);
    };
  }, [session?.user?.id, refetchUnreadCounts, refetchUsers]);

  // 未読メッセージ数を各ユーザーに追加
  useEffect(() => {
    if (users && unreadCounts) {
      const updatedUsers = users.map((user) => {
        const userUnreadCount = unreadCounts.find(
          (count) => count.conversationId === user.conversations?.[0]?.id,
        );
        return {
          ...user,
          unreadCount: userUnreadCount?.unreadCount ?? 0,
        };
      });
      setUsersWithUnread(updatedUsers);
    }
  }, [users, unreadCounts]);

  const isLoading = isUserLoading || isUsersLoading || isUnreadLoading;

  return {
    user,
    users: usersWithUnread,
    refetchUser,
    refetchUsers,
    isLoading,
  };
};
