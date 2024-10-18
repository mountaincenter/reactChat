import { useConversationMutation } from "~/app/hooks/useConversationMutation";

export const useConversationLogic = () => {
  const { createConversation } = useConversationMutation();

  const handleEntityClick = async (
    entity: {
      id: string;
      conversations?: { id: string }[];
      members?: { id: string }[];
      conversationId?: string; // グループに関連付けられた会話ID
    },
    isGroup: boolean,
    onSelectConversation: (conversationId: string) => void,
  ) => {
    // 既存の会話がある場合はその会話IDを使用
    if (isGroup && entity.conversationId) {
      onSelectConversation(entity.conversationId);
      return;
    }

    const conversationId = entity.conversations?.[0]?.id;
    console.log("entity:", entity);
    console.log("entityId:", entity.id);
    console.log("entityConversations:", entity.conversations);
    console.log("conversationId:", conversationId);
    if (conversationId) {
      onSelectConversation(conversationId);
    } else {
      try {
        let participantIds: string[];

        if (isGroup && entity.members) {
          // グループの場合、全メンバーのIDを取得
          participantIds = entity.members.map((member) => member.id);
        } else {
          // 一対一の会話の場合、ユーザーIDのみを取得
          participantIds = [entity.id];
        }

        // 新しい会話を非同期に作成し、完了後に次の処理を実行
        const newConversation = await createConversation({
          isGroup,
          participantIds,
          groupId: isGroup ? entity.id : undefined, // グループIDを含める
        });

        if (newConversation?.id) {
          onSelectConversation(newConversation.id); // 作成された会話IDを使用
        } else {
          console.error("Failed to create conversation");
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    }
  };

  return { handleEntityClick };
};
