# SQL Commands Report

## List 1: CREATE TABLE Statements

### 1. circuits
```sql
CREATE TABLE `circuits` (
  `circuitId` int NOT NULL,
  `circuitRef` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `alt` int DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`circuitId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 2. constructor_results
```sql
CREATE TABLE `constructor_results` (
  `constructorResultsId` int NOT NULL,
  `raceId` int DEFAULT NULL,
  `constructorId` int DEFAULT NULL,
  `points` decimal(8,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`constructorResultsId`),
  KEY `raceId` (`raceId`),
  KEY `constructorId` (`constructorId`),
  CONSTRAINT `constructor_results_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `constructor_results_ibfk_2` FOREIGN KEY (`constructorId`) REFERENCES `constructors` (`constructorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 3. constructor_standings
```sql
CREATE TABLE `constructor_standings` (
  `constructorStandingsId` int NOT NULL,
  `raceId` int DEFAULT NULL,
  `constructorId` int DEFAULT NULL,
  `points` decimal(8,2) DEFAULT NULL,
  `position` int DEFAULT NULL,
  `positionText` varchar(10) DEFAULT NULL,
  `wins` int DEFAULT NULL,
  PRIMARY KEY (`constructorStandingsId`),
  KEY `raceId` (`raceId`),
  KEY `constructorId` (`constructorId`),
  CONSTRAINT `constructor_standings_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `constructor_standings_ibfk_2` FOREIGN KEY (`constructorId`) REFERENCES `constructors` (`constructorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 4. constructors
```sql
CREATE TABLE `constructors` (
  `constructorId` int NOT NULL AUTO_INCREMENT,
  `constructorRef` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`constructorId`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 5. driver_standings
```sql
CREATE TABLE `driver_standings` (
  `driverStandingsId` int NOT NULL,
  `raceId` int DEFAULT NULL,
  `driverId` int DEFAULT NULL,
  `points` decimal(8,2) DEFAULT NULL,
  `position` int DEFAULT NULL,
  `positionText` varchar(10) DEFAULT NULL,
  `wins` int DEFAULT NULL,
  PRIMARY KEY (`driverStandingsId`),
  KEY `raceId` (`raceId`),
  KEY `driverId` (`driverId`),
  CONSTRAINT `driver_standings_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `driver_standings_ibfk_2` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`driverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 6. drivers
```sql
CREATE TABLE `drivers` (
  `driverId` int NOT NULL AUTO_INCREMENT,
  `driverRef` varchar(50) DEFAULT NULL,
  `number` int DEFAULT NULL,
  `code` varchar(3) DEFAULT NULL,
  `forename` varchar(50) DEFAULT NULL,
  `surname` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`driverId`)
) ENGINE=InnoDB AUTO_INCREMENT=865 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 7. lap_times
```sql
CREATE TABLE `lap_times` (
  `raceId` int NOT NULL,
  `driverId` int NOT NULL,
  `lap` int NOT NULL,
  `position` int DEFAULT NULL,
  `time` varchar(20) DEFAULT NULL,
  `milliseconds` int DEFAULT NULL,
  PRIMARY KEY (`raceId`,`driverId`,`lap`),
  KEY `driverId` (`driverId`),
  CONSTRAINT `lap_times_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `lap_times_ibfk_2` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`driverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 8. pit_stops
```sql
CREATE TABLE `pit_stops` (
  `raceId` int NOT NULL,
  `driverId` int NOT NULL,
  `stop` int NOT NULL,
  `lap` int DEFAULT NULL,
  `time` varchar(20) DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `milliseconds` int DEFAULT NULL,
  PRIMARY KEY (`raceId`,`driverId`,`stop`),
  KEY `driverId` (`driverId`),
  CONSTRAINT `pit_stops_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `pit_stops_ibfk_2` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`driverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 9. qualifying
```sql
CREATE TABLE `qualifying` (
  `qualifyId` int NOT NULL,
  `raceId` int DEFAULT NULL,
  `driverId` int DEFAULT NULL,
  `constructorId` int DEFAULT NULL,
  `number` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `q1` varchar(20) DEFAULT NULL,
  `q2` varchar(20) DEFAULT NULL,
  `q3` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`qualifyId`),
  KEY `raceId` (`raceId`),
  KEY `driverId` (`driverId`),
  KEY `constructorId` (`constructorId`),
  CONSTRAINT `qualifying_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `qualifying_ibfk_2` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`driverId`),
  CONSTRAINT `qualifying_ibfk_3` FOREIGN KEY (`constructorId`) REFERENCES `constructors` (`constructorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 10. races
```sql
CREATE TABLE `races` (
  `raceId` int NOT NULL,
  `year` int DEFAULT NULL,
  `round` int DEFAULT NULL,
  `circuitId` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `fp1_date` date DEFAULT NULL,
  `fp1_time` time DEFAULT NULL,
  `fp2_date` date DEFAULT NULL,
  `fp2_time` time DEFAULT NULL,
  `fp3_date` date DEFAULT NULL,
  `fp3_time` time DEFAULT NULL,
  `quali_date` date DEFAULT NULL,
  `quali_time` time DEFAULT NULL,
  `sprint_date` date DEFAULT NULL,
  `sprint_time` time DEFAULT NULL,
  PRIMARY KEY (`raceId`),
  KEY `year` (`year`),
  KEY `circuitId` (`circuitId`),
  CONSTRAINT `races_ibfk_1` FOREIGN KEY (`circuitId`) REFERENCES `circuits` (`circuitId`),
  CONSTRAINT `races_ibfk_2` FOREIGN KEY (`year`) REFERENCES `seasons` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 11. results
```sql
CREATE TABLE `results` (
  `resultId` int NOT NULL,
  `raceId` int DEFAULT NULL,
  `driverId` int DEFAULT NULL,
  `constructorId` int DEFAULT NULL,
  `number` int DEFAULT NULL,
  `grid` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `positionText` varchar(10) DEFAULT NULL,
  `positionOrder` int DEFAULT NULL,
  `points` decimal(8,2) DEFAULT NULL,
  `laps` int DEFAULT NULL,
  `time` varchar(20) DEFAULT NULL,
  `milliseconds` int DEFAULT NULL,
  `fastestLap` int DEFAULT NULL,
  `rank` int DEFAULT NULL,
  `fastestLapTime` varchar(20) DEFAULT NULL,
  `fastestLapSpeed` decimal(8,2) DEFAULT NULL,
  `statusId` int DEFAULT NULL,
  PRIMARY KEY (`resultId`),
  KEY `raceId` (`raceId`),
  KEY `driverId` (`driverId`),
  KEY `constructorId` (`constructorId`),
  KEY `statusId` (`statusId`),
  CONSTRAINT `results_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `results_ibfk_2` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`driverId`),
  CONSTRAINT `results_ibfk_3` FOREIGN KEY (`constructorId`) REFERENCES `constructors` (`constructorId`),
  CONSTRAINT `results_ibfk_4` FOREIGN KEY (`statusId`) REFERENCES `status` (`statusId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 12. seasons
```sql
CREATE TABLE `seasons` (
  `year` int NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 13. sprint_results
```sql
CREATE TABLE `sprint_results` (
  `resultId` int NOT NULL,
  `raceId` int DEFAULT NULL,
  `driverId` int DEFAULT NULL,
  `constructorId` int DEFAULT NULL,
  `number` int DEFAULT NULL,
  `grid` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `positionText` varchar(10) DEFAULT NULL,
  `positionOrder` int DEFAULT NULL,
  `points` decimal(8,2) DEFAULT NULL,
  `laps` int DEFAULT NULL,
  `time` varchar(20) DEFAULT NULL,
  `milliseconds` int DEFAULT NULL,
  `fastestLap` int DEFAULT NULL,
  `fastestLapTime` varchar(20) DEFAULT NULL,
  `statusId` int DEFAULT NULL,
  PRIMARY KEY (`resultId`),
  KEY `raceId` (`raceId`),
  KEY `driverId` (`driverId`),
  KEY `constructorId` (`constructorId`),
  KEY `statusId` (`statusId`),
  CONSTRAINT `sprint_results_ibfk_1` FOREIGN KEY (`raceId`) REFERENCES `races` (`raceId`),
  CONSTRAINT `sprint_results_ibfk_2` FOREIGN KEY (`driverId`) REFERENCES `drivers` (`driverId`),
  CONSTRAINT `sprint_results_ibfk_3` FOREIGN KEY (`constructorId`) REFERENCES `constructors` (`constructorId`),
  CONSTRAINT `sprint_results_ibfk_4` FOREIGN KEY (`statusId`) REFERENCES `status` (`statusId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 14. status
```sql
CREATE TABLE `status` (
  `statusId` int NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`statusId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 15. users
```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user','guest') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## List 2: CREATE VIEW Statements

### 1. all_circuits_and_races
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `all_circuits_and_races` AS 
SELECT COALESCE(`c`.`circuitId`,`r`.`circuitId`) AS `circuit_id`,
       `c`.`name` AS `circuit_name`,
       `c`.`country` AS `circuit_country`,
       `r`.`raceId` AS `raceId`,
       `r`.`name` AS `race_name`,
       `r`.`date` AS `race_date`,
       `r`.`year` AS `year` 
FROM (`circuits` `c` LEFT JOIN `races` `r` ON((`c`.`circuitId` = `r`.`circuitId`))) 
UNION 
SELECT `r`.`circuitId` AS `circuit_id`,
       `c`.`name` AS `circuit_name`,
       `c`.`country` AS `circuit_country`,
       `r`.`raceId` AS `raceId`,
       `r`.`name` AS `race_name`,
       `r`.`date` AS `race_date`,
       `r`.`year` AS `year` 
FROM (`races` `r` LEFT JOIN `circuits` `c` ON((`c`.`circuitId` = `r`.`circuitId`))) 
WHERE (`c`.`circuitId` IS NULL);
```

### 2. circuit_statistics
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `circuit_statistics` AS 
SELECT `c`.`name` AS `circuit_name`,
       `c`.`country` AS `country`,
       COUNT(DISTINCT `r`.`raceId`) AS `total_races`,
       COUNT(DISTINCT `r`.`year`) AS `years_hosted`,
       MIN(`r`.`date`) AS `first_race_date`,
       MAX(`r`.`date`) AS `last_race_date`,
       COUNT(DISTINCT `d`.`driverId`) AS `unique_drivers`,
       COUNT(DISTINCT `const`.`constructorId`) AS `unique_constructors` 
FROM ((((`circuits` `c` JOIN `races` `r` ON((`c`.`circuitId` = `r`.`circuitId`))) 
       JOIN `results` `res` ON((`r`.`raceId` = `res`.`raceId`))) 
       JOIN `drivers` `d` ON((`res`.`driverId` = `d`.`driverId`))) 
       JOIN `constructors` `const` ON((`res`.`constructorId` = `const`.`constructorId`))) 
GROUP BY `c`.`circuitId`,`c`.`name`,`c`.`country` 
ORDER BY `total_races` DESC;
```

### 3. driver_performance_details
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `driver_performance_details` AS 
SELECT `d`.`forename` AS `forename`,
       `d`.`surname` AS `surname`,
       `d`.`nationality` AS `driver_nationality`,
       `c`.`name` AS `constructor_name`,
       `c`.`nationality` AS `constructor_nationality`,
       `r`.`name` AS `race_name`,
       `r`.`date` AS `race_date`,
       `res`.`position` AS `position`,
       `res`.`points` AS `points`,
       `res`.`laps` AS `laps`,
       `res`.`time` AS `race_time` 
FROM (((`drivers` `d` JOIN `results` `res` ON((`d`.`driverId` = `res`.`driverId`))) 
       JOIN `constructors` `c` ON((`res`.`constructorId` = `c`.`constructorId`))) 
       JOIN `races` `r` ON((`res`.`raceId` = `r`.`raceId`))) 
WHERE (`res`.`points` > 0) 
ORDER BY `res`.`points` DESC,`res`.`position`;
```

### 4. driver_season_performance
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `driver_season_performance` AS 
SELECT `r`.`year` AS `year`,
       `d`.`forename` AS `forename`,
       `d`.`surname` AS `surname`,
       COUNT(0) AS `races_participated`,
       COUNT((CASE WHEN (`res`.`position` = 1) THEN 1 END)) AS `wins`,
       COUNT((CASE WHEN (`res`.`position` <= 3) THEN 1 END)) AS `podiums`,
       SUM(`res`.`points`) AS `total_points`,
       AVG(`res`.`position`) AS `avg_position` 
FROM ((`drivers` `d` JOIN `results` `res` ON((`d`.`driverId` = `res`.`driverId`))) 
      JOIN `races` `r` ON((`res`.`raceId` = `r`.`raceId`))) 
GROUP BY `r`.`year`,`d`.`driverId`,`d`.`forename`,`d`.`surname` 
ORDER BY `r`.`year` DESC,`total_points` DESC;
```

### 5. drivers_above_constructor_average
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `drivers_above_constructor_average` AS 
SELECT `d`.`forename` AS `forename`,
       `d`.`surname` AS `surname`,
       `c`.`name` AS `constructor_name`,
       COUNT((CASE WHEN (`res`.`position` = 1) THEN 1 END)) AS `driver_wins`,
       (SELECT AVG(`constructor_wins`.`win_count`) 
        FROM (SELECT COUNT((CASE WHEN (`res2`.`position` = 1) THEN 1 END)) AS `win_count` 
              FROM (`results` `res2` JOIN `drivers` `d2` ON((`res2`.`driverId` = `d2`.`driverId`))) 
              WHERE (`res2`.`constructorId` = `res`.`constructorId`) 
              GROUP BY `d2`.`driverId`) `constructor_wins`) AS `avg_constructor_wins` 
FROM ((`drivers` `d` JOIN `results` `res` ON((`d`.`driverId` = `res`.`driverId`))) 
      JOIN `constructors` `c` ON((`res`.`constructorId` = `c`.`constructorId`))) 
GROUP BY `d`.`driverId`,`d`.`forename`,`d`.`surname`,`c`.`name`,`res`.`constructorId` 
HAVING (COUNT((CASE WHEN (`res`.`position` = 1) THEN 1 END)) > 
        (SELECT AVG(`constructor_wins`.`win_count`) 
         FROM (SELECT COUNT((CASE WHEN (`res2`.`position` = 1) THEN 1 END)) AS `win_count` 
               FROM (`results` `res2` JOIN `drivers` `d2` ON((`res2`.`driverId` = `d2`.`driverId`))) 
               WHERE (`res2`.`constructorId` = `res`.`constructorId`) 
               GROUP BY `d2`.`driverId`) `constructor_wins`)) 
ORDER BY `driver_wins` DESC;
```

### 6. drivers_better_than_hamilton
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `drivers_better_than_hamilton` AS 
SELECT `d`.`forename` AS `forename`,
       `d`.`surname` AS `surname`,
       COUNT(0) AS `race_count`,
       AVG(`res`.`position`) AS `avg_position`,
       SUM(`res`.`points`) AS `total_points` 
FROM (`drivers` `d` JOIN `results` `res` ON((`d`.`driverId` = `res`.`driverId`))) 
WHERE `res`.`position` < ANY (SELECT `res2`.`position` 
                               FROM (`results` `res2` JOIN `drivers` `d2` ON((`res2`.`driverId` = `d2`.`driverId`))) 
                               WHERE (`d2`.`surname` = 'Hamilton')) 
GROUP BY `d`.`driverId`,`d`.`forename`,`d`.`surname` 
HAVING (COUNT(0) > 5) 
ORDER BY `total_points` DESC;
```

### 7. pit_stop_analysis
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `pit_stop_analysis` AS 
SELECT `d`.`forename` AS `forename`,
       `d`.`surname` AS `surname`,
       `r`.`name` AS `race_name`,
       `r`.`date` AS `race_date`,
       `ps`.`stop` AS `pit_stop_number`,
       `ps`.`lap` AS `pit_lap`,
       `ps`.`duration` AS `pit_duration`,
       `ps`.`milliseconds` AS `pit_duration_ms`,
       `res`.`position` AS `final_position`,
       (CASE WHEN (`ps`.`milliseconds` < 30000) THEN 'Fast' 
             WHEN (`ps`.`milliseconds` < 45000) THEN 'Average' 
             ELSE 'Slow' END) AS `pit_speed_category` 
FROM (((`drivers` `d` JOIN `pit_stops` `ps` ON((`d`.`driverId` = `ps`.`driverId`))) 
       JOIN `races` `r` ON((`ps`.`raceId` = `r`.`raceId`))) 
       JOIN `results` `res` ON(((`d`.`driverId` = `res`.`driverId`) AND (`r`.`raceId` = `res`.`raceId`)))) 
ORDER BY `ps`.`milliseconds`;
```

### 8. qualifying_vs_race_performance
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `qualifying_vs_race_performance` AS 
SELECT `d`.`forename` AS `forename`,
       `d`.`surname` AS `surname`,
       `r`.`name` AS `race_name`,
       `r`.`date` AS `race_date`,
       `q`.`position` AS `qualifying_position`,
       `res`.`position` AS `race_position`,
       (`q`.`position` - `res`.`position`) AS `position_gain_loss`,
       (CASE WHEN ((`q`.`position` - `res`.`position`) > 0) THEN 'Gained Positions' 
             WHEN ((`q`.`position` - `res`.`position`) < 0) THEN 'Lost Positions' 
             ELSE 'Same Position' END) AS `performance_category` 
FROM (((`drivers` `d` JOIN `qualifying` `q` ON((`d`.`driverId` = `q`.`driverId`))) 
       JOIN `races` `r` ON((`q`.`raceId` = `r`.`raceId`))) 
       JOIN `results` `res` ON(((`d`.`driverId` = `res`.`driverId`) AND (`r`.`raceId` = `res`.`raceId`)))) 
WHERE ((`q`.`position` IS NOT NULL) AND (`res`.`position` IS NOT NULL)) 
ORDER BY (`q`.`position` - `res`.`position`) DESC;
```

### 9. race_winners_and_fastest_lap_drivers
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `race_winners_and_fastest_lap_drivers` AS 
SELECT DISTINCT `d`.`forename` AS `forename`,
                `d`.`surname` AS `surname`,
                'Race Winner' AS `achievement_type`,
                `r`.`name` AS `race_name`,
                `r`.`date` AS `achievement_date` 
FROM ((`drivers` `d` JOIN `results` `res` ON((`d`.`driverId` = `res`.`driverId`))) 
      JOIN `races` `r` ON((`res`.`raceId` = `r`.`raceId`))) 
WHERE (`res`.`position` = 1) 
UNION 
SELECT DISTINCT `d`.`forename` AS `forename`,
                `d`.`surname` AS `surname`,
                'Fastest Lap' AS `achievement_type`,
                `r`.`name` AS `race_name`,
                `r`.`date` AS `achievement_date` 
FROM ((`drivers` `d` JOIN `results` `res` ON((`d`.`driverId` = `res`.`driverId`))) 
      JOIN `races` `r` ON((`res`.`raceId` = `r`.`raceId`))) 
WHERE (`res`.`fastestLap` = 1) 
ORDER BY `achievement_date` DESC;
```

### 10. top_constructors_by_points
```sql
CREATE ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` SQL SECURITY DEFINER 
VIEW `top_constructors_by_points` AS 
SELECT `c`.`name` AS `constructor_name`,
       `c`.`nationality` AS `nationality`,
       COUNT(DISTINCT `r`.`raceId`) AS `races_participated`,
       SUM(`res`.`points`) AS `total_points`,
       COUNT((CASE WHEN (`res`.`position` = 1) THEN 1 END)) AS `total_wins`,
       AVG(`res`.`points`) AS `avg_points_per_race` 
FROM ((`constructors` `c` JOIN `results` `res` ON((`c`.`constructorId` = `res`.`constructorId`))) 
      JOIN `races` `r` ON((`res`.`raceId` = `r`.`raceId`))) 
GROUP BY `c`.`constructorId`,`c`.`name`,`c`.`nationality` 
HAVING (COUNT(DISTINCT `r`.`raceId`) > 10) 
ORDER BY `total_points` DESC;
```

