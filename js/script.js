const API_URL = "http://localhost:3000/pessoas";

const form = document.getElementById("form-pessoa");
const inputNome = document.getElementById("nome");
const inputIdade = document.getElementById("idade");
const botao = document.getElementById("btn-cadastrar");
const mensagem = document.getElementById("mensagem");
const tabela = document.getElementById("tabela-pessoas");

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem " + tipo;
}

async function cadastrarPessoa(evento) {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  const idade = Number(inputIdade.value);

  if (nome === "" || inputIdade.value === "") {
    mostrarMensagem("Preencha o nome e a idade.", "erro");
    return;
  }
  if (!Number.isInteger(idade) || idade < 0) {
    mostrarMensagem("Informe uma idade válida (número inteiro).", "erro");
    return;
  }

  botao.disabled = true;
  botao.textContent = "Enviando...";

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, idade })
    });

    let dados = {};
    try {
      dados = await resposta.json();
    } catch (e) {
      dados = {};
    }

    if (!resposta.ok) {
      throw new Error(dados.mensagem || dados.erro || "Erro " + resposta.status + " ao cadastrar.");
    }

    mostrarMensagem(
      (dados.mensagem || "Pessoa cadastrada!") + (dados.id ? " (ID: " + dados.id + ")" : ""),
      "sucesso"
    );
    form.reset();
    inputNome.focus();
    listarPessoas();
  } catch (erro) {
    if (erro instanceof TypeError) {
      mostrarMensagem("Não foi possível conectar à API.");
    } else {
      mostrarMensagem("Erro ao cadastrar: " + erro.message, "erro");
    }
  } finally {
    botao.disabled = false;
    botao.textContent = "Cadastrar";
  }
}
async function listarPessoas() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Falha ao listar.");
    const pessoas = await resposta.json();

    tabela.innerHTML = "";

    if (pessoas.length === 0) {
      tabela.innerHTML = '<tr><td colspan="3">Nenhuma pessoa cadastrada.</td></tr>';
      return;
    }

    pessoas.forEach((p) => {
      const linha = document.createElement("tr");
      [p.id, p.nome, p.idade].forEach((valor) => {
        const celula = document.createElement("td");
        celula.textContent = valor;
        linha.appendChild(celula);
      });
      tabela.appendChild(linha);
    });
  } catch (erro) {
    tabela.innerHTML = '<tr><td colspan="3">Não foi possível carregar a lista.</td></tr>';
  }
}

form.addEventListener("submit", cadastrarPessoa);
listarPessoas();