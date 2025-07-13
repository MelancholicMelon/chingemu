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
    <>
    <h1 className="login-header">Timber Tycoon</h1>
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-container">
          <h2 className="login-title">{isRegistering ? "Register" : "Login"}</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
  
          <form onSubmit={handleSubmit}>
            <input
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
  
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
  
            <button className="login-button" type="submit">
              {isRegistering ? "Create Account" : "Log In"}
            </button>
          </form>
  
          <p className="login-subtext">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="register-button"
              onClick={() => {
                setError("");
                setIsRegistering(!isRegistering);
              }}
            >
              {isRegistering ? "Login here" : "Register here"}
            </button>
          </p>
        </div>
      </div>
  
      <div className="login-right">
        <h2 className="about-title">The Mission</h2>
        <p className="about-text">
          <strong>Timber Tycoon</strong> is a strategy-based simulation game that challenges you to balance economic growth with environmental responsibility. 
          As the responsible environmental leader of Japan, you must make decisions that affect both your profit and the planet.
        </p>
        <p className="about-text">
          Your goal? Scale your operations while protecting forests and supporting global sustainability efforts. Inspired by the <em>UN Sustainable Development Goal 15</em> — Life on Land — this game makes you think critically about how business and environmental ethics can (and must) coexist.
        </p>
        <p className="about-text">
          Can you grow your empire without destroying the world? The choice is yours.
        </p>
      </div>
    </div>
    </>
  );
  
    
}
