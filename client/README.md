### Deforestation Simulation Game

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

enum ObjectTypes    {"ocean"}                               # Names of objects other than continents
enum Continents     {"c1", "c2", "c3", "c4", ..., "cn_c"}   # Names of continents
enum FacilityTypes  {"f1", "f2", "f3", "f4", ..., "fn_f"}   # Names of facility types
enum PDFTypes       {"normal"}                              # Types of PDFs
enum PolicyTypes    {"p1", "p2", "p3", "p4", ..., "pn_p"}   # Names of policies
enum Params         {"sd", "maxImpact"}                     # Parameters modified by policies

# Define the properties of each facility
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

# Describe the presence of continents in the 2D game grid (n_k × n_k)
ContinentLocation = [
    {
        "id"  : Continents,
        "loc" : Bool[n_k][n_k]  # True where the continent exists, otherwise False
    },
    ... (continue until the last)
]

# Describe the presence of each object in the 2D game grid (n_k × n_k)
ObjectLocation = [
    {
        "id"  : ObjectTypes,
        "loc" : Bool[n_k][n_k]  # True where the continent exists, otherwise False
    },
    ... (continue until the last)
]

# Describe greenness values for each cell (0–255), with NaN outside the continent area
greennessMap = [
    {
        "id"        : Continents,
        "greenness" : int[n_k][n_k] {0..255 or NaN}
    },
    ... (continue until the last)
]

# Describe facility placement in the game world
# Instead of using a 2D array, define position and size, and let the server compute the impact
facilityCoordinate = [
    {
        "id"        : FacilityTypes,
        "coordinate": int[2],  # Placement coordinates (x, y)
    },
    ... (continue until the last)
]


# Describe how each policy modifies the impact of each facility
PolicySpecification = [
    {
        "id"            : PolicyTypes,
        "parameter"     : Params,
        "coefficient"   : int
    },
    ... (continue until the last)
]

# Describe whether each policy is currently activated
policyActivation = [
    {
        "id"      : PolicyTypes,
        "activate": Bool  # True if activated, otherwise False
    },
    ... (continue until the last)
]
```

## State Initialization Flow

## Server Defines

- `n_k`
- `n_c`
- `n_f`
- `ObjectTypes`
- `Continents`
- `FacilityTypes`
- `PDFTypes`
- `PolicyTypes`
- `Params`
- `facilitySpecification`
- `ContinentLocation`
- `ObjectLocation`
- `greennessMap`
- `PolicySpecification`

please create a getter for each variable

- `getKernelSize()` → `n_k`
- `getNumContinents()` → `n_c`
- `getNumFacilityTypes()` → `n_f`
- `getObjectTypes()` → `ObjectTypes`
- `getContinents()` → `Continents`
- `getFacilityTypes()` → `FacilityTypes`
- `getPdfTypes()` → `PDFTypes`
- `getPolicyTypes()` → `PolicyTypes`
- `getModifiableParams()` → `Params`
- `getFacilitySpecification()` → `facilitySpecification`
- `getContinentLocation()` → `ContinentLocation`
- `getObjectLocation()` → `ObjectLocation`
- `getGreennessMap()` → `greennessMap`
- `getPolicySpecification()` → `PolicySpecification`

A function that updates greenness

- `setGreennessMap(gm: greennessMap, fc: facilityCoordinate, pa: policyActivation)` → `(no return)`

A function that records the score

- `recordStore(s: score)`

---

## Client Defines

- `budget`
- `profit`
- `score`
- `year`
- `facilityCoordinate`
- `policyActivation`

Once you call `setGreennessMap`, use `getGreennessMap` to get the updated values.

A function that checks whether the input coordinates for facility placement are valid. If the coordinates are invalid, it shows an error message and ask the user to enter new coordinates until a valid input is given. The facility coordinate represents the center of its area.

- `validateInput(fs: facilitySpecification, fc: facilityCoordinate)` → `(no return)`

A function that calculates the score

- `calculateScore(b: budget, gm: greennessMap, pa: policyActivation, fc: facilityCoordinate)` → updates `score`

A function that checks if the game has ended and finishes the game if it has ended.

- `checkGameStates(y: year)` → updates `gameStates`

### profit is not specified yet
