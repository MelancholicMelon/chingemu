import { useEffect, useState } from "react";

export default function Game() {
    const [scores, setScores] = useState([]);
    const [score, setScore] = useState('');

    const addScore = async (score) => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:3001/scores/add", {
            headers: {
                Authorization: "Bearer " + token,
                score: score
            }
        })
        .then(res => res.json())
        .then(data => setScores(data));

        console.log(scores)
    };


    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:3001/scores", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => setScores(data));
    }, []);

    return (
        <div>
            <h2>Add Score</h2>
            <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score" />
            <button onClick={() => addScore(score)}>add</button>
            <ul>{scores.map(p => 
                <li key={p.id}>Score Id: {p.id}, Score: {p.title}, User Id: {p.userId}</li>)} 
            </ul>
        </div>
    );
}