document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const blogForm = document.getElementById("blog-form");
    const blogsContainer = document.getElementById("blogs-container");
    const writeBlogBtn = document.getElementById("write-blog-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const loginBtn = document.getElementById("login-btn");
    const welcomeMessage = document.getElementById("welcome-message");

    let token = localStorage.getItem("token");
    let role = localStorage.getItem("role");
    let username = localStorage.getItem("username");
    let user_id = localStorage.getItem("user_id");


    // ✅ Show/hide UI elements based on login status
    if (user_id) {
        // User is logged in
        if (welcomeMessage) welcomeMessage.textContent = `Hello, ${username}`;
        if (loginBtn) loginBtn.classList.add("hidden");
        if (logoutBtn) logoutBtn.classList.remove("hidden");
        if (writeBlogBtn && role === "author") writeBlogBtn.classList.remove("hidden");
    } else {
        // User is not logged in
        if (welcomeMessage) welcomeMessage.textContent = "Login to comment or write a blog";
        if (loginBtn) loginBtn.classList.remove("hidden");
        if (logoutBtn) logoutBtn.classList.add("hidden");
        if (writeBlogBtn) writeBlogBtn.classList.add("hidden");
    }

    // ✅ Update the welcome message only if logged in
    if (welcomeMessage) {
        if (username) {
            welcomeMessage.textContent = `Hello ${username}, what's on your mind today?`;
        } else {
            welcomeMessage.style.display = "none"; // Hide if not logged in
        }
    }

    // ✅ Show "Write Blog" button only for authors
    if (writeBlogBtn && role === "author") {
        writeBlogBtn.classList.remove("hidden");
        writeBlogBtn.addEventListener("click", () => {
            window.location.href = "write-blog.html";
        });
    }

    // ✅ Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
        });
    }

    //Handle User Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const response = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("username", data.username);
                localStorage.setItem("user_id", data.user_id);
                window.location.href = "home.html";
            } else {
                alert(data.error || "Login failed");
            }
        });
    }


    // ✅ Handle User Registration
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            const response = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful! Please login.");
                window.location.href = "login.html";
            } else {
                alert(data.error || "Registration failed");
            }
        });
    }

    // ✅ Load all blogs
    window.loadBlogs = async function(sortBy = "date") {  // ✅ Make it globally accessible
        try {
            const response = await fetch(`/blogs?sort=${sortBy}`);
            const blogs = await response.json();
            blogsContainer.innerHTML = "";

            blogs.forEach(async (blog) => {
                const blogDiv = document.createElement("div");
                blogDiv.classList.add("blog-post");
                blogDiv.innerHTML = `
                    <h3>${blog.title}</h3>
                    <p>${blog.content}</p>
                    <small>Posted by ${blog.author_name} on: ${blog.timestamp}</small>
                    <small> | Comments: ${blog.comment_count}</small>

                    ${user_id == blog.author_id ? `
                    <button onclick="editBlog(${blog.id}, '${blog.title}', '${blog.content}')">Edit</button>
                    <button onclick="deleteBlog(${blog.id})">Delete</button>
                    ` : ""}

                    <div class="comment-section" id="comments-${blog.id}">
                        ${user_id ? `
                        <input class="comment-input" id="comment-input-${blog.id}" placeholder="Add a comment">
                        <button class="comment-btn" onclick="addComment(${blog.id})">Post</button>
                        ` : '<p class="login-warning">Login to post comments</p>'}
                        <div class="comment-list"></div>
                    </div>
                `;

                blogsContainer.appendChild(blogDiv);
                loadComments(blog.id);
            });
        } catch (error) {
            console.error("Error loading blogs:", error);
        }
    };
    

    // ✅ Submit a blog
    if (blogForm) {
        blogForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("blog-title").value;
            const content = document.getElementById("blog-content").value;

            if (!user_id || role !== "author") {
                alert("Only authors can post blogs.");
                return;
            }

            const response = await fetch("/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, author_id: user_id })
            });

            if (response.ok) {
                alert("Blog posted successfully!");
                window.location.href = "home.html";
            } else {
                alert("Error posting blog.");
            }
        });
    }

    // ✅ Load comments for a blog
    async function loadComments(blog_id) {
        try {
            const response = await fetch(`/comments/${blog_id}`);
            const comments = await response.json();
    
            // ✅ Get the correct comment section container
            const commentSection = document.getElementById(`comments-${blog_id}`);
            if (!commentSection) return;
    
            // ✅ Clear existing comments before appending new ones
            let commentListHTML = '<div class="comment-list">';
            comments.forEach(comment => {
                commentListHTML += `
                    <div class="comment-item">
                        <p>
                            <strong>${comment.commenter_name}:</strong> ${comment.comment_text}
                        </p>
                        ${user_id == comment.user_id ? `
                            <button class="edit-btn" onclick="editComment(${comment.id}, ${blog_id})">Edit</button>
                            <button class="delete-btn" onclick="deleteComment(${comment.id}, ${blog_id})">Delete</button>
                        ` : ""}
                    </div>
                `;
            });
            commentListHTML += "</div>";
    
            // ✅ Ensure comments display in the correct section
            commentSection.querySelector(".comment-list").innerHTML = commentListHTML;
    
        } catch (error) {
            console.error("Error loading comments:", error);
        }
    }

    // ✅ Add a comment
    window.addComment = async function(blog_id) {
        const commentInput = document.getElementById(`comment-input-${blog_id}`);
        const commentText = commentInput.value;
    
        if (!user_id) {
            alert("You must be logged in to post a comment.");
            return;
        }
    
        const response = await fetch("/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blog_id, user_id, comment_text: commentText })
        });
    
        if (response.ok) {
            commentInput.value = "";  // Clear input field after posting
            await loadComments(blog_id);  // ✅ Reload comments after posting
        } else {
            alert("Error adding comment.");
        }
    };
    

    // ✅ Edit a blog
    window.editBlog = async function(blogId, oldTitle, oldContent) {
        const newTitle = prompt("Enter new title:", oldTitle);
        const newContent = prompt("Enter new content:", oldContent);
        if (!newTitle || !newContent) return;

        const response = await fetch(`/blogs/${blogId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, content: newContent, author_id: user_id })
        });

        if (response.ok) {
            alert("Blog updated successfully!");
            loadBlogs();
        } else {
            alert("Error updating blog.");
        }
    };


    // ✅ Delete a blog
    window.deleteBlog = async function(blogId) {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        const response = await fetch(`/blogs/${blogId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ author_id: user_id })
        });

        if (response.ok) {
            alert("Blog deleted successfully!");
            loadBlogs();
        } else {
            alert("Error deleting blog.");
        }
    };

    // ✅ Edit a comment
    window.editComment = async function(commentId) {
        const newComment = prompt("Edit your comment:");
        if (!newComment) return;

        const response = await fetch(`/comments/${commentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment_text: newComment, user_id })
        });

        if (response.ok) {
            loadBlogs();
        } else {
            alert("Error updating comment.");
        }
    };

    // ✅ Delete a comment
    window.deleteComment = async function(commentId) {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        const response = await fetch(`/comments/${commentId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id })
        });

        if (response.ok) {
            loadBlogs();
        } else {
            alert("Error deleting comment.");
        }
    };

    if (blogsContainer) loadBlogs();
});
