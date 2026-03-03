/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contract_userId_name_key" ON "Contract"("userId", "name");
