import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        const res = await
        fetch("http://localhost:3001/login", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            alert("Login success!");
            navigate("game/", { replace: true }); window.location.reload();
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={(e) => { e.preventDefault(); login(); }}>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
                <button type="submit">Log In</button>
            </form>
        </div>

    );
}