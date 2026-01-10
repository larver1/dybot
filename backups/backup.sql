-- MySQL dump 10.13  Distrib 8.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: DyBot
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `commands`
--

DROP TABLE IF EXISTS `commands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commandName` varchar(255) NOT NULL,
  `locked` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `commandName` (`commandName`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commands`
--

LOCK TABLES `commands` WRITE;
/*!40000 ALTER TABLE `commands` DISABLE KEYS */;
INSERT INTO `commands` VALUES (1,'givecoupon',0),(2,'givepoints',0),(3,'lockcommand',0),(4,'reload',0),(5,'takecoupon',0),(6,'takepoints',0),(7,'toggle',0),(8,'commission',0),(9,'commissionlist',0),(10,'coupons',0),(11,'help',0),(12,'leaderboard',0),(13,'profile',0),(14,'transfer',0),(15,'archive',0),(16,'favourite',0),(17,'giveaway',0),(18,'inspect',0),(19,'open',0),(20,'trade',0),(21,'tradebox',0);
/*!40000 ALTER TABLE `commands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `coupon_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `cost` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `emoji` varchar(255) NOT NULL,
  `value` int NOT NULL DEFAULT '20',
  `discount` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`coupon_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'5% Off 20€ Order',10,'Get a 5% discount off a 20€ Order.','🎟️',20,5,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(2,'10% Off 20€ Order',20,'Get a 10% discount off a 20€ Order.','🎟️',20,10,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(3,'20% Off 20€ Order',40,'Get a 20% discount off a 20€ Order.','🎟️',20,5,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(4,'5% Off 50€ Order',25,'Get a 5% discount off a 50€ Order.','🎟️',50,5,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(5,'10% Off 50€ Order',50,'Get a 10% discount off a 50 Order.','🎟️',50,10,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(6,'20% Off 50€ Order',100,'Get a 20% discount off a 50 Order.','🎟️',50,20,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(7,'5% Off 90€ Order',45,'Get a 5% discount off a 90€ Order.','🎟️',50,5,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(8,'10% Off 90€ Order',90,'Get a 10% discount off a 90€ Order.','🎟️',90,10,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(9,'20% Off 90€ Order',180,'Get a 20% discount off a 90€ Order.','🎟️',90,20,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(10,'5% Off 150€ Order',75,'Get a 5% discount off a 150€ Order.','🎟️',150,5,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(11,'10% Off 150€ Order',150,'Get a 10% discount off a 150€ Order.','🎟️',150,10,'2024-04-01 10:45:08','2026-01-10 22:08:44'),(12,'20% Off 150€ Order',300,'Get a 20% discount off a 150€ Order.','🎟️',150,20,'2024-04-01 10:45:08','2026-01-10 22:08:44');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `type` enum('sketch','lineart','colorblack','colorcolor','animated','twitch','pfp','big') NOT NULL,
  `size` enum('small','medium','large','xl') NOT NULL,
  `express` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`item_id`,`order_id`),
  KEY `order_items_item_id` (`item_id`),
  KEY `order_items_order_id` (`order_id`),
  KEY `order_items_item_id_order_id` (`item_id`,`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,'colorcolor','large',0,'2024-04-01 10:52:13','2024-04-01 10:52:13'),(2,1,'colorcolor','small',0,'2024-04-01 10:52:13','2024-04-01 10:52:13'),(3,1,'animated','small',0,'2024-04-01 10:52:13','2024-04-01 10:52:13'),(4,2,'sketch','medium',3,'2024-04-02 05:31:01','2024-04-02 05:31:01'),(5,3,'colorblack','xl',0,'2024-04-02 05:34:23','2024-04-02 05:34:23'),(6,3,'colorblack','xl',0,'2024-04-02 05:34:23','2024-04-02 05:34:23'),(7,4,'colorcolor','xl',0,'2024-04-02 06:50:45','2024-04-02 06:50:45'),(8,5,'colorcolor','large',0,'2024-04-02 06:51:21','2024-04-02 06:51:21'),(9,6,'colorcolor','xl',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(10,6,'colorcolor','medium',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(11,6,'colorcolor','small',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(12,6,'colorcolor','small',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(13,7,'colorcolor','small',0,'2024-04-02 18:00:15','2024-04-02 18:00:15'),(14,7,'colorcolor','small',0,'2024-04-02 18:00:15','2024-04-02 18:00:15'),(15,8,'colorblack','small',0,'2024-05-13 13:52:18','2024-05-13 13:52:18'),(16,9,'colorblack','large',3,'2024-06-11 04:13:13','2024-06-11 04:13:13'),(17,10,'colorblack','medium',0,'2024-06-12 18:13:40','2024-06-12 18:13:40'),(18,11,'colorblack','medium',0,'2024-06-29 19:40:04','2024-06-29 19:40:04'),(19,12,'colorblack','small',0,'2024-07-22 21:16:13','2024-07-22 21:16:13'),(20,13,'sketch','medium',3,'2024-08-06 15:28:38','2024-08-06 15:28:38'),(21,14,'colorcolor','medium',0,'2024-09-09 06:54:17','2024-09-09 06:54:17'),(22,15,'colorblack','small',0,'2024-09-09 09:38:14','2024-09-09 09:38:14'),(23,16,'colorblack','medium',3,'2024-09-11 10:40:58','2024-09-11 10:40:58'),(24,17,'colorblack','medium',0,'2024-09-18 09:12:10','2024-09-18 09:12:10'),(25,18,'colorblack','medium',0,'2024-10-28 10:48:24','2024-10-28 10:48:24'),(26,19,'colorcolor','medium',3,'2024-11-08 08:31:47','2024-11-08 08:31:47'),(27,21,'twitch','small',0,'2024-12-20 22:09:00','2024-12-20 22:09:00'),(28,22,'twitch','small',0,'2024-12-20 22:27:46','2024-12-20 22:27:46'),(29,23,'colorblack','large',0,'2025-01-27 15:51:48','2025-01-27 15:51:48'),(30,24,'colorblack','medium',0,'2025-01-28 10:51:29','2025-01-28 10:51:29'),(31,24,'colorcolor','medium',0,'2025-01-28 10:51:30','2025-01-28 10:51:30'),(32,24,'animated','small',0,'2025-01-28 10:51:30','2025-01-28 10:51:30'),(33,25,'colorcolor','xl',0,'2025-01-29 08:19:15','2025-01-29 08:19:15'),(34,26,'colorblack','small',0,'2025-03-10 21:22:49','2025-03-10 21:22:49'),(35,27,'colorblack','small',0,'2025-03-10 23:09:07','2025-03-10 23:09:07'),(36,28,'colorblack','medium',0,'2025-03-25 19:12:42','2025-03-25 19:12:42'),(37,29,'colorblack','medium',0,'2025-03-28 05:15:25','2025-03-28 05:15:25'),(38,30,'colorblack','xl',0,'2025-03-28 11:38:27','2025-03-28 11:38:27'),(39,31,'colorcolor','medium',0,'2025-04-01 09:52:51','2025-04-01 09:52:51'),(40,32,'colorblack','small',0,'2025-04-11 16:46:51','2025-04-11 16:46:51'),(41,32,'animated','small',0,'2025-04-11 16:46:51','2025-04-11 16:46:51'),(42,33,'pfp','small',0,'2025-04-12 17:00:26','2025-04-12 17:00:26'),(43,34,'colorcolor','medium',0,'2025-05-14 09:02:48','2025-05-14 09:02:48'),(44,35,'colorblack','medium',0,'2025-08-20 11:14:09','2025-08-20 11:14:09'),(45,36,'colorblack','large',0,'2025-10-15 16:56:49','2025-10-15 16:56:49');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `coupon_id` int DEFAULT '0',
  `status` enum('received','started','complete','cancelled') NOT NULL DEFAULT 'received',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `orders_user_id` (`user_id`),
  KEY `orders_order_id` (`order_id`),
  KEY `orders_user_id_order_id` (`user_id`,`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'129366727048953856',0,'complete','2024-04-01 10:52:13','2024-06-11 12:51:48'),(2,'715889450248437780',0,'cancelled','2024-04-02 05:31:01','2024-04-02 18:01:33'),(3,'833840694740516895',0,'complete','2024-04-02 05:34:23','2024-07-11 14:31:31'),(4,'1116153115427754106',0,'cancelled','2024-04-02 06:50:45','2024-04-02 06:57:51'),(5,'1116153115427754106',0,'cancelled','2024-04-02 06:51:21','2024-04-02 06:58:00'),(6,'1116153115427754106',0,'complete','2024-04-02 06:58:52','2024-07-25 07:26:13'),(7,'129366727048953856',0,'complete','2024-04-02 18:00:15','2024-09-07 10:36:47'),(8,'715889450248437780',0,'cancelled','2024-05-13 13:52:18','2024-09-10 15:53:24'),(9,'715889450248437780',0,'complete','2024-06-11 04:13:13','2024-06-12 18:14:16'),(10,'937440341047541811',0,'complete','2024-06-12 18:13:40','2024-09-11 10:40:00'),(11,'232091003534835722',0,'complete','2024-06-29 19:40:04','2024-10-31 15:24:01'),(12,'833840694740516895',0,'cancelled','2024-07-22 21:16:13','2024-09-09 10:00:17'),(13,'715889450248437780',0,'cancelled','2024-08-06 15:28:38','2024-09-10 16:23:31'),(14,'1116153115427754106',0,'complete','2024-09-09 06:54:17','2025-01-13 06:19:01'),(15,'252098592360103937',0,'cancelled','2024-09-09 09:38:14','2024-10-28 07:53:35'),(16,'715889450248437780',0,'cancelled','2024-09-11 10:40:58','2024-10-31 15:52:23'),(17,'119146493524312066',0,'complete','2024-09-18 09:12:10','2025-01-02 08:25:32'),(18,'821381838151876709',0,'complete','2024-10-28 10:48:24','2025-01-27 15:57:32'),(19,'1116153115427754106',0,'complete','2024-11-08 08:31:47','2024-11-11 13:09:28'),(20,'184717700239589377',0,'cancelled','2024-12-20 22:07:22','2024-12-20 22:13:19'),(21,'184717700239589377',0,'cancelled','2024-12-20 22:09:00','2024-12-20 22:13:36'),(22,'184717700239589377',0,'cancelled','2024-12-20 22:27:46','2024-12-20 22:42:28'),(23,'821381838151876709',0,'complete','2025-01-27 15:51:48','2025-03-18 17:55:20'),(24,'1241785558154608711',0,'complete','2025-01-28 10:51:29','2025-07-15 16:27:43'),(25,'1116153115427754106',0,'complete','2025-01-29 08:19:15','2025-03-18 17:55:37'),(26,'766286355902627841',0,'cancelled','2025-03-10 21:22:48','2025-03-10 23:08:17'),(27,'766286355902627841',0,'complete','2025-03-10 23:09:07','2025-07-16 05:11:22'),(28,'232091003534835722',0,'complete','2025-03-25 19:12:42','2025-11-21 14:52:18'),(29,'311578593509507072',0,'complete','2025-03-28 05:15:25','2025-12-01 17:19:47'),(30,'434381911872503831',0,'complete','2025-03-28 11:38:27','2025-12-22 19:03:15'),(31,'503999914141941761',0,'received','2025-04-01 09:52:51','2025-04-01 09:52:51'),(32,'232091003534835722',0,'cancelled','2025-04-11 16:46:51','2025-12-29 21:39:59'),(33,'232091003534835722',0,'cancelled','2025-04-12 17:00:26','2025-12-29 21:40:11'),(34,'1116153115427754106',0,'received','2025-05-14 09:02:48','2025-05-14 09:02:48'),(35,'245711912786984980',0,'received','2025-08-20 11:14:09','2025-08-20 11:14:09'),(36,'937440341047541811',0,'received','2025-10-15 16:56:49','2025-10-15 16:56:49');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20241220203841-create-migration.js'),('20241220220804-create-migration.js'),('20260110214836-create-user.js'),('20260110215759-create-usernh.js'),('20260110220320-create-usernhmn.js'),('addUserCards.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_archives`
--

DROP TABLE IF EXISTS `user_archives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_archives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `dex_id` int NOT NULL,
  `rarity` varchar(255) NOT NULL,
  `star` tinyint(1) DEFAULT NULL,
  `gold` tinyint(1) DEFAULT NULL,
  `holo` tinyint(1) DEFAULT '0',
  `first_edition` tinyint(1) DEFAULT '0',
  `name` varchar(255) DEFAULT NULL,
  `emoji` varchar(255) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_archives_user_id` (`user_id`),
  KEY `user_archives_dex_id` (`dex_id`),
  KEY `user_archives_user_id_dex_id` (`user_id`,`dex_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_archives`
--

LOCK TABLES `user_archives` WRITE;
/*!40000 ALTER TABLE `user_archives` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_archives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_cards`
--

DROP TABLE IF EXISTS `user_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cards` (
  `card_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `dex_id` int NOT NULL,
  `fav` tinyint(1) DEFAULT '0',
  `rarity` varchar(255) NOT NULL,
  `star` tinyint(1) DEFAULT NULL,
  `gold` tinyint(1) DEFAULT NULL,
  `holo` tinyint(1) DEFAULT '0',
  `lvl` int DEFAULT '1',
  `first_edition` tinyint(1) DEFAULT '0',
  `in_tradebox` tinyint(1) DEFAULT '0',
  `name` varchar(255) DEFAULT NULL,
  `emoji` varchar(255) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`card_id`),
  KEY `user_cards_user_id` (`user_id`),
  KEY `user_cards_card_id` (`card_id`),
  KEY `user_cards_dex_id` (`dex_id`),
  KEY `user_cards_user_id_card_id` (`user_id`,`card_id`),
  KEY `user_cards_user_id_dex_id` (`user_id`,`dex_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_cards`
--

LOCK TABLES `user_cards` WRITE;
/*!40000 ALTER TABLE `user_cards` DISABLE KEYS */;
INSERT INTO `user_cards` VALUES (1,'184717700239589377',2,0,'Uncommon',1,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:00:33','2026-01-10 22:00:33'),(2,'184717700239589377',2,0,'Common',1,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:00:34','2026-01-10 22:00:34'),(3,'184717700239589377',1,0,'Common',0,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:00:34','2026-01-10 22:00:34'),(4,'184717700239589377',1,0,'Uncommon',1,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:00:34','2026-01-10 22:00:34'),(5,'184717700239589377',1,0,'Rare',0,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:00:34','2026-01-10 22:00:34'),(6,'184717700239589377',1,0,'Common',0,0,1,1,1,0,NULL,NULL,NULL,'2026-01-10 22:05:01','2026-01-10 22:05:01'),(7,'184717700239589377',3,0,'Common',0,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:05:01','2026-01-10 22:05:01'),(8,'184717700239589377',1,0,'Common',1,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:05:01','2026-01-10 22:05:01'),(9,'184717700239589377',3,0,'Uncommon',0,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:05:01','2026-01-10 22:05:01'),(10,'184717700239589377',3,0,'Rare',0,0,0,1,1,0,NULL,NULL,NULL,'2026-01-10 22:05:01','2026-01-10 22:05:01');
/*!40000 ALTER TABLE `user_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_coupons`
--

DROP TABLE IF EXISTS `user_coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_coupons` (
  `user_id` varchar(255) NOT NULL,
  `coupon_id` varchar(255) NOT NULL,
  `amount` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`user_id`,`coupon_id`),
  KEY `user_coupons_user_id` (`user_id`),
  KEY `user_coupons_coupon_id` (`coupon_id`),
  KEY `user_coupons_user_id_coupon_id` (`user_id`,`coupon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_coupons`
--

LOCK TABLES `user_coupons` WRITE;
/*!40000 ALTER TABLE `user_coupons` DISABLE KEYS */;
INSERT INTO `user_coupons` VALUES ('1116153115427754106','9',0,'2025-01-29 08:20:01','2025-01-29 08:21:43'),('715889450248437780','6',1,'2025-01-29 08:15:11','2025-01-29 08:15:11');
/*!40000 ALTER TABLE `user_coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usercards`
--

DROP TABLE IF EXISTS `usercards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usercards` (
  `card_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `dex_id` int NOT NULL,
  `fav` tinyint(1) DEFAULT '0',
  `rarity` varchar(255) NOT NULL,
  `star` tinyint(1) DEFAULT NULL,
  `gold` tinyint(1) DEFAULT NULL,
  `holo` tinyint(1) DEFAULT '0',
  `lvl` int DEFAULT '1',
  `first_edition` tinyint(1) DEFAULT '0',
  `in_tradebox` tinyint(1) DEFAULT '0',
  `name` varchar(255) DEFAULT NULL,
  `emoji` varchar(255) DEFAULT NULL,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usercards`
--

LOCK TABLES `usercards` WRITE;
/*!40000 ALTER TABLE `usercards` DISABLE KEYS */;
/*!40000 ALTER TABLE `usercards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(255) NOT NULL,
  `balance` int NOT NULL DEFAULT '0',
  `leaderboard` tinyint(1) NOT NULL DEFAULT '1',
  `paused` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `archive` varchar(255) DEFAULT '',
  `first_pack` datetime DEFAULT NULL,
  `last_pack` datetime DEFAULT NULL,
  `level` int DEFAULT '1',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1094155859921211403',0,1,0,'2025-04-03 05:31:13','2025-07-22 13:29:14','',NULL,NULL,1),('1116153115427754106',154,1,0,'2024-04-02 06:50:04','2025-05-15 05:10:17','',NULL,NULL,1),('119146493524312066',24,1,0,'2024-06-12 08:53:45','2025-01-22 13:33:45','',NULL,NULL,1),('1241785558154608711',0,1,0,'2025-01-27 18:08:56','2025-01-28 10:51:31','',NULL,NULL,1),('129366727048953856',152,0,0,'2024-04-01 10:51:06','2025-01-22 13:32:21','',NULL,NULL,1),('184717700239589377',12,1,0,'2024-04-01 10:49:53','2026-01-10 22:05:02','2USN1,2CSN1,1CNN1,1USN1,1RNN1,1CNH1,3CNN1,1CSN1,3UNN1,3RNN1,','2026-01-10 22:00:33','2026-01-10 22:05:02',1),('232091003534835722',130,1,0,'2024-04-02 17:03:34','2025-04-12 17:00:27','',NULL,NULL,1),('245711912786984980',0,0,0,'2025-08-20 05:46:11','2025-08-20 11:14:11','',NULL,NULL,1),('252098592360103937',0,1,0,'2024-09-09 08:30:19','2024-09-09 09:38:16','',NULL,NULL,1),('263688147504857089',0,1,0,'2024-05-13 13:56:18','2024-05-13 13:57:48','',NULL,NULL,1),('311578593509507072',50,1,0,'2025-03-28 05:12:18','2025-12-01 17:12:20','',NULL,NULL,1),('434370404853874688',0,1,0,'2024-06-12 21:40:58','2024-06-12 21:40:58','',NULL,NULL,1),('434381911872503831',53,1,0,'2025-03-28 11:35:48','2025-12-22 19:02:44','',NULL,NULL,1),('503999914141941761',0,1,0,'2024-10-28 11:06:01','2025-04-01 09:52:52','',NULL,NULL,1),('521551601349951488',0,1,0,'2025-04-08 18:56:05','2025-04-08 18:56:05','',NULL,NULL,1),('535774350746320897',0,1,0,'2024-10-22 08:52:22','2024-10-22 08:52:22','',NULL,NULL,1),('715889450248437780',0,1,0,'2024-04-01 10:55:09','2025-03-22 10:55:02','',NULL,NULL,1),('718911016200700005',0,1,0,'2024-06-27 17:54:25','2024-06-27 17:54:25','',NULL,NULL,1),('766286355902627841',6,1,0,'2025-03-10 21:21:27','2025-08-12 17:39:16','',NULL,NULL,1),('821381838151876709',51,1,0,'2024-10-28 10:45:27','2025-03-17 17:33:44','',NULL,NULL,1),('833840694740516895',106,1,0,'2024-04-02 05:25:09','2024-09-10 18:08:03','',NULL,NULL,1),('937440341047541811',165,1,0,'2024-04-02 17:00:46','2025-10-15 16:56:50','',NULL,NULL,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'DyBot'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-10 22:09:31
