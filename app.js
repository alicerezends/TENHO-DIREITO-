/*
  ARQUIVO: app.js
  O QUE É: a conversa inteira. O assistente:
    1. Pergunta qual benefício a pessoa quer verificar.
    2. Faz as perguntas do benefício uma por uma, no chat.
    3. Pergunta a regional de Belo Horizonte.
    4. Mostra a possibilidade, os documentos e o CRAS e a Defensoria mais perto.
    5. Depois disso, responde dúvidas livres (pelo servidor assistente.py).

  IMPORTANTE: os valores do bloco REGRAS mudam com o tempo. Confira antes de publicar.
*/

/* =========================================================================
   REGRAS: valores usados nas contas. Edite AQUI quando mudarem.
   ========================================================================= */
const REGRAS = {
  SALARIO_MINIMO: 1621,                       // CONFERIR o valor vigente
  BPC_LIMITE_PER_CAPITA: 1621 / 4,            // BPC: renda por pessoa abaixo de 1/4 do salário mínimo
  BPC_IDADE_IDOSO: 65,                        // idade do BPC para pessoa idosa
  BOLSA_LIMITE_PER_CAPITA: 218,               // CONFERIR o valor vigente
  APOSENT_IDADE_URBANA: { homem: 65, mulher: 62 },
  APOSENT_IDADE_RURAL: { homem: 60, mulher: 55 },
  APOSENT_ANOS_CARENCIA: 15                   // 180 contribuições mensais
};

/* Benefícios que aparecem no início da conversa. */
const DIREITOS = [
  { label: "BPC", valor: "bpc" },
  { label: "Aposentadoria por idade", valor: "aposentadoria" },
  { label: "Bolsa Família", valor: "bolsa" },
  { label: "Atendimento no CRAS", valor: "cras" }
];

/* Regionais de Belo Horizonte. Os nomes precisam ser iguais aos de unidades.js. */
const REGIONAIS = ["Barreiro", "Centro-Sul", "Leste", "Nordeste", "Noroeste", "Norte", "Oeste", "Pampulha", "Venda Nova"];

/* Última pergunta de todo benefício: onde a pessoa mora, para indicar o CRAS mais perto. */
const ETAPA_REGIONAL = {
  id: "regional",
  tipo: "bairro",
  texto: "Por último, qual é o seu bairro em Belo Horizonte? Assim eu indico o CRAS da sua região. (Ex.: Santa Efigênia)",
  opcoes: [...REGIONAIS, "Não sei"]
};

/* =========================================================================
   ROTEIROS: perguntas de cada benefício, na ordem da conversa.
     id    -> nome interno da resposta
     tipo  -> "numero" (digitar), "sim_nao" (botões) ou "opcoes" (botões com opções)
     texto -> o que o assistente pergunta
     se    -> (opcional) decide se a pergunta aparece, com base nas respostas anteriores
   As perguntas seguem o roteiro de triagem em PDF, em versão resumida.
   ========================================================================= */
const ROTEIROS = {
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
      texto: "Ela precisa de ajuda para tomar banho, se alimentar, andar, estudar, trabalhar ou sair de casa?",
      se: (r) => r.idade < REGRAS.BPC_IDADE_IDOSO && r.deficiencia === true },
    { id: "membros", tipo: "numero",
      texto: "Quantas pessoas do grupo familiar moram sob o mesmo teto, incluindo a pessoa que pede? (Entram cônjuge, pais, irmãos e filhos solteiros e menores tutelados.)" },
    { id: "renda", tipo: "numero",
      texto: "Qual é a renda mensal somada do grupo familiar, em reais? Digite 0 se não houver renda." },
    { id: "outroBeneficio", tipo: "sim_nao",
      texto: "Alguém da família recebe BPC ou outro benefício de até um salário mínimo?" },
    { id: "cadUnico", tipo: "sim_nao",
      texto: "A família está inscrita no Cadastro Único?" },
    { id: "jaPediu", tipo: "sim_nao",
      texto: "A pessoa já pediu o BPC ao INSS?" },
    { id: "negado", tipo: "sim_nao",
      texto: "E o INSS negou o pedido?",
      se: (r) => r.jaPediu === true }
  ],

  aposentadoria: [
    { id: "idade", tipo: "numero",
      texto: "Qual é a sua idade?" },
    { id: "mulher", tipo: "sim_nao",
      texto: "Você é mulher?" },
    { id: "rural", tipo: "sim_nao",
      texto: "Você trabalhou principalmente no campo (atividade rural)?" },
    { id: "contribuiu", tipo: "sim_nao",
      texto: "Já contribuiu para o INSS, com carteira assinada, como autônoma ou contribuinte individual, ou de forma facultativa?" },
    { id: "anos", tipo: "numero",
      texto: "Quantos anos de contribuição ao INSS você acredita ter?",
      se: (r) => r.contribuiu === true },
    { id: "pendencia", tipo: "sim_nao",
      texto: "Existem períodos sem registro no CNIS, ou contribuições pagas em atraso?",
      se: (r) => r.contribuiu === true },
    { id: "docsRurais", tipo: "sim_nao",
      texto: "Você tem documentos da época do trabalho rural, como notas de produtor, contratos ou cadastro rural?",
      se: (r) => r.rural === true },
    { id: "jaPediu", tipo: "sim_nao",
      texto: "Você já pediu a aposentadoria ao INSS?" },
    { id: "negado", tipo: "sim_nao",
      texto: "E o INSS negou o pedido?",
      se: (r) => r.jaPediu === true }
  ],

  bolsa: [
    { id: "pessoas", tipo: "numero",
      texto: "Quantas pessoas moram na sua casa, incluindo você?" },
    { id: "renda", tipo: "numero",
      texto: "Qual é a renda total mensal da família, em reais? Digite 0 se não houver renda." },
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

/* Nome do benefício, usado nos textos. */
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
   ESTADO DA CONVERSA
   ========================================================================= */
let direito = null;        // benefício escolhido
let respostas = {};        // o que a pessoa respondeu
let passo = 0;             // posição na lista de perguntas ativas
let modo = "inicio";       // inicio | pergunta | fim | duvida
let historicoChat = [];    // mensagens para o assistente de dúvidas

const $ = (id) => document.getElementById(id);
const campo = $("campo-chat");
const digitandoHtml = '<span class="digitando"><span></span><span></span><span></span></span>';

/* =========================================================================
   PERGUNTAS: lista de perguntas que valem agora
   ========================================================================= */
function perguntasAtivas() {
  const perguntas = ROTEIROS[direito].filter((p) => !p.se || p.se(respostas));
  return [...perguntas, ETAPA_REGIONAL];
}

/* =========================================================================
   MENSAGENS: o que aparece no chat
   ========================================================================= */
function rolar() {
  const area = $("mensagens");
  area.scrollTop = area.scrollHeight;
}

/* Cria um balão vazio do tipo "bot" ou "usuario". */
function criarBalao(tipo) {
  const balao = document.createElement("div");
  balao.className = `balao balao--${tipo}`;
  $("mensagens").appendChild(balao);
  rolar();
  return balao;
}

/* O assistente "digita" por um instante e depois mostra o texto. */
function bot(html, depoisDeMostrar) {
  const balao = criarBalao("bot");
  balao.innerHTML = digitandoHtml;
  setTimeout(() => {
    balao.innerHTML = html;
    rolar();
    if (depoisDeMostrar) depoisDeMostrar();
  }, 450);
}

/* Mensagem da pessoa. textContent evita que o texto vire código. */
function usuario(texto) {
  const balao = criarBalao("usuario");
  balao.textContent = texto;
}

/* Mostra as opções clicáveis. Ao clicar, as opções somem e a escolha vai para aoEscolher. */
function definirAcoes(lista, aoEscolher = responder) {
  const area = $("acoes");
  area.innerHTML = "";
  lista.forEach((op) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "opcao-chat";
    botao.textContent = op.label;
    botao.addEventListener("click", () => {
      definirAcoes([]);
      aoEscolher(op.valor, op.label);
    });
    area.appendChild(botao);
  });
}

/* =========================================================================
   FLUXO: conversa passo a passo
   ========================================================================= */
function iniciarConversa(temaInicial) {
  $("mensagens").innerHTML = "";
  definirAcoes([]);
  direito = null;
  respostas = {};
  passo = 0;
  modo = "inicio";
  historicoChat = [];
  campo.type = "text";
  campo.value = "";
  campo.placeholder = "Digite sua resposta...";

  if (temaInicial) {
    const tema = DIREITOS.find((d) => d.valor === temaInicial);
    if (tema) escolherDireito(tema.valor, tema.label);
    return;
  }

  bot("Olá! Sou o assistente do Tenho Direito?. Qual benefício você quer verificar?", () => {
    definirAcoes(DIREITOS, escolherDireito);
  });
}

