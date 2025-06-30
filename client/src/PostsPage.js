import { useEffect, useState } from "react";

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [deleteId, setDeleteId] = useState(-1);

    const deletePost = async (pid) => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:3001/posts/delete", {
            headers: {
                Authorization: "Bearer " + token,
                postid: pid
            }
        })
        .then(res => res.json())
        .then(data => setPosts(data));

        console.log(posts)
    };


    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:3001/posts", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => setPosts(data));
    }, []);

    return (
        <div>
            <h2>Posts</h2>
            <input value={deleteId} onChange={e => setDeleteId(e.target.value)} placeholder="Post ID to delete" />
            <button onClick={() => deletePost(deleteId)}>delete by post id</button>
            <ul>{posts.map(p => 
                <li key={p.id}>User Id: {p.userId}, Post Id: {p.id}, Post: {p.title}</li>)} 
            </ul>
        </div>
    );
}