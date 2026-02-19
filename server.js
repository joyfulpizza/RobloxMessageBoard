import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "YOUR_GITHUB_USERNAME";
const REPO_NAME = "RobloxMessageBoard";
const FILE_PATH = "messages.txt";

async function getMessages() {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`;
    const res = await fetch(url);
    const text = await res.text();
    return text || "";
}

async function writeMessage(newMessage) {
    // Get current file info (sha)
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const fileRes = await fetch(url);
    const fileData = await fileRes.json();
    const sha = fileData.sha;
    const existingText = Buffer.from(fileData.content, "base64").toString("utf-8");

    const updated = existingText + "\n" + newMessage;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Add new message",
            content: Buffer.from(updated).toString("base64"),
            sha: sha
        })
    });
    return res.ok;
}

// API routes
app.get("/messages", async (req, res) => {
    const msgs = await getMessages();
    res.send(msgs);
});

app.post("/messages", async (req, res) => {
    const { userId, message, timestamp } = req.body;
    const formatted = `${timestamp}(${userId}): ${message}`;
    const success = await writeMessage(formatted);
    res.send({ success });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
