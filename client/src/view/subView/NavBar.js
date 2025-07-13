import { Link, useNavigate } from "react-router-dom";

export default function NavBar(props) {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token") != null;

  const logout = async () => {
    if (isLoggedIn) {
      localStorage.removeItem("token");
      alert("Logout success!");
      navigate("/", { replace: true });
      window.location.reload();
    } else {
      alert("Please log in first!");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        {!isLoggedIn && <Link to="/">Login</Link>}
        {isLoggedIn && (
          <>
            <Link to="/leaderboard">LeaderBoard</Link>
            <Link to="/game">Game</Link>
          </>
        )}
      </div>
      <div className="navbar-right">
        <span>{props.nametag}</span>
        {isLoggedIn && (
          <button className="navbar-button" onClick={logout}>
            Log Out
          </button>
        )}
      </div>
    </nav>
  );
}
