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

  // 会話の作成
  const createConversation = (data: {
    title?: string;
    isGroup: boolean;
    participantIds: string[];
  }) => {
    createConversationMutation.mutate(data); // 新しい会話を作成
  };

  // 会話の更新
  const updateConversation = (
    id: string,
    data: { title?: string; participantIds: string[] },
  ) => {
    updateConversationMutation.mutate({ id, ...data }); // 会話を更新
  };

  // 会話の削除
  const deleteConversation = (id: string) => {
    deleteConversationMutation.mutate(id); // 会話を削除
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
