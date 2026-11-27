"""
ARQUIVO: geocodificar_unidades.py
O QUE FAZ: descobre a latitude e a longitude de cada CRAS e Defensoria
pelo Nominatim (OpenStreetMap). Você roda UMA vez, no seu computador.
Depois confere o arquivo unidades_coords.json no mapa e corrige o que estiver errado.

COMO RODAR:
  1. pip install requests
  2. Troque o contato em CABECALHO abaixo (o Nominatim pede para identificar o projeto).
  3. python geocodificar_unidades.py
"""

import json
import re
import time

import requests

# Arquivo com as unidades, gerado a partir de unidades.js.
ENTRADA = "unidades.json"
# Arquivo de saída, com a localização de cada unidade.
SAIDA = "unidades_coords.json"

URL_NOMINATIM = "https://nominatim.openstreetmap.org/search"
# Obrigatório pelo Nominatim: identifique o projeto com um contato real.
CABECALHO = {"User-Agent": "TenhoDireito-geocodificacao/1.0 (contato@seudominio.com.br)"}

# Caixa aproximada de Belo Horizonte. Resultado fora dela é marcado para conferência.
LAT_MIN, LAT_MAX = -20.05, -19.75
LON_MIN, LON_MAX = -44.05, -43.85

# Pausa entre consultas: o Nominatim aceita no máximo 1 requisição por segundo.
PAUSA_SEGUNDOS = 1.1


def endereco_para_busca(endereco):
    """
    Deixa só rua e número para a busca.
    Ex.: "Rua Dona Benta, 145 – Vila Fátima" vira "Rua Dona Benta, 145, Belo Horizonte, MG, Brasil".
    """
    rua_e_numero = endereco.split("–")[0]
    rua_e_numero = re.sub(r"\(.*?\)", "", rua_e_numero).strip()
    return f"{rua_e_numero}, Belo Horizonte, MG, Brasil"


def buscar_no_nominatim(consulta):
    """Devolve (latitude, longitude, nome encontrado) ou None se não achar."""
    resposta = requests.get(
        URL_NOMINATIM,
        params={"q": consulta, "format": "json", "limit": 1, "countrycodes": "br"},
        headers=CABECALHO,
        timeout=20,
    )
    resposta.raise_for_status()
    dados = resposta.json()
    if not dados:
        return None
    primeiro = dados[0]
    return float(primeiro["lat"]), float(primeiro["lon"]), primeiro.get("display_name", "")


def geocodificar(unidades):
    resultado = []
    for tipo in ["cras", "defensoria"]:
        for unidade in unidades[tipo]:
            consulta = endereco_para_busca(unidade["endereco"])
            item = {"tipo": tipo, "nome": unidade["nome"], "consulta": consulta}

            try:
                achado = buscar_no_nominatim(consulta)
            except requests.RequestException:
                achado = None
            time.sleep(PAUSA_SEGUNDOS)

            if achado is None:
                item.update(status="nao_encontrado", lat=None, lon=None,
                            obs="Endereço não achado. Confira no Google Maps e preencha lat/lon à mão.")
            else:
                lat, lon, nome_encontrado = achado
                dentro_de_bh = LAT_MIN <= lat <= LAT_MAX and LON_MIN <= lon <= LON_MAX
                item.update(
                    status="ok" if dentro_de_bh else "fora_de_bh",
                    lat=lat,
                    lon=lon,
                    encontrado=nome_encontrado,
                    obs="" if dentro_de_bh else "Caiu fora de Belo Horizonte. Confira o ponto no mapa.",
                )
            resultado.append(item)
            print(f"{item['status']:>15}  {unidade['nome']}")
    return resultado


def main():
    with open(ENTRADA, encoding="utf-8") as arquivo:
        unidades = json.load(arquivo)

    resultado = geocodificar(unidades)

    with open(SAIDA, "w", encoding="utf-8") as arquivo:
        json.dump(resultado, arquivo, ensure_ascii=False, indent=2)

    pendentes = [r for r in resultado if r["status"] != "ok"]
    print(f"\nGravado em {SAIDA}. {len(pendentes)} item(ns) precisam de conferência manual.")


if __name__ == "__main__":
    main()
