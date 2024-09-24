"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle, Search, Users } from "lucide-react";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import UserStatus from "./UserStatus";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useConversationMutation } from "~/app/hooks/useConversationMutation"; // フックをインポート
import type { Status } from "@prisma/client";

interface Conversation {
  id: string;
  name: string | null;
}

interface UserWithConversations {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  status: Status;
  idleTimeout: number;
  defaultStatus: string;
  conversations?: Conversation[]; // conversationsをオプショナルにする
}

interface UserListProps {
  onSelectConversation: (conversationId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectConversation }) => {
  const { status: sessionStatus } = useSession();
  const { users } = useUserMutation();
  const { createConversation } = useConversationMutation(); // 会話作成用のフックを使用
  const [searchTerm, setSearchTerm] = useState("");

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Signed In</AlertTitle>
          <AlertDescription>
            You are not signed in. Please{" "}
            <button
              onClick={() => signIn()}
              className="text-blue-500 underline"
            >
              sign in
            </button>{" "}
            to view the user list.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!users) return null;

  const handleUserClick = async (user: UserWithConversations) => {
    // 既存の会話がある場合はその会話IDを使用
    const conversationId = user.conversations?.[0]?.id;
    if (conversationId) {
      onSelectConversation(conversationId);
    } else {
      // 既存の会話がない場合は新しく作成
      createConversation({
        isGroup: false,
        participantIds: [user.id],
      });
      // 新しく作成された会話が返ってきたらそのIDを使用（MutationのonSuccessなどで）
      onSelectConversation(conversationId ?? ""); // 作成された会話IDをセット
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5" />
          User List
        </h2>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {users.length === 0 ? (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Users</AlertTitle>
            <AlertDescription>
              There are no users in the system. Please add some users to get
              started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {users
              .filter((user: UserWithConversations) =>
                (user.name ?? "")
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()),
              )
              .map((user: UserWithConversations) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)} // ユーザーをクリックしたら会話の作成をチェック
                  className="cursor-pointer"
                >
                  <UserStatus user={user} />
                </div>
              ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default UserList;
