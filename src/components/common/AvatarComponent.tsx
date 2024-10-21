"use client";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import type { User, Group } from "@prisma/client";

interface AvatarComponentProps {
  entity: User | Group;
  className?: string; // classNameを追加
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({
  entity,
  className,
}) => {
  // ユーザーまたはグループの画像が存在すれば、それを表示
  const imageUrl = entity.image;

  return (
    <Avatar className={`h-12 w-12 ${className}`}>
      {" "}
      {/* classNameを適用 */}
      {imageUrl && <AvatarImage src={imageUrl} alt="Entity Avatar" />}
    </Avatar>
  );
};

export default AvatarComponent;
