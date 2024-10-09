"use client";
import { useState } from "react";
import EntityOverview from "../_components/Lists/EntityOverview";
import ConversationArea from "../_components/chat/conversationArea";
import { useUserMutation } from "../hooks/useUserMutation";
import type { User, Group } from "@prisma/client";

const ChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [selectedEntity, setSelectedEntity] = useState<User | Group | null>(
    null,
  );
  const { user } = useUserMutation();

  console.log("selectedConversationId", selectedConversationId);
  console.log("selectedEntity", selectedEntity);

  const handleEntitySelect = (entityId: string, entity: User | Group) => {
    setSelectedConversationId(entityId);
    setSelectedEntity(entity);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Entity Overview List */}
      <div className="w-1/4 border-r">
        <EntityOverview onSelectEntity={handleEntitySelect} />
      </div>

      {/* Chat Conversation Area */}
      <div className="w-3/4">
        {selectedConversationId && selectedEntity && user ? (
          <ConversationArea
            conversationId={selectedConversationId}
            entity={selectedEntity}
            user={user} // 修正: user をプロパティとして渡す
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
