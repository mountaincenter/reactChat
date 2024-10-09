import { useMemo } from "react";

interface UseEntityListProps<T> {
  entities: T[]; // ユーザーやグループを受け取る
  searchTerm: string; // 検索文字列
  renderEntityName: (entity: T) => string; // エンティティ名の取得
}

export const useEntityList = <T extends { id: string }>({
  entities,
  searchTerm,
  renderEntityName,
}: UseEntityListProps<T>) => {
  // 検索条件に一致するエンティティをフィルタリング
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) =>
      renderEntityName(entity).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [entities, searchTerm, renderEntityName]);

  return {
    filteredEntities,
  };
};
