/*
  Warnings:

  - You are about to alter the column `user_id` on the `contribution_replies` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(256)`.
  - You are about to alter the column `contribution_id` on the `contribution_replies` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(256)`.
  - You are about to alter the column `contribution_id` on the `contribution_votes` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(256)`.
  - You are about to alter the column `user_id` on the `contribution_votes` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(256)`.
  - You are about to alter the column `user_id` on the `contributions` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(256)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `contributions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `user_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `contribution_replies` DROP FOREIGN KEY `contribution_reply`;

-- DropForeignKey
ALTER TABLE `contribution_replies` DROP FOREIGN KEY `reply_user`;

-- DropForeignKey
ALTER TABLE `contribution_votes` DROP FOREIGN KEY `contribution_vote`;

-- DropForeignKey
ALTER TABLE `contribution_votes` DROP FOREIGN KEY `vote_user`;

-- DropForeignKey
ALTER TABLE `contributions` DROP FOREIGN KEY `contribution_author`;

-- AlterTable
ALTER TABLE `contribution_replies` MODIFY `user_id` VARCHAR(256) NOT NULL,
    MODIFY `contribution_id` VARCHAR(256) NOT NULL;

-- AlterTable
ALTER TABLE `contribution_votes` MODIFY `contribution_id` VARCHAR(256) NOT NULL,
    MODIFY `user_id` VARCHAR(256) NOT NULL;

-- AlterTable
ALTER TABLE `contributions` MODIFY `user_id` VARCHAR(256) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    MODIFY `user_id` VARCHAR(256) NOT NULL,
    ADD PRIMARY KEY (`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `contributions_user_id_key` ON `contributions`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_user_id_key` ON `users`(`user_id`);

-- AddForeignKey
ALTER TABLE `contribution_replies` ADD CONSTRAINT `contribution_reply` FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contribution_replies` ADD CONSTRAINT `reply_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contribution_votes` ADD CONSTRAINT `contribution_vote` FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contribution_votes` ADD CONSTRAINT `vote_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contribution_author` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
