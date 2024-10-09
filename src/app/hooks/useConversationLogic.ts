import { useConversationMutation } from "~/app/hooks/useConversationMutation";

export const useConversationLogic = () => {
  const { createConversation } = useConversationMutation();

  const handleEntityClick = async (
    entity: { id: string; conversations?: { id: string }[] },
    isGroup: boolean,
    onSelectConversation: (conversationId: string) => void,
  ) => {
    // 既存の会話がある場合はその会話IDを使用
    const conversationId = entity.conversations?.[0]?.id;
    if (conversationId) {
      onSelectConversation(conversationId);
    } else {
      try {
        // 新しい会話を非同期に作成し、完了後に次の処理を実行
        const newConversation = await createConversation({
          isGroup,
          participantIds: [entity.id],
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
