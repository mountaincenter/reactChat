"use client";
import { useState } from "react";
import UserList from "../_components/userList/UserList";
import ConversationArea from "../_components/chat/conversationArea";
import { useUserMutation } from "../hooks/useUserMutation";

const ChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { user } = useUserMutation();

  console.log("selectedConversationId", selectedConversationId);

  return (
    <div className="flex h-screen w-full">
      {/* User List */}
      <div className="w-1/4 border-r">
        <UserList onSelectConversation={setSelectedConversationId} />
      </div>

      {/* Chat Conversation Area */}
      <div className="w-3/4">
        {selectedConversationId && user ? (
          <ConversationArea
            conversationId={selectedConversationId}
            user={user}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p>メッセージを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
