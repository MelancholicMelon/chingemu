import { useState, useEffect } from "react";

export default function ScoreTestPage() {
  const baseUrl = process.env.REACT_APP_API_URL;
  const [highScore, setHighScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [testScore, setTestScore] = useState(0);

  const token = localStorage.getItem("token");

  const fetchHighScore = async () => {
    try {
      const res = await fetch(`${baseUrl}/user/highscore`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setHighScore(data);
      console.log("Fetched High Score:", data);
    } catch (err) {
      console.error("Error fetching high score:", err);
    }
  };

  const submitTestScore = async () => {
    try {
      const res = await fetch(`${baseUrl}/scores/add`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          score: parseInt(testScore),
          finalBudget: 500,
          finalAvgGreenness: 80
        })
      });

      const data = await res.json();
      console.log("Score submitted:", data);
      fetchHighScore();
      fetchLeaderboard(); // refresh
    } catch (err) {
      console.error("Error submitting score:", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${baseUrl}/scores/leaderboard?start=1&end=10`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setLeaderboard(data);
      console.log("Leaderboard:", data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  useEffect(() => {
    fetchHighScore();
    fetchLeaderboard();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Test Score Functions</h2>

      <div>
        <h3>Your High Score</h3>
        {highScore ? (
          <p>Score ID: {highScore.scoreId} | Score: {highScore.score}</p>
        ) : (
          <p>No high score found.</p>
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h3>Submit New Score</h3>
        <input
          type="number"
          value={testScore}
          onChange={(e) => setTestScore(e.target.value)}
          placeholder="Enter test score"
        />
        <button onClick={submitTestScore} style={{ marginLeft: "1rem" }}>
          Submit Score
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Top 10 Leaderboard</h3>
        <ol>
          {leaderboard.map((entry) => (
            <li key={entry.id}>
              User ID: {entry.userId} | Score: {entry.score}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
