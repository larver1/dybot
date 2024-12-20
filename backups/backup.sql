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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'5% Off 20€ Order',10,'Get a 5% discount off a 20€ Order.','🎟️',20,5,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(2,'10% Off 20€ Order',20,'Get a 10% discount off a 20€ Order.','🎟️',20,10,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(3,'20% Off 20€ Order',40,'Get a 20% discount off a 20€ Order.','🎟️',20,5,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(4,'5% Off 50€ Order',25,'Get a 5% discount off a 50€ Order.','🎟️',50,5,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(5,'10% Off 50€ Order',50,'Get a 10% discount off a 50 Order.','🎟️',50,10,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(6,'20% Off 50€ Order',100,'Get a 20% discount off a 50 Order.','🎟️',50,20,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(7,'5% Off 90€ Order',45,'Get a 5% discount off a 90€ Order.','🎟️',50,5,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(8,'10% Off 90€ Order',90,'Get a 10% discount off a 90€ Order.','🎟️',90,10,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(9,'20% Off 90€ Order',180,'Get a 20% discount off a 90€ Order.','🎟️',90,20,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(10,'5% Off 150€ Order',75,'Get a 5% discount off a 150€ Order.','🎟️',150,5,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(11,'10% Off 150€ Order',150,'Get a 10% discount off a 150€ Order.','🎟️',150,10,'2024-04-01 10:45:08','2024-04-01 10:45:43'),(12,'20% Off 150€ Order',300,'Get a 20% discount off a 150€ Order.','🎟️',150,20,'2024-04-01 10:45:08','2024-04-01 10:45:43');
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,'colorcolor','large',0,'2024-04-01 10:52:13','2024-04-01 10:52:13'),(2,1,'colorcolor','small',0,'2024-04-01 10:52:13','2024-04-01 10:52:13'),(3,1,'animated','small',0,'2024-04-01 10:52:13','2024-04-01 10:52:13'),(4,2,'sketch','medium',3,'2024-04-02 05:31:01','2024-04-02 05:31:01'),(5,3,'colorblack','xl',0,'2024-04-02 05:34:23','2024-04-02 05:34:23'),(6,3,'colorblack','xl',0,'2024-04-02 05:34:23','2024-04-02 05:34:23'),(7,4,'colorcolor','xl',0,'2024-04-02 06:50:45','2024-04-02 06:50:45'),(8,5,'colorcolor','large',0,'2024-04-02 06:51:21','2024-04-02 06:51:21'),(9,6,'colorcolor','xl',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(10,6,'colorcolor','medium',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(11,6,'colorcolor','small',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(12,6,'colorcolor','small',0,'2024-04-02 06:58:52','2024-04-02 06:58:52'),(13,7,'colorcolor','small',0,'2024-04-02 18:00:15','2024-04-02 18:00:15'),(14,7,'colorcolor','small',0,'2024-04-02 18:00:15','2024-04-02 18:00:15'),(15,8,'colorblack','small',0,'2024-05-13 13:52:18','2024-05-13 13:52:18'),(16,9,'colorblack','large',3,'2024-06-11 04:13:13','2024-06-11 04:13:13'),(17,10,'colorblack','medium',0,'2024-06-12 18:13:40','2024-06-12 18:13:40'),(18,11,'colorblack','medium',0,'2024-06-29 19:40:04','2024-06-29 19:40:04'),(19,12,'colorblack','small',0,'2024-07-22 21:16:13','2024-07-22 21:16:13'),(20,13,'sketch','medium',3,'2024-08-06 15:28:38','2024-08-06 15:28:38'),(21,14,'colorcolor','medium',0,'2024-09-09 06:54:17','2024-09-09 06:54:17'),(22,15,'colorblack','small',0,'2024-09-09 09:38:14','2024-09-09 09:38:14'),(23,16,'colorblack','medium',3,'2024-09-11 10:40:58','2024-09-11 10:40:58'),(24,17,'colorblack','medium',0,'2024-09-18 09:12:10','2024-09-18 09:12:10'),(25,18,'colorblack','medium',0,'2024-10-28 10:48:24','2024-10-28 10:48:24'),(26,19,'colorcolor','medium',3,'2024-11-08 08:31:47','2024-11-08 08:31:47'),(27,21,'twitch','small',0,'2024-12-20 22:09:00','2024-12-20 22:09:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'129366727048953856',0,'complete','2024-04-01 10:52:13','2024-06-11 12:51:48'),(2,'715889450248437780',0,'cancelled','2024-04-02 05:31:01','2024-04-02 18:01:33'),(3,'833840694740516895',0,'complete','2024-04-02 05:34:23','2024-07-11 14:31:31'),(4,'1116153115427754106',0,'cancelled','2024-04-02 06:50:45','2024-04-02 06:57:51'),(5,'1116153115427754106',0,'cancelled','2024-04-02 06:51:21','2024-04-02 06:58:00'),(6,'1116153115427754106',0,'complete','2024-04-02 06:58:52','2024-07-25 07:26:13'),(7,'129366727048953856',0,'complete','2024-04-02 18:00:15','2024-09-07 10:36:47'),(8,'715889450248437780',0,'cancelled','2024-05-13 13:52:18','2024-09-10 15:53:24'),(9,'715889450248437780',0,'complete','2024-06-11 04:13:13','2024-06-12 18:14:16'),(10,'937440341047541811',0,'complete','2024-06-12 18:13:40','2024-09-11 10:40:00'),(11,'232091003534835722',0,'complete','2024-06-29 19:40:04','2024-10-31 15:24:01'),(12,'833840694740516895',0,'cancelled','2024-07-22 21:16:13','2024-09-09 10:00:17'),(13,'715889450248437780',0,'cancelled','2024-08-06 15:28:38','2024-09-10 16:23:31'),(14,'1116153115427754106',0,'received','2024-09-09 06:54:17','2024-09-09 06:54:17'),(15,'252098592360103937',0,'cancelled','2024-09-09 09:38:14','2024-10-28 07:53:35'),(16,'715889450248437780',0,'cancelled','2024-09-11 10:40:58','2024-10-31 15:52:23'),(17,'119146493524312066',0,'started','2024-09-18 09:12:10','2024-11-07 11:36:45'),(18,'821381838151876709',0,'received','2024-10-28 10:48:24','2024-10-28 10:48:24'),(19,'1116153115427754106',0,'complete','2024-11-08 08:31:47','2024-11-11 13:09:28'),(20,'184717700239589377',0,'cancelled','2024-12-20 22:07:22','2024-12-20 22:13:19'),(21,'184717700239589377',0,'cancelled','2024-12-20 22:09:00','2024-12-20 22:13:36');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20241220203841-create-migration.js'),('20241220220804-create-migration.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `user_coupons` ENABLE KEYS */;
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
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1116153115427754106',94,1,0,'2024-04-02 06:50:04','2024-11-08 08:31:47'),('119146493524312066',6,1,0,'2024-06-12 08:53:45','2024-09-18 09:12:12'),('129366727048953856',76,0,0,'2024-04-01 10:51:06','2024-09-10 11:57:18'),('184717700239589377',12,1,0,'2024-04-01 10:49:53','2024-12-20 22:09:01'),('232091003534835722',130,1,0,'2024-04-02 17:03:34','2024-10-27 20:17:51'),('252098592360103937',0,1,0,'2024-09-09 08:30:19','2024-09-09 09:38:16'),('263688147504857089',0,1,0,'2024-05-13 13:56:18','2024-05-13 13:57:48'),('434370404853874688',0,1,0,'2024-06-12 21:40:58','2024-06-12 21:40:58'),('503999914141941761',0,1,0,'2024-10-28 11:06:01','2024-10-28 11:06:01'),('535774350746320897',0,1,0,'2024-10-22 08:52:22','2024-10-22 08:52:22'),('715889450248437780',0,1,0,'2024-04-01 10:55:09','2024-12-20 22:06:26'),('718911016200700005',0,1,0,'2024-06-27 17:54:25','2024-06-27 17:54:25'),('821381838151876709',0,1,0,'2024-10-28 10:45:27','2024-10-28 10:48:27'),('833840694740516895',106,1,0,'2024-04-02 05:25:09','2024-09-10 18:08:03'),('937440341047541811',147,1,0,'2024-04-02 17:00:46','2024-09-10 19:26:10');
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

-- Dump completed on 2024-12-20 22:14:36
