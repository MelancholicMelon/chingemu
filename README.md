### Deforestation Simulation Game

### Timetable

1. explain what key variables exist
2. what client and server defines
3. What exactly each person will do.

### Note

This documentation introduces the overview of the system architecture. It can be changed by you. In these cases, please also change the content here as well.

# explain what key variables exist

User states follow the structure of the class examples.

```
n_k   : int > 0         # World (kernel) size
n_c   : int > 0         # Number of continents
n_f   : int > 0         # Number of facility types

budget: int > 0         # Budget amount
profit: int             # Profit amount
score : int             # score of the game
year  : int >= 0        # how many years (turns) passed in the game

gameStates: Bool        # True=> the game is in progress, False=> the game has ended

list ObjectTypes        [ "continent", "facility", "ocean"]            # Types of objects
list Continents         [ "c1", "c2", "c3", "c4", ..., "cn_c"]        # Names of continents
list FacilityTypes      [ "f1", "f2", "f3", "f4", ..., "fn_f"]        # Types of facilities
list PDFTypes           [ "normal"]                                    # Types of PDFs
list PolicyTypes        [ "p1", "p2", "p3", "p4", ..., "pn_p"]        # Policy names
list Params             [ "sd", "maxImpact"]                           # Parameters affected by policies
```

### Define colors for objects

```
colorSpecification = [
    {
        "id": ObjectTypes # objects
        "color": hex
    }
    ... (continue until the last)
]
```

### Define the properties of each facility

```
facilitySpecification = [
    {
        "id"         : FacilityTypes,
        "size"       : int[2] (odd numbers only)  # Size of the facility in (x, y) direction
        "pdf"        : PDFTypes,
        "maxImpact"  : int
        "description": str     # Explain the characteristics of this facility. (so everyone understand how this faciltiy works)
    },
    ... (continue until the last)
]
```

### Describe the presence of continents in the 2D game grid (n_k × n_k)

```
ContinentLocation = [
    {
        "id"  : Continents,
        "loc" : Bool[n_k][n_k]  # True where the continent exists, otherwise False
    },
    ... (continue until the last)
]
```

### Describe the presence of each object in the 2D game grid (n_k × n_k)

```
ObjectLocation = [
    {
        "id"  : ObjectTypes \ {"continent", "facility"},  # objects excluding continent and facility
        "loc" : Bool[n_k][n_k]  # True where the continent exists, otherwise False
    },
    ... (continue until the last)
]
```

### Describe greenness values for each cell (0–255), with NaN outside the continent area

```
greennessMap = [
    {
        "id"        : Continents,
        "greenness" : int[n_k][n_k] {0..255 or NaN}
    },
    ... (continue until the last)
]
```

### Describe facility placement in the game world

### Instead of using a 2D array, define position and size, and let the server compute the impact

```
facilityCoordinate = [
    {
        "id"        : FacilityTypes,
        "coordinate": int[2],  # Placement coordinates (x, y)
    },
    ... (continue until the last)
]
```

### Describe how each policy modifies the impact of each facility

```
PolicySpecification = [
    {
        "id"            : PolicyTypes,
        "parameter"     : Params,
        "coefficient"   : int
    },
    ... (continue until the last)
]
```

### Describe whether each policy is currently activated

```
policyActivation = [
    {
        "id"      : PolicyTypes,
        "activate": Bool  # True if activated, otherwise False
    },
    ... (continue until the last)
]
```

---

# what client and server defines

### Server Defines

| Name                    | Description                               |
| ----------------------- | ----------------------------------------- |
| `n_k`                   | World (kernel) size                       |
| `n_c`                   | Number of continents                      |
| `n_f`                   | Number of facility types                  |
| `ObjectTypes`           | Types of objects                          |
| `Continents`            | Names of continents                       |
| `FacilityTypes`         | Types of facilities                       |
| `PDFTypes`              | Types of PDFs                             |
| `PolicyTypes`           | Policy names                              |
| `Params`                | Parameters affected by policies           |
| `colorSpecification`    | Colors for each object type               |
| `facilitySpecification` | Properties of each facility type          |
| `ContinentLocation`     | Presence of each continent in the 2D grid |
| `ObjectLocation`        | Presence of each object in the 2D grid    |
| `greennessMap`          | Greenness values for each cell            |
| `PolicySpecification`   | Policy impact modification for facilities |

please create getters for each variable

| Getter Function              | Returns                 |
| ---------------------------- | ----------------------- |
| `getKernelSize()`            | `n_k`                   |
| `getNumContinents()`         | `n_c`                   |
| `getNumFacilityTypes()`      | `n_f`                   |
| `getObjectTypes()`           | `ObjectTypes`           |
| `getContinents()`            | `Continents`            |
| `getColorSpecification()`    | `colorSpecification`    |
| `getFacilityTypes()`         | `FacilityTypes`         |
| `getPdfTypes()`              | `PDFTypes`              |
| `getPolicyTypes()`           | `PolicyTypes`           |
| `getModifiableParams()`      | `Params`                |
| `getFacilitySpecification()` | `facilitySpecification` |
| `getContinentLocation()`     | `ContinentLocation`     |
| `getObjectLocation()`        | `ObjectLocation`        |
| `getGreennessMap()`          | `greennessMap`          |
| `getPolicySpecification()`   | `PolicySpecification`   |

A function that records the score

- `recordStore(s: score)`

---

### Client Defines

| Name                 | Description                                |
| -------------------- | ------------------------------------------ |
| `budget`             | Budget amount                              |
| `profit`             | Profit amount                              |
| `score`              | Score of the game                          |
| `year`               | How many years (turns) passed in the game  |
| `facilityCoordinate` | Facility placement in the game world       |
| `policyActivation`   | Whether each policy is currently activated |
| `gameStates`         | Whether the game is in progress or ended   |

| Function (implemented by the backend team)                                                                                   | Description                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `setGreennessMap(gm: greennessMap, gm_set: setGreennessMap, fc: facilityCoordinate, pa: policyActivation)` → `(no return)`   | Updates greenness values; uses a setter (useState) to update the greenness map based on facility placement and policies. |
| `validateInput(fs: facilitySpecification, fc: facilityCoordinate)` → `(no return)`                                           | Checks if facility placement coordinates are valid; prompts user for new input if invalid.                               |
| `calculateScore(b: budget, gm: greennessMap, pa: policyActivation, fc: facilityCoordinate, s_set: setScore)` → `(no return)` | Calculates and sets the score; uses a setter (useState) to update the score.                                             |
| `checkGameStates(y: year, gs: gameStates, set_gs: setGameStates)` → `(no return)`                                            | Checks if the game has ended and updates the game state accordingly.                                                     |

### The overflow of the system

#### this mini-section explains the overflow of the system with plain-text puedo-code. I'd like you to have the same thought as me.

#### please fully understand the previous section's content first.

- client team

initilization stage

- define variables to be defined in client
- define and initialize all variables by calling getters.

In rendering, (depending on your UI design)

- please put a button for starting new game.

After putting a button, move on to first visualization stage

- Visualize the inital state of the game.
