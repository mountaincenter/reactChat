"use client";

import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

export const useUserConversationMutation = () => {
  const { status } = useSession(); // セッションステータスの取得
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 会話の作成または取得ミューテーション
  const createOrGetConversationMutation =
    api.conversation.createOrGet.useMutation();

  const {
    data: conversation,
    isLoading: isConversationLoading,
    refetch: refetchConversation,
  } = api.conversation.getById.useQuery(conversationId ?? "", {
    enabled: !!conversationId,
  });

  // Pusherのリアルタイム更新
  useEffect(() => {
    if (status !== "authenticated") return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("conversation-channel");

    const handleConversationUpdate = async (data: {
      conversationId: string;
    }) => {
      if (data.conversationId === conversationId) {
        await refetchConversation();
      }
    };

    channel.bind("conversation-update", handleConversationUpdate);

    return () => {
      channel.unbind("conversation-update", handleConversationUpdate);
      pusher.unsubscribe("conversation-channel");
    };
  }, [conversation, refetchConversation, status]);

  // 新しい会話を作成または既存の会話を取得する関数
  const createUserConversation = async (
    userId: string,
    targetUserId: string,
  ) => {
    try {
      const newConversation = await createOrGetConversationMutation.mutateAsync(
        {
          isGroup: false,
          participantIds: [userId, targetUserId].sort(), // ソートして一意に特定
        },
      );

      setConversationId(newConversation.id);
      return newConversation;
    } catch (error) {
      console.error("Failed to create or get conversation:", error);
      throw error;
    }
  };

  return {
    createUserConversation,
    conversation,
    conversationId,
    setConversationId,
    isConversationLoading,
  };
};
