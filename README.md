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

enum ObjectTypes        { "continent", "facility", "ocean" }               # Types of objects
enum Continents         { "c1", "c2", "c3", "c4", ..., "cn_c" }            # Names of continents
enum FacilityTypes      { "f1", "f2", "f3", "f4", ..., "fn_f" }            # Types of facilities
enum PDFTypes           { "normal" }                                       # Types of PDFs
enum PolicyTypes        { "p1", "p2", "p3", "p4", ..., "pn_p" }            # Policy names
enum Params             { "sd", "maxImpact" }                              # Parameters affected by policies


colorSpecification = [
    {
        "id": ObjectTypes \ {"continent"}, # objects excluding continent
        "color": hex
    }
    ... (continue until the last)
]

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
        "id"  : ObjectTypes \ {"continent", "facility"},  # objects excluding continent and facility
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
