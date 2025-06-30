import React, { useState, useEffect } from 'react';
import './App.css';

function PostList(props) {
  const [posts, setPosts] = useState([]); 

  useEffect(() => {
    fetch("http://localhost:9999/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.slice(0, 10))); 
    }, 
    []);

  return (
    <div className = "card-1">
        <h2 className = "title">Posts</h2>
        {posts.map((post) => (
        <div className = "content" key={post.id}>
            <strong>{post.title}</strong>
            <p>{post.body}</p>
        </div>
        ))}
    </div>
  );
}

export default PostList;
