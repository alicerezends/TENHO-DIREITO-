/*
  ARQUIVO: app.js
  O QUE É: a lógica do site. Ele faz quatro coisas:
    1. Abre o fluxo de perguntas do direito escolhido.
    2. Guarda as respostas e mostra o progresso.
    3. Calcula as possibilidades (regras de elegibilidade) e mostra o resultado.
    4. Conversa com o assistente, enviando a dúvida ao servidor (assistente.py).

  IMPORTANTE: as regras de renda e idade ficam no bloco "REGRAS" logo abaixo.
  Os valores (limites de renda, salário mínimo) mudam com o tempo.
  Confira sempre a legislação vigente antes de publicar.
*/

/* =========================================================================
   REGRAS: valores usados para decidir a possibilidade de cada direito
   Edite AQUI quando os valores oficiais mudarem.
   ========================================================================= */
const REGRAS = {
  /* Salário mínimo vigente. Usado para calcular o limite do BPC (um quarto do salário). */
  SALARIO_MINIMO: 1621,

  /* Limite de renda por pessoa para o Bolsa Família, em reais por mês. */
  LIMITE_BOLSA_PER_CAPITA: 218,

  /* Idade mínima para o BPC do idoso. */
  IDADE_MINIMA_BPC_IDOSO: 65,

  /* Tempo de contribuição de referência usado apenas como orientação simples. */
  ANOS_CONTRIBUICAO_REFERENCIA: 15
};

/* =========================================================================
   FLUXOS: as perguntas de cada direito, na ordem em que aparecem.
   Cada pergunta tem:
     id    -> nome interno da resposta (ex.: "renda")
     tipo  -> "numero" (campo para digitar) ou "sim_nao" (dois botões)
     texto -> o que aparece para a pessoa
   ========================================================================= */
const FLUXOS = {
  bolsa: [
    { id: "pessoas", tipo: "numero", texto: "Quantas pessoas moram na sua casa, incluindo você?" },
    { id: "renda",   tipo: "numero", texto: "Qual é a renda total mensal da família, em reais? (Se não houver renda, digite 0.)" },
    { id: "filhos",  tipo: "sim_nao", texto: "Há crianças, adolescentes ou gestantes na família?" }
  ],
  bpc: [
    { id: "idade",       tipo: "numero",  texto: "Qual é a sua idade?" },
    { id: "deficiencia", tipo: "sim_nao", texto: "Você tem alguma deficiência de longo prazo que dificulte sua participação na sociedade?" },
    { id: "pessoas",     tipo: "numero",  texto: "Quantas pessoas moram na sua casa, incluindo você?" },
    { id: "renda",       tipo: "numero",  texto: "Qual é a renda total mensal da família, em reais? (Se não houver renda, digite 0.)" }
  ],
  aposentadoria: [
    { id: "idade",        tipo: "numero",  texto: "Qual é a sua idade?" },
    { id: "contribuicao", tipo: "sim_nao", texto: "Você já contribuiu para o INSS (com carteira assinada, como autônomo ou como contribuinte individual)?" },
    { id: "anos",         tipo: "numero",  texto: "Aproximadamente quantos anos de contribuição você tem?" }
  ],
  cras: [
    { id: "pessoas",       tipo: "numero",  texto: "Quantas pessoas moram na sua casa, incluindo você?" },
    { id: "vulnerabilidade", tipo: "sim_nao", texto: "Você passa por dificuldade para pagar contas básicas, como comida, aluguel ou remédios?" }
  ]
};

/* Nome bonito de cada direito, usado nos títulos e no progresso. */
const NOMES = {
  bolsa: "Bolsa Família",
  bpc: "BPC",
  aposentadoria: "Aposentadoria",
  cras: "Atendimento no CRAS"
};

/* Lista de documentos que costumam ser pedidos. Pode variar: sempre confirmar no local. */
const DOCUMENTOS = {
  bolsa: [
    "Documento com foto (RG ou CNH)",
    "CPF de todas as pessoas da família",
    "Cadastro Único atualizado (se não tiver, o CRAS faz o cadastro)",
    "Comprovante de residência"
  ],
  bpc: [
    "Documento com foto e CPF",
    "Comprovante de residência",
    "Laudos e exames que comprovem a deficiência ou a condição de saúde",
    "Documentos que comprovem a renda da família"
  ],
  aposentadoria: [
    "Documento com foto e CPF",
    "Carteira de trabalho ou carnês de contribuição",
    "Documentos que comprovem o tempo de contribuição",
    "Certidão de nascimento ou de casamento, se aplicável"
  ],
  cras: [
    "Documento com foto e CPF",
    "Comprovante de residência",
    "Cadastro Único, se já tiver"
  ]
};

/* =========================================================================
   ESTADO: informações que mudam enquanto a pessoa usa o site
   ========================================================================= */
let direitoAtual = null;   // qual direito está sendo verificado agora
let passoAtual = 0;        // número da pergunta atual (começa em 0)
let respostas = {};        // guarda o que a pessoa respondeu, ex.: { renda: 300 }
let historicoChat = [];    // mensagens do chat, para o assistente lembrar do que foi dito

/* Atalho para pegar um elemento da página pelo id, sem repetir document.getElementById. */
const $ = (id) => document.getElementById(id);

/* Mostra apenas uma das telas (inicio, perguntas ou resultado) e esconde as outras. */
function mostrarTela(nome) {
  $("tela-inicio").hidden = nome !== "inicio";
  $("tela-perguntas").hidden = nome !== "perguntas";
  $("tela-resultado").hidden = nome !== "resultado";
  window.scrollTo({ top: 0, behavior: "smooth" }); // sobe para o topo ao trocar de tela
}

/* Começa o fluxo de um direito: zera as respostas e mostra a primeira pergunta. */
function iniciarFluxo(direito) {
  direitoAtual = direito;
  passoAtual = 0;
  respostas = {}; // limpa respostas de uma verificação anterior
  mostrarTela("perguntas");
  mostrarPergunta();
}

/* Desenha a pergunta atual na tela: título, campo ou botões, progresso e botões de navegação. */
function mostrarPergunta() {
  const lista = FLUXOS[direitoAtual];
  const pergunta = lista[passoAtual];

  // Progresso: texto e barra. Ex.: "Bolsa Família · pergunta 2 de 3".
  $("progresso-texto").textContent = `${NOMES[direitoAtual]} · pergunta ${passoAtual + 1} de ${lista.length}`;
  $("progresso-barra").style.width = `${((passoAtual + 1) / lista.length) * 100}%`;

  $("pergunta-titulo").textContent = pergunta.texto;

  const corpo = $("pergunta-corpo");
  corpo.innerHTML = ""; // limpa a pergunta anterior

  if (pergunta.tipo === "numero") {
    // Campo para digitar um número (ex.: renda, idade).
    const campo = document.createElement("input");
    campo.type = "number";
    campo.min = "0";
    campo.inputMode = "numeric";  // abre teclado numérico no celular
    campo.id = "campo-numero";
    campo.className = "campo";
    campo.placeholder = "Digite um número";
    if (respostas[pergunta.id] !== undefined) campo.value = respostas[pergunta.id];
    corpo.appendChild(campo);
    setTimeout(() => campo.focus(), 50); // deixa o cursor já no campo
  } else {
    // Dois botões: Sim e Não.
    const grupo = document.createElement("div");
    grupo.className = "opcoes";
    [["Sim", true], ["Não", false]].forEach(([texto, valor]) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "opcao";
      botao.textContent = texto;
      if (respostas[pergunta.id] === valor) botao.classList.add("opcao--ativa");
      botao.addEventListener("click", () => {
        respostas[pergunta.id] = valor; // guarda a escolha
        grupo.querySelectorAll(".opcao").forEach((b) => b.classList.remove("opcao--ativa"));
        botao.classList.add("opcao--ativa"); // destaca a escolha feita
      });
      grupo.appendChild(botao);
    });
    corpo.appendChild(grupo);
  }

  // O botão Voltar não aparece na primeira pergunta.
  $("btn-voltar").hidden = passoAtual === 0;
  // Na última pergunta, o botão muda para "Ver resultado".
  $("btn-proximo").textContent = passoAtual === lista.length - 1 ? "Ver resultado" : "Próxima";
}

/* Lê a resposta da pergunta atual e guarda. Devolve false se a pessoa não respondeu. */
function guardarRespostaAtual() {
  const pergunta = FLUXOS[direitoAtual][passoAtual];

  if (pergunta.tipo === "numero") {
    const valor = $("campo-numero").value;
    if (valor === "") return false;           // não deixa avançar sem digitar
    respostas[pergunta.id] = Number(valor);   // converte o texto em número
    return true;
  }

  // Para Sim/Não, confere se algum botão foi escolhido.
  return respostas[pergunta.id] !== undefined;
}

/* =========================================================================
   CÁLCULO: decide a possibilidade de cada direito com base nas respostas.
   Este resultado é uma ORIENTAÇÃO, não uma decisão oficial.
   ========================================================================= */
function calcularPossibilidades() {
  const r = respostas;
  const mensagens = [];

  if (direitoAtual === "bolsa") {
    // Renda por pessoa = renda total dividida pelo número de moradores.
    const rendaPorPessoa = r.pessoas > 0 ? r.renda / r.pessoas : 0;
    if (rendaPorPessoa <= REGRAS.LIMITE_BOLSA_PER_CAPITA) {
      mensagens.push("Pela renda informada, a família pode ter direito ao Bolsa Família. A análise final depende do Cadastro Único e do CRAS.");
    } else {
      mensagens.push("Pela renda informada, a família pode estar acima do limite do Bolsa Família. Vale conversar com o CRAS, pois as regras podem mudar.");
    }
    if (r.filhos) {
      mensagens.push("A presença de crianças, adolescentes ou gestantes pode dar prioridade no acompanhamento.");
    }
  }

  if (direitoAtual === "bpc") {
    // O BPC usa renda por pessoa abaixo de um quarto do salário mínimo.
    const limiteBpc = REGRAS.SALARIO_MINIMO / 4;
    const rendaPorPessoa = r.pessoas > 0 ? r.renda / r.pessoas : 0;
    const idosoElegivel = r.idade >= REGRAS.IDADE_MINIMA_BPC_IDOSO;
    const pcdElegivel = r.deficiencia === true;

    if ((idosoElegivel || pcdElegivel) && rendaPorPessoa < limiteBpc) {
      mensagens.push("Pelo que você informou, pode ter direito ao BPC. A análise final é feita pelo INSS.");
    } else {
      mensagens.push("Pelas respostas, o BPC pode não se aplicar agora. Procure o CRAS para uma orientação completa.");
    }
  }

  if (direitoAtual === "aposentadoria") {
    if (r.contribuicao === false) {
      mensagens.push("Sem contribuição ao INSS, a aposentadoria por contribuição não se aplica. Converse com o CRAS sobre outras opções.");
    } else if (r.anos >= REGRAS.ANOS_CONTRIBUICAO_REFERENCIA) {
      mensagens.push("Você pode ter direito a alguma aposentadoria. O tipo e o tempo exato são definidos pelo INSS, com base no seu histórico.");
    } else {
      mensagens.push("Você ainda pode estar longe do tempo mínimo. O INSS calcula o tempo exato com base no seu histórico de contribuições.");
    }
  }

  if (direitoAtual === "cras") {
    mensagens.push(r.vulnerabilidade
      ? "O CRAS pode acompanhar você e encaminhar para benefícios e serviços. Procure a unidade mais próxima."
      : "Você pode procurar o CRAS para se orientar sobre serviços e benefícios disponíveis.");
  }

  return mensagens;
}

/* Monta a tela de resultado com as possibilidades, os documentos e os links de mapa. */
function mostrarResultado() {
  const possibilidades = calcularPossibilidades();

  // Caixa verde com as possibilidades, uma linha por item.
  $("resultado-corpo").innerHTML =
    '<div class="caixa-resultado">' +
    possibilidades.map((texto) => `<p>${texto}</p>`).join("") +
    "</div>";

  // Lista de documentos do direito escolhido.
  $("lista-documentos").innerHTML = DOCUMENTOS[direitoAtual]
    .map((doc) => `<li>${doc}</li>`)
    .join("");

  atualizarLinksLocal(); // preenche os links de mapa (podem estar sem o local ainda)
  mostrarTela("resultado");
}

/* Cria os links para o CRAS e a Defensoria mais próximos. O bairro ou CEP digitado entra na busca. */
function atualizarLinksLocal() {
  const local = $("campo-local").value.trim();
  // encodeURIComponent deixa o texto seguro para usar dentro de um link.
  const busca = encodeURIComponent(local);

  $("links-local").innerHTML =
    `<a class="link-local" target="_blank" rel="noopener" href="https://www.google.com/maps/search/CRAS+${busca}">📍 Ver CRAS mais próximo no mapa</a>` +
    `<a class="link-local" target="_blank" rel="noopener" href="https://www.google.com/maps/search/Defensoria+P%C3%BAblica+${busca}">📍 Ver Defensoria Pública mais próxima no mapa</a>`;
}

/* =========================================================================
   CHAT: envia a dúvida ao servidor e mostra a resposta na janela
   ========================================================================= */

/* Acrescenta um balão na janela do chat. "tipo" é "usuario" ou "assistente". */
function adicionarBalao(texto, tipo) {
  const balao = document.createElement("div");
  balao.className = `balao balao--${tipo}`;
  balao.textContent = texto; // textContent evita que o texto seja interpretado como código
  $("mensagens").appendChild(balao);
  rolarParaFim();
  return balao;
}

/* Mantém a conversa sempre mostrando a mensagem mais nova. */
function rolarParaFim() {
  const area = $("mensagens");
  area.scrollTop = area.scrollHeight;
}

/* Envia a pergunta da pessoa ao servidor e mostra a resposta. */
async function enviarChat(evento) {
  evento.preventDefault(); // impede que o formulário recarregue a página

  const campo = $("campo-chat");
  const pergunta = campo.value.trim();
  if (!pergunta) return;

  adicionarBalao(pergunta, "usuario");
  campo.value = "";
  historicoChat.push({ papel: "usuario", texto: pergunta });

  // Balão de "pensando..." enquanto a resposta não chega.
  const aguardando = adicionarBalao("", "assistente");
  aguardando.innerHTML = '<span class="digitando"><span></span><span></span><span></span></span>';

  try {
    // Chamada ao servidor (assistente.py), que é quem guarda a chave da API.
    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: pergunta, historico: historicoChat.slice(-6) })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Não consegui responder agora.");
    }

    aguardando.textContent = dados.resposta;
    historicoChat.push({ papel: "assistente", texto: dados.resposta });
  } catch (erro) {
    // Se algo falhar, mostra uma mensagem simples em vez de travar a tela.
    aguardando.textContent = "Não consegui responder agora. Tente de novo em instantes, ou procure o CRAS.";
  }
  rolarParaFim();
}

/* =========================================================================
   LIGAÇÕES: conecta os botões e campos da página às funções acima
   ========================================================================= */

// Os quatro cartões da tela inicial: cada um abre o fluxo do seu direito.
document.querySelectorAll("[data-direito]").forEach((cartao) => {
  cartao.addEventListener("click", () => iniciarFluxo(cartao.dataset.direito));
});

// Botão "Próxima": valida a resposta, avança ou mostra o resultado.
$("btn-proximo").addEventListener("click", () => {
  if (!guardarRespostaAtual()) return; // se não respondeu, fica na mesma pergunta
  if (passoAtual < FLUXOS[direitoAtual].length - 1) {
    passoAtual++;
    mostrarPergunta();
  } else {
    mostrarResultado();
  }
});

// Botão "Voltar": volta uma pergunta, se possível.
$("btn-voltar").addEventListener("click", () => {
  if (passoAtual > 0) {
    passoAtual--;
    mostrarPergunta();
  }
});

// Campo do bairro/CEP: atualiza os links de mapa a cada letra digitada.
$("campo-local").addEventListener("input", atualizarLinksLocal);

// Botão "Fazer outra verificação": volta para a tela inicial.
$("btn-recomecar").addEventListener("click", () => mostrarTela("inicio"));

// Chat: abre e fecha a janela pelo botão flutuante e pelo X.
$("abrir-chat").addEventListener("click", () => {
  const janela = $("janela-chat");
  const abrindo = janela.hidden;
  janela.hidden = !abrindo;
  $("abrir-chat").setAttribute("aria-expanded", String(abrindo));
  if (abrindo) {
    $("campo-chat").focus();
    // Mensagem de boas-vindas só na primeira vez que a janela abre.
    if ($("mensagens").childElementCount === 0) {
      adicionarBalao("Olá! Posso explicar como o site funciona ou tirar dúvidas sobre os direitos. Não sou advogado e não substituo o atendimento do CRAS ou da Defensoria.", "assistente");
    }
  }
});
$("fechar-chat").addEventListener("click", () => {
  $("janela-chat").hidden = true;
  $("abrir-chat").setAttribute("aria-expanded", "false");
});

// Envio do formulário do chat.
$("form-chat").addEventListener("submit", enviarChat);
