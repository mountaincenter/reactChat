import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const conversations = [
  {
    name: "General Chat",
    isGroup: false,
    participants: ["cm0zkbbal0000pno51j0id310", "cm18oxmvf0008m4iiwmwsqk58"],
    messages: [
      {
        content: "Hello, how are you?",
        timestamp: "2024-09-01T12:00:00Z",
        senderId: "cm0zkbbal0000pno51j0id310",
      },
      {
        content: "I'm good, thank you! How about you?",
        timestamp: "2024-09-01T12:05:00Z",
        senderId: "cm18oxmvf0008m4iiwmwsqk58",
      },
    ],
  },
  {
    name: "Project Discussion",
    isGroup: true,
    participants: ["cm0zkbbal0000pno51j0id310", "cm18oxmvf0008m4iiwmwsqk58"],
    messages: [
      {
        content: "Let's discuss the new project.",
        timestamp: "2024-09-02T10:00:00Z",
        senderId: "cm0zkbbal0000pno51j0id310",
      },
      {
        content: "Sure, I have some ideas.",
        timestamp: "2024-09-02T10:10:00Z",
        senderId: "cm18oxmvf0008m4iiwmwsqk58",
      },
    ],
  },
];

async function main() {
  for (const conversation of conversations) {
    // 会話を作成
    const createdConversation = await prisma.conversation.create({
      data: {
        name: conversation.name,
        isGroup: conversation.isGroup,
        participants: {
          connect: conversation.participants.map((userId) => ({ id: userId })),
        },
      },
    });

    // メッセージを作成
    for (const message of conversation.messages) {
      await prisma.message.create({
        data: {
          content: message.content,
          timestamp: new Date(message.timestamp),
          senderId: message.senderId,
          conversationId: createdConversation.id,
        },
      });
    }
  }

  const allConversations = await prisma.conversation.findMany({
    include: {
      messages: true,
      participants: true,
    },
  });
  console.log("allConversations", JSON.stringify(allConversations, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
