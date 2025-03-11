const express = require("express");
const db = require("../database");

const router = express.Router();

// ✅ Add a Comment (POST)
router.post("/", (req, res) => {
    const { blog_id, user_id, comment_text } = req.body;

    if (!blog_id || !user_id || !comment_text) {
        return res.status(400).send("Missing required fields.");
    }

    db.run("INSERT INTO comments (blog_id, user_id, comment_text) VALUES (?, ?, ?)", 
        [blog_id, user_id, comment_text], (err) => {
            if (err) return res.status(500).send("Error adding comment.");
            res.send("Comment added successfully.");
        });
});

// ✅ Fetch Comments for a Blog (GET)
router.get("/:blog_id", (req, res) => {
    const query = `
        SELECT comments.id, comments.comment_text, comments.timestamp, comments.user_id, users.name AS commenter_name
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.blog_id = ?
        ORDER BY comments.timestamp DESC
    `;

    db.all(query, [req.params.blog_id], (err, comments) => {
        if (err) {
            console.error("Error retrieving comments:", err);
            return res.status(500).json({ error: "Error retrieving comments" });
        }
        res.json(comments);
    });
});


// ✅ Update a Comment (PUT)
router.put("/:id", (req, res) => {
    const { comment_text, user_id } = req.body;
    const commentId = req.params.id;

    db.run("UPDATE comments SET comment_text = ? WHERE id = ? AND user_id = ?", 
        [comment_text, commentId, user_id], (err) => {
            if (err) return res.status(500).send("Error updating comment.");
            res.send("Comment updated successfully.");
        });
});

// ✅ Delete a Comment (DELETE)
router.delete("/:id", (req, res) => {
    const { user_id } = req.body;
    const commentId = req.params.id;

    db.run("DELETE FROM comments WHERE id = ? AND user_id = ?", [commentId, user_id], (err) => {
        if (err) return res.status(500).send("Error deleting comment.");
        res.send("Comment deleted successfully.");
    });
});



module.exports = router;
