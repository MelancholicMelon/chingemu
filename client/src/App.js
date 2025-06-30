import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./NavBar";
// import PostsPage from "./PostsPage";
// import AddPost from "./AddPost";
import ScorePage from "./ScorePage";
import Game from "./Game";
import LoginPage from "./LoginPage";
import ProtectedRoute from "./ProtectedRoute";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function App() {
    const [user, setUser] = useState(null);
    const nametag = !user ? "Not Logged In" : `ID: ${user.id} Username: ${user.username}`;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token == null){
          return
        }
        setUser(jwtDecode(token));
    }, []);

    
    return (
        <Router>
            <NavBar nametag = {nametag}/>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/leaderboard" element={<ProtectedRoute><ScorePage/></ProtectedRoute>} />
                <Route path="/game" element={<ProtectedRoute><Game/></ProtectedRoute>} />
            </Routes>
        </Router>
    ); 
}