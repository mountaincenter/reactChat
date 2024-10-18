"use client";

import AvatarComponent from "~/components/common/AvatarComponent";
import type { UserWithConversations } from "~/app/types";

interface UserItemProps {
  user: UserWithConversations;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  return (
    <div className="flex cursor-pointer items-center space-x-4 p-4 shadow-md hover:bg-accent">
      <div className="relative">
        <AvatarComponent entity={user} />
      </div>
      <div>
        <h2 className="flex-sm">{user.name}</h2>
      </div>
    </div>
  );
};

export default UserItem;
