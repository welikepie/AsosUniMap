SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';
CREATE SCHEMA IF NOT EXISTS `asosUniMap` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;

USE `asosUniMap` ;

-- -----------------------------------------------------
-- Table `mydb`.`content`
-- -----------------------------------------------------

CREATE  TABLE IF NOT EXISTS `asosUniMap`.`content` (
  `id` VARCHAR(30) NOT NULL ,
  `user` VARCHAR(45) NULL ,
  `userIMG` VARCHAR(200) NULL ,
  `name` VARCHAR(60) NOT NULL,
  `time` TIMESTAMP NOT NULL ,
  `link` VARCHAR(200) NOT NULL ,
  `lat` DECIMAL(9,6) NULL ,
  `lon` DECIMAL(9,6) NULL ,
  `text` TEXT NULL ,
  `img_small` VARCHAR(200) NULL ,
  `img_med` VARCHAR(200) NULL ,
  `img_large` VARCHAR(200) NULL ,
  `source` VARCHAR(5) NULL ,
  `hashtag` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`) )

ENGINE = InnoDB,DEFAULT CHARSET=utf8;

USE `asosUniMap` ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