function escolherDireito(valor, label) {
  usuario(label);
  direito = valor;
  respostas = {};
  passo = 0;
  bot("Vou fazer algumas perguntas simples. Você pode clicar nas opções ou digitar a resposta.", continuar);
}

/* Faz a próxima pergunta ou, se acabaram, mostra o resultado. */
function continuar() {
  const ativas = perguntasAtivas();
  if (passo < ativas.length) {
    modo = "pergunta";
    const pergunta = ativas[passo];
    definirAcoes([]);
    bot(pergunta.texto, () => mostrarEntrada(pergunta));
  } else {
    finalizar();
  }
}

/* Prepara o jeito de responder: digitar número ou clicar em opções. */
function mostrarEntrada(pergunta) {
  campo.value = "";
  if (pergunta.tipo === "bairro") {
    campo.type = "text";
    campo.placeholder = "Digite o seu bairro";
    definirAcoes([{ label: "Não sei o bairro, escolher a regional", valor: "lista" }], (valor, label) => {
      usuario(label);
      bot("Escolha a sua regional:", () => {
        definirAcoes(ETAPA_REGIONAL.opcoes.map((o) => ({ label: o, valor: o })), responder);
      });
    });
    campo.focus();
    return;
  }
  if (pergunta.tipo === "numero") {
    definirAcoes([]);
    campo.type = "number";
    campo.inputMode = "numeric";
    campo.placeholder = "Digite um número e envie";
    campo.focus();
  } else {
    campo.type = "text";
    campo.placeholder = "Escolha uma das opções acima";
    const opcoes = pergunta.tipo === "sim_nao"
      ? [{ label: "Sim", valor: true }, { label: "Não", valor: false }]
      : pergunta.opcoes.map((o) => ({ label: o, valor: o }));
    definirAcoes(opcoes, responder);
  }
}

/* Guarda a resposta da pergunta atual e segue para a próxima. */
function responder(valor, label) {
  const pergunta = perguntasAtivas()[passo];
  usuario(label);
  respostas[pergunta.id] = valor;
  passo++;
  continuar();
}

/* Resultado: card com o nível, documentos, encaminhamento e espaço para dúvidas. */
function finalizar() {
  modo = "fim";
  definirAcoes([]);
  const resultado = CALCULOS[direito]();
  bot(montarResultado(resultado), () => {
    bot(montarDocumentos(direito), () => {
      bot(montarEncaminhamento(respostas.regional), () => {
        bot("Quer tirar alguma dúvida? Escreva aqui. As dúvidas vão para um assistente de IA, então não digite CPF, endereço nem números de documentos.", () => {
          modo = "duvida";
          campo.placeholder = "Escreva sua dúvida...";
          definirAcoes([{ label: "Fazer outra verificação", valor: "recomecar" }], () => iniciarConversa());
        });
      });
    });
  });
}

/* Card do resultado: selo colorido, título, explicação e próximos passos. */
function montarResultado(res) {
  const selos = {
    positivo: "Possível direito",
    analise: "Precisa de análise",
    nao: "Não se aplica agora"
  };
  const classe = res.nivel;
  const selo = res.selo || selos[res.nivel];
  return `<div class="res-card">
    <span class="res-selo res-selo--${classe}">${selo}</span>
    <h3 class="res-titulo">${res.titulo}</h3>
    ${res.msgs.map((m) => `<p class="res-texto">${m}</p>`).join("")}
    <div class="res-passos">
      <strong>Próximos passos</strong>
      <ol>${res.passos.map((p) => `<li>${p}</li>`).join("")}</ol>
    </div>
    <p class="nota">As orientações não substituem análise profissional nem decisão de órgãos públicos.</p>
  </div>`;
}

/* Lista de documentos em formato de checklist. */
function montarDocumentos(d) {
  return `<div class="res-card">
    <h4 class="res-titulo-menor">Documentos para levar (${NOMES[d]})</h4>
    <ul class="res-checks">${DOCUMENTOS[d].map((x) => `<li>${x}</li>`).join("")}</ul>
    <p class="nota">A lista pode variar. Confirme no local antes de ir.</p>
  </div>`;
}

/* Encaminhamento: CRAS da regional do bairro e Defensorias de BH. */
function montarEncaminhamento(regional) {
  let html = '<div class="res-card"><h4 class="res-titulo-menor">Para onde ir</h4>';
  if (regional && regional !== "Não sei") {
    const cras = UNIDADES_CRAS.filter((u) => u.regional === regional);
    html += `<p class="res-texto">CRAS da regional <strong>${regional}</strong>. Escolha o que for mais fácil para você e use "Ver como chegar":</p>`;
    html += cras.map((u) => cartaoUnidade(u)).join("");
  } else {
    html += '<p class="res-texto">Procure o CRAS mais perto de você. Veja a lista completa:</p>';
    html += `<details><summary>Ver todos os CRAS de Belo Horizonte</summary>${UNIDADES_CRAS.map((u) => cartaoUnidade(u)).join("")}</details>`;
  }
  html += '<h4 class="res-titulo-menor">Defensorias Públicas em Belo Horizonte</h4>';
  html += UNIDADES_DEFENSORIA.map((u) => cartaoUnidade(u)).join("");
  return html + "</div>";
}

/* Cartão de uma unidade, com telefone e rota. */
function cartaoUnidade(unidade) {
  const telefone = unidade.telefone
    ? `<a href="tel:${unidade.telefone.replace(/[^0-9+]/g, "")}">${unidade.telefone}</a>`
    : "não informado";
  const rota = "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(`${unidade.endereco}, Belo Horizonte, MG`);

  return `<div class="unidade">
    <strong class="unidade__nome">${unidade.nome}</strong>
    <div class="unidade__linha">${unidade.endereco}</div>
    <div class="unidade__linha">Telefone: ${telefone}</div>
    <div class="unidade__linha">Horário: ${unidade.horario}</div>
    <a href="${rota}" target="_blank" rel="noopener">📍 Ver como chegar</a>
  </div>`;
}

/* Busca a regional pelo nome do bairro, sem acento e sem diferença de maiúsculas. */
function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

function buscarRegionalPorBairro(texto) {
  return BAIRROS_REGIONAL[normalizarTexto(texto)] || null;
}

/* =========================================================================
   CÁLCULO: orientação de possibilidade. NÃO é decisão oficial.
   Cada função devolve: nivel (positivo | analise | nao), titulo, msgs e passos.
   ========================================================================= */
function calcularBPC() {
  const r = respostas;
  const idoso = r.idade >= REGRAS.BPC_IDADE_IDOSO;
  const pcd = r.deficiencia === true && r.impedimento === true && r.barreiras === true;
  const passos = [
    "Atualize o Cadastro Único no CRAS, se estiver desatualizado.",
    "Reúna documentos pessoais, comprovante de residência e laudos médicos atualizados.",
    "Peça o BPC pelo aplicativo Meu INSS ou pela central 135."
  ];

  if (!idoso && !pcd) {
    return {
      nivel: "nao", titulo: "BPC / LOAS",
      msgs: ["Pelas respostas, o BPC pode não se aplicar agora: não há idade de 65 anos nem deficiência de longo prazo com barreiras."],
      passos: ["Procure o CRAS para uma orientação completa sobre outros benefícios."]
    };
  }

  const rendaPorPessoa = r.membros > 0 ? r.renda / r.membros : 0;
  const limite = REGRAS.BPC_LIMITE_PER_CAPITA;
  const quem = idoso ? "pessoa idosa" : "pessoa com deficiência";
  const msgs = [];
  let nivel;

  if (rendaPorPessoa < limite * 0.8) {
    nivel = "positivo";
    msgs.push(`A renda por pessoa do grupo familiar parece abaixo do limite. Pelo que você informou, a ${quem} pode ter direito ao BPC.`);
  } else if (rendaPorPessoa < limite * 1.2) {
    nivel = "analise";
    msgs.push("A renda por pessoa está perto do limite. Esse caso precisa de análise com mais detalhes.");
  } else {
    nivel = "nao";
    msgs.push("A renda por pessoa parece acima do limite do BPC. Algumas exclusões previstas em lei podem mudar a conta, então vale conferir com o CRAS.");
  }

  if (r.outroBeneficio === true) {
    msgs.push("Como alguém da família já recebe BPC ou benefício de até um salário mínimo, esse valor costuma ficar fora do cálculo.");
  }

  let passosFinais = passos;
  if (r.negado === true) {
    msgs.push("Como o INSS já negou o pedido, a Defensoria Pública pode avaliar o caso e orientar sobre recurso.");
    passosFinais = ["Leve a carta de indeferimento à Defensoria Pública.", ...passos];
  }
  return { nivel, titulo: "BPC / LOAS", msgs, passos: passosFinais };
}

