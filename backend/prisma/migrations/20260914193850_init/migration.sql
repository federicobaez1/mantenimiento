-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'TECNICO') NOT NULL DEFAULT 'TECNICO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `ubicacion` VARCHAR(191) NULL,
    `estado` ENUM('OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO') NOT NULL DEFAULT 'OPERATIVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Equipo_codigo_key`(`codigo`),
    INDEX `Equipo_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Orden` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    `fechaProgramada` DATETIME(3) NOT NULL,
    `fechaRealizada` DATETIME(3) NULL,
    `comentario` VARCHAR(191) NULL,
    `usuarioId` INTEGER NOT NULL,
    `equipoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Orden_estado_idx`(`estado`),
    INDEX `Orden_usuarioId_idx`(`usuarioId`),
    INDEX `Orden_equipoId_idx`(`equipoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Orden` ADD CONSTRAINT `Orden_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orden` ADD CONSTRAINT `Orden_equipoId_fkey` FOREIGN KEY (`equipoId`) REFERENCES `Equipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Convertir las tablas a la collation española de la base de datos
ALTER TABLE `User` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
ALTER TABLE `Equipo` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
ALTER TABLE `Orden` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
