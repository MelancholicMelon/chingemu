const express = require("express");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.REACT_APP_PORT;
//console.log(process.env)

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-ipv4 and internal addresses like 127.0.0.1
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}
//Util functions for later use.
function readDB() {
  return JSON.parse(fs.readFileSync("user_score.json", "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync("user_score.json", JSON.stringify(data, null, 2));
}

function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  try {
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
// Get user highscore
app.get("/user/highscore", (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const db = readDB();
  const currentUser = db.users.find((u) => u.id === user.id);
  if (!currentUser || currentUser.highScoreId === undefined) {
    return res.json({ score: 0, scoreId: null });
  }

  const score = db.scores.find((s) => s.id === currentUser.highScoreId);
  if (!score) return res.json({ score: 0, scoreId: null });

  res.json({ ...score, scoreId: score.id });
});

//Score add, kinda redundant. need to merge later.
app.post("/scores/add", (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { score, finalBudget, finalAvgGreenness } = req.body;
  if (score === undefined)
    return res.status(400).json({ message: "Score is required" });

  const db = readDB();

  const newScore = {
    id: Date.now(),
    score,
    userId: user.id,
    finalBudget,
    finalAvgGreenness,
  };
  db.scores.push(newScore);

  const currentUser = db.users.find((u) => u.id === user.id);

  const currentHighScore = db.scores.find(
    (s) => s.id === currentUser.highScoreId
  );
  const isNewHigh = !currentHighScore || score > currentHighScore.score;

  if (isNewHigh) {
    currentUser.highScoreId = newScore.id;
  }

  writeDB(db);
  res.status(201).json({ message: "Score added", highScoreUpdated: isNewHigh });
});
//Get leaderboard
app.get("/scores/leaderboard", (req, res) => {
  const start = parseInt(req.query.start) || 1;
  const end = parseInt(req.query.end) || 10;

  const db = readDB();
  const sortedScores = [...db.scores].sort((a, b) => b.score - a.score);

  const sliced = sortedScores.slice(start - 1, end);
  res.json(sliced);
});

app.listen(PORT, () => {
  const localIp = getLocalIp();
  console.log(`Server running at:`);
  console.log(` - http://localhost:${PORT}`);
  console.log(` - http://${localIp}:${PORT}  (LAN IP)`);
});

// Score management: Get Score, Post Score, Delete Score by user id.

app.get("/scores", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    const db = JSON.parse(fs.readFileSync("user_score.json", "utf-8"));
    const scores = db.scores.filter((p) => p.userId === user.id);
    res.json(scores);
  });
});

app.get("/scores/delete", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const scoreid = parseInt(req.headers.scoreid);
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    const db = JSON.parse(fs.readFileSync("user_score.json", "utf-8"));
    db.scores = db.scores.filter(
      (s) => !(s.id === scoreid && s.userId === user.id)
    );
    fs.writeFileSync("user_score.json", JSON.stringify(db, null, 2));
    res.json(db.scores.filter((s) => s.userId === user.id));
  });
});

app.get("/scores/add", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const score = req.headers.score;
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    const db = JSON.parse(fs.readFileSync("user_score.json", "utf-8"));
    const scoreid = () => {
      let i = 0;
      while (true) {
        if (db.scores.filter((p) => p.id === i).length === 0) {
          break;
        } else {
          i += 1;
        }
      }
      return i;
    };
    db.scores.push({ id: scoreid(), title: score, userId: user.id });
    fs.writeFileSync("user_score.json", JSON.stringify(db, null, 2));
    res.json(db.scores.filter((s) => s.userId === user.id));
  });
});

// Kernel Management

app.get("/specification", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    const db = JSON.parse(fs.readFileSync("specification.json", "utf-8"));
    res.json(db);
  });
});

app.get("/continentJson", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const filePath = req.query.filePath;

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    try {
      const db = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(db);
    } catch (error) {
      res
        .status(500)
        .json({ message: "File not found or invalid", error: error.message });
    }
  });
});

const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const SECRET = process.env.REACT_APP_SECRET;

app.use(bodyParser.json());

// User Management: Login, Signup, Delete Account

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = JSON.parse(fs.readFileSync("user_score.json", "utf-8"));
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, username: user.username, id: user.id }); // Include user info for client
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username and password are required");

  const db = JSON.parse(fs.readFileSync("user_score.json", "utf-8"));
  const existingUser = db.users.find((u) => u.username === username);
  if (existingUser) return res.status(409).send("Username already exists");

  const newUser = { id: Date.now(), username, password };
  db.users.push(newUser);
  fs.writeFileSync("user_score.json", JSON.stringify(db, null, 2));

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username },
    SECRET,
    { expiresIn: "1h" }
  );
  res.status(201).json({ token, username: newUser.username, id: newUser.id }); // Same structure as login
});
