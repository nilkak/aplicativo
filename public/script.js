let numeroGlobal = '';

function validarNumero(numero) {
    const apenasDigitos = numero.replace(/\D/g, '');
    return /^\d{10,11}$/.test(apenasDigitos);
}

function enviarCodigo() {
    const phone = document.getElementById("phone").value.trim();
    const msg1 = document.getElementById("msg1");
    msg1.className = "message";
    
    if (!validarNumero(phone)) {
        msg1.classList.add("error");
        msg1.innerText = "Número inválido. Use DDD + número (apenas dígitos).";
        return;
    }
    
    fetch("/enviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: phone })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            numeroGlobal = phone;
            msg1.classList.add("success");
            msg1.innerText = "Código enviado com sucesso!";
            
            setTimeout(() => {
                document.getElementById("step1").classList.remove("active");
                document.getElementById("step2").classList.add("active");
            }, 1000);
        } else {
            msg1.classList.add("error");
            msg1.innerText = data.erro || "Erro ao enviar código";
        }
    })
    .catch(err => {
        msg1.classList.add("error");
        msg1.innerText = "Erro na comunicação com o servidor";
    });
}

function verificarCodigo() {
    const codigo = document.getElementById("codigoDigitado").value.trim();
    const msg2 = document.getElementById("msg2");
    msg2.className = "message";
    
    fetch("/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: numeroGlobal, codigo: codigo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            msg2.classList.add("success");
            msg2.innerText = "Verificação bem-sucedida! Redirecionando...";
            setTimeout(() => {
                window.location.href = "https://lionsse.com.br";
            }, 2000);
        } else {
            msg2.classList.add("error");
            msg2.innerText = "Código incorreto. Tente novamente.";
        }
    })
    .catch(err => {
        msg2.classList.add("error");
        msg2.innerText = "Erro na verificação";
    });
}

document.getElementById("phone").addEventListener("input", function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = `(${value.substring(0,2)}) ${value.substring(2)}`;
    }
    if (value.length > 10) {
        value = `${value.substring(0,10)}-${value.substring(10,15)}`;
    }
    e.target.value = value;
});
