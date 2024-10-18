"use client";

import UserList from "./UserList";
import GroupList from "./GroupList";
import CreateGroup from "../Group/CreateGroup";
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
    <div className="relative space-y-6">
      {/* Create Group Button */}
      <div className="absolute left-4 top-4">
        <CreateGroup />
      </div>

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
