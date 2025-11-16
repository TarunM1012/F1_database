-- Phase 2 Views for Formula 1 Database
-- This file contains all database views used by the application

-- 1. all_circuits_and_races
CREATE OR REPLACE VIEW `all_circuits_and_races` AS 
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

-- 2. circuit_statistics
CREATE OR REPLACE VIEW `circuit_statistics` AS 
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

-- 3. driver_performance_details
CREATE OR REPLACE VIEW `driver_performance_details` AS 
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

-- 4. driver_season_performance
CREATE OR REPLACE VIEW `driver_season_performance` AS 
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

-- 5. drivers_above_constructor_average
CREATE OR REPLACE VIEW `drivers_above_constructor_average` AS 
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

-- 6. drivers_better_than_hamilton
CREATE OR REPLACE VIEW `drivers_better_than_hamilton` AS 
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

-- 7. pit_stop_analysis
CREATE OR REPLACE VIEW `pit_stop_analysis` AS 
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

-- 8. qualifying_vs_race_performance
CREATE OR REPLACE VIEW `qualifying_vs_race_performance` AS 
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

-- 9. race_winners_and_fastest_lap_drivers
CREATE OR REPLACE VIEW `race_winners_and_fastest_lap_drivers` AS 
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

-- 10. top_constructors_by_points
CREATE OR REPLACE VIEW `top_constructors_by_points` AS 
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

