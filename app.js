/*
  ARQUIVO: app.js
  O QUE É: a lógica do site. Ele faz cinco coisas:
    1. Exige o aceite do consentimento antes de liberar os direitos.
    2. Abre o fluxo de perguntas do direito escolhido (BPC, aposentadoria, Bolsa Família, CRAS).
    3. Guarda as respostas e mostra o progresso (só na tela; some ao fechar a página).
    4. Calcula uma ORIENTAÇÃO de possibilidade e mostra documentos e onde ir.
    5. Conversa com o assistente, enviando a dúvida ao servidor (assistente.py).

  IMPORTANTE: os valores do bloco REGRAS mudam com o tempo.
  Confira sempre a legislação vigente antes de publicar.
*/

/* =========================================================================
   REGRAS: valores usados nas contas. Edite AQUI quando mudarem.
   ========================================================================= */
const REGRAS = {
  /* Salário mínimo vigente. CONFERIR o valor atual. */
  SALARIO_MINIMO: 1621,

  /* BPC: renda por pessoa do grupo familiar deve ser menor que 1/4 do salário mínimo. */
  BPC_LIMITE_PER_CAPITA: 1621 / 4,

  /* Idade a partir da qual a pessoa idosa tem direito ao BPC (sem precisar de deficiência). */
  BPC_IDADE_IDOSO: 65,

  /* Bolsa Família: renda por pessoa de referência. CONFERIR o valor atual. */
  BOLSA_LIMITE_PER_CAPITA: 218,

  /* Aposentadoria por idade: idades mínimas (regra permanente). */
  APOSENT_IDADE_URBANA: { homem: 65, mulher: 62 },
  APOSENT_IDADE_RURAL: { homem: 60, mulher: 55 },

  /* Carência: 180 contribuições mensais, ou seja, 15 anos. */
  APOSENT_ANOS_CARENCIA: 15
};

/* =========================================================================
   FLUXOS: perguntas de cada direito, na ordem em que aparecem.
   Cada pergunta tem:
     id    -> nome interno da resposta
     tipo  -> "numero" (campo para digitar) ou "sim_nao" (dois botões)
     texto -> o que aparece para a pessoa
     se    -> (opcional) função que diz se a pergunta deve aparecer,
              com base nas respostas anteriores
   ========================================================================= */
const FLUXOS = {
  bpc: [
    { id: "idade", tipo: "numero",
      texto: "Qual é a idade da pessoa que vai pedir o BPC?" },
    { id: "deficiencia", tipo: "sim_nao",
      texto: "A pessoa tem alguma doença, deficiência ou limitação?",
      se: (r) => r.idade < REGRAS.BPC_IDADE_IDOSO },
    { id: "impedimento", tipo: "sim_nao",
      texto: "Essa condição dificulta a participação na sociedade em igualdade com outras pessoas, e já dura ou deve durar pelo menos 2 anos?",
      se: (r) => r.idade < REGRAS.BPC_IDADE_IDOSO && r.deficiencia === true },
    { id: "barreiras", tipo: "sim_nao",
      texto: "A pessoa precisa de ajuda para tomar banho, se alimentar, andar, estudar, trabalhar ou sair de casa, ou enfrenta outras barreiras para participar da sociedade?",
      se: (r) => r.idade < REGRAS.BPC_IDADE_IDOSO && r.deficiencia === true },
    { id: "membros", tipo: "numero",
      texto: "Quantas pessoas do grupo familiar moram sob o mesmo teto, incluindo a pessoa que pede? (Entram cônjuge ou companheiro, pais, irmãos solteiros, filhos solteiros e menores tutelados.)" },
    { id: "renda", tipo: "numero",
      texto: "Qual é a renda mensal somada do grupo familiar, em reais? (Digite 0 se não houver renda.)" },
    { id: "outroBeneficio", tipo: "sim_nao",
      texto: "Alguém do grupo familiar recebe BPC ou outro benefício de até um salário mínimo?" }
  ],

  aposentadoria: [
    { id: "idade", tipo: "numero",
      texto: "Qual é a sua idade?" },
    { id: "mulher", tipo: "sim_nao",
      texto: "Você é mulher?" },
    { id: "rural", tipo: "sim_nao",
      texto: "Você trabalhou principalmente no campo (atividade rural)?" },
    { id: "contribuiu", tipo: "sim_nao",
      texto: "Já contribuiu para o INSS (com carteira assinada, como autônomo, contribuinte individual ou de forma facultativa)?" },
    { id: "anos", tipo: "numero",
      texto: "Aproximadamente quantos anos de contribuição ao INSS você acredita ter?",
      se: (r) => r.contribuiu === true },
    { id: "pendencia", tipo: "sim_nao",
      texto: "Existem períodos sem registro no CNIS, ou contribuições pagas em atraso ou abaixo do mínimo?",
      se: (r) => r.contribuiu === true },
    { id: "docsRurais", tipo: "sim_nao",
      texto: "Você tem documentos da época do trabalho rural (notas de produtor, contratos, cadastro rural)?",
      se: (r) => r.rural === true }
  ],

  bolsa: [
    { id: "pessoas", tipo: "numero",
      texto: "Quantas pessoas moram na sua casa, incluindo você?" },
    { id: "renda", tipo: "numero",
      texto: "Qual é a renda total mensal da família, em reais? (Digite 0 se não houver renda.)" },
    { id: "filhos", tipo: "sim_nao",
      texto: "Há crianças, adolescentes ou gestantes na família?" }
  ],

  cras: [
    { id: "pessoas", tipo: "numero",
      texto: "Quantas pessoas moram na sua casa, incluindo você?" },
    { id: "vulnerabilidade", tipo: "sim_nao",
      texto: "Você tem dificuldade para pagar contas básicas, como comida, aluguel ou remédios?" }
  ]
};

