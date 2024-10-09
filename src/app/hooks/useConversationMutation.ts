"use client";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

export const useConversationMutation = () => {
  const { status } = useSession(); // セッションステータスを取得
  const [conversationId, setConversationId] = useState<string | null>(null); // 会話IDの状態を管理

  // 現在のユーザーが参加している会話を取得
  const { data: conversations, isLoading: isConversationsLoading } =
    api.conversation.getConversationsByUser.useQuery(undefined, {
      enabled: status === "authenticated",
    });

  // 特定の会話をIDで取得
  const {
    data: conversation,
    isLoading: isConversationLoading,
    refetch: refetchConversation,
  } = api.conversation.getById.useQuery(conversationId ?? "", {
    enabled: status === "authenticated" && !!conversationId, // 会話IDが存在する場合にのみクエリを有効化
  });

  // mutateAsync を使って非同期処理を待つようにする
  const createConversationMutation = api.conversation.create.useMutation();
  const updateConversationMutation = api.conversation.update.useMutation();
  const deleteConversationMutation = api.conversation.delete.useMutation();

  // Pusherを使ってリアルタイム更新を設定
  useEffect(() => {
    if (status !== "authenticated") return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("conversation-channel");

    const handleConversationUpdate = async (_data: {
      conversationId: string;
    }) => {
      await refetchConversation(); // 更新時にデータを再取得
    };

    channel.bind("conversation-update", handleConversationUpdate);

    return () => {
      channel.unbind("conversation-update", handleConversationUpdate);
      pusher.unsubscribe("conversation-channel");
    };
  }, [refetchConversation, status]);

  // mutateAsync を使って非同期処理を行うよう修正
  const createConversation = async (data: {
    title?: string;
    isGroup: boolean;
    participantIds: string[];
  }) => {
    console.log("Creating conversation with data:", data);
    try {
      return createConversationMutation.mutateAsync(data); // 新しい会話を作成し、Promise を返す
    } catch (error) {
      console.error("Failed to create converation:", error);
      throw error;
    }
  };

  // 会話の更新
  const updateConversation = async (
    id: string,
    data: { title?: string; participantIds: string[] },
  ) => {
    return updateConversationMutation.mutateAsync({ id, ...data }); // 会話を更新し、Promise を返す
  };

  // 会話の削除
  const deleteConversation = async (id: string) => {
    return deleteConversationMutation.mutateAsync(id); // 会話を削除し、Promise を返す
  };

  return {
    conversations,
    conversation,
    createConversation,
    updateConversation,
    deleteConversation,
    isConversationsLoading,
    isConversationLoading,
    setConversationId, // 会話IDを設定する関数をエクスポート
  };
};
