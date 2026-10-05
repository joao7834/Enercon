DROP TABLE IF EXISTS `tbl_ltr`;
DROP TABLE IF EXISTS `tbl_esp`;
DROP TABLE IF EXISTS `tbl_cmd`;
DROP TABLE IF EXISTS `tbl_usr`;
DROP TABLE IF EXISTS `tbl_user`;

CREATE TABLE `tbl_usr` (
  `id_usr` int NOT NULL AUTO_INCREMENT,
  `u_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `hash_key` varchar(100) DEFAULT NULL,
  `cad_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usr`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tbl_cmd` (
    `id_cmd` INT NOT NULL AUTO_INCREMENT,
    `id_usr` int NOT NULL,
    `c_name` varchar(100) DEFAULT NULL,
    `c_type` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`id_cmd`),
    FOREIGN KEY (`id_usr`) REFERENCES `tbl_usr`(`id_usr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `tbl_esp` (
  `id_esp` VARCHAR(50) PRIMARY KEY,
  `id_cmd` INT NOT NULL,
  `cad_name` VARCHAR(100) NOT NULL,
  `cad_date` DATETIME NOT NULL,
  FOREIGN KEY (`id_cmd`) REFERENCES `tbl_cmd`(`id_cmd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tbl_ltr` (
  `id_ltr` INT NOT NULL AUTO_INCREMENT,
  `id_esp` VARCHAR(50) NOT NULL,
  `crn` FLOAT,
  `pot` FLOAT,
  `tmp` FLOAT,
  `umd` FLOAT,
  `cut` BOOLEAN,
  `stt` VARCHAR(50),
  `stm` DATETIME,
  PRIMARY KEY (`id_ltr`),
  FOREIGN KEY (`id_esp`) REFERENCES `tbl_esp`(`id_esp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX `idx_stm_esp` ON `tbl_ltr` (`id_esp`, `stm`);