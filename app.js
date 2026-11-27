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
  tipo: "opcoes",
  texto: "Por último, em qual regional de Belo Horizonte você mora? Assim eu indico o CRAS mais perto.",
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
function iniciarConversa() {
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

/* Resultado: possibilidade, documentos, encaminhamento e espaço para dúvidas. */
function finalizar() {
  modo = "fim";
  definirAcoes([]);
  const possibilidades = CALCULOS[direito]();

  bot(
    "<p><strong>Seu resultado</strong></p>" +
    possibilidades.map((t) => `<p>${t}</p>`).join("") +
    '<p class="nota">As orientações não substituem análise profissional nem decisão de órgãos públicos.</p>',
    () => {
      bot(
        `<p><strong>Documentos que costumam ser pedidos (${NOMES[direito]}):</strong></p><ul>` +
        DOCUMENTOS[direito].map((d) => `<li>${d}</li>`).join("") +
        "</ul>" +
        '<p class="nota">A lista pode variar. Confirme no local antes de ir.</p>',
        () => {
          bot(montarEncaminhamento(respostas.regional), () => {
            bot("Quer tirar alguma dúvida? Pode escrever aqui. Ou comece outra verificação.", () => {
              modo = "duvida";
              campo.type = "text";
              campo.placeholder = "Escreva sua dúvida...";
              definirAcoes([{ label: "Fazer outra verificação", valor: "recomecar" }], () => iniciarConversa());
            });
          });
        }
      );
    }
  );
}

/* Monta o encaminhamento: CRAS da regional e Defensorias de BH. */
function montarEncaminhamento(regional) {
  let html = "<p><strong>Para onde ir</strong></p>";

  if (regional && regional !== "Não sei") {
    const crasDaRegional = UNIDADES_CRAS.filter((u) => u.regional === regional);
    html += `<p>CRAS mais perto (regional ${regional}):</p>` + crasDaRegional.map(cartaoUnidade).join("");
  } else {
    html += "<p>Procure o CRAS mais perto de você. Veja a lista completa:</p>" +
      `<details><summary>Ver todos os CRAS de Belo Horizonte</summary>${UNIDADES_CRAS.map(cartaoUnidade).join("")}</details>`;
  }

  html += "<p>Defensorias Públicas em Belo Horizonte:</p>" + UNIDADES_DEFENSORIA.map(cartaoUnidade).join("");
  return html;
}

/* Cartão de uma unidade, com telefone e botão para ver a rota. */
function cartaoUnidade(unidade) {
  const digitos = unidade.telefone.replace(/[^0-9+]/g, "");
  const telefone = unidade.telefone ? `<a href="tel:${digitos}">${unidade.telefone}</a>` : "não informado";
  // A rota abre no Google Maps, que usa a localização de quem clicou como ponto de partida.
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

/* =========================================================================
   CÁLCULO: orientação de possibilidade. NÃO é decisão oficial.
   ========================================================================= */
function calcularBPC() {
  const r = respostas;
  const msgs = [];
  const idoso = r.idade >= REGRAS.BPC_IDADE_IDOSO;
  const pcd = r.deficiencia === true && r.impedimento === true && r.barreiras === true;

  if (!idoso && !pcd) {
    msgs.push("Pelas respostas, o BPC pode não se aplicar agora, porque não há idade de 65 anos nem deficiência de longo prazo com barreiras. Vale procurar o CRAS para uma orientação completa.");
    return msgs;
  }

  const rendaPorPessoa = r.membros > 0 ? r.renda / r.membros : 0;
  const limite = REGRAS.BPC_LIMITE_PER_CAPITA;
  const quem = idoso ? "pessoa idosa" : "pessoa com deficiência";

  if (rendaPorPessoa < limite * 0.8) {
    msgs.push(`Possível BPC para ${quem}: a renda por pessoa do grupo familiar parece abaixo do limite. A análise final é do INSS.`);
  } else if (rendaPorPessoa < limite * 1.2) {
    msgs.push("Necessidade de análise mais detalhada: a renda por pessoa está perto do limite. Vale conferir as exclusões previstas em lei com o CRAS ou a Defensoria.");
  } else {
    msgs.push("Pelas respostas, a renda por pessoa parece acima do limite do BPC. Vale conferir com o CRAS, pois algumas exclusões podem mudar a conta.");
  }

  if (r.outroBeneficio === true) {
    msgs.push("Como alguém da família já recebe BPC ou benefício de até um salário mínimo, esse valor costuma ficar fora do cálculo. Confirme isso com o CRAS.");
  }
  if (r.negado === true) {
    msgs.push("Como o INSS já negou o pedido, a Defensoria Pública pode avaliar o caso e orientar sobre recurso.");
  }
  return msgs;
}

function calcularAposentadoria() {
  const r = respostas;
  const msgs = [];
  const ehMulher = r.mulher === true;
  const idadeMin = r.rural
    ? (ehMulher ? REGRAS.APOSENT_IDADE_RURAL.mulher : REGRAS.APOSENT_IDADE_RURAL.homem)
    : (ehMulher ? REGRAS.APOSENT_IDADE_URBANA.mulher : REGRAS.APOSENT_IDADE_URBANA.homem);

  if (r.idade < idadeMin) {
    msgs.push(`Ainda não atingiu a idade mínima de ${idadeMin} anos para a aposentadoria por idade. Se já era filiado antes da Reforma de 2019, existem regras de transição: peça a análise ao INSS.`);
    return msgs;
  }

  if (!r.contribuiu && !r.rural) {
    msgs.push("Sem contribuição ao INSS, a aposentadoria por idade não se aplica pela via contributiva. Vale procurar o CRAS para conhecer outras opções.");
    return msgs;
  }

  if (!r.contribuiu && r.rural) {
    msgs.push(r.docsRurais
      ? "Possível aposentadoria rural: confirme o período de trabalho no campo com os documentos da época. Prova só testemunhal normalmente não basta."
      : "A aposentadoria rural depende de comprovar o trabalho no campo. Procure o CRAS ou o sindicato rural para reunir documentos.");
  } else {
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
  }

  if (r.negado === true) {
    msgs.push("Como o INSS já negou o pedido, a Defensoria Pública pode avaliar o caso e orientar sobre recurso.");
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
    balao.textContent = "Não consegui responder agora. Tente de novo em instantes, ou procure o CRAS.";
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
aceite.addEventListener("change", () => {
  $("btn-comecar").disabled = !aceite.checked;
});

$("btn-comecar").addEventListener("click", () => {
  if (!aceite.checked) return;
  $("tela-aceite").hidden = true;
  $("tela-chat").hidden = false;
  iniciarConversa();
});

$("btn-recomecar").addEventListener("click", iniciarConversa);
