import { useEffect, useState } from "react";
import Simulation from "./Simulation";

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
            <Simulation/>
        </div>
    );
}