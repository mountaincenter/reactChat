"use client";
import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { useMessageMutation } from "~/app/hooks/useMessageMutation";
import type { User } from "@prisma/client";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string;
  conversationId: string;
}

interface ConversationAreaProps {
  conversationId: string;
  user: User;
}

const ConversationArea: React.FC<ConversationAreaProps> = ({
  conversationId,
  user,
}) => {
  const { messages, createMessage, isMessagesLoading } =
    useMessageMutation(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 初回レンダリング時にメッセージを取得しセット
  useEffect(() => {
    if (messages) {
      setRealtimeMessages(messages); // リロード時にmessagesを反映
    }
  }, [messages]);

  // Pusherを使ってリアルタイムメッセージを購読
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`conversation-${conversationId}`);

    const handleMessageReceived = (data: { message: Message }) => {
      setRealtimeMessages((prevMessages) => [...prevMessages, data.message]);
    };

    channel.bind("new-message", handleMessageReceived);

    return () => {
      channel.unbind("new-message", handleMessageReceived);
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  // スクロール処理
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [realtimeMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      createMessage({ content: newMessage, senderId: user.id }); // senderIdはセッションから取得
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>

      {isMessagesLoading ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p>Loading...</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {realtimeMessages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.senderId === user.id ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block rounded-lg p-3 ${
                  message.senderId === user.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      )}

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationArea;
