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
import type { UserWithDetails } from "~/app/types";
import type { MessageWithFilesAndSender } from "~/app/types";
import AvatarComponent from "~/components/common/AvatarComponent";
import { formatDate } from "~/lib/utils";

interface UserConversationAreaProps {
  conversationId: string;
  user: UserWithDetails;
}

const UserConversationArea: React.FC<UserConversationAreaProps> = ({
  conversationId,
  user,
}) => {
  const { messages, createMessage, markMessageAsRead, isMessagesLoading } =
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
      const messagesWithReadBy = messages.map((message) => ({
        ...message,
        readBy: Array.isArray(message.readBy) ? message.readBy : [], // readBy が存在しない場合は空の配列を設定
      }));
      setRealtimeMessages(messagesWithReadBy);
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
      setRealtimeMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.id === data.message.id)) {
          return prevMessages; // 既に存在する場合は何もしない
        }
        return [...prevMessages, data.message];
      });
    };

    const handleMessageRead = (data: { messageId: string; userId: string }) => {
      setRealtimeMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === data.messageId
            ? {
                ...message,
                readBy: Array.isArray(message.readBy)
                  ? [
                      ...message.readBy,
                      {
                        id: data.userId,
                        name: "",
                        email: "",
                        emailVerified: null,
                        image: "",
                      },
                    ]
                  : [], // readByが存在しない場合は空配列を設定
              }
            : message,
        ),
      );
    };

    channel.bind("new-message", handleMessageReceived);
    channel.bind("message-read", handleMessageRead);

    return () => {
      channel.unbind("new-message", handleMessageReceived);
      channel.unbind("message-read", handleMessageRead);
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [realtimeMessages]);

  useEffect(() => {
    realtimeMessages.forEach((message) => {
      if (
        message.senderId !== user?.id &&
        Array.isArray(message.readBy) &&
        !message.readBy.some((reader) => reader.id === user.id)
      ) {
        void markMessageAsRead(message.id);
      }
    });
  }, [realtimeMessages, user, markMessageAsRead]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "" || selectedFiles.length > 0) {
      const senderId = user?.id;

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
      if (!message?.timestamp) return;

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
                    className={`mb-4 flex ${
                      message.senderId === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="flex flex-col">
                      {message.senderId !== user?.id &&
                        message.sender?.image && (
                          <div className="flex items-start">
                            <AvatarComponent
                              entity={message.sender}
                              className="mr-2"
                            />
                            <div className="flex flex-col">
                              {message.content && (
                                <div className="inline-block w-[80%] max-w-[400px] rounded-lg bg-gray-300 p-3 text-black dark:bg-gray-700 dark:text-white">
                                  <p>{message.content}</p>
                                </div>
                              )}
                              {message.files?.map(
                                (file) =>
                                  file.fileType === "IMAGE" && (
                                    <div key={file.url} className="mt-2">
                                      <Image
                                        src={file.url}
                                        alt="Thumbnail"
                                        width={128}
                                        height={128}
                                        className="cursor-pointer rounded"
                                        onClick={() =>
                                          setSelectedImage(file.url)
                                        }
                                      />
                                    </div>
                                  ),
                              )}
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
                        )}
                      {message.senderId === user?.id && (
                        <div className="flex flex-col items-end">
                          {message.content && (
                            <div className="inline-block w-[80%] max-w-[400px] rounded-lg bg-blue-500 p-3 text-white">
                              <p>{message.content}</p>
                            </div>
                          )}
                          {message.files?.map(
                            (file) =>
                              file.fileType === "IMAGE" && (
                                <div key={file.url} className="mt-2">
                                  <Image
                                    src={file.url}
                                    alt="Thumbnail"
                                    width={128}
                                    height={128}
                                    className="cursor-pointer rounded"
                                    onClick={() => setSelectedImage(file.url)}
                                  />
                                </div>
                              ),
                          )}
                          <div className="w-[80%] max-w-[400px] text-left text-xs opacity-70">
                            <p>
                              {message.readBy &&
                                message.readBy.length > 0 &&
                                message.readBy.some(
                                  (reader) => reader.id !== user.id,
                                ) && <span className="ml-2">既読</span>}
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

      <div className="sticky bottom-0 left-0 right-0 w-full border-t bg-background p-4">
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
            className="flex-1 backdrop-blur-md backdrop-filter"
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
