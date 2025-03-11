const express = require("express");
const db = require("../database");

const router = express.Router();

// ✅ Create a Blog (POST)
router.post("/", (req, res) => {
    const { title, content, author_id } = req.body;

    if (!title || !content || !author_id) {
        return res.status(400).send("Missing required fields.");
    }

    db.run("INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)", 
        [title, content, author_id], (err) => {
            if (err) return res.status(500).send("Error creating blog.");
            res.send("Blog created successfully.");
        });
});

// ✅ Fetch All Blogs (GET)
router.get("/", (req, res) => {
    db.all("SELECT blogs.*, users.name AS author_name FROM blogs JOIN users ON blogs.author_id = users.id ORDER BY timestamp DESC", 
    [], (err, blogs) => {
        if (err) {
            console.error("Error retrieving blogs:", err);
            return res.status(500).send("Error retrieving blogs.");
        }
        res.json(blogs);
    });
});

// ✅ Update a Blog (PUT)
router.put("/:id", (req, res) => {
    const { title, content, author_id } = req.body;
    const blogId = req.params.id;

    if (!title || !content || !author_id) {
        return res.status(400).json({ error: "All fields are required." });
    }

    db.run("UPDATE blogs SET title = ?, content = ? WHERE id = ? AND author_id = ?", 
        [title, content, blogId, author_id], (err) => {
            if (err) {
                console.error("Error updating blog:", err.message);
                return res.status(500).json({ error: "Error updating blog." });
            }
            res.json({ message: "Blog updated successfully." });
        });
});


// ✅ Delete a Blog (DELETE)
router.delete("/:id", (req, res) => {
    const { author_id } = req.body;
    const blogId = req.params.id;

    if (!author_id) {
        return res.status(400).json({ error: "Unauthorized request." });
    }

    db.run("DELETE FROM blogs WHERE id = ? AND author_id = ?", [blogId, author_id], (err) => {
        if (err) {
            console.error("Error deleting blog:", err.message);
            return res.status(500).json({ error: "Error deleting blog." });
        }
        res.json({ message: "Blog deleted successfully." });
    });
});



// ✅ Fetch Blogs with Sorting
router.get("/", (req, res) => {
    const { sort } = req.query;

    let query = `
        SELECT blogs.*, users.name AS author_name,
        (SELECT COUNT(*) FROM comments WHERE comments.blog_id = blogs.id) AS comment_count
        FROM blogs
        JOIN users ON blogs.author_id = users.id
    `;

    if (sort === "comments") {
        query += " ORDER BY comment_count DESC";  // Sort by number of comments
    } else {
        query += " ORDER BY blogs.timestamp DESC"; // Default: Sort by date/time
    }

    db.all(query, [], (err, blogs) => {
        if (err) {
            console.error("Error retrieving blogs:", err);
            return res.status(500).send("Error retrieving blogs.");
        }
        res.json(blogs);
    });
});

module.exports = router;
