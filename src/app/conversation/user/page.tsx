"use client";
import React, { useState } from "react";
import UserList from "~/app/_components/User/UserList";
import UserConversationArea from "~/app/_components/User/UserConversationArea";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import type { UserWithConversations } from "~/app/types";

const Page = () => {
  const { users, user } = useUserMutation(); // ユーザーリストを取得するカスタムフック
  const [selectedUser, setSelectedUser] =
    useState<UserWithConversations | null>(null); // 選択されたユーザーの状態管理
  const [conversationId, setConversationId] = useState<string>("");

  const handleSelectUser = (convId: string, user: UserWithConversations) => {
    // ユーザー選択時の処理
    setSelectedUser(user);
    setConversationId(convId);
  };

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
            user={user as UserWithConversations} // 型を明示的に指定
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
