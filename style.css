/*
  ARQUIVO: style.css
  O QUE É: todo o visual do site (cores, tamanhos, espaçamentos, animações).
  COMO TROCAR AS CORES DO PROJETO: edite SOMENTE o bloco "PALETA" abaixo.
  Todas as telas usam essas variáveis, então uma troca aqui muda o site inteiro.
*/

/* =========================================================================
   PALETA — TROQUE PELAS CORES DO PROJETO
   Os valores abaixo são provisórios. Substitua pelos códigos hexadecimais
   (por exemplo #1A2B3C) do material de identidade visual.
   ========================================================================= */
:root {
  --cor-primaria: #1f6b55;        /* cor principal (verde do banner): botões, títulos */
  --cor-primaria-escura: #24503f; /* verde escuro do banner: hover e gradientes */
  --cor-destaque: #2e7d5b;        /* cor de sucesso e de ações positivas */
  --cor-fundo: #f3eee3;           /* creme do banner: fundo geral da página */
  --cor-cartao: #fbf9f4;          /* fundo dos cartões e janelas */
  --cor-texto: #1d2430;           /* texto principal */
  --cor-texto-suave: #5a6474;     /* textos secundários e legendas */
  --cor-borda: #dfe3ea;           /* linhas e contornos */
  --cor-aviso-fundo: #fff4e0;     /* fundo do aviso importante */
  --cor-aviso-texto: #7a4a00;     /* texto do aviso importante */

  /* Medidas e formas (ajuste se quiser páginas mais ou menos arredondadas) */
  --raio: 16px;                   /* arredondamento dos cartões */
  --sombra: 0 8px 24px rgba(20, 30, 45, 0.08); /* sombra suave dos cartões */
  --fonte: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Modo escuro automático: quando o celular ou computador está no escuro,
   as cores trocam sozinhas. Você pode ajustar estes valores também. */
@media (prefers-color-scheme: dark) {
  :root {
    --cor-primaria: #7fd1b0;
    --cor-primaria-escura: #a6e0c8;
    --cor-destaque: #6fcf9e;
    --cor-fundo: #15201b;
    --cor-cartao: #1d2b25;
    --cor-texto: #eef3ef;
    --cor-texto-suave: #aebfb5;
    --cor-borda: #33463d;
    --cor-aviso-fundo: #3a2e14;
    --cor-aviso-texto: #ffd99a;
  }
}

/* =========================================================================
   BASE: regras gerais que valem para a página inteira
   ========================================================================= */

/* Remove margens padrão do navegador e aplica a caixa de medidas previsível. */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Corpo da página: fonte, cor de fundo e tamanho de letra confortável para leitura. */
body {
  margin: 0;
  min-height: 100vh;
  background: var(--cor-fundo);
  color: var(--cor-texto);
  font-family: var(--fonte);
  font-size: 18px;      /* letra maior facilita a leitura para idosos e pessoas com baixa visão */
  line-height: 1.6;
  display: flex;
  flex-direction: column;
}

/* Centraliza o conteúdo com largura máxima, para não ficar esticado em telas grandes. */
.container {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 96px; /* espaço embaixo para não cobrir o botão do chat */
  flex: 1;
}

/* Animação: cada tela aparece com um leve movimento de baixo para cima. */
@keyframes surgir {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* =========================================================================
   CABEÇALHO (topo com gradiente)
   ========================================================================= */
.topo {
  background: linear-gradient(135deg, var(--cor-primaria), var(--cor-primaria-escura));
  color: #ffffff;
  padding: 28px 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
}
.topo__marca {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}
.topo__icone {
  font-size: 40px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.18); /* um disco translúcido atrás do ícone */
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.topo__titulo {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.topo__sub {
  margin: 4px 0 0;
  font-size: 0.98rem;
  opacity: 0.92;
}

/* =========================================================================
   AVISO IMPORTANTE (fica em destaque, mas sem assustar)
   ========================================================================= */
.aviso {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: var(--cor-aviso-fundo);
  color: var(--cor-aviso-texto);
  border-radius: var(--raio);
  padding: 16px 18px;
  margin: 20px 0 24px;
  font-size: 0.95rem;
  border-left: 5px solid var(--cor-aviso-texto); /* faixa lateral chama atenção */
}
.aviso p {
  margin: 0;
}
.aviso__icone {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--cor-aviso-texto);
  color: var(--cor-aviso-fundo);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

/* =========================================================================
   TELAS: cada seção grande da página (início, perguntas, resultado)
   ========================================================================= */
.tela {
  background: var(--cor-cartao);
  border-radius: var(--raio);
  box-shadow: var(--sombra);
  padding: 28px 22px;
  animation: surgir 0.35s ease-out; /* efeito de entrada */
}
.tela[hidden] {
  display: none; /* garante que "hidden" esconda a tela de verdade */
}
.tela__titulo {
  margin: 0 0 6px;
  font-size: 1.5rem;
  font-weight: 800;
}
.tela__texto {
  margin: 0 0 22px;
  color: var(--cor-texto-suave);
}
.subtitulo {
  margin: 26px 0 10px;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--cor-primaria);
}
.nota {
  font-size: 0.9rem;
  color: var(--cor-texto-suave);
  margin: 8px 0 0;
}

/* =========================================================================
   GRADE DE DIREITOS (os quatro cartões da tela inicial)
   ========================================================================= */
.grade-direitos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); /* 2 colunas no celular, 4 no computador */
  gap: 14px;
}
.cartao-direito {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  text-align: left;
  padding: 20px;
  border: 2px solid var(--cor-borda);
  border-radius: var(--raio);
  background: var(--cor-cartao);
  color: var(--cor-texto);
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
/* Ao passar o mouse (ou tocar), o cartão sobe um pouco e ganha a cor do projeto. */
.cartao-direito:hover,
.cartao-direito:focus-visible {
  transform: translateY(-3px);
  border-color: var(--cor-primaria);
  box-shadow: var(--sombra);
  outline: none;
}
.cartao-direito__icone {
  font-size: 30px;
  line-height: 1;
}
.cartao-direito__nome {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--cor-primaria);
}
.cartao-direito__desc {
  font-size: 0.95rem;
  color: var(--cor-texto-suave);
}

