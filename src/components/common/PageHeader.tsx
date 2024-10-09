import React from "react";
import { Search } from "lucide-react"; // 検索アイコン用
import { Button } from "~/components/ui/button"; // グループ/ユーザーのアクション用ボタン

interface PageHeaderProps {
  title: string; // グループ名またはユーザー名
  onSearchClick: () => void; // 検索アイコンクリック時のハンドラ
  onTitleClick: () => void; // グループ名クリック時にダイアログを表示するハンドラ
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onSearchClick,
  onTitleClick,
}) => {
  return (
    <div className="flex items-center justify-between border-b p-4">
      {/* 左側: グループ/ユーザー名（クリック可能） */}
      <div
        className="cursor-pointer text-lg font-semibold"
        onClick={onTitleClick}
      >
        {title}
      </div>

      {/* 右側: 検索アイコン */}
      <Button onClick={onSearchClick} variant="ghost" size="icon">
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default PageHeader;