function calcularAposentadoria() {
  const r = respostas;
  const ehMulher = r.mulher === true;
  const idadeMin = r.rural
    ? (ehMulher ? REGRAS.APOSENT_IDADE_RURAL.mulher : REGRAS.APOSENT_IDADE_RURAL.homem)
    : (ehMulher ? REGRAS.APOSENT_IDADE_URBANA.mulher : REGRAS.APOSENT_IDADE_URBANA.homem);
  const titulo = "Aposentadoria por idade";
  const passos = [
    "Consulte seu extrato no Meu INSS (CNIS) e confira os períodos de trabalho.",
    "Reúna carteira de trabalho, carnês e comprovantes de pagamento ao INSS.",
    "Peça a aposentadoria pelo Meu INSS ou pela central 135."
  ];

  if (r.idade < idadeMin) {
    return {
      nivel: "nao", titulo,
      msgs: [`Ainda não atingiu a idade mínima de ${idadeMin} anos para a aposentadoria por idade.`],
      passos: ["Se já era filiado antes da Reforma de 2019, peça ao INSS a análise das regras de transição."]
    };
  }

  if (!r.contribuiu && !r.rural) {
    return {
      nivel: "nao", titulo,
      msgs: ["Sem contribuição ao INSS, a aposentadoria por idade não se aplica pela via contributiva."],
      passos: ["Procure o CRAS para conhecer outras opções."]
    };
  }

  if (!r.contribuiu && r.rural) {
    return r.docsRurais
      ? {
          nivel: "analise", titulo,
          msgs: ["Pode haver direito à aposentadoria rural. É preciso comprovar o trabalho no campo com documentos da época, porque prova só testemunhal normalmente não basta."],
          passos: ["Reúna notas de produtor, contratos e cadastro rural.", "Leve tudo ao sindicato rural ou à Defensoria Pública para análise."]
        }
      : {
          nivel: "analise", titulo,
          msgs: ["A aposentadoria rural depende de comprovar o trabalho no campo."],
          passos: ["Procure o sindicato rural ou o CRAS para reunir documentos da época."]
        };
  }

  const msgs = [];
  let nivel = "positivo";
  if (r.pendencia === true) {
    nivel = "analise";
    msgs.push("Há pendências no CNIS ou contribuições em atraso. Isso precisa ser conferido antes do pedido.");
  }
  if (r.anos >= REGRAS.APOSENT_ANOS_CARENCIA) {
    msgs.push(r.rural
      ? "Tempo urbano e rural podem ser somados (aposentadoria híbrida). O INSS confirma a regra exata."
      : "A carência é de 180 contribuições (15 anos). A regra exata depende da data de filiação; o INSS confirma.");
  } else {
    nivel = "nao";
    msgs.push(`Pelo que você informou, ainda pode faltar tempo de contribuição: são necessários pelo menos ${REGRAS.APOSENT_ANOS_CARENCIA} anos.`);
  }

  let passosFinais = passos;
  if (r.negado === true) {
    msgs.push("Como o INSS já negou o pedido, a Defensoria Pública pode avaliar o caso e orientar sobre recurso.");
    passosFinais = ["Leve a carta de indeferimento à Defensoria Pública.", ...passos];
  }
  return { nivel, titulo, msgs, passos: passosFinais };
}

function calcularBolsa() {
  const r = respostas;
  const rendaPorPessoa = r.pessoas > 0 ? r.renda / r.pessoas : 0;
  const acima = rendaPorPessoa > REGRAS.BOLSA_LIMITE_PER_CAPITA;
  const msgs = [acima
    ? "Pela renda informada, a família pode estar acima do limite do Bolsa Família. Vale conversar com o CRAS, pois as regras podem mudar."
    : "Pela renda informada, a família pode ter direito ao Bolsa Família. A análise final depende do Cadastro Único e do CRAS."];
  if (r.filhos === true) {
    msgs.push("A presença de crianças, adolescentes ou gestantes pode dar prioridade no acompanhamento.");
  }
  return {
    nivel: acima ? "analise" : "positivo",
    titulo: "Bolsa Família",
    msgs,
    passos: [
      "Procure o CRAS para atualizar ou fazer o Cadastro Único.",
      "Leve documento com foto, CPF de todas as pessoas da família e comprovante de residência."
    ]
  };
}

