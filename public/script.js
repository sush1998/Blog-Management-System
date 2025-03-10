document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const blogForm = document.getElementById("blog-form");
    const blogsContainer = document.getElementById("blogs-container");
    const writeBlogBtn = document.getElementById("write-blog-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeMessage = document.getElementById("welcome-message");

    let token = localStorage.getItem("token");
    let role = localStorage.getItem("role");
    let username = localStorage.getItem("username");

    // ✅ Update the welcome message
    if (welcomeMessage && username) {
        welcomeMessage.textContent = `Hello ${username}, what's on your mind today?`;
    }

    if (writeBlogBtn && role === "author") {
        writeBlogBtn.classList.remove("hidden");
        writeBlogBtn.addEventListener("click", () => {
            window.location.href = "write-blog.html";
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("username");
            window.location.href = "login.html";
        });
    }

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
                localStorage.setItem("username", data.username); // Store username
                window.location.href = "home.html";
            } else {
                alert("Login failed");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role })
            });

            window.location.href = "login.html";
        });
    }

    async function loadBlogs() {
        const response = await fetch("/blogs");
        const blogs = await response.json();
        blogsContainer.innerHTML = "";
        
        blogs.forEach(blog => {
            const blogDiv = document.createElement("div");
            blogDiv.classList.add("container");
            blogDiv.innerHTML = `<h3>${blog.title}</h3><p>${blog.content}</p>`;
            blogsContainer.appendChild(blogDiv);
        });
    }

    if (blogsContainer) loadBlogs();
});
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

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
                localStorage.setItem("user_id", data.user_id);  // ✅ Store user_id

                window.location.href = "home.html";
            } else {
                alert("Login failed");
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const blogForm = document.getElementById("blog-form");

    if (blogForm) {
        blogForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("blog-title").value;
            const content = document.getElementById("blog-content").value;
            const author_id = localStorage.getItem("user_id"); // ✅ Retrieve user_id

            if (!author_id) {
                alert("You must be logged in as an author to post a blog.");
                window.location.href = "login.html";
                return;
            }

            const response = await fetch("/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, author_id })
            });

            if (response.ok) {
                alert("Blog posted successfully!");
                window.location.href = "home.html";
            } else {
                alert("Error posting blog.");
            }
        });
    }
});
