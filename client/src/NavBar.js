import { Link, useNavigate } from "react-router-dom";


export default function NavBar(props) {
  const navigate = useNavigate();

  const logout = async () => {
    if(localStorage.getItem("token") != null){
      localStorage.removeItem("token");
      alert("Logout success!");
      navigate("/", { replace: true }); window.location.reload();
    } else {
      alert("Please log in first!")
    }
  };

  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      <Link to="/">Login</Link> |{" "}
      <Link to="/posts">Posts</Link> |{" "}
      <Link to="/add">Add Post</Link>

      <div style={{float: "right"}}>{props.nametag}. | 
        <button onClick={logout}>Log Out</button>|
      </div>
    </nav>
  );
}