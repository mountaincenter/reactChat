-- CreateTable
CREATE TABLE "_MessageReadUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MessageReadUsers_AB_unique" ON "_MessageReadUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageReadUsers_B_index" ON "_MessageReadUsers"("B");

-- AddForeignKey
ALTER TABLE "_MessageReadUsers" ADD CONSTRAINT "_MessageReadUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageReadUsers" ADD CONSTRAINT "_MessageReadUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
