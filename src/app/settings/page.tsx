"use client";

import { useState } from "react";
import { Clock, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUserMutation } from "~/app/hooks/useUserMutation";
import type { Status } from "@prisma/client"; // Statusの型をインポート

const SettingsPage: React.FC = () => {
  const { user, updateUserSettings } = useUserMutation();
  const [idleTimeout, setIdleTimeout] = useState(user?.idleTimeout ?? 15000);
  const [customTimeout, setCustomTimeout] = useState<number | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>(
    user?.defaultStatus ?? "ONLINE",
  );

  // idleTimeout変更ハンドラー
  const handleIdleTimeoutChange = (value: string) => {
    if (value === "custom") {
      setCustomTimeout(5); // デフォルトで5分のカスタムタイムアウトを設定
      setIdleTimeout(0); // idleTimeoutはゼロに設定
    } else {
      setIdleTimeout(Number(value)); // プルダウンからの選択でタイムアウトを設定
      setCustomTimeout(null); // カスタム入力をリセット
    }
  };

  // 保存ハンドラー
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const timeoutToSave =
      customTimeout !== null ? customTimeout * 60000 : idleTimeout;
    updateUserSettings({ idleTimeout: timeoutToSave, defaultStatus });
  };

  // onValueChangeでStatus型にキャストする
  const handleStatusChange = (value: string) => {
    setDefaultStatus(value as Status); // 文字列をStatus型にキャスト
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idleTimeout">Idle Timeout</Label>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select
                value={customTimeout !== null ? "custom" : String(idleTimeout)}
                onValueChange={handleIdleTimeoutChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Timeout Options</SelectLabel>
                    <SelectItem value="15000">15 seconds</SelectItem>
                    <SelectItem value="30000">30 seconds</SelectItem>
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="120000">2 minutes</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                    <SelectItem value="600000">10 minutes</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {customTimeout !== null && (
              <div className="mt-2">
                <Label htmlFor="customTimeout">Custom Timeout (minutes):</Label>
                <Input
                  id="customTimeout"
                  type="number"
                  value={customTimeout}
                  min={1}
                  onChange={(e) => setCustomTimeout(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultStatus">Default Status</Label>
            <Select value={defaultStatus} onValueChange={handleStatusChange}>
              <SelectTrigger id="defaultStatus" className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span>Online</span>
                  </div>
                </SelectItem>
                <SelectItem value="MUTE">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-red-500" />
                    <span>MUTE</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SettingsPage;
