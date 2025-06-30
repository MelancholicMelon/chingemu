import { useEffect, useState } from "react";

export default function AddPost() {
    const [posts, setPosts] = useState([]);
    const [post, setPost] = useState('');

    const addPost = async (post) => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:3001/posts/add", {
            headers: {
                Authorization: "Bearer " + token,
                post: post
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
            <h2>Add Posts</h2>
            <input value={post} onChange={e => setPost(e.target.value)} placeholder="Title of Post" />
            <button onClick={() => addPost(post)}>add</button>
            <ul>{posts.map(p => 
                <li key={p.id}>Post Id: {p.id}, Post: {p.title}, User Id: {p.userId}</li>)} 
            </ul>
        </div>
    );
}