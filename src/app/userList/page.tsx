"use client";

import { useState } from "react";
import UserList from "~/app/_components/Lists/UserList";
import GroupList from "~/app/_components/Lists/GroupList"; // GroupListをインポート

const Page = () => {
  const [view, setView] = useState<"users" | "groups">("users"); // ユーザーとグループを切り替え
  const [selectedConversationOrGroupId, setSelectedConversationOrGroupId] =
    useState<string | null>(null);

  return (
    <div className="flex h-full">
      <div>
        <div className="flex justify-between p-4">
          <button onClick={() => setView("users")}>Users</button>
          <button onClick={() => setView("groups")}>Groups</button>
        </div>

        {view === "users" ? (
          <UserList onSelectConversation={setSelectedConversationOrGroupId} />
        ) : (
          <GroupList onSelectGroup={setSelectedConversationOrGroupId} />
        )}
      </div>

      <div>
        {/* 選択された会話やグループを表示 */}
        {selectedConversationOrGroupId ? (
          <div>Selected ID: {selectedConversationOrGroupId}</div>
        ) : (
          <div>ユーザーまたはグループを選択してください</div>
        )}
      </div>
    </div>
  );
};

export default Page;
