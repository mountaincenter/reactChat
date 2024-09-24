"use client";
import { useEffect } from "react";
import Pusher from "pusher-js";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

export const useMessageMutation = (conversationId: string) => {
  const { status } = useSession();
  const {
    data: messages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = api.message.getByConversationId.useQuery(conversationId, {
    enabled: status === "authenticated" && !!conversationId,
  });

  const createMessageMutation = api.message.create.useMutation();
  const updateMessageMutation = api.message.update.useMutation();
  const deleteMessageMutation = api.message.delete.useMutation();

  // Pusherでリアルタイムメッセージ更新を管理
  useEffect(() => {
    if (status !== "authenticated") return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`message-channel-${conversationId}`);

    const handleMessageUpdate = async (_data: { conversationId: string }) => {
      await refetchMessages(); // 更新時にメッセージを再取得
    };

    channel.bind("message-update", handleMessageUpdate);

    return () => {
      channel.unbind("message-update", handleMessageUpdate);
      pusher.unsubscribe(`message-channel-${conversationId}`);
    };
  }, [refetchMessages, conversationId, status]);

  const createMessage = (data: { content: string; senderId: string }) => {
    createMessageMutation.mutate({ ...data, conversationId }); // 新しいメッセージを作成
  };

  const updateMessage = (
    id: string,
    content: string,
    conversationId: string,
  ) => {
    updateMessageMutation.mutate({ id, content, conversationId }); // メッセージを更新
  };

  const deleteMessage = (id: string) => {
    deleteMessageMutation.mutate(id); // メッセージを削除
  };

  return {
    messages,
    createMessage,
    updateMessage,
    deleteMessage,
    isMessagesLoading,
  };
};
