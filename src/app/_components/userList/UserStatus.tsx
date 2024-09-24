"use client";

import { useEffect, useState } from "react";
// import Pusher from "pusher-js";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { Status } from "@prisma/client";

interface Conversation {
  id: string;
  name: string | null;
}

interface UserWithConversations {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  status: Status;
  idleTimeout: number;
  defaultStatus: string;
  conversations?: Conversation[]; // conversationsをオプショナルにする
}

interface UserProps {
  user: UserWithConversations;
}

// アイコンの色をステータスに基づいて変更するためのマッピング
const getStatusColor = (status: Status | undefined) => {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "IDLE":
      return "bg-yellow-500";
    case "MUTE":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const UserStatus: React.FC<UserProps> = ({ user }) => {
  const [localStatus, setLocalStatus] = useState<Status | undefined>(
    user?.status,
  );

  useEffect(() => {
    // user.status が変更されたら localStatus を更新
    if (user?.status) {
      setLocalStatus(user.status);
    }
  }, [user?.status]);

  useEffect(() => {
    // Pusherの初期設定
    // const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    //   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    // });
    // const channel = pusher.subscribe("user-channel");
    // const handleStatusUpdate = (data: { userId: string; status: Status }) => {
    //   // ユーザーIDが一致する場合のみステータスを更新
    //   if (data.userId === user.id) {
    //     setLocalStatus(data.status);
    //   }
    // };
    // // リアルタイムのステータス変更イベントを監視
    // channel.bind("status-update", handleStatusUpdate);
    // // コンポーネントがアンマウントされた時にPusherの購読を解除
    // return () => {
    //   channel.unbind("status-update", handleStatusUpdate);
    //   pusher.unsubscribe("user-channel");
    // };
  }, [user.id]);

  return (
    <div className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 shadow-md hover:bg-accent">
      <div className="relative">
        <Avatar className="h-12 w-12">
          {user?.image && <AvatarImage src={user.image} alt="User avatar" />}
          <AvatarFallback>{user?.name}</AvatarFallback>
        </Avatar>
        {/* ステータスに応じた色のアイコン */}
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
            localStatus,
          )}`}
        ></span>
      </div>
      <div className="flex-1">
        <h2 className="text-sm font-medium leading-none">{user?.name}</h2>
        <p className="text-sm text-muted-foreground">{localStatus}</p>
      </div>
    </div>
  );
};

export default UserStatus;