/* =========================================================================
   PROGRESSO DAS PERGUNTAS (barra que cresce conforme a pessoa avança)
   ========================================================================= */
.progresso {
  height: 8px;
  background: var(--cor-borda);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progresso__barra {
  height: 100%;
  width: 0%;                      /* o app.js muda esta largura, por exemplo para 50% */
  background: linear-gradient(90deg, var(--cor-primaria), var(--cor-destaque));
  border-radius: 999px;
  transition: width 0.4s ease;    /* a barra desliza suavemente */
}
.progresso__texto {
  font-size: 0.9rem;
  color: var(--cor-texto-suave);
  margin: 0 0 18px;
}

/* =========================================================================
   CAMPOS DE FORMULÁRIO (caixas para digitar números e textos)
   ========================================================================= */
.rotulo {
  display: block;
  font-weight: 700;
  margin: 18px 0 6px;
}
.campo {
  width: 100%;
  padding: 14px;
  font-size: 1.05rem;
  font-family: inherit;
  color: var(--cor-texto);
  background: var(--cor-cartao);
  border: 2px solid var(--cor-borda);
  border-radius: 12px;
  transition: border-color 0.15s ease;
}
.campo:focus {
  outline: none;
  border-color: var(--cor-primaria); /* a borda muda de cor quando a pessoa clica */
  box-shadow: 0 0 0 4px rgba(31, 107, 85, 0.15);
}

/* Botões Sim / Não lado a lado. */
.opcoes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.opcao {
  flex: 1;
  min-width: 130px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  font-family: inherit;
  color: var(--cor-primaria);
  background: var(--cor-cartao);
  border: 2px solid var(--cor-primaria);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.opcao:hover {
  background: rgba(31, 107, 85, 0.08);
}
.opcao--ativa {
  background: var(--cor-primaria);
  color: #ffffff;                 /* texto branco sobre a cor escolhida */
}

/* =========================================================================
   BOTÕES GERAIS (Próxima, Voltar, Enviar...)
   ========================================================================= */
.acoes {
  display: flex;
  gap: 12px;
  margin-top: 26px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.botao {
  padding: 14px 26px;
  font-size: 1.02rem;
  font-weight: 700;
  font-family: inherit;
  color: #ffffff;
  background: var(--cor-primaria);
  border: 2px solid var(--cor-primaria);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.15s ease;
}
.botao:hover {
  background: var(--cor-primaria-escura);
  border-color: var(--cor-primaria-escura);
}
.botao:active {
  transform: scale(0.98); /* leve "afundar" ao clicar */
}
.botao--secundario {
  background: transparent;
  color: var(--cor-primaria);
}
.botao--secundario:hover {
  background: rgba(31, 107, 85, 0.08);
  color: var(--cor-primaria);
}
/* Quando o botão "Voltar" não deve aparecer (primeira pergunta), o app.js o esconde. */
.botao[hidden] {
  display: none;
}

/* Foco visível para quem navega pelo teclado (acessibilidade). */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid var(--cor-destaque);
  outline-offset: 2px;
}

/* =========================================================================
   RESULTADO: lista de possibilidades e documentos
   ========================================================================= */
.caixa-resultado {
  background: linear-gradient(135deg, rgba(46, 125, 91, 0.12), rgba(31, 107, 85, 0.08));
  border: 1px solid var(--cor-destaque);
  border-radius: var(--raio);
  padding: 18px 20px;
  margin-bottom: 8px;
}
.caixa-resultado p {
  margin: 0 0 10px;
}
.caixa-resultado p:last-child {
  margin-bottom: 0;
}
.lista-documentos {
  padding: 0;
  margin: 0;
  list-style: none;
}
.lista-documentos li {
  position: relative;
  padding: 10px 12px 10px 38px;
  margin-bottom: 8px;
  background: var(--cor-fundo);
  border-radius: 10px;
}
/* Um "check" verde antes de cada documento. */
.lista-documentos li::before {
  content: "✓";
  position: absolute;
  left: 12px;
  top: 10px;
  color: var(--cor-destaque);
  font-weight: 800;
}

/* Links de mapa (CRAS e Defensoria). */
.links-local {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}
.link-local {
  display: block;
  padding: 14px 16px;
  background: var(--cor-fundo);
  border: 2px solid var(--cor-borda);
  border-radius: 12px;
  color: var(--cor-primaria);
  font-weight: 700;
  text-decoration: none;
  transition: border-color 0.15s ease;
}
.link-local:hover {
  border-color: var(--cor-primaria);
}

/* =========================================================================
   BOTÃO FLUTUANTE DO CHAT E JANELA DE CONVERSA
   ========================================================================= */
.chat-flutuante {
  position: fixed;               /* fica sempre visível ao rolar a página */
  right: 18px;
  bottom: 18px;
  z-index: 20;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  color: #ffffff;
  background: linear-gradient(135deg, var(--cor-primaria), var(--cor-destaque));
  border: none;
  border-radius: 999px;          /* formato de pílula */
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.chat-flutuante:hover {
  transform: translateY(-2px);
}

/* A janela de conversa: flutua no canto, acima do conteúdo. */
.janela-chat {
  position: fixed;
  right: 18px;
  bottom: 84px;                  /* fica acima do botão flutuante */
  width: min(380px, calc(100vw - 36px));
  height: min(520px, calc(100vh - 140px));
  background: var(--cor-cartao);
  border-radius: var(--raio);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 30;
  animation: surgir 0.25s ease-out;
}
.janela-chat[hidden] {
  display: none;
}
.janela-chat__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--cor-primaria), var(--cor-primaria-escura));
  color: #ffffff;
}
.janela-chat__fechar {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}

