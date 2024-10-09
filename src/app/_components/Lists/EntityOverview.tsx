"use client";

import UserList from "./UserList";
import GroupList from "./GroupList";
import { useConversationLogic } from "~/app/hooks/useConversationLogic";
import type {
  UserWithConversations,
  GroupWithConversations,
} from "~/app/types";

const EntityOverview: React.FC<{
  onSelectEntity: (
    entityId: string,
    entity: UserWithConversations | GroupWithConversations,
  ) => void;
}> = ({ onSelectEntity }) => {
  const { handleEntityClick } = useConversationLogic();

  const handleSelectEntity = (
    entity: UserWithConversations | GroupWithConversations,
    isGroup: boolean,
  ) => {
    void handleEntityClick(entity, isGroup, (conversationId) =>
      onSelectEntity(conversationId, entity),
    );
  };

  return (
    <div className="space-y-6">
      <UserList
        onSelectEntity={(userId, user) => handleSelectEntity(user, false)}
      />
      <GroupList
        onSelectEntity={(groupId, group) => handleSelectEntity(group, true)}
      />
    </div>
  );
};

export default EntityOverview;
