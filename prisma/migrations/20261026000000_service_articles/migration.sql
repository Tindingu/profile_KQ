ALTER TABLE "Content" ADD COLUMN "parentId" TEXT;
CREATE INDEX "Content_parentId_status_publishedAt_idx" ON "Content"("parentId", "status", "publishedAt");
ALTER TABLE "Content" ADD CONSTRAINT "Content_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
