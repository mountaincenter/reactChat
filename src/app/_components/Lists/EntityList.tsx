"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Search } from "lucide-react";
import EntityItem from "./EntityItem";
import type {
  UserWithConversations,
  GroupWithConversations,
} from "~/app/types";

interface EntityListProps<T> {
  entities: T[];
  onSelectEntity: (entityId: string, entity: T) => void; // 修正: idとエンティティを両方渡す
  searchPlaceholder: string;
  noEntitiesMessage: string;
  renderEntityName: (entity: T) => string;
  entityKeyExtractor: (entity: T) => string;
}

const EntityList = <T extends UserWithConversations | GroupWithConversations>({
  entities,
  onSelectEntity,
  searchPlaceholder,
  noEntitiesMessage,
  renderEntityName,
  entityKeyExtractor,
}: EntityListProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEntities = entities.filter((entity) =>
    renderEntityName(entity).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="relative mt-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredEntities.length === 0 ? (
          <Alert className="mt-4">
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>{noEntitiesMessage}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredEntities.map((entity) => (
              <div
                key={entityKeyExtractor(entity)}
                onClick={() => onSelectEntity(entity.id, entity)} // 修正: id とエンティティを両方渡す
                className="cursor-pointer"
              >
                <EntityItem entity={entity} />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EntityList;
