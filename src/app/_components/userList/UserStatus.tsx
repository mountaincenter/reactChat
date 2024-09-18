"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js"; // Pusherをインポート
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { Status, User } from "@prisma/client";

interface UserProps {
  user: User;
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
      return "bg-gray-500"; // デフォルトの色
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
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("user-channel");

    const handleStatusUpdate = (data: { userId: string; status: Status }) => {
      // ユーザーIDが一致する場合のみステータスを更新
      if (data.userId === user.id) {
        setLocalStatus(data.status); // リアルタイムでUIを更新
      }
    };

    // リアルタイムのステータス変更イベントを監視
    channel.bind("status-update", handleStatusUpdate);

    // コンポーネントがアンマウントされた時にPusherの購読を解除
    return () => {
      channel.unbind("status-update", handleStatusUpdate);
      pusher.unsubscribe("user-channel");
    };
  }, [user.id]);

  return (
    <div className="flex max-w-sm items-center space-x-4 rounded-lg p-4 shadow-md">
      <div className="relative">
        <Avatar className="h-12 w-12">
          {user?.image && <AvatarImage src={user.image} alt="User avatar" />}
          <AvatarFallback>{user?.name}</AvatarFallback>
        </Avatar>
        {/* ステータスに応じた色のアイコン */}
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
            localStatus, // Pusherを通じて更新されたステータスを使用
          )}`}
        ></span>
      </div>
      <div>
        <h2 className="text-lg font-semibold">{user?.name}</h2>
        <p className="text-sm">{localStatus}</p>{" "}
        {/* リアルタイムで更新されたステータス */}
      </div>
    </div>
  );
};

export default UserStatus;
