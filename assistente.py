"""
ARQUIVO: assistente.py
O QUE É: o servidor do site. Ele faz duas coisas:
  1. Entrega os arquivos da página (index.html, style.css, app.js) ao navegador.
  2. Recebe a dúvida do chat, envia para a API do Gemini e devolve a resposta.

POR QUE EXISTE: a chave da API é um segredo. Se ela ficasse no app.js,
qualquer pessoa que abrisse o código do site poderia copiá-la e usar a sua conta.
Por isso a chave fica aqui no servidor, lida de uma variável de ambiente.

COMO RODAR (no terminal, dentro da pasta do projeto):
  1. pip install flask requests
  2. Defina a chave (sem colocá-la no código):
       Windows (PowerShell):  $env:GEMINI_API_KEY="SUA_CHAVE"
       Linux/Mac:             export GEMINI_API_KEY="SUA_CHAVE"
  3. python assistente.py
  4. Abra no navegador: http://127.0.0.1:5000
"""

import os

import requests
from flask import Flask, jsonify, request, send_from_directory

# Pasta onde este arquivo está. Usada para achar index.html, style.css e app.js.
PASTA = os.path.dirname(os.path.abspath(__file__))

# Cria a aplicação web. "static_folder=None" evita a pasta padrão do Flask,
# já que servimos os arquivos diretamente da pasta do projeto.
app = Flask(__name__, static_folder=None)

# Endereço da API do Google Gemini (modelo de texto).
# O nome do modelo pode mudar com o tempo: confira em https://ai.google.dev
URL_GEMINI = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# Limite de tamanho da mensagem, para evitar abuso e custos.
TAMANHO_MAXIMO_MENSAGEM = 500

# Instruções fixas dadas ao modelo. Definem como ele deve se comportar.
INSTRUCOES_SISTEMA = """
Você é um assistente virtual de orientação sobre direitos sociais no Brasil
(Bolsa Família, BPC, aposentadoria do INSS e atendimento no CRAS).

Regras obrigatórias:
- Responda em português, de forma simples e acolhedora, em poucas frases.
- Você NÃO é advogado e NÃO substitui defensor público, CRAS ou INSS.
  Sempre que for uma questão individual, oriente a procurar o CRAS ou a Defensoria.
- Não prometa benefício nem diga que a pessoa "com certeza" tem direito.
- Não peça nem registre dados pessoais como CPF, endereço completo ou número de documento.
- Se a pergunta não for sobre direitos sociais, diga gentilmente que só pode ajudar com esse tema.
"""


def perguntar_ao_gemini(mensagem, historico):
    """
    Envia a pergunta ao Gemini e devolve o texto da resposta.

    Parâmetros:
      mensagem  -> texto que a pessoa digitou no chat.
      historico -> lista das últimas mensagens, para a conversa ter contexto.

    Devolve uma tupla (texto, erro). Se der certo, erro é None.
    """
    chave = os.environ.get("GEMINI_API_KEY")
    if not chave:
        # Sem chave, o assistente não funciona. Avisa quem está rodando o servidor.
        return None, "A chave do assistente não está configurada no servidor."

    # Monta a conversa no formato que a API espera: uma lista de "conteudos".
    conteudos = []
    for item in historico:
        # A API usa "user" para a pessoa e "model" para o assistente.
        papel = "user" if item.get("papel") == "usuario" else "model"
        conteudos.append({"role": papel, "parts": [{"text": item.get("texto", "")}]})
    conteudos.append({"role": "user", "parts": [{"text": mensagem}]})

    corpo = {
        # Instruções de comportamento, separadas da conversa.
        "system_instruction": {"parts": [{"text": INSTRUCOES_SISTEMA}]},
        "contents": conteudos,
        # Controla a criatividade e o tamanho da resposta.
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 400},
    }

    try:
        resposta = requests.post(
            URL_GEMINI,
            # A chave vai no cabeçalho, não na URL, para não aparecer em registros de acesso.
            headers={"x-goog-api-key": chave, "Content-Type": "application/json"},
            json=corpo,
            timeout=20,  # desiste depois de 20 segundos para não deixar a pessoa esperando
        )
        resposta.raise_for_status()  # gera erro se a API respondeu com falha (ex.: 400, 429, 500)
        dados = resposta.json()

        # O texto fica em dados["candidates"][0]["content"]["parts"][0]["text"].
        texto = dados["candidates"][0]["content"]["parts"][0]["text"]
        return texto.strip(), None

    except requests.Timeout:
        return None, "A resposta demorou demais. Tente novamente."
    except requests.RequestException:
        # Qualquer falha de rede ou da API cai aqui. Não mostramos detalhes técnicos à pessoa.
        return None, "Não consegui falar com o assistente agora."
    except (KeyError, IndexError, ValueError):
        # A API respondeu, mas em formato inesperado (ex.: resposta bloqueada por segurança).
        return None, "O assistente não conseguiu responder essa pergunta. Tente reformular."


@app.route("/")
def pagina_inicial():
    """Entrega a página principal (index.html) quando alguém abre o endereço do site."""
    return send_from_directory(PASTA, "index.html")


@app.route("/<path:arquivo>")
def arquivos_do_site(arquivo):
    """
    Entrega os demais arquivos do site (style.css, app.js).
    Só serve arquivos de extensões conhecidas, para não expor o código do servidor.
    """
    permitidos = {".html", ".css", ".js"}
    extensao = os.path.splitext(arquivo)[1].lower()
    if extensao not in permitidos:
        return jsonify({"erro": "Arquivo não encontrado."}), 404
    return send_from_directory(PASTA, arquivo)


@app.route("/api/chat", methods=["POST"])
def api_chat():
    """
    Recebe a pergunta do chat (em JSON) e devolve a resposta do assistente.
    Entrada esperada: {"mensagem": "...", "historico": [...]}
    Saída: {"resposta": "..."} ou {"erro": "..."} com status de erro.
    """
    dados = request.get_json(silent=True) or {}
    mensagem = (dados.get("mensagem") or "").strip()
    historico = dados.get("historico") or []

    # Validações simples antes de gastar a API.
    if not mensagem:
        return jsonify({"erro": "Escreva uma pergunta."}), 400
    if len(mensagem) > TAMANHO_MAXIMO_MENSAGEM:
        return jsonify({"erro": "A pergunta está muito longa. Resuma e tente de novo."}), 400
    if not isinstance(historico, list):
        historico = []

    texto, erro = perguntar_ao_gemini(mensagem, historico)
    if erro:
        return jsonify({"erro": erro}), 502  # 502 = o serviço externo falhou
    return jsonify({"resposta": texto})


if __name__ == "__main__":
    # debug=False: em produção não mostra detalhes internos do erro para o público.
    # Porta 5000 é o padrão local. host 127.0.0.1 deixa o site acessível só nesta máquina.
    app.run(host="127.0.0.1", port=5000, debug=False)
