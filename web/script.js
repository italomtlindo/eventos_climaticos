
const formLogin = document.getElementById("formLogin");

if (formLogin) {
    const mensagem = document.getElementById("mensagem");

    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        mensagem.textContent = "Verificando acesso...";
        mensagem.style.color = "#1769aa";

        try {
            const resposta = await fetch("http://localhost:3000/usuario/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mensagem.textContent = dados.mensagem || "Não foi possível entrar.";
                mensagem.style.color = "red";
                return;
            }

            localStorage.setItem("usuario", JSON.stringify(dados));
            window.location.href = "home.html";
        } catch (erro) {
            mensagem.textContent = "Não foi possível conectar ao servidor.";
            mensagem.style.color = "red";
        }
    });
}
