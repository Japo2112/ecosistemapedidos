CREATE DATABASE  IF NOT EXISTS `TiendaVirtual` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `TiendaVirtual`;
-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: TiendaVirtual
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id_audit` bigint NOT NULL AUTO_INCREMENT,
  `evento` varchar(60) NOT NULL,
  `actor_email` varchar(150) DEFAULT NULL,
  `ip_origen` varchar(45) DEFAULT NULL,
  `entidad` varchar(60) DEFAULT NULL,
  `entidad_id` varchar(60) DEFAULT NULL,
  `detalle` json DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_audit`),
  KEY `evento` (`evento`,`creado_en`),
  KEY `actor_email` (`actor_email`,`creado_en`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,'USUARIO_CREAR','system','127.0.0.1','usuarios','1','{\"email\": \"admin@empresa.com\", \"nombre\": \"admin\", \"id_role\": 1}','2026-03-16 03:48:11'),(2,'LOGIN_FALLIDO','admin@empresa.com','127.0.0.1','usuarios','1','{\"intento\": 1}','2026-03-17 02:46:01'),(3,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 02:48:29'),(4,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 03:07:22'),(5,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 03:45:08'),(6,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 03:57:43'),(7,'PRODUCTO_CREAR','admin@empresa.com','127.0.0.1','productos','1','{\"sku\": \"001\", \"stock\": 20, \"activo\": 1, \"nombre\": \"Martillo\", \"precio\": 100.00}','2026-03-17 04:00:46'),(8,'USUARIO_CREAR','admin@empresa.com','127.0.0.1','usuarios','2','{\"email\": \"iboycesar7@gmail.com\", \"nombre\": \"Cesar\", \"id_role\": 2}','2026-03-17 04:06:57'),(9,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 04:07:39'),(10,'LOGIN_FALLIDO','iboycesar7@gmail.com','127.0.0.1','usuarios','2','{\"intento\": 1}','2026-03-17 04:07:52'),(11,'USUARIO_DESBLOQUEADO','admin@empresa.com','127.0.0.1','usuarios','1','{\"accion\": \"desbloqueo manual\"}','2026-03-17 04:08:10'),(12,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 04:08:21'),(13,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 04:28:22'),(14,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-17 13:07:07'),(15,'PEDIDO_CREAR','admin@empresa.com','127.0.0.1','pedidos','1','{\"total\": 0.00, \"estado\": \"CREADO\", \"id_usuario\": 1}','2026-03-18 01:53:59'),(16,'PEDIDO_CREAR','admin@empresa.com','127.0.0.1','pedidos','2','{\"total\": 0.00, \"estado\": \"CREADO\", \"id_usuario\": 1}','2026-03-18 01:58:06'),(17,'PEDIDO_DETALLE_CREAR','admin@empresa.com','127.0.0.1','pedido_detalle','1','{\"cantidad\": 1, \"id_pedido\": 2, \"id_producto\": 1, \"precio_unit\": 100.00}','2026-03-18 01:58:06'),(18,'PEDIDO_CONFIRMAR_TRANSACCION','admin@empresa.com','127.0.0.1','pedidos','2','{\"total\": 100.00, \"estado_nuevo\": \"PAGADO\", \"cantidad_detalles\": 1}','2026-03-18 02:02:53'),(19,'USUARIO_CREAR','admin@empresa.com','127.0.0.1','usuarios','3','{\"email\": \"walbinramos@example.com\", \"nombre\": \"Walbin\", \"id_role\": 2}','2026-03-18 02:16:56'),(20,'LOGIN_FALLIDO','walbinramos@example.com','127.0.0.1','usuarios','3','{\"intento\": 1}','2026-03-18 02:17:48'),(21,'LOGIN_FALLIDO','walbinramos@example.com','127.0.0.1','usuarios','3','{\"intento\": 2}','2026-03-18 02:17:55'),(22,'LOGIN_FALLIDO','admin@empresa.com','127.0.0.1','usuarios','1','{\"intento\": 1}','2026-03-18 02:18:01'),(23,'LOGIN_EXITOSO','admin@empresa.com','127.0.0.1','usuarios','1','{\"rol\": \"ADMIN\", \"nombre\": \"admin\"}','2026-03-18 02:18:06'),(24,'USUARIO_ACTUALIZAR','admin@empresa.com','127.0.0.1','usuarios','2','{\"rol\": 2, \"activo\": 1, \"email_nuevo\": \"iboycesar7@gmail.com\", \"email_anterior\": \"iboycesar7@gmail.com\"}','2026-03-18 02:18:26'),(25,'USUARIO_ACTUALIZAR','admin@empresa.com','127.0.0.1','usuarios','3','{\"rol\": 2, \"activo\": 1, \"email_nuevo\": \"walbinramos@example.com\", \"email_anterior\": \"walbinramos@example.com\"}','2026-03-18 02:18:33'),(26,'USUARIO_DESBLOQUEADO','admin@empresa.com','127.0.0.1','usuarios','3','{\"accion\": \"desbloqueo manual\"}','2026-03-18 02:18:36'),(27,'USUARIO_DESBLOQUEADO','admin@empresa.com','127.0.0.1','usuarios','3','{\"accion\": \"desbloqueo manual\"}','2026-03-18 02:18:38');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_detalle`
--

DROP TABLE IF EXISTS `pedido_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_detalle` (
  `id_detalle` bigint NOT NULL AUTO_INCREMENT,
  `id_pedido` bigint NOT NULL,
  `id_producto` bigint NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unit` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  UNIQUE KEY `uk_pedido_producto` (`id_pedido`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `pedido_detalle_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE,
  CONSTRAINT `pedido_detalle_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_detalle`
--

LOCK TABLES `pedido_detalle` WRITE;
/*!40000 ALTER TABLE `pedido_detalle` DISABLE KEYS */;
INSERT INTO `pedido_detalle` VALUES (1,2,1,1,100.00,100.00);
/*!40000 ALTER TABLE `pedido_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id_pedido` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `estado` enum('CREADO','PAGADO','CANCELADO','ENVIADO') NOT NULL DEFAULT 'CREADO',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pedido`),
  KEY `id_usuario` (`id_usuario`,`creado_en`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,1,'CREADO',0.00,'2026-03-18 01:53:59','2026-03-18 01:53:59'),(2,1,'PAGADO',100.00,'2026-03-18 01:58:06','2026-03-18 02:02:53');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` bigint NOT NULL AUTO_INCREMENT,
  `sku` varchar(60) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `precio` decimal(12,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `sku` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'001','Martillo','Martillo de goma',100.00,19,1,'2026-03-17 04:00:46','2026-03-18 02:02:53');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_role` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(2,'CLIENTE');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `pass_hash` varchar(255) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `id_role` int NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `intentos_fallidos` int DEFAULT '0',
  `bloqueado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `id_role` (`id_role`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@empresa.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','admin',1,1,'2026-03-16 03:48:11','2026-03-18 02:18:06',0,0),(2,'iboycesar7@gmail.com','123456789','Cesar',2,1,'2026-03-17 04:06:57','2026-03-17 04:07:52',1,0),(3,'walbinramos@example.com','1012','Walbin',2,1,'2026-03-18 02:16:56','2026-03-18 02:18:36',0,0);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-17 20:21:28
