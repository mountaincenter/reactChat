"use client";
import { useEffect } from "react";
import Pusher from "pusher-js";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { supabase } from "~/lib/supabaseClient";
import { generateTimestamp } from "~/lib/utils"; // タイムスタンプ生成関数をインポート

// 画像をアップロードする関数
const uploadFileToSupabase = async (
  file: File | Blob,
): Promise<string | null> => {
  // ファイル名にタイムスタンプを付与する
  const timestamp = generateTimestamp();
  const fileName = file instanceof File ? file.name : `blob_${timestamp}.jpg`;

  // ファイルを Supabase にアップロード
  const { data, error } = await supabase.storage
    .from("realTimeChat") // アップロード先のバケット名
    .upload(`public/${timestamp}-${fileName}`, file); // タイムスタンプ付きのファイル名

  // エラーハンドリング
  if (error) {
    console.error("ファイルアップロードエラー:", error);
    return null; // エラー時には null を返す
  }

  // ファイルが正常にアップロードされた場合、その公開URLを取得
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

  // Pusher を使ったリアルタイムメッセージ更新の管理
  useEffect(() => {
    if (status !== "authenticated") return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`message-channel-${conversationId}`);

    const handleMessageUpdate = async (_data: { conversationId: string }) => {
      await refetchMessages(); // メッセージが更新された際に再取得
    };

    channel.bind("message-update", handleMessageUpdate);

    return () => {
      channel.unbind("message-update", handleMessageUpdate);
      pusher.unsubscribe(`message-channel-${conversationId}`);
    };
  }, [refetchMessages, conversationId, status]);

  // メッセージを作成する関数（ファイル対応）
  const createMessage = async (data: {
    content: string;
    senderId: string;
    file?: File | Blob; // File または Blob に対応
  }) => {
    let fileUrl: string | null = null;

    // ファイルが存在する場合、アップロード処理を実行
    if (data.file) {
      fileUrl = await uploadFileToSupabase(data.file);
    }

    createMessageMutation.mutate({
      content: data.content,
      conversationId,
      files: fileUrl ? [{ url: fileUrl, fileType: "IMAGE" }] : [], // ファイルのURLを TRPC に渡す
    });
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
