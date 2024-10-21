"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { supabase } from "~/lib/supabaseClient";
import { generateTimestamp } from "~/lib/utils"; // タイムスタンプ生成関数をインポート

// 画像をアップロードする関数
export const uploadFileToSupabase = async (
  file: File | Blob,
): Promise<string | null> => {
  const timestamp = generateTimestamp();
  const fileName = file instanceof File ? file.name : `blob_${timestamp}.jpg`;

  const { data, error } = await supabase.storage
    .from("realTimeChat")
    .upload(`public/${timestamp}-${fileName}`, file);

  if (error) {
    console.error("ファイルアップロードエラー:", error);
    return null;
  }

  if (data?.path) {
    const publicUrlData = supabase.storage
      .from("realTimeChat")
      .getPublicUrl(data.path);

    if (!publicUrlData?.data?.publicUrl) {
      console.error("パブリックURLの取得に失敗しました");
      return null;
    }

    return publicUrlData.data.publicUrl; // 公開URLを返す
  }

  return null;
};

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
  const markAsReadMutation = api.message.markAsRead.useMutation();

  useEffect(() => {
    if (status !== "authenticated") return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`message-channel-${conversationId}`);

    const handleMessageUpdate = async () => {
      await refetchMessages();
    };

    channel.bind("new-message", handleMessageUpdate);
    channel.bind("message-read", handleMessageUpdate);

    return () => {
      channel.unbind("new-message", handleMessageUpdate);
      channel.unbind("message-read", handleMessageUpdate);
      pusher.unsubscribe(`message-channel-${conversationId}`);
    };
  }, [refetchMessages, conversationId, status]);

  // メッセージを作成する関数（ファイル対応）
  const createMessage = async (data: {
    content: string;
    senderId: string;
    files?: {
      url: string;
      fileType: "IMAGE" | "DOCUMENT" | "PDF" | "VIDEO" | "AUDIO";
    }[];
  }) => {
    createMessageMutation.mutate({
      content: data.content,
      conversationId,
      files: data.files ?? [],
    });
  };

  const updateMessage = (messageId: string, content: string) => {
    updateMessageMutation.mutate({ messageId, content });
  };

  const deleteMessage = (id: string) => {
    deleteMessageMutation.mutate(id);
  };

  const markMessageAsRead = async (messageId: string) => {
    markAsReadMutation.mutate({ messageId, conversationId });
  };

  return {
    messages,
    createMessage,
    updateMessage,
    deleteMessage,
    markMessageAsRead,
    isMessagesLoading,
  };
};
