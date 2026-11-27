"""
ARQUIVO: assistente.py
O QUE É: o servidor do site. Ele faz três coisas:
  1. Entrega a página (index.html, style.css, app.js) ao navegador.
  2. Recebe a dúvida do chat, envia ao Gemini e devolve a resposta.
  3. Recebe um endereço, acha a coordenada e devolve o CRAS e a Defensoria mais perto.

POR QUE EXISTE: a chave da API é um segredo. Ela fica aqui no servidor,
lida de uma variável de ambiente, e nunca no código do site.

COMO RODAR (dentro da pasta do projeto, no terminal):
  1. pip install flask requests
  2. Defina a chave:
       Windows (PowerShell):  $env:GEMINI_API_KEY="SUA_CHAVE"
       Linux/Mac:             export GEMINI_API_KEY="SUA_CHAVE"
  3. (Opcional) Defina um contato para o Nominatim, que pede identificação:
       $env:CONTATO_NOMINATIM="seuemail@exemplo.com"
  4. python assistente.py
  5. Abra no navegador: http://127.0.0.1:5000

PARA O ENDEREÇO FUNCIONAR: rode antes o geocodificar_unidades.py, que gera
unidades_coords.json. Sem esse arquivo, o site pede o bairro.
Depois de gerar ou corrigir o arquivo, reinicie este servidor.
"""

import json
import math
import os
import re
import threading
import time

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
TAMANHO_MAXIMO_ENDERECO = 150

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


# =========================================================================
# DÚVIDAS LIVRES: Gemini
# =========================================================================
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


# =========================================================================
# ENDEREÇO: acha a unidade mais perto (distância em linha reta)
# =========================================================================
URL_NOMINATIM = "https://nominatim.openstreetmap.org/search"
CONTATO_NOMINATIM = os.environ.get("CONTATO_NOMINATIM", "contato@seudominio.com.br")
ARQUIVO_COORDS = os.path.join(PASTA, "unidades_coords.json")

# Caixa de Belo Horizonte, no formato left,top,right,bottom (lon/lat).
CAIXA_BH = "-44.05,-19.75,-43.85,-20.05"

# Guarda endereços já localizados (só na memória do servidor, até reiniciar).
_cache_enderecos = {}
_ultima_consulta = [0.0]
_trava = threading.Lock()


def carregar_unidades():
    """Lê unidades_coords.json e fica só com as unidades marcadas como 'ok'."""
    if not os.path.exists(ARQUIVO_COORDS):
        return []
    with open(ARQUIVO_COORDS, encoding="utf-8") as arquivo:
        dados = json.load(arquivo)
    return [u for u in dados if u.get("status") == "ok" and u.get("lat") is not None]


UNIDADES_COORDS = carregar_unidades()


def distancia_km(lat1, lon1, lat2, lon2):
    """Distância em linha reta entre dois pontos (fórmula de Haversine), em km."""
    raio_terra = 6371.0
    f1, f2 = math.radians(lat1), math.radians(lat2)
    delta_f = math.radians(lat2 - lat1)
    delta_l = math.radians(lon2 - lon1)
    a = math.sin(delta_f / 2) ** 2 + math.cos(f1) * math.cos(f2) * math.sin(delta_l / 2) ** 2
    return 2 * raio_terra * math.asin(math.sqrt(a))


def localizar_endereco(endereco):
    """
    Devolve (latitude, longitude) do endereço em Belo Horizonte, ou None se não achar.
    Levanta requests.RequestException se o serviço de mapas falhar.
    Respeita o limite do Nominatim: no máximo 1 consulta por segundo.
    """
    chave = re.sub(r"\s+", " ", endereco.strip().lower())
    if chave in _cache_enderecos:
        return _cache_enderecos[chave]

    consulta = f"{endereco}, Belo Horizonte, MG, Brasil"
    with _trava:
        espera = 1.1 - (time.time() - _ultima_consulta[0])
        if espera > 0:
            time.sleep(espera)
        resposta = requests.get(
            URL_NOMINATIM,
            params={
                "q": consulta,
                "format": "json",
                "limit": 1,
                "countrycodes": "br",
                "viewbox": CAIXA_BH,
                "bounded": 1,
            },
            headers={"User-Agent": f"TenhoDireito/1.0 ({CONTATO_NOMINATIM})"},
            timeout=10,
        )
        _ultima_consulta[0] = time.time()
    resposta.raise_for_status()
    dados = resposta.json()

    achado = None
    if dados:
        achado = (float(dados[0]["lat"]), float(dados[0]["lon"]))

    if len(_cache_enderecos) > 500:
        _cache_enderecos.clear()
    _cache_enderecos[chave] = achado
    return achado


def unidade_mais_proxima(lat, lon, tipo):
    """Devolve (nome, km) da unidade do tipo ('cras' ou 'defensoria') mais perto, ou None."""
    candidatas = [u for u in UNIDADES_COORDS if u.get("tipo") == tipo]
    if not candidatas:
        return None
    mais_perto = min(candidatas, key=lambda u: distancia_km(lat, lon, u["lat"], u["lon"]))
    km = distancia_km(lat, lon, mais_perto["lat"], mais_perto["lon"])
    return {"nome": mais_perto["nome"], "km": round(km, 1)}


# =========================================================================
# ROTAS
# =========================================================================
@app.route("/")
def pagina_inicial():
    """Entrega a página principal quando alguém abre o endereço do site."""
    return send_from_directory(PASTA, "index.html")


@app.route("/<path:arquivo>")
def arquivos_do_site(arquivo):
    """
    Entrega style.css, app.js, unidades.js e imagens do site.
    Só serve extensões de site, para não expor o código do servidor nem os dados.
    """
    permitidos = {".html", ".css", ".js", ".png", ".jpg", ".svg"}
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


@app.route("/api/unidade-proxima", methods=["POST"])
def api_unidade_proxima():
    """
    Recebe {"endereco": "Rua ..., 145"} e devolve o CRAS e a Defensoria mais perto:
      {"cras": {"nome": "...", "km": 1.2}, "defensoria": {"nome": "...", "km": 2.0}}
    Em caso de erro, devolve {"erro": "...", "codigo": "..."}.
    """
    dados = request.get_json(silent=True) or {}
    endereco = (dados.get("endereco") or "").strip()

    if not endereco:
        return jsonify({"erro": "Digite o endereço.", "codigo": "vazio"}), 400
    if PADRAO_DOCUMENTO.search(endereco):
        return jsonify({"erro": "Por segurança, não digite CPF nem número de documento. Digite só a rua e o número.", "codigo": "documento"}), 400
    if len(endereco) > TAMANHO_MAXIMO_ENDERECO:
        return jsonify({"erro": "O endereço está muito longo. Digite só a rua e o número.", "codigo": "longo"}), 400
    if not UNIDADES_COORDS:
        return jsonify({"erro": "Ainda não consigo localizar pelo endereço neste momento.", "codigo": "sem_coordenadas"}), 503

    try:
        local = localizar_endereco(endereco)
    except (requests.RequestException, ValueError, KeyError, IndexError):
        return jsonify({"erro": "Não consegui localizar o endereço agora. Tente de novo ou informe o bairro.", "codigo": "servico"}), 502

    if local is None:
        return jsonify({"erro": "Não encontrei esse endereço em Belo Horizonte. Tente só a rua e o número, ou informe o bairro.", "codigo": "nao_encontrado"}), 404

    lat, lon = local
    return jsonify({
        "cras": unidade_mais_proxima(lat, lon, "cras"),
        "defensoria": unidade_mais_proxima(lat, lon, "defensoria"),
    })


if __name__ == "__main__":
    # debug=False: não mostra detalhes internos de erro ao público.
    # host 127.0.0.1: o site fica acessível só nesta máquina, por enquanto.
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)