/* Nome bonito de cada direito. */
const NOMES = {
  bpc: "BPC",
  aposentadoria: "Aposentadoria por idade",
  bolsa: "Bolsa Família",
  cras: "Atendimento no CRAS"
};

/* Documentos que costumam ser pedidos. Pode variar: confirmar no local. */
const DOCUMENTOS = {
  bpc: [
    "Documento com foto e CPF da pessoa que pede",
    "CPF e documento de todas as pessoas do grupo familiar",
    "Cadastro Único atualizado",
    "Laudos, exames ou relatórios médicos atualizados (no caso de deficiência)",
    "Comprovante de residência",
    "Comprovantes de renda da família"
  ],
  aposentadoria: [
    "Documento com foto e CPF",
    "Extrato do CNIS atualizado (pelo Meu INSS)",
    "Carteira de trabalho, carnês ou comprovantes de pagamento ao INSS",
    "Contratos, holerites ou termos de rescisão, se houver",
    "Documentos da época do trabalho rural, se houver",
    "Carta de indeferimento ou protocolo, se já tiver pedido"
  ],
  bolsa: [
    "Documento com foto (RG ou CNH)",
    "CPF de todas as pessoas da família",
    "Cadastro Único atualizado (se não tiver, o CRAS faz o cadastro)",
    "Comprovante de residência"
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
let direitoAtual = null;   // qual direito está sendo verificado
let passoAtual = 0;        // posição da pergunta atual na lista ativa
let respostas = {};        // o que a pessoa respondeu, ex.: { renda: 300 }
let historicoChat = [];    // mensagens do chat, para o assistente ter contexto

/* Atalho para pegar um elemento pelo id. */
const $ = (id) => document.getElementById(id);

/* Perguntas que devem aparecer agora, com base nas respostas dadas até aqui. */
function perguntasAtivas() {
  return FLUXOS[direitoAtual].filter((p) => !p.se || p.se(respostas));
}

/* Mostra apenas uma tela (inicio, perguntas ou resultado). */
function mostrarTela(nome) {
  $("tela-inicio").hidden = nome !== "inicio";
  $("tela-perguntas").hidden = nome !== "perguntas";
  $("tela-resultado").hidden = nome !== "resultado";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Começa o fluxo de um direito: zera as respostas e mostra a primeira pergunta. */
function iniciarFluxo(direito) {
  direitoAtual = direito;
  passoAtual = 0;
  respostas = {};
  mostrarTela("perguntas");
  mostrarPergunta();
}

/* Desenha a pergunta atual: título, campo ou botões, progresso e navegação. */
function mostrarPergunta() {
  const lista = perguntasAtivas();
  const pergunta = lista[passoAtual];

  $("progresso-texto").textContent = `${NOMES[direitoAtual]} · pergunta ${passoAtual + 1} de ${lista.length}`;
  $("progresso-barra").style.width = `${((passoAtual + 1) / lista.length) * 100}%`;
  $("pergunta-titulo").textContent = pergunta.texto;

  const corpo = $("pergunta-corpo");
  corpo.innerHTML = "";

  if (pergunta.tipo === "numero") {
    // Campo para digitar um número.
    const campo = document.createElement("input");
    campo.type = "number";
    campo.min = "0";
    campo.inputMode = "numeric";   // teclado numérico no celular
    campo.id = "campo-numero";
    campo.className = "campo";
    campo.placeholder = "Digite um número";
    if (respostas[pergunta.id] !== undefined) campo.value = respostas[pergunta.id];
    corpo.appendChild(campo);
    setTimeout(() => campo.focus(), 50);
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
        respostas[pergunta.id] = valor;
        grupo.querySelectorAll(".opcao").forEach((b) => b.classList.remove("opcao--ativa"));
        botao.classList.add("opcao--ativa");
      });
      grupo.appendChild(botao);
    });
    corpo.appendChild(grupo);
  }

  $("btn-voltar").hidden = passoAtual === 0;
  $("btn-proximo").textContent = passoAtual === lista.length - 1 ? "Ver resultado" : "Próxima";
}

