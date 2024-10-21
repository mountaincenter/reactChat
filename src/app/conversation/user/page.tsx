"use client";

import React, { useState, useEffect } from "react";
import UserList from "~/app/_components/User/UserList";
import UserConversationArea from "~/app/_components/User/UserConversationArea";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import type { UserWithDetails } from "~/app/types";
import Pusher from "pusher-js";

const Page = () => {
  const { users, user, refetchUsers } = useUserMutation(); // ユーザーリストを取得するカスタムフック
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(
    null,
  ); // 選択されたユーザーの状態管理
  const [conversationId, setConversationId] = useState<string>("");

  const handleSelectUser = (convId: string, user: UserWithDetails) => {
    // ユーザー選択時の処理
    setSelectedUser(user);
    setConversationId(convId);
  };

  // Pusherを使用してリアルタイムで未読件数を更新
  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user-${user.id}`);

    const handleUnreadUpdate = () => {
      void refetchUsers();
    };

    channel.bind("unread-count-update", handleUnreadUpdate);

    return () => {
      channel.unbind("unread-count-update", handleUnreadUpdate);
      pusher.unsubscribe(`user-${user.id}`);
    };
  }, [user, refetchUsers]);

  // userがundefinedの場合は早期リターン
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-muted-foreground">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/4 border-r p-4">
        {users && (
          <UserList
            users={users}
            onSelectUser={handleSelectUser}
            searchPlaceholder="Search users..."
            noUsersMessage="No users found."
          />
        )}
      </div>
      <div className="w-3/4 p-4">
        {selectedUser ? (
          <UserConversationArea
            conversationId={conversationId}
            user={user as UserWithDetails} // 型を明示的に指定
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Select a user to start a conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
