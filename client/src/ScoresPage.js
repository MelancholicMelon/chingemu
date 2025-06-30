import { useEffect, useState } from "react";

export default function ScoresPage() {
    const [scores, setScores] = useState([]);
    const [deleteId, setDeleteId] = useState(-1);

    const deleteScore = async (id) => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:3001/scores/delete", {
            headers: {
                Authorization: "Bearer " + token,
                id: id
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
            <h2>Scores</h2>
            <input value={deleteId} onChange={e => setDeleteId(e.target.value)} placeholder="Score ID to delete" />
            <button onClick={() => deleteScore(deleteId)}>delete by score id</button>
            <ul>{scores.map(p => 
                <li key={p.id}>User Id: {p.userId}, Score Id: {p.id}, Score: {p.title}</li>)} 
            </ul>
        </div>
    );
}