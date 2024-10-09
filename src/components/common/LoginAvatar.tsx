"use client";

import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
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
import { LogOut, Settings } from "lucide-react";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import AvatarComponent from "./AvatarComponent";

const LoginAvatar: React.FC = () => {
  const { data: session } = useSession();
  const { user, isLoading } = useUserMutation();
  const router = useRouter();

  // サインイン処理
  const handleSignIn = async () => {
    await signIn(); // サインイン処理
  };

  // サインアウト処理
  const handleSignOut = async () => {
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
            {/* AvatarComponentを使用 */}
            <AvatarComponent entity={user} type="user" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
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
