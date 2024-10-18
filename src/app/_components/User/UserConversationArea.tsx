"use client";

import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { SendHorizontal, Paperclip } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";
import { Dialog, DialogTrigger, DialogContent } from "~/components/ui/dialog";
import Image from "next/image";
import {
  useMessageMutation,
  uploadFileToSupabase,
} from "~/app/hooks/useMessageMutation";
import type { UserWithConversations } from "~/app/types";
import type { MessageWithFilesAndSender } from "~/app/types";
import AvatarComponent from "~/components/common/AvatarComponent";
import { format, isToday, isYesterday } from "date-fns";
import { ja } from "date-fns/locale";

interface UserConversationAreaProps {
  conversationId: string;
  user: UserWithConversations;
}

// 日付をフォーマットする関数
const formatDate = (date: Date) => {
  if (isToday(date)) {
    return "今日";
  } else if (isYesterday(date)) {
    return "昨日";
  } else {
    return format(date, "MM月dd日", { locale: ja });
  }
};

const UserConversationArea: React.FC<UserConversationAreaProps> = ({
  conversationId,
  user,
}) => {
  const { messages, createMessage, isMessagesLoading } =
    useMessageMutation(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreview, setFilePreview] = useState<string[]>([]);
  const [realtimeMessages, setRealtimeMessages] = useState<
    MessageWithFilesAndSender[]
  >([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages) {
      setRealtimeMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`conversation-${conversationId}`);

    const handleMessageReceived = (data: {
      message: MessageWithFilesAndSender;
    }) => {
      setRealtimeMessages((prevMessages) => [...prevMessages, data.message]);
    };

    channel.bind("new-message", handleMessageReceived);

    return () => {
      channel.unbind("new-message", handleMessageReceived);
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [realtimeMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "" || selectedFiles.length > 0) {
      const senderId = user?.id;

      // 複数ファイルのアップロードを実行
      const fileUploads = await Promise.all(
        selectedFiles.map(async (file) => {
          const url = await uploadFileToSupabase(file);
          return url ? { url, fileType: "IMAGE" } : null;
        }),
      );

      const filesData = fileUploads.filter((url) => url !== null) as {
        url: string;
        fileType: "IMAGE";
      }[];

      await createMessage({
        content: newMessage.trim() !== "" ? newMessage : "",
        senderId,
        files: filesData,
      });

      setNewMessage("");
      setSelectedFiles([]);
      setFilePreview([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      const filePreviews = filesArray.map((file) => URL.createObjectURL(file));
      setFilePreview(filePreviews);
    }
  };

  const groupedMessages = () => {
    const grouped: { date: string; messages: MessageWithFilesAndSender[] }[] =
      [];
    let currentDate: string | null = null;

    const messagesToGroup = realtimeMessages || [];

    messagesToGroup.forEach((message) => {
      if (!message || !message.timestamp) return;

      const messageDate = new Date(message.timestamp);
      const formattedDate = formatDate(messageDate);

      if (formattedDate !== currentDate) {
        currentDate = formattedDate;
        grouped.push({ date: formattedDate, messages: [message] });
      } else {
        grouped[grouped.length - 1]?.messages.push(message);
      }
    });

    return grouped;
  };

  return (
    <div className="flex h-full flex-col">
      {isMessagesLoading ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <ScrollArea
            className="flex-1 overflow-y-auto p-4"
            ref={scrollAreaRef}
            style={{ minHeight: "calc(100vh - 150px)" }}
          >
            {groupedMessages().map(({ date, messages }) => (
              <div key={date} className="mb-4">
                <div className="mb-2 text-center text-gray-500">{date}</div>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex flex-col">
                      {/* 自分以外のメッセージの場合、送信者のアイコンを表示 */}
                      <div>
                        {message.senderId !== user?.id && message.sender && (
                          <AvatarComponent entity={message.sender} />
                        )}
                        <div
                          className={`inline-block max-w-[70%] rounded-lg p-3 ${message.senderId === user?.id ? "bg-blue-500 text-white" : "bg-gray-300 text-black dark:bg-gray-700 dark:text-white"}`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      {/* 画像ファイルがある場合にサムネイルを表示 */}
                      {message.files &&
                        message.files.map(
                          (file) =>
                            file.fileType === "IMAGE" && (
                              <div key={file.url} className="mt-2">
                                <img
                                  src={file.url}
                                  alt="Thumbnail"
                                  className="h-32 w-32 cursor-pointer rounded"
                                  onClick={() => setSelectedImage(file.url)} // クリックで拡大画像を表示
                                />
                              </div>
                            ),
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </ScrollArea>

          {/* 画像拡大表示のためのダイアログ */}
          {selectedImage && (
            <Dialog
              open={Boolean(selectedImage)}
              onOpenChange={() => setSelectedImage(null)}
            >
              <DialogTrigger asChild>
                <div></div>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-[90vw] p-4">
                <div className="relative flex h-full w-full items-center justify-center">
                  <Image
                    src={selectedImage}
                    alt="Preview enlarged"
                    layout="intrinsic"
                    width={600}
                    height={600}
                    className="rounded"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      <div className="sticky bottom-0 left-0 right-0 w-full border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Textarea
            id="message"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewMessage(e.target.value)
            }
            className="flex-1"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <label htmlFor="file-upload">
                  <Paperclip className="cursor-pointer" />
                </label>
              </TooltipTrigger>
              <TooltipContent>ファイルを添付</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            onClick={(e) => (e.currentTarget.value = "")}
            multiple // 複数選択を許可
          />

          <Button type="submit" size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
          {filePreview.length > 0 && (
            <div className="mt-2">
              {filePreview.map((preview, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <Image
                      src={preview}
                      alt={`Selected Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className="cursor-pointer rounded"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-[90vw] p-4">
                    <div className="relative flex h-full w-full items-center justify-center">
                      <Image
                        src={preview}
                        alt={`Preview enlarged ${index + 1}`}
                        layout="intrinsic"
                        width={600}
                        height={600}
                        className="rounded"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserConversationArea;
