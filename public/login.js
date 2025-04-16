function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const msg = document.getElementById("login-msg");
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            window.location.href = "/admin.html";
        } else {
            msg.className = "message error";
            msg.innerText = "Usuário ou senha incorretos.";
        }
    });
}
