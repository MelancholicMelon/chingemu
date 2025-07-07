

export default function Simulation() {
    let n_k = 0;
    let n_c = 0;
    let n_f = 0;

    let budget = 0;
    let profit = 0;
    let score = 0;
    let year = 2025;

    let gameState = False;

    let facilities = []
    let policiies = []

    function initializeSimulation(mapId, year, budget){
        // get kernel for the base map from server
        // get params for facilities from server
        // set kernel & params to local varaibles
        // Initialize score & budget 
        // Initialize policy activation states
    }

    function getGreenessMap(){
        // Return the matrix render of the current map
    }

    function validateInput(coordinate, object_id){
        // get x y coordinate of mouse input
        // get facility / policy object 
        //  object can be "remove". Check if there is facility on coordinate
        //  remove facility if cooridnate valid 
        // validate the placement of facility / policy
        // append facility / policy to local variables
        // return validation success / failure
    }

    function calculateScore(){
        // calculate score based on:
        //  budget
        //  profit
        //  year
        //  greenness matrix
    }
    
    // originally checkGameStatus
    function progress(){
        // Apply matrix arithmetics from all facilities and policies to current map
    }

    function endSimulation(){
        // calculate score
        // post score to server
        // return final greenness map state
        // terminate game state
    }
}