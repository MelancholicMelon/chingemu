const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/posts", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
            const posts = db.posts.filter(p => p.userId === user.id);
            console.log(posts)
            res.json(posts);
    });
});

app.get("/posts/delete", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const postid = parseInt(req.headers.postid);
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
            db.posts = db.posts.filter((p) => !(p.id === postid && p.userId === user.id));
            console.log(postid, user.id)
            fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
            res.json(db.posts.filter(p => p.userId === user.id));
    });
});

app.get("/posts/add", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const post = req.headers.post
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
            const postid = () => {
                let i = 0;
                while(true){
                    if(db.posts.filter(p => p.id === i).length === 0){
                        break; 
                    } else { i+=1; }
                }
                return i;
            }
            db.posts.push({ "id": postid(), "title": post, "userId": user.id});
            console.log(db.posts)
            fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
            res.json(db.posts.filter(p => p.userId === user.id));
    });
});

const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const SECRET = "mySecretKey";

app.use(bodyParser.json());

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        const token = jwt.sign({ id: user.id, username: user.username },
        SECRET, { expiresIn: "1h" });
        res.json({ token });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});