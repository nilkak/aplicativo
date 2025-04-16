function atualizaStatus() {
    fetch("/admin/status")
      .then(res => res.json())
      .then(data => {
        const status = document.getElementById("status");
        status.className = "message " + (data.conectado ? "success" : "error");
        status.innerText = data.conectado ? "✅ Conectado ao WhatsApp" : "❌ Não conectado";
      });
  }
  
  function aplicarFiltro() {
    const numero = document.getElementById("filtroNumero").value.trim();
    const data = document.getElementById("filtroData").value;
  
    fetch("/admin/logs")
      .then(res => res.json())
      .then(dataLogs => {
        const logList = document.getElementById("log-list");
        logList.innerHTML = '';
  
        dataLogs
          .filter(log =>
            (!numero || log.numero.includes(numero)) &&
            (!data || log.hora.startsWith(data.split("-").reverse().join("/")))
          )
          .forEach(log => {
            const li = document.createElement("li");
            li.textContent = `${log.hora} - ${log.numero} - Código: ${log.codigo}`;
            logList.appendChild(li);
          });
      });
  }
  
  function carregaLogs() {
    fetch("/admin/logs")
      .then(res => res.json())
      .then(data => {
        const logList = document.getElementById("log-list");
        logList.innerHTML = '';
        data.forEach(log => {
          const li = document.createElement("li");
          li.textContent = `${log.hora} - ${log.numero} - Código: ${log.codigo}`;
          logList.appendChild(li);
        });
      });
  }
  
  atualizaStatus();
  carregaLogs();
  setInterval(() => {
    atualizaStatus();
    carregaLogs();
  }, 10000);
  
  // WebSocket para QR Code ao vivo
  const socket = io();
  
  socket.on('qr', qr => {
    const img = document.getElementById("qr-image");
    img.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=200x200`;
    img.style.display = "block";
    document.getElementById("qr-msg").innerText = "Escaneie o QR Code para conectar:";
    document.getElementById("qr-container").style.display = "block";
  });
  
  socket.on('ready', () => {
    // Esconde o título e o container do QR
    document.getElementById("qr-title").style.display = "none";
    document.getElementById("qr-container").style.display = "none";
  
    // Opcional: mostrar um aviso de sucesso
    const status = document.getElementById("status");
    status.className = "message success";
    status.innerText = "✅ WhatsApp conectado com sucesso!";
  });
  
  // Ao carregar a página, buscar QR existente
  fetch("/admin/qr")
    .then(res => res.json())
    .then(data => {
      const qrContainer = document.getElementById("qr-container");
      if (data.qr) {
        const img = document.getElementById("qr-image");
        img.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.qr)}&size=200x200`;
        img.style.display = "block";
        document.getElementById("qr-msg").innerText = "Escaneie o QR Code para conectar:";
        qrContainer.style.display = "block";
      } else {
        qrContainer.innerHTML =
          "<p style='color: green; text-align: center; font-weight: bold;'>✅ WhatsApp já está conectado!</p>";
      }
    });
  