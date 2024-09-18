// NextAuthのセッション型
export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
  status?: Status; // ユーザーのステータスを含める
}

export interface Session {
  user?: SessionUser;
  expires: string; // セッションの有効期限
}

// ステータスの列挙型
export enum Status {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  IDLE = "IDLE",
  MUTE = "MUTE",
}
