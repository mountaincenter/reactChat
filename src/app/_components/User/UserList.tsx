"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Search } from "lucide-react";
import UserItem from "./UserItem";
import { useUserConversationMutation } from "~/app/hooks/useUserConversationMutation";
import type { UserWithConversations } from "~/app/types";
import { useSession } from "next-auth/react";

interface UserListProps {
  users: UserWithConversations[];
  onSelectUser: (conversationId: string, user: UserWithConversations) => void;
  searchPlaceholder: string;
  noUsersMessage: string;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onSelectUser,
  searchPlaceholder,
  noUsersMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { createUserConversation } = useUserConversationMutation();
  const { data: session } = useSession(); // 現在のユーザー情報を取得

  const handleUserClick = async (user: UserWithConversations) => {
    if (!session?.user?.id) return; // セッション情報がない場合は何もしない

    let conversationId = user.conversations?.[0]?.id;
    if (!conversationId) {
      // 会話が存在しない場合は新たに作成
      const newConversation = await createUserConversation(
        session.user.id, // 現在のユーザーID
        user.id, // ターゲットユーザーID
      );
      conversationId = newConversation?.id ?? "";
    }
    onSelectUser(conversationId, user);
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="relative mt-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredUsers.length === 0 ? (
          <Alert className="mt-4">
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>{noUsersMessage}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="cursor-pointer"
              >
                <UserItem user={user} />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default UserList;
