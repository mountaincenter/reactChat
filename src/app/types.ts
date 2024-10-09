import type { User, Group, Message, File } from "@prisma/client";

// NextAuthのセッション型
export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
}

export interface Session {
  user?: SessionUser;
  expires: string; // セッションの有効期限
}

interface Conversation {
  id: string;
  name: string | null;
}

export interface UserWithConversations extends User {
  conversations?: Conversation[]; // conversationsをオプショナルにする
}

export interface GroupWithConversations extends Group {
  members: User[];
  conversations?: Conversation[];
}

export interface MessageWithFiles extends Message {
  files: File[];
}
