/*
  Warnings:

  - You are about to alter the column `contribution_id` on the `contribution_replies` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `UnsignedInt`.
  - You are about to alter the column `contribution_id` on the `contribution_votes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `UnsignedInt`.

*/
-- DropForeignKey
ALTER TABLE `contribution_replies` DROP FOREIGN KEY `contribution_reply`;

-- DropForeignKey
ALTER TABLE `contribution_votes` DROP FOREIGN KEY `contribution_vote`;

-- AlterTable
ALTER TABLE `contribution_replies` MODIFY `contribution_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `contribution_votes` MODIFY `contribution_id` INTEGER UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `contribution_replies` ADD CONSTRAINT `contribution_reply` FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contribution_votes` ADD CONSTRAINT `contribution_vote` FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `contributions` DROP CONSTRAINT `contributions_user_id_key`