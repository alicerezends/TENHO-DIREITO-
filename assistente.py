"""
ARQUIVO: assistente.py
O QUE É: o servidor do site. Ele faz duas coisas:
  1. Entrega a página (index.html, style.css, app.js) ao navegador.
  2. Recebe a dúvida do chat, envia ao Gemini e devolve a resposta.

POR QUE EXISTE: a chave da API é um segredo. Ela fica aqui no servidor,
lida de uma variável de ambiente, e nunca no código do site.

COMO RODAR (dentro da pasta do projeto, no terminal):
  1. pip install flask requests
  2. Defina a chave:
       Windows (PowerShell):  $env:GEMINI_API_KEY="SUA_CHAVE"
       Linux/Mac:             export GEMINI_API_KEY="SUA_CHAVE"
  3. python assistente.py
  4. Abra no navegador: http://127.0.0.1:5000
"""

import os
import re

import requests
from flask import Flask, jsonify, request, send_from_directory

# Pasta onde este arquivo está. Os arquivos do site ficam nela.
PASTA = os.path.dirname(os.path.abspath(__file__))

# Aplicação web. static_folder=None: servimos os arquivos nós mesmos.
app = Flask(__name__, static_folder=None)

# Endereço da API do Gemini (modelo de texto).
# O nome do modelo pode mudar: confira em https://ai.google.dev
URL_GEMINI = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# Padrão de CPF (com ou sem pontos e traço) e de números longos de documento.
PADRAO_DOCUMENTO = re.compile(r"\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{9,}")

# Tamanho máximo da mensagem, para evitar abuso e custo.
TAMANHO_MAXIMO_MENSAGEM = 500

# Regras fixas de comportamento do assistente.
INSTRUCOES_SISTEMA = """
Você é um assistente virtual de orientação sobre direitos sociais no Brasil
(BPC, aposentadoria por idade do INSS, Bolsa Família e atendimento no CRAS).

Regras obrigatórias:
- Responda em português, de forma simples e acolhedora, em poucas frases.
- Você NÃO é advogado e NÃO substitui defensor público, CRAS ou INSS.
  Em casos individuais, oriente a procurar o CRAS ou a Defensoria.
- Não prometa benefício nem diga que a pessoa "com certeza" tem direito.
- Não peça nem registre dados pessoais como CPF, endereço completo ou número de documento.
- Se a pergunta não for sobre direitos sociais, diga com gentileza que só ajuda com esse tema.
"""


def perguntar_ao_gemini(mensagem, historico):
    """
    Envia a pergunta ao Gemini e devolve (texto, erro).
    Se der certo, erro é None. Se falhar, texto é None.
    """
    chave = os.environ.get("GEMINI_API_KEY")
    if not chave:
        return None, "A chave do assistente não está configurada no servidor."

    # Monta a conversa no formato da API: "user" para a pessoa, "model" para o assistente.
    conteudos = []
    for item in historico:
        papel = "user" if item.get("papel") == "usuario" else "model"
        conteudos.append({"role": papel, "parts": [{"text": item.get("texto", "")}]})
    conteudos.append({"role": "user", "parts": [{"text": mensagem}]})

    corpo = {
        "system_instruction": {"parts": [{"text": INSTRUCOES_SISTEMA}]},
        "contents": conteudos,
        # Temperatura baixa: respostas mais previsíveis. Limite de tamanho da resposta.
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 400},
    }

    try:
        resposta = requests.post(
            URL_GEMINI,
            # A chave vai no cabeçalho, não na URL, para não aparecer em registros.
            headers={"x-goog-api-key": chave, "Content-Type": "application/json"},
            json=corpo,
            timeout=20,  # desiste após 20 segundos
        )
        resposta.raise_for_status()  # erro se a API falhar (400, 429, 500...)
        dados = resposta.json()
        texto = dados["candidates"][0]["content"]["parts"][0]["text"]
        return texto.strip(), None

    except requests.Timeout:
        return None, "A resposta demorou demais. Tente novamente."
    except requests.RequestException:
        # Falha de rede ou da API. Não mostramos detalhes técnicos à pessoa.
        return None, "Não consegui falar com o assistente agora."
    except (KeyError, IndexError, ValueError):
        # A API respondeu em formato inesperado (ex.: bloqueio de segurança).
        return None, "O assistente não conseguiu responder essa pergunta. Tente reformular."


@app.route("/")
def pagina_inicial():
    """Entrega a página principal quando alguém abre o endereço do site."""
    return send_from_directory(PASTA, "index.html")


@app.route("/<path:arquivo>")
def arquivos_do_site(arquivo):
    """
    Entrega style.css e app.js.
    Só serve extensões de site, para não expor o código do servidor.
    """
    permitidos = {".html", ".css", ".js"}
    extensao = os.path.splitext(arquivo)[1].lower()
    if extensao not in permitidos:
        return jsonify({"erro": "Arquivo não encontrado."}), 404
    return send_from_directory(PASTA, arquivo)


@app.route("/api/chat", methods=["POST"])
def api_chat():
    """
    Recebe {"mensagem": "...", "historico": [...]} e devolve {"resposta": "..."}.
    Em caso de erro, devolve {"erro": "..."} com o código HTTP correspondente.
    """
    dados = request.get_json(silent=True) or {}
    mensagem = (dados.get("mensagem") or "").strip()
    historico = dados.get("historico") or []

    if not mensagem:
        return jsonify({"erro": "Escreva uma pergunta."}), 400
    if PADRAO_DOCUMENTO.search(mensagem):
        return jsonify({"erro": "Por segurança, não digite CPF nem número de documento aqui. Escreva sua dúvida sem esses dados."}), 400
    if len(mensagem) > TAMANHO_MAXIMO_MENSAGEM:
        return jsonify({"erro": "A pergunta está muito longa. Resuma e tente de novo."}), 400
    if not isinstance(historico, list):
        historico = []

    texto, erro = perguntar_ao_gemini(mensagem, historico)
    if erro:
        return jsonify({"erro": erro}), 502  # 502: o serviço externo falhou
    return jsonify({"resposta": texto})


if __name__ == "__main__":
    # debug=False: não mostra detalhes internos de erro ao público.
    # host 127.0.0.1: o site fica acessível só nesta máquina, por enquanto.
    app.run(host="127.0.0.1", port=5000, debug=False)
