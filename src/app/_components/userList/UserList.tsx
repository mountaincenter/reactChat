"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react"; // NextAuthのフックをインポート
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import UserStatus from "./UserStatus";

const UserList: React.FC = () => {
  const { status: sessionStatus } = useSession(); // セッション情報を取得
  const { users } = useUserMutation();
  const [searchTerm, setSearchTerm] = useState("");

  // セッションがない場合はサインインを促すメッセージを表示
  if (sessionStatus === "unauthenticated") {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Signed In</AlertTitle>
        <AlertDescription>
          You are not signed in. Please{" "}
          <button onClick={() => signIn()} className="text-blue-500 underline">
            sign in
          </button>{" "}
          to view the user list.
        </AlertDescription>
      </Alert>
    );
  }

  // ユーザーリストがない場合はnullを返す
  if (!users) return null;

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
      <div className="p-4">
        {users.length === 0 ? (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>No Users</AlertTitle>
            <AlertDescription>
              There are no users in the system. Please add some users to get
              started.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            {users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <UserStatus key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Results</AlertTitle>
                <AlertDescription>
                  No users match your search criteria. Please try a different
                  search term.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;
