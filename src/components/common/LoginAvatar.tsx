"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import type { Status } from "@prisma/client";

// ステータスに応じた色を取得する関数
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

const LoginAvatar: React.FC = () => {
  const { data: session, status } = useSession();
  const { user, updateStatus, isLoading } = useUserMutation();
  const [localStatus, setLocalStatus] = useState<Status | undefined>(
    user?.status,
  );
  const router = useRouter();

  useEffect(() => {
    if (user?.status) {
      setLocalStatus(user.status);
    }
  }, [user?.status]);

  // ステータス変更関数
  const handleStatusChange = useCallback(
    (newStatus: Status) => {
      if (user?.id && newStatus !== localStatus) {
        setLocalStatus(newStatus); // Optimistic UI update
        updateStatus(newStatus); // Update status on the server
      }
    },
    [user?.id, localStatus, updateStatus],
  );

  // セッションに応じてステータスを自動更新
  useEffect(() => {
    if (status === "authenticated" && user?.status === "OFFLINE") {
      handleStatusChange("ONLINE"); // セッションが開始されたらステータスをオンラインに
    } else if (status === "unauthenticated" && user?.status !== "OFFLINE") {
      handleStatusChange("OFFLINE"); // セッションが終了したらステータスをオフラインに
    }
  }, [status, user?.status, handleStatusChange]);

  // サインイン処理
  const handleSignIn = async () => {
    await signIn(); // サインイン処理
  };

  // サインアウト処理
  const handleSignOut = async () => {
    handleStatusChange("OFFLINE"); // ステータスをオフラインに
    const response = await signOut({ redirect: false }); // サインアウト処理
    if (response?.url) {
      void router.push("/"); // ルートページにリダイレクト
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (session && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative inline-block">
            <Avatar className="h-10 w-10">
              {user.image ? (
                <AvatarImage
                  src={user.image}
                  alt={user.name ?? "User avatar"}
                  onLoadingStatusChange={(status) => {
                    if (status === "error") {
                      console.error("Failed to load avatar image");
                    }
                  }}
                />
              ) : (
                <AvatarFallback>
                  <UserRound className="h-6 w-6" />
                </AvatarFallback>
              )}
            </Avatar>
            {/* Badgeを使用してステータスを表示 */}
            <Badge
              variant="secondary"
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0"
            >
              <span
                className={`h-3 w-3 rounded-full ${getStatusColor(localStatus)}`}
              />
            </Badge>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusChange("ONLINE")}>
            Online
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("IDLE")}>
            Idle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("MUTE")}>
            Mute
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <Button onClick={handleSignIn}>Sign in</Button>;
};

export default LoginAvatar;