/* Lê e guarda a resposta da pergunta atual. Devolve false se faltou responder. */
function guardarRespostaAtual() {
  const pergunta = perguntasAtivas()[passoAtual];

  if (pergunta.tipo === "numero") {
    const valor = $("campo-numero").value;
    if (valor === "") return false;
    respostas[pergunta.id] = Number(valor);
    return true;
  }
  return respostas[pergunta.id] !== undefined;
}

/* =========================================================================
   CÁLCULO: orientação de possibilidade. NÃO é decisão oficial.
   Cada função devolve uma lista de frases para mostrar na tela.
   ========================================================================= */
function calcularBPC() {
  const r = respostas;
  const msgs = [];
  const idoso = r.idade >= REGRAS.BPC_IDADE_IDOSO;
  const pcd = r.deficiencia === true && r.impedimento === true && r.barreiras === true;
  const rendaPorPessoa = r.membros > 0 ? r.renda / r.membros : 0;
  const limite = REGRAS.BPC_LIMITE_PER_CAPITA;

  if (!idoso && !pcd) {
    msgs.push("Pelas respostas, o BPC pode não se aplicar agora, porque não há idade de 65 anos ou deficiência de longo prazo com barreiras. Procure o CRAS para uma orientação completa.");
    return msgs;
  }

  const quem = idoso ? "pessoa idosa" : "pessoa com deficiência";
  if (rendaPorPessoa < limite * 0.8) {
    msgs.push(`Possível BPC para ${quem}: a renda por pessoa do grupo familiar parece abaixo do limite. A análise final é do INSS.`);
  } else if (rendaPorPessoa < limite * 1.2) {
    msgs.push(`Necessidade de análise mais detalhada: a renda por pessoa está perto do limite do BPC. Procure o CRAS ou a Defensoria para conferir as exclusões previstas em lei.`);
  } else {
    msgs.push("Pelas respostas, a renda por pessoa parece acima do limite do BPC. Vale conferir com o CRAS, pois algumas despesas e exclusões podem mudar a conta.");
  }

  if (r.outroBeneficio === true) {
    msgs.push("Como alguém da família já recebe BPC ou benefício de até um salário mínimo, esse valor costuma ficar fora do cálculo. Confirme isso com o CRAS.");
  }
  return msgs;
}

function calcularAposentadoria() {
  const r = respostas;
  const msgs = [];
  const idadeMin = r.rural
    ? (r.mulher ? REGRAS.APOSENT_IDADE_RURAL.mulher : REGRAS.APOSENT_IDADE_RURAL.homem)
    : (r.mulher ? REGRAS.APOSENT_IDADE_URBANA.mulher : REGRAS.APOSENT_IDADE_URBANA.homem);

  if (r.idade < idadeMin) {
    msgs.push(`Ainda não atingiu a idade mínima de ${idadeMin} anos para a aposentadoria por idade. Se você já era filiado antes da Reforma de 2019, existem regras de transição: peça ao INSS a análise.`);
    return msgs;
  }

  if (!r.contribuiu && !r.rural) {
    msgs.push("Sem contribuição ao INSS, a aposentadoria por idade não se aplica pela via contributiva. Procure o CRAS para conhecer outras opções.");
    return msgs;
  }

  if (!r.contribuiu && r.rural) {
    msgs.push(r.docsRurais
      ? "Possível aposentadoria rural: confirme o período de trabalho no campo com os documentos da época. Prova só testemunhal normalmente não basta."
      : "A aposentadoria rural depende de comprovar o trabalho no campo. Procure o CRAS ou o sindicato rural para reunir documentos.");
    return msgs;
  }

  if (r.pendencia === true) {
    msgs.push("Necessidade de conferência: há pendências no CNIS ou contribuições em atraso. Confira o extrato no Meu INSS antes do pedido.");
  }

  if (r.anos >= REGRAS.APOSENT_ANOS_CARENCIA) {
    msgs.push(r.rural
      ? "Possível aposentadoria híbrida: tempo urbano e rural podem ser somados. O INSS confirma a regra exata."
      : "Possível aposentadoria urbana por idade. A carência é de 180 contribuições (15 anos). A regra exata depende da data de filiação; o INSS confirma.");
  } else {
    msgs.push(`Ainda pode faltar tempo de contribuição: são necessários pelo menos ${REGRAS.APOSENT_ANOS_CARENCIA} anos (180 contribuições). Confira o CNIS para ver o tempo real.`);
  }
  return msgs;
}

function calcularBolsa() {
  const r = respostas;
  const rendaPorPessoa = r.pessoas > 0 ? r.renda / r.pessoas : 0;
  const msgs = [];
  msgs.push(rendaPorPessoa <= REGRAS.BOLSA_LIMITE_PER_CAPITA
    ? "Pela renda informada, a família pode ter direito ao Bolsa Família. A análise final depende do Cadastro Único e do CRAS."
    : "Pela renda informada, a família pode estar acima do limite do Bolsa Família. Vale conversar com o CRAS, pois as regras podem mudar.");
  if (r.filhos === true) {
    msgs.push("A presença de crianças, adolescentes ou gestantes pode dar prioridade no acompanhamento.");
  }
  return msgs;
}

function calcularCras() {
  return [respostas.vulnerabilidade === true
    ? "O CRAS pode acompanhar você e encaminhar para benefícios e serviços. Procure a unidade mais próxima."
    : "Você pode procurar o CRAS para se orientar sobre serviços e benefícios disponíveis."];
}

const CALCULOS = {
  bpc: calcularBPC,
  aposentadoria: calcularAposentadoria,
  bolsa: calcularBolsa,
  cras: calcularCras
};

/* Monta a tela de resultado. */
function mostrarResultado() {
  const possibilidades = CALCULOS[direitoAtual]();

  $("resultado-corpo").innerHTML =
    '<div class="caixa-resultado">' +
    possibilidades.map((texto) => `<p>${texto}</p>`).join("") +
    "</div>";

  $("lista-documentos").innerHTML = DOCUMENTOS[direitoAtual]
    .map((doc) => `<li>${doc}</li>`)
    .join("");

  atualizarLinksLocal();
  mostrarTela("resultado");
}

/* Links de mapa para o CRAS e a Defensoria, usando o bairro ou CEP digitado. */
function atualizarLinksLocal() {
  const busca = encodeURIComponent($("campo-local").value.trim());
  $("links-local").innerHTML =
    `<a class="link-local" target="_blank" rel="noopener" href="https://www.google.com/maps/search/CRAS+${busca}">📍 Ver CRAS mais próximo no mapa</a>` +
    `<a class="link-local" target="_blank" rel="noopener" href="https://www.google.com/maps/search/Defensoria+P%C3%BAblica+${busca}">📍 Ver Defensoria Pública mais próxima no mapa</a>`;
}

/* =========================================================================
   CONSENTIMENTO: os cartões de direito só liberam depois do aceite.
   ========================================================================= */
const aceite = $("aceite");
function atualizarAceite() {
  document.querySelectorAll("[data-direito]").forEach((cartao) => {
    cartao.disabled = !aceite.checked;
  });
}
aceite.addEventListener("change", atualizarAceite);
atualizarAceite();

/* =========================================================================
   CHAT: envia a dúvida ao servidor e mostra a resposta
   ========================================================================= */
function adicionarBalao(texto, tipo) {
  const balao = document.createElement("div");
  balao.className = `balao balao--${tipo}`;
  balao.textContent = texto; // textContent: o texto nunca vira código
  $("mensagens").appendChild(balao);
  rolarParaFim();
  return balao;
}

function rolarParaFim() {
  const area = $("mensagens");
  area.scrollTop = area.scrollHeight;
}

async function enviarChat(evento) {
  evento.preventDefault();

  const campo = $("campo-chat");
  const pergunta = campo.value.trim();
  if (!pergunta) return;

  adicionarBalao(pergunta, "usuario");
  campo.value = "";
  historicoChat.push({ papel: "usuario", texto: pergunta });

  const aguardando = adicionarBalao("", "assistente");
  aguardando.innerHTML = '<span class="digitando"><span></span><span></span><span></span></span>';

  try {
    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: pergunta, historico: historicoChat.slice(-6) })
    });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || "Erro");

    aguardando.textContent = dados.resposta;
    historicoChat.push({ papel: "assistente", texto: dados.resposta });
  } catch (erro) {
    aguardando.textContent = "Não consegui responder agora. Tente de novo em instantes, ou procure o CRAS.";
  }
  rolarParaFim();
}

/* =========================================================================
   LIGAÇÕES: conecta botões e campos às funções acima
   ========================================================================= */

// Cartões de direito: abrem o fluxo do direito escolhido.
document.querySelectorAll("[data-direito]").forEach((cartao) => {
  cartao.addEventListener("click", () => {
    if (!aceite.checked) return; // segurança extra: sem aceite, nada abre
    iniciarFluxo(cartao.dataset.direito);
  });
});

// Próxima: valida, avança ou mostra o resultado.
$("btn-proximo").addEventListener("click", () => {
  if (!guardarRespostaAtual()) return;
  const lista = perguntasAtivas();
  if (passoAtual < lista.length - 1) {
    passoAtual++;
    mostrarPergunta();
  } else {
    mostrarResultado();
  }
});

// Voltar: uma pergunta para trás.
$("btn-voltar").addEventListener("click", () => {
  if (passoAtual > 0) {
    passoAtual--;
    mostrarPergunta();
  }
});

// Bairro ou CEP: atualiza os links a cada letra.
$("campo-local").addEventListener("input", atualizarLinksLocal);

// Voltar ao início.
$("btn-recomecar").addEventListener("click", () => mostrarTela("inicio"));

// Chat: abre e fecha pela bolha flutuante e pelo X.
$("abrir-chat").addEventListener("click", () => {
  const janela = $("janela-chat");
  const abrindo = janela.hidden;
  janela.hidden = !abrindo;
  $("abrir-chat").setAttribute("aria-expanded", String(abrindo));
  if (abrindo) {
    $("campo-chat").focus();
    if ($("mensagens").childElementCount === 0) {
      adicionarBalao("Olá! Posso explicar como o site funciona e tirar dúvidas sobre os direitos. Não sou advogado e não substituo o CRAS, a Defensoria ou o INSS.", "assistente");
    }
  }
});
$("fechar-chat").addEventListener("click", () => {
  $("janela-chat").hidden = true;
  $("abrir-chat").setAttribute("aria-expanded", "false");
});

$("form-chat").addEventListener("submit", enviarChat);
