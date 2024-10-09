import React from "react";
import Image from "next/image";
import type { User } from "@prisma/client";

interface GroupMembersProps {
  members: User[];
}

const GroupMembers: React.FC<GroupMembersProps> = ({ members }) => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={"/defaultGroupAvatar.png"}
        alt="GroupAvagar"
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="text-sm text-gray-500">({members.length})</span>
    </div>
  );
};

export default GroupMembers;
