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
    <nav style={{ padding: "1rem", background: "#D5ED9F" }}>
      {!isLoggedIn && <Link to="/">Login</Link>}{" "}
      {isLoggedIn && (
        <>
          <Link to="/leaderboard">LeaderBoard</Link> |{" "}
          <Link to="/game">Game</Link>
        </>
      )}
      <div style={{ float: "right" }}>
        {props.nametag}
        {isLoggedIn && (
          <>
            {" "} | <button onClick={logout}>Log Out</button> |
          </>
        )}
      </div>
    </nav>
  );
}
