const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Posts management: not needed for now

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

// Score management: Get Score, Post Score, Delete Score by user id.

app.get("/scores", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
            const scores = db.scores.filter(p => p.userId === user.id);
            console.log(scores)
            res.json(scores);
    });
});

app.get("/scores/delete", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const scoreid = parseInt(req.headers.scoreid);
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
            db.scores = db.scores.filter((s) => !(s.id === scoreid && s.userId === user.id));
            console.log(scoreid, user.id)
            fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
            res.json(db.scores.filter(s => s.userId === user.id));
    });
});

app.get("/scores/add", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const score = req.headers.score
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
            const scoreid = () => {
                let i = 0;
                while(true){
                    if(db.scores.filter(p => p.id === i).length === 0){
                        break; 
                    } else { i+=1; }
                }
                return i;
            }
            db.scores.push({ "id": scoreid(), "title": score, "userId": user.id});
            console.log(db.scores)
            fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
            res.json(db.scores.filter(s => s.userId === user.id));
    });
});

// Kernel Management

app.get("/kernel/maps", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const id = parseInt(req.headers.id); //const name = parseInt(req.headers.name);
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("kernels.json", "utf-8"));
            const map = db.maps.filter(m => m.id === id)[0]; // const map = db.maps.filter(m => m.name === name);
            console.log(map.continents)
            const kernels = JSON.parse(fs.readFileSync(map.continents, "utf-8"));
            res.json(kernels);
    });
});

app.get("/kernel/facilities", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("kernels.json", "utf-8"));
            res.json(db.facilities);
    });
});

app.get("/kernel/policies", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided"});
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
            const db = JSON.parse(fs.readFileSync("kernels.json", "utf-8"));
            res.json(db.policies);
    });
});

const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const SECRET = "mySecretKey";

app.use(bodyParser.json());

// User Management: Login, Signup, Delete Account

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