/* Área que mostra as mensagens e rola sozinha quando chega conteúdo novo. */
.mensagens {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--cor-fundo);
}
/* Balão da mensagem. Mensagens da pessoa ficam à direita, do assistente à esquerda. */
.balao {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.97rem;
  line-height: 1.5;
  word-wrap: break-word;
  animation: surgir 0.2s ease-out;
}
.balao--usuario {
  align-self: flex-end;
  background: var(--cor-primaria);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}
.balao--assistente {
  align-self: flex-start;
  background: var(--cor-cartao);
  color: var(--cor-texto);
  border: 1px solid var(--cor-borda);
  border-bottom-left-radius: 4px;
}
/* Balão de "estou pensando": três pontinhos que pulsam. */
.digitando {
  display: inline-flex;
  gap: 4px;
}
.digitando span {
  width: 7px;
  height: 7px;
  background: var(--cor-texto-suave);
  border-radius: 50%;
  animation: pulsar 1.2s infinite ease-in-out;
}
.digitando span:nth-child(2) { animation-delay: 0.15s; }
.digitando span:nth-child(3) { animation-delay: 0.3s; }
@keyframes pulsar {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40%           { opacity: 1;    transform: translateY(-3px); }
}

/* Linha com campo de texto e botão Enviar, no rodapé da janela. */
.form-chat {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--cor-borda);
  background: var(--cor-cartao);
}
.campo--chat {
  padding: 10px 12px;
  font-size: 0.97rem;
  border-radius: 10px;
}
.botao--chat {
  padding: 10px 16px;
  font-size: 0.95rem;
  border-radius: 10px;
}

/* =========================================================================
   RODAPÉ
   ========================================================================= */
.rodape {
  text-align: center;
  color: var(--cor-texto-suave);
  font-size: 0.85rem;
  padding: 22px 16px 28px;
  border-top: 1px solid var(--cor-borda);
  margin-top: 24px;
}

/* =========================================================================
   CELULAR: ajustes para telas pequenas
   ========================================================================= */
@media (max-width: 480px) {
  body {
    font-size: 17px;             /* um pouco menor em celulares estreitos */
  }
  .topo__titulo {
    font-size: 1.4rem;
  }
  .janela-chat {
    right: 10px;
    left: 10px;
    width: auto;                 /* ocupa quase toda a largura do celular */
  }
  .chat-flutuante {
    right: 12px;
    bottom: 12px;
  }
}

/* =========================================================================
   CONSENTIMENTO (aceite antes de começar) e cartões desabilitados
   ========================================================================= */
.consentimento {
  margin-bottom: 16px;
}
.aceite {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.97rem;
  line-height: 1.5;
}
.aceite input {
  width: 22px;
  height: 22px;
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: var(--cor-primaria);
}
.aceite a {
  color: var(--cor-primaria);
  font-weight: 700;
}
/* Enquanto o aceite não é marcado, os cartões ficam apagados e não respondem. */
.cartao-direito:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* Respeita a preferência de quem pede menos animação no sistema. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
