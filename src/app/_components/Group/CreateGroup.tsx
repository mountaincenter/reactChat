"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { useGroupMutation } from "~/app/hooks/useGroupMutation";
import { useConversationMutation } from "~/app/hooks/useConversationMutation";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import { Plus } from "lucide-react";
import AvatarComponent from "~/components/common/AvatarComponent";

const CreateGroup: React.FC = () => {
  const { createGroup } = useGroupMutation(); // グループ作成ミューテーションを取得
  const { createConversation } = useConversationMutation();
  const { user, users } = useUserMutation(); // 現在のユーザー情報とユーザーリストを取得
  const [groupName, setGroupName] = useState(""); // グループ名の状態管理
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // 選択されたメンバーの状態管理
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ドロップダウンの状態管理

  const handleCreateGroup = async () => {
    if (groupName.trim() !== "" && user?.id) {
      // 自分自身のIDをメンバーリストに追加（ユニークなリストにするため Set を使用）
      const allMembers = Array.from(new Set([...selectedMembers, user.id]));

      // グループには少なくとも2人以上のメンバーが必要
      if (allMembers.length < 2) {
        console.error("グループには少なくとも2人のメンバーが必要です");
        return;
      }

      // グループを作成する
      try {
        const newGroup = await createGroup(groupName, true, allMembers);
        if (newGroup?.id) {
          // グループ作成成功後にそのグループの会話を作成
          console.log("newGroup:", newGroup); // グループ情報を確認
          console.log("Creating conversation for group:", newGroup.id);

          const newConversation = await createConversation({
            isGroup: true,
            participantIds: allMembers,
            groupId: newGroup.id,
          });

          console.log("newConversation:", newConversation); // 作成された会話情報を確認
        }

        setGroupName(""); // フォームをリセット
        setSelectedMembers([]);
        setIsDropdownOpen(false); // ドロップダウンを閉じる
      } catch (error) {
        console.error("Error creating group or conversation:", error);
      }
    }
  };

  const handleMemberSelect = (userId: string) => {
    // メンバーの選択状態をトグル
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg"
          style={{ zIndex: 50 }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4">
        <DropdownMenuLabel>新しいグループを作成</DropdownMenuLabel>
        <div className="space-y-2">
          {/* グループ名の入力フィールド */}
          <Input
            type="text"
            placeholder="グループ名を入力"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-2"
          />
          {/* メンバー選択用のチェックボックスリスト */}
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {users?.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedMembers.includes(user.id)}
                  onCheckedChange={() => handleMemberSelect(user.id)}
                />
                <AvatarComponent entity={user} />
                <span>{user.name}</span>
              </div>
            ))}
          </div>
          {/* グループ作成ボタン */}
          <Button onClick={handleCreateGroup} className="mt-4 w-full">
            作成
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateGroup;
