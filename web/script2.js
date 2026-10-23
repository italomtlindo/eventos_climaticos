const API = "http://localhost:3000";

const usuarioSalvo = localStorage.getItem("usuario");

if (!usuarioSalvo) {
    window.location.href = "index.html";
} else {
    iniciarHome(JSON.parse(usuarioSalvo));
}

function iniciarHome(usuario) {
    const formEvento = document.getElementById("formEvento");
    const listaEventos = document.getElementById("listaEventos");
    const mensagemEvento = document.getElementById("mensagemEvento");
    const mensagemLista = document.getElementById("mensagemLista");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnCancelar = document.getElementById("btnCancelar");

    let eventoEditando = null;

    document.getElementById("boasVindas").textContent =
        "Olá, " + usuario.nome + "!";

    document.getElementById("btnSair").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });

    document.getElementById("btnAtualizar").addEventListener("click", carregarEventos);

    function mostrarMensagem(elemento, texto, erro = false) {
        elemento.textContent = texto;
        elemento.style.color = erro ? "#b91c1c" : "#15803d";
    }

    async function carregarEventos() {
        listaEventos.innerHTML = '<p class="vazio">Carregando eventos...</p>';
        mensagemLista.textContent = "";

        try {
            const resposta = await fetch(API + "/evento/listar");

            if (!resposta.ok) {
                throw new Error("Falha ao carregar eventos.");
            }

            const eventos = await resposta.json();

            document.getElementById("totalEventos").textContent = eventos.length;

            const cidades = new Set(
                eventos.map(evento => evento.cidade.trim().toLowerCase())
            );

            document.getElementById("totalCidades").textContent = cidades.size;

            const temperaturas = eventos
                .map(evento => evento.temperaturaMaxima)
                .filter(temperatura => temperatura !== null && temperatura !== undefined);

            document.getElementById("maiorTemperatura").textContent =
                temperaturas.length > 0
                    ? Math.max(...temperaturas) + " °C"
                    : "--";

            listaEventos.innerHTML = "";

            if (eventos.length === 0) {
                listaEventos.innerHTML =
                    '<p class="vazio">Nenhum evento cadastrado ainda.</p>';
                return;
            }

            eventos.forEach(evento => {
                const card = document.createElement("article");
                card.className = "evento";

                const titulo = document.createElement("h3");
                titulo.textContent = evento.tipoEvento;

                const cidade = document.createElement("p");
                cidade.textContent = "📍 Cidade: " + evento.cidade;

                const temperatura = document.createElement("p");
                temperatura.textContent =
                    "🌡️ Temperatura máxima: " +
                    (evento.temperaturaMaxima ?? "Não informada") +
                    (evento.temperaturaMaxima !== null &&
                    evento.temperaturaMaxima !== undefined ? " °C" : "");

                const impacto = document.createElement("p");
                impacto.textContent = "⚠️ Impacto: " + evento.nivelImpacto;

                const data = document.createElement("p");
                data.textContent =
                    "📅 Data: " + new Date(evento.data).toLocaleDateString("pt-BR");

                const acoes = document.createElement("div");
                acoes.className = "acoes";

                const editar = document.createElement("button");
                editar.className = "editar";
                editar.textContent = "Editar";
                editar.addEventListener("click", () => prepararEdicao(evento));

                const excluir = document.createElement("button");
                excluir.className = "excluir";
                excluir.textContent = "Excluir";
                excluir.addEventListener("click", () => excluirEvento(evento.id));

                acoes.append(editar, excluir);
                card.append(titulo, cidade, temperatura, impacto, data, acoes);
                listaEventos.appendChild(card);
            });
        } catch (erro) {
            listaEventos.innerHTML =
                '<p class="vazio">Não foi possível carregar os eventos. Confira se o servidor está funcionando.</p>';
        }
    }

    function prepararEdicao(evento) {
        eventoEditando = evento.id;

        document.getElementById("tituloFormulario").textContent = "Editar evento";
        document.getElementById("cidade").value = evento.cidade;
        document.getElementById("tipoEvento").value = evento.tipoEvento;
        document.getElementById("temperaturaMaxima").value =
            evento.temperaturaMaxima ?? "";
        document.getElementById("nivelImpacto").value = evento.nivelImpacto;

        btnSalvar.textContent = "Salvar alterações";
        btnCancelar.hidden = false;
        mensagemEvento.textContent = "";

        document.getElementById("cidade").focus();
    }

    function limparFormulario() {
        formEvento.reset();
        eventoEditando = null;

        document.getElementById("tituloFormulario").textContent = "Cadastrar evento";
        btnSalvar.textContent = "Cadastrar evento";
        btnCancelar.hidden = true;
    }

    btnCancelar.addEventListener("click", () => {
        limparFormulario();
        mensagemEvento.textContent = "";
    });

    formEvento.addEventListener("submit", async event => {
        event.preventDefault();

        const dados = {
            usuarioId: usuario.id,
            cidade: document.getElementById("cidade").value.trim(),
            tipoEvento: document.getElementById("tipoEvento").value,
            nivelImpacto: document.getElementById("nivelImpacto").value
        };

        const temperatura = document.getElementById("temperaturaMaxima").value;

        dados.temperaturaMaxima =
            temperatura === "" ? null : Number(temperatura);

        const editando = eventoEditando !== null;

        const url = editando
            ? API + "/evento/atualizar/" + eventoEditando
            : API + "/evento/cadastrar";

        btnSalvar.disabled = true;
        mostrarMensagem(mensagemEvento, "Salvando evento...");

        try {
            const resposta = await fetch(url, {
                method: editando ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem || "Não foi possível salvar o evento."
                );
            }

            mostrarMensagem(
                mensagemEvento,
                editando
                    ? "Evento atualizado com sucesso!"
                    : "Evento cadastrado com sucesso!"
            );

            limparFormulario();
            await carregarEventos();
        } catch (erro) {
            mostrarMensagem(
                mensagemEvento,
                erro.message || "Erro ao conectar com o servidor.",
                true
            );
        } finally {
            btnSalvar.disabled = false;
        }
    });

    async function excluirEvento(id) {
        if (!confirm("Deseja realmente excluir este evento?")) {
            return;
        }

        try {
            const resposta = await fetch(
                API + "/evento/excluir/" + id,
                { method: "DELETE" }
            );

            if (!resposta.ok) {
                throw new Error();
            }

            mostrarMensagem(mensagemLista, "Evento excluído com sucesso!");
            await carregarEventos();
        } catch (erro) {
            mostrarMensagem(
                mensagemLista,
                "Não foi possível excluir o evento.",
                true
            );
        }
    }

    carregarEventos();
}
