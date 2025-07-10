import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
export default function LoginPage({ setUser }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        navigate("/game", { replace: true });
    }
        }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isRegistering ? "register" : "login";

      const res = await fetch(`${baseUrl}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Authentication failed");
      }

      const data = await res.json();

      // Save token & decode user info
      localStorage.setItem("token", data.token);
      const decodedUser = jwtDecode(data.token);
      setUser(decodedUser);

      // Redirect to protected page
      navigate("/game", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{isRegistering ? "Create Account" : "Log In"}</button>
      </form>

      <p>
        {isRegistering
          ? "Already have an account?"
          : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setError("");
            setIsRegistering(!isRegistering);
          }}
        >
          {isRegistering ? "Login here" : "Register here"}
        </button>
      </p>
    </div>
  );
}
