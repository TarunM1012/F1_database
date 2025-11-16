# Formula 1 Database - Entity Relationship Diagram

## ER Diagram (Phase II Part D)

```mermaid
classDiagram
    class SEASONS {
        <<PK>> int year
        varchar url
    }
    
    class CIRCUITS {
        <<PK>> int circuitId
        varchar circuitRef
        varchar name
        varchar location
        varchar country
        decimal lat
        decimal lng
        int alt
        varchar url
    }
    
    class CONSTRUCTORS {
        <<PK>> int constructorId
        varchar constructorRef
        varchar name
        varchar nationality
        varchar url
    }
    
    class DRIVERS {
        <<PK>> int driverId
        varchar driverRef
        int number
        varchar code
        varchar forename
        varchar surname
        date dob
        varchar nationality
        varchar url
    }
    
    class STATUS {
        <<PK>> int statusId
        varchar status
    }
    
    class RACES {
        <<PK>> int raceId
        <<FK>> int year
        int round
        <<FK>> int circuitId
        varchar name
        date date
        time time
        varchar url
        date fp1_date
        time fp1_time
        date fp2_date
        time fp2_time
        date fp3_date
        time fp3_time
        date quali_date
        time quali_time
        date sprint_date
        time sprint_time
    }
    
    class RESULTS {
        <<PK>> int resultId
        <<FK>> int raceId
        <<FK>> int driverId
        <<FK>> int constructorId
        int number
        int grid
        int position
        varchar positionText
        int positionOrder
        decimal points
        int laps
        varchar time
        int milliseconds
        int fastestLap
        int rank
        varchar fastestLapTime
        decimal fastestLapSpeed
        <<FK>> int statusId
    }
    
    class QUALIFYING {
        <<PK>> int qualifyId
        <<FK>> int raceId
        <<FK>> int driverId
        <<FK>> int constructorId
        int number
        int position
        varchar q1
        varchar q2
        varchar q3
    }
    
    class SPRINT_RESULTS {
        <<PK>> int resultId
        <<FK>> int raceId
        <<FK>> int driverId
        <<FK>> int constructorId
        int number
        int grid
        int position
        varchar positionText
        int positionOrder
        decimal points
        int laps
        varchar time
        int milliseconds
        int fastestLap
        varchar fastestLapTime
        <<FK>> int statusId
    }
    
    class CONSTRUCTOR_STANDINGS {
        <<PK>> int constructorStandingsId
        <<FK>> int raceId
        <<FK>> int constructorId
        decimal points
        int position
        varchar positionText
        int wins
    }
    
    class CONSTRUCTOR_RESULTS {
        <<PK>> int constructorResultsId
        <<FK>> int raceId
        <<FK>> int constructorId
        decimal points
        varchar status
    }
    
    class DRIVER_STANDINGS {
        <<PK>> int driverStandingsId
        <<FK>> int raceId
        <<FK>> int driverId
        decimal points
        int position
        varchar positionText
        int wins
    }
    
    class LAP_TIMES {
        <<PK,FK>> int raceId
        <<PK,FK>> int driverId
        <<PK>> int lap
        int position
        varchar time
        int milliseconds
    }
    
    class PIT_STOPS {
        <<PK,FK>> int raceId
        <<PK,FK>> int driverId
        <<PK>> int stop
        int lap
        varchar time
        varchar duration
        int milliseconds
    }

    %% Relationships
    SEASONS "1" --> "0..*" RACES : year
    CIRCUITS "1" --> "0..*" RACES : circuitId
    
    RACES "1" --> "0..*" RESULTS : raceId
    DRIVERS "1" --> "0..*" RESULTS : driverId
    CONSTRUCTORS "1" --> "0..*" RESULTS : constructorId
    STATUS "1" --> "0..*" RESULTS : statusId
    
    RACES "1" --> "0..*" QUALIFYING : raceId
    DRIVERS "1" --> "0..*" QUALIFYING : driverId
    CONSTRUCTORS "1" --> "0..*" QUALIFYING : constructorId
    
    RACES "1" --> "0..*" SPRINT_RESULTS : raceId
    DRIVERS "1" --> "0..*" SPRINT_RESULTS : driverId
    CONSTRUCTORS "1" --> "0..*" SPRINT_RESULTS : constructorId
    STATUS "1" --> "0..*" SPRINT_RESULTS : statusId
    
    RACES "1" --> "0..*" CONSTRUCTOR_STANDINGS : raceId
    CONSTRUCTORS "1" --> "0..*" CONSTRUCTOR_STANDINGS : constructorId
    
    RACES "1" --> "0..*" CONSTRUCTOR_RESULTS : raceId
    CONSTRUCTORS "1" --> "0..*" CONSTRUCTOR_RESULTS : constructorId
    
    RACES "1" --> "0..*" DRIVER_STANDINGS : raceId
    DRIVERS "1" --> "0..*" DRIVER_STANDINGS : driverId
    
    RACES "1" --> "0..*" LAP_TIMES : raceId
    DRIVERS "1" --> "0..*" LAP_TIMES : driverId
    
    RACES "1" --> "0..*" PIT_STOPS : raceId
    DRIVERS "1" --> "0..*" PIT_STOPS : driverId
```

## Key Relationships:

1. **SEASONS** → **RACES**: One season has many races
2. **CIRCUITS** → **RACES**: One circuit hosts many races
3. **RACES** → **RESULTS**: One race has many results
4. **DRIVERS** → **RESULTS**: One driver has many results
5. **CONSTRUCTORS** → **RESULTS**: One constructor has many results
6. **STATUS** → **RESULTS**: One status applies to many results

## Entity Descriptions:

- **SEASONS**: Formula 1 seasons (1950-present)
- **CIRCUITS**: Racing circuits around the world
- **CONSTRUCTORS**: F1 teams/constructors
- **DRIVERS**: F1 drivers
- **STATUS**: Race finish status (Finished, DNF, etc.)
- **RACES**: Individual Grand Prix races
- **RESULTS**: Race results and points
- **QUALIFYING**: Qualifying session results
- **SPRINT_RESULTS**: Sprint race results
- **CONSTRUCTOR_STANDINGS**: Constructor championship standings
- **CONSTRUCTOR_RESULTS**: Constructor race results
- **DRIVER_STANDINGS**: Driver championship standings
- **LAP_TIMES**: Individual lap times
- **PIT_STOPS**: Pit stop data

This ER diagram shows the complete structure of your Formula 1 database with all entities, attributes, and relationships.
