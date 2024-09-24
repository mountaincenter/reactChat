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

  // メッセージを作成する関数（ファイル対応）
  const createMessage = (data: {
    content: string;
    senderId: string;
    file?: File;
  }) => {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("senderId", data.senderId);
    formData.append("conversationId", conversationId);

    if (data.file) {
      formData.append("file", data.file); // ファイルがある場合、FormDataに追加
    }

    createMessageMutation.mutate({ ...data, conversationId, formData }); // 新しいメッセージを作成
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
