"use client";

import { useGroupMutation } from "~/app/hooks/useGroupMutation";
import EntityList from "./EntityList";
import type { GroupWithConversations } from "~/app/types";

const GroupList: React.FC<{
  onSelectEntity: (groupId: string, group: GroupWithConversations) => void;
}> = ({ onSelectEntity }) => {
  const { groups } = useGroupMutation();

  if (!groups) return null;

  return (
    <EntityList<GroupWithConversations>
      entities={groups}
      onSelectEntity={onSelectEntity} // 修正: onSelectEntity に id と group を両方渡す
      searchPlaceholder="Search groups..."
      noEntitiesMessage="No groups found."
      renderEntityName={(group) => group.name}
      entityKeyExtractor={(group) => group.id}
    />
  );
};

export default GroupList;
