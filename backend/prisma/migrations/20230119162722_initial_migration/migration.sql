-- CreateTable
CREATE TABLE `boroughs` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(256) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contribution_replies` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(256) NULL,
    `contribution_id` INTEGER UNSIGNED NOT NULL,
    `message` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` TINYINT NULL DEFAULT 0,

    INDEX `contribution_reply`(`contribution_id`),
    INDEX `reply_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contribution_votes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `contribution_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `score` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `contribution_vote`(`contribution_id`),
    INDEX `vote_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contributions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NULL,
    `issue_id` INTEGER UNSIGNED NULL,
    `comment` TEXT NULL,
    `photo_path` VARCHAR(256) NULL,
    `photo_width` INTEGER UNSIGNED NULL,
    `photo_height` INTEGER UNSIGNED NULL,
    `location` TEXT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(256) NULL,
    `quality` INTEGER NULL,
    `is_deleted` TINYINT NULL DEFAULT 0,

    INDEX `contribution_author`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `troncons` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_trc` INTEGER NULL,
    `id2020` INTEGER NULL,
    `borough_id` INTEGER NULL,
    `type` TINYINT NULL,
    `length` FLOAT NULL,
    `id_cycl` INTEGER NULL,
    `type2` INTEGER NULL,
    `nb_lanes` INTEGER NULL,
    `splitter` VARCHAR(10) NULL,
    `four_seasons` TINYINT NULL,
    `protected_four_seasons` TINYINT NULL,
    `street_side_one_state` INTEGER NULL DEFAULT 0,
    `street_side_two_state` INTEGER NULL DEFAULT 0,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `troncon_lines` TEXT NULL,

    INDEX `trc_id`(`id_trc`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(256) NULL,
    `token` VARCHAR(256) NULL,
    `rq_ip` VARCHAR(256) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contribution_replies` ADD CONSTRAINT `contribution_reply` FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contribution_replies` ADD CONSTRAINT `reply_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contribution_votes` ADD CONSTRAINT `contribution_vote` FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contribution_votes` ADD CONSTRAINT `vote_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contribution_author` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