function calcularCras() {
  const precisa = respostas.vulnerabilidade === true;
  return {
    nivel: "positivo",
    selo: "Atendimento recomendado",
    titulo: "Atendimento no CRAS",
    msgs: [precisa
      ? "O CRAS pode acompanhar você e encaminhar para benefícios e serviços."
      : "Você pode procurar o CRAS para se orientar sobre serviços e benefícios disponíveis."],
    passos: ["Vá à unidade da sua região com documento com foto e comprovante de residência."]
  };
}

const CALCULOS = {
  bpc: calcularBPC,
  aposentadoria: calcularAposentadoria,
  bolsa: calcularBolsa,
  cras: calcularCras
};

/* =========================================================================
   DÚVIDAS LIVRES: depois do resultado, a pessoa pode perguntar qualquer coisa.
   A pergunta vai ao servidor (assistente.py), que chama o Gemini.
   ========================================================================= */
async function perguntarDuvida(texto) {
  usuario(texto);
  historicoChat.push({ papel: "usuario", texto });

  const balao = criarBalao("bot");
  balao.innerHTML = digitandoHtml;

  try {
    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: texto, historico: historicoChat.slice(-6) })
    });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || "Erro");

    balao.textContent = dados.resposta;
    historicoChat.push({ papel: "assistente", texto: dados.resposta });
  } catch (erro) {
    balao.textContent = erro.message && erro.message !== "Erro"
      ? erro.message
      : "Não consegui responder agora. Tente de novo em instantes, ou procure o CRAS.";
  }
  rolar();
}

/* =========================================================================
   ENVIO DO CAMPO DE TEXTO
   ========================================================================= */
$("form-chat").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const texto = campo.value.trim();
  if (!texto) return;

  if (modo === "duvida") {
    campo.value = "";
    perguntarDuvida(texto);
    return;
  }

  if (modo === "pergunta") {
    const pergunta = perguntasAtivas()[passo];
    if (pergunta.tipo === "bairro") {
      campo.value = "";
      const regional = buscarRegionalPorBairro(texto);
      if (regional) {
        responder(regional, texto);
      } else {
        usuario(texto);
        bot("Não encontrei esse bairro na minha lista. Escolha a sua regional abaixo:", () => {
          definirAcoes(ETAPA_REGIONAL.opcoes.map((o) => ({ label: o, valor: o })), responder);
        });
      }
      return;
    }
    if (pergunta.tipo !== "numero") {
      bot("Escolha uma das opções acima, por favor.");
      return;
    }
    const numero = Number(texto.replace(",", "."));
    if (Number.isNaN(numero) || numero < 0) {
      bot("Digite apenas um número, sem letras.");
      return;
    }
    campo.value = "";
    responder(numero, texto);
  }
});

/* =========================================================================
   ACEITE E INÍCIO
   ========================================================================= */
const aceite = $("aceite");
const avisoAceite = $("aviso-aceite");
const btnEnviar = $("btn-enviar");

/* Liga ou desliga o chat e os cartões da página, conforme o aceite. */
function liberarChat(liberado) {
  campo.disabled = !liberado;
  btnEnviar.disabled = !liberado;
  document.querySelectorAll("[data-tema]").forEach((cartao) => {
    cartao.disabled = !liberado;
  });
  avisoAceite.hidden = liberado;
}

/* Marcar o aceite começa a conversa. Desmarcar a interrompe. */
aceite.addEventListener("change", () => {
  liberarChat(aceite.checked);
  if (aceite.checked) {
    iniciarConversa();
  } else {
    definirAcoes([]);
    modo = "inicio";
  }
});

/* Cartões da página: começam o benefício direto no chat. */
document.querySelectorAll("[data-tema]").forEach((cartao) => {
  cartao.addEventListener("click", () => {
    if (!aceite.checked) return;
    document.getElementById("assistente").scrollIntoView({ behavior: "smooth" });
    iniciarConversa(cartao.dataset.tema);
  });
});

$("btn-recomecar").addEventListener("click", () => {
  if (aceite.checked) iniciarConversa();
});

/* Estado inicial: chat travado até o aceite. */
liberarChat(false);
bot("Olá! Seja bem-vindo(a) ao <strong>Tenho Direito?</strong>. Para começar, marque a caixa de aceite acima. Depois escolha um benefício, no chat ou nos cartões da página.");
