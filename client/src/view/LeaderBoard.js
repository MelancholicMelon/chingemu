import { useEffect, useState } from "react";
import '../css/leaderboard.css';
export default function LeaderBoard() {
  const [scores, setScores] = useState([]);
  const [highScore, setHighScore] = useState(null);
  const baseUrl = process.env.REACT_APP_API_URL;

  // 1. Get user's high score (including reference to score id)
  async function fetchUserHighScore() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/user/highscore`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to fetch user high score");
      const data = await res.json();
      setHighScore(data); // assume data includes score id reference etc.
    } catch (error) {
      console.error(error);
    }
  }

  // 3. Get leaderboard scores within a range (e.g. 1-10, 11-20)
  async function fetchLeaderboard(start = 1, end = 10) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${baseUrl}/scores/leaderboard?start=${start}&end=${end}`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch leaderboard scores");
      const data = await res.json();
      setScores(data);
    } catch (error) {
      console.error(error);
    }
  }

  // 2. Post new score and update user's high score if applicable
  async function addScore({
    id,
    score,
    userId,
    finalBudget,
    finalAvgGreenness,
  }) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/scores/add`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          score,
          userId,
          finalBudget,
          finalAvgGreenness,
        }),
      });
      if (!res.ok) throw new Error("Failed to add score");
      const data = await res.json();
      // Update scores or highScore as needed based on response
      fetchUserHighScore(); // refresh high score
      fetchLeaderboard(); // refresh leaderboard
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchUserHighScore();
    fetchLeaderboard();
  }, []);

  return (
    <section className="leaderboard-container">
      <h2 className="leaderboard-title">Leaderboard</h2>

      {highScore && (
        <article className="highscore">
          <strong>Your High Score:</strong> {highScore.score}
        </article>
      )}

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((p) => (
            <tr key={p.id}>
              <td>{p.username}</td>
              <td>{p.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
