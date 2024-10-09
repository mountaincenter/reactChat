"use client";

import AvatarComponent from "~/components/common/AvatarComponent";
import type {
  UserWithConversations,
  GroupWithConversations,
} from "~/app/types";

interface EntityItemProps {
  entity: UserWithConversations | GroupWithConversations;
}

const EntityItem: React.FC<EntityItemProps> = ({ entity }) => {
  const isGroup = "members" in entity;
  return (
    <div className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 shadow-md hover:bg-accent">
      <div className="relative">
        <AvatarComponent entity={entity} />
      </div>
      <div className="flex-1">
        <h2 className="text-sm font-medium leading-none">
          {entity.name}
          {isGroup && ` (${entity.members.length})`}
        </h2>
      </div>
    </div>
  );
};

export default EntityItem;
