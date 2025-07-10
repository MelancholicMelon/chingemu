import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./view/subView/NavBar";
// import PostsPage from "./PostsPage";
// import AddPost from "./AddPost";
import LeaderBoard from "./view/LeaderBoard";
import Game from "./view/Game";
import LoginPage from "./view/LoginPage";
import ProtectedRoute from "./utils/ProtectedRoute";
//For testing http://localhost:3000/scoretest
import ScoreTestPage from "./utils/ScoreTestPage";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const nametag = !user
    ? "Not Logged In"
    : `ID: ${user.id} Username: ${user.username}`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token == null) {
      return;
    }
    setUser(jwtDecode(token));
  }, []);

  return (
    <Router>
      <NavBar nametag={nametag} />
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scoretest"
          element={
            <ProtectedRoute>
              <ScoreTestPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
