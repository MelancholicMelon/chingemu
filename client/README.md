### Deforestation Simulation Game

data strucre in client

-status for game status

```
kernelSize        : n_k
Number of islands : n_i
Number of facility: n_f
falicityTypes     : str[f1,f2,f3,f4...fn_f]
policyTypes       : str[p1,p2,p3,p4...pn_p]


greennessMap = [
    {
        "islandType": island_1,
        "greenness" : int[n_k][n_k]{0..255}
    },
    {
        "islandType": island_2,
        "greenness" : int[n_k][n_k]{0..255}
    },
    ...
    {
        "islandType": island_n_i,
        "greenness" : int[n_k][n_k]{0..255}
    }
]


facilityMap = [
    {
        "fType"     :f1
        "coordinate":int[2] # placement coordinate (x,y)
        "size"      :int[2] # facility placement size for (x,y)
    },
    {
        "fType":f2
        "coordinate": int[2]
    }
    {
        "fType":f1
        "coordinate": int[2]
    }
]

policyActivate = [
    {
        "policy":p1,
        "activate": Bool
    },
    {
        "policy":p2,
        "activate": Bool
    },
    ...
    {
        "policy":pn_p,
        "activate": Bool
    }
]
```
