const express = require("express");
const db = require("../database");

const router = express.Router();

// ✅ Create a Blog (POST)
router.post("/", (req, res) => {
    const { title, content, author_id } = req.body;

    // Validate required fields
    if (!title || !content || !author_id) {
        return res.status(400).send("Missing required fields.");
    }

    // Insert the new blog into the database    
    db.run("INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)", 
        [title, content, author_id], (err) => {
            // Handle any errors that occur during the insertion
            if (err) return res.status(500).send("Error creating blog.");
            // If successful, send a success message
            res.send("Blog created successfully.");
        });
});


// ✅ Fetch All Blogs (GET)
router.get("/", (req, res) => {
    const sort = req.query.sort;
    let orderClause;

    // Determine the order clause based on the sort query parameter
    if (sort === "time-asc") {
        orderClause = "ORDER BY blogs.timestamp ASC";
    } else if (sort === "time-desc") {
        orderClause = "ORDER BY blogs.timestamp DESC";
    } else if (sort === "comments-asc") {
        orderClause = "ORDER BY comment_count ASC";
    } else if (sort === "comments-desc") {
        orderClause = "ORDER BY comment_count DESC";
    } else {
        // Default: sort by newest time
        orderClause = "ORDER BY blogs.timestamp DESC";
    }

    // SQL query to fetch blogs with author name and comment count/timestamp
    // Using LEFT JOIN to include blogs even if they have no comments
    // Using COUNT in a subquery to get the number of comments for each blog
    // Using ORDER BY to sort the results based on the specified criteria
    const query = `
        SELECT blogs.id, blogs.title, blogs.content, blogs.timestamp, blogs.author_id, 
               users.name AS author_name,
               (SELECT COUNT(*) FROM comments WHERE comments.blog_id = blogs.id) AS comment_count
        FROM blogs
        LEFT JOIN users ON blogs.author_id = users.id
        ${orderClause};
    `;

    // Execute the query and return the results
    // Using db.all to fetch all rows that match the query
    db.all(query, [], (err, rows) => {
        if (err) {
            // Log the error and return a 500 status code with an error message 
            console.error("Error retrieving blogs:", err);
            // If an error occurs, send a 500 status code with an error message
            return res.status(500).json({ error: "Failed to fetch blogs" });
        }
        // If successful, return the rows as JSON
        res.json(rows);
    });
});


// ✅ Update a Blog (PUT)
router.put("/:id", (req, res) => {
    const { title, content, author_id } = req.body;
    const blogId = req.params.id;

    // Validate required fields
    if (!title || !content || !author_id) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Update the blog in the database
    // Using db.run to execute the update query
    // The query updates the title and content of the blog with the specified id and author_id
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





module.exports = router;
