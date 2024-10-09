"use client";

import { useUserMutation } from "~/app/hooks/useUserMutation";
import EntityList from "./EntityList";
import type { UserWithConversations } from "~/app/types";

const UserList: React.FC<{
  onSelectEntity: (userId: string, user: UserWithConversations) => void;
}> = ({ onSelectEntity }) => {
  const { users } = useUserMutation();

  if (!users) return null;

  return (
    <EntityList<UserWithConversations>
      entities={users}
      onSelectEntity={onSelectEntity} // 修正: onSelectEntity に id と user を両方渡す
      searchPlaceholder="Search users..."
      noEntitiesMessage="No users found."
      renderEntityName={(user) => user.name ?? ""}
      entityKeyExtractor={(user) => user.id}
    />
  );
};

export default UserList;
