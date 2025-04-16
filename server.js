// === server.js ===
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const client = new Client({ authStrategy: new LocalAuth() });
const codigos = {};
const logs = [];
let ultimoQR = '';
let conectado = false;

app.use(session({
    secret: "senhaSuperSecreta123",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/admin.html", (req, res) => {
    if (req.session && req.session.logado) {
        res.sendFile(path.join(__dirname, "views", "admin.html"));
    } else {
        res.redirect("/login.html");
    }
});

app.post("/login", (req, res) => {
    const { user, pass } = req.body;
    const USUARIO = "snackin24h";
    const SENHA = "SMn@33133132";
    if (user === USUARIO && pass === SENHA) {
        req.session.logado = true;
        res.json({ ok: true });
    } else {
        res.json({ ok: false });
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

client.on("qr", (qr) => {
    ultimoQR = qr;
    conectado = false;
    console.log("📲 Escaneie o QR Code com o WhatsApp Web:");
    qrcode.generate(qr, { small: true });
    io.emit("qr", qr);
});

client.on("ready", () => {
    conectado = true;
    ultimoQR = '';
    console.log("✅ WhatsApp conectado!");
    io.emit("ready");
});

client.initialize();

app.post("/enviar-codigo", async (req, res) => {
    const { numero } = req.body;
    const numeroLimpo = numero.replace(/\D/g, '');
    if (!/^\d{10,11}$/.test(numeroLimpo)) {
        return res.json({ sucesso: false, erro: "Número inválido. Use DDD + número, apenas dígitos." });
    }
    const numeroFormatado = `55${numeroLimpo}`;
    try {
        const numeroId = await client.getNumberId(numeroFormatado);
        if (!numeroId) return res.json({ sucesso: false, erro: "Este número não possui WhatsApp." });

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        codigos[numeroLimpo] = codigo;
        logs.unshift({ numero: numeroFormatado, codigo, hora: new Date().toLocaleString("pt-BR") });
        if (logs.length > 20) logs.pop();
        await client.sendMessage(numeroId._serialized, `Seu código de verificação *Snackin* é: ${codigo}`);
        res.json({ sucesso: true });
    } catch (err) {
        console.error("Erro ao enviar:", err);
        res.json({ sucesso: false, erro: err.message });
    }
});

app.post("/verificar-codigo", (req, res) => {
    const { numero, codigo } = req.body;
    const numeroLimpo = numero.replace(/\D/g, '');
    if (codigos[numeroLimpo] === codigo) {
        delete codigos[numeroLimpo];
        res.json({ sucesso: true });
    } else {
        res.json({ sucesso: false });
    }
});

app.get("/admin/status", (req, res) => {
    res.json({ conectado });
});

app.get("/admin/qr", (req, res) => {
    if (!conectado && ultimoQR) {
        res.json({ qr: ultimoQR });
    } else {
        res.json({ qr: null });
    }
});

app.get("/admin/logs", (req, res) => {
    res.json(logs);
});

io.on('connection', () => {
    console.log('🧩 Socket.io conectado!');
});

server.listen(PORT, () => {
    console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});
