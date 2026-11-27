/*
  ARQUIVO: unidades.js
  O QUE É: onde a pessoa pode ser encaminhada.
    - UNIDADES_CRAS: CRAS de Belo Horizonte, com regional, endereço, telefone e horário.
    - UNIDADES_DEFENSORIA: Defensorias Públicas de BH (DPMG e DPU).
    - BAIRROS_REGIONAL: para cada bairro, a regional e a unidade mais próxima conhecida.

  Fonte dos endereços e telefones: tabela enviada (Prefeitura de BH e Defensorias).
  Conferir antes de divulgar: telefones, horários marcados "Confirmar horário" e
  a lista de bairros, que é parcial.
*/

const HORARIO_CRAS = "Segunda a sexta, 8h às 18h";

const UNIDADES_CRAS = [
  { nome: "CRAS Independência", regional: "Barreiro", endereco: "Rua Maria Antonieta Ferreira, 151 – Independência", telefone: "(31) 3277-5977 / (31) 98866-1026", horario: HORARIO_CRAS },
  { nome: "CRAS Petrópolis", regional: "Barreiro", endereco: "Rua Frederico Boy Prussiano, 137 – Petrópolis", telefone: "(31) 3277-9578", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Cemig", regional: "Barreiro", endereco: "Rua Faisão, 1071 – Flávio Marques Lisboa", telefone: "(31) 3277-1355", horario: HORARIO_CRAS },

  { nome: "CRAS Vila Fátima", regional: "Centro-Sul", endereco: "Rua Dona Benta, 145 – Vila Fátima", telefone: "(31) 3277-9913", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Marçola", regional: "Centro-Sul", endereco: "Rua Engenheiro Lucas Júlio de Proença, 73 – Serra", telefone: "(31) 3246-5006", horario: HORARIO_CRAS },
  { nome: "CRAS Santa Rita de Cássia", regional: "Centro-Sul", endereco: "Rua São Tomaz de Aquino, 640 – Vila Santa Rita de Cássia", telefone: "(31) 3277-9415", horario: HORARIO_CRAS },

  { nome: "CRAS Alto Vera Cruz", regional: "Leste", endereco: "Rua Padre Júlio Maria, 1550 – Alto Vera Cruz", telefone: "(31) 98866-0839 / (31) 98411-9317", horario: HORARIO_CRAS },
  { nome: "CRAS Granja de Freitas", regional: "Leste", endereco: "Rua do Grupo, 12 – Granja de Freitas", telefone: "(31) 3277-5660", horario: HORARIO_CRAS },
  { nome: "CRAS Mariano de Abreu", regional: "Leste", endereco: "Rua Cinco de Janeiro, s/n – Mariano de Abreu", telefone: "(31) 3277-5643", horario: HORARIO_CRAS },
  { nome: "CRAS Taquaril", regional: "Leste", endereco: "Rua Ludgero Felipe Ferreira com Joaquim Teixeira dos Anjos, 42 – Taquaril", telefone: "(31) 3277-9010 / (31) 3246-8503", horario: HORARIO_CRAS },

  { nome: "CRAS União / Arthur de Sá", regional: "Nordeste", endereco: "Rua Professor Geraldo Fontes, 30 – União", telefone: "(31) 3277-9155", horario: HORARIO_CRAS },
  { nome: "CRAS Conjunto Paulo VI", regional: "Nordeste", endereco: "Rua Neblina, 120 – Conjunto Paulo VI", telefone: "(31) 3277-6840", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Maria", regional: "Nordeste", endereco: "Rua Professor Amílcar Viana Martins, 65 – Jardim Vitória", telefone: "(31) 3246-8051", horario: HORARIO_CRAS },

  { nome: "CRAS Vila Califórnia", regional: "Noroeste", endereco: "Avenida Avaí, 700 – Vila Califórnia", telefone: "(31) 3246-3045", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Coqueiral", regional: "Noroeste", endereco: "Rua Rainha das Flores, 102 – Jardim Filadélfia", telefone: "(31) 3277-7179", horario: HORARIO_CRAS },
  { nome: "CRAS Pedreira Prado Lopes", regional: "Noroeste", endereco: "Rua Guapé, 307 – Santo André", telefone: "(31) 3277-6032", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Sumaré", regional: "Noroeste", endereco: "Rua Cirilo Gaspar Araújo, 522 – Aparecida", telefone: "(31) 3246-7552", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Senhor dos Passos", regional: "Noroeste", endereco: "Rua Evaristo da Veiga, 239 – Vila Senhor dos Passos", telefone: "(31) 3277-6119", horario: HORARIO_CRAS },

  { nome: "CRAS Novo Aarão Reis", regional: "Norte", endereco: "Avenida Risoleta Neves, 347 – Novo Aarão Reis", telefone: "(31) 3277-1327", horario: HORARIO_CRAS },
  { nome: "CRAS Jardim Felicidade", regional: "Norte", endereco: "Rua Cecília Trindade da Silva, 55 – Conjunto Jardim Felicidade", telefone: "(31) 3246-9503", horario: HORARIO_CRAS },
  { nome: "CRAS Providência", regional: "Norte", endereco: "Rua São Sebastião, 140 – Minaslândia", telefone: "(31) 3277-6635", horario: HORARIO_CRAS },
  { nome: "CRAS Zilah Spósito", regional: "Norte", endereco: "Rua Coquilhos, 75 – Zilah Spósito", telefone: "(31) 3277-1848", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Biquinhas", regional: "Norte", endereco: "Rua Coronel Joaquim Tibúrcio, 850 – Heliópolis", telefone: "(31) 3246-8004", horario: HORARIO_CRAS },

  { nome: "CRAS Havaí–Ventosa", regional: "Oeste", endereco: "Rua Manila, 432 – Havaí (anexo: Rua Dona Nicolina de Lima, 316 – Ventosa)", telefone: "(31) 3277-9976 / (31) 3277-9616", horario: HORARIO_CRAS },
  { nome: "CRAS Graça Saboia", regional: "Oeste", endereco: "Avenida Silva Lobo, 2379 – Nova Granada", telefone: "(31) 3277-7091", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Antena", regional: "Oeste", endereco: "Rua Central, 78 – Vila Antena", telefone: "(31) 98874-0972", horario: HORARIO_CRAS },
  { nome: "CRAS Vista Alegre I", regional: "Oeste", endereco: "Rua Aguanil, 425 – Vista Alegre", telefone: "(31) 3246-2008", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Betânia", regional: "Oeste", endereco: "Rua Demiza, 770 – Betânia", telefone: "Telefone não publicado", horario: HORARIO_CRAS },
  { nome: "CRAS Cabana", regional: "Oeste", endereco: "Rua Capim Branco, 231 – Vista Alegre", telefone: "Telefone não publicado", horario: HORARIO_CRAS },

  { nome: "CRAS Confisco", regional: "Pampulha", endereco: "Rua Cecília Magalhães Gomes, 127 – Confisco", telefone: "(31) 3277-7146", horario: HORARIO_CRAS },
  { nome: "CRAS Novo Ouro Preto", regional: "Pampulha", endereco: "Rua Geraldina Cândida de Jesus, 92 – Novo Ouro Preto", telefone: "(31) 3277-7964", horario: HORARIO_CRAS },
  { nome: "CRAS Santa Rosa", regional: "Pampulha", endereco: "Avenida Major Delfino de Paula, 2553 – São Francisco", telefone: "(31) 3277-6698", horario: HORARIO_CRAS },
  { nome: "CRAS Vila São José", regional: "Pampulha", endereco: "Rua Joaquim José Ribeiro, 50 – Manacás", telefone: "(31) 3277-7149", horario: HORARIO_CRAS },
  { nome: "CRAS Dandara", regional: "Pampulha", endereco: "Rua José Simplício Moreira, 1144 – Trevo", telefone: "(31) 98906-6792", horario: HORARIO_CRAS },

  { nome: "CRAS Apolônia", regional: "Venda Nova", endereco: "Rua Visconde de Itaboraí, 304 – Jardim Leblon", telefone: "(31) 3277-1816", horario: HORARIO_CRAS },
  { nome: "CRAS Lagoa", regional: "Venda Nova", endereco: "Rua José Sabino Maciel, 120 – Lagoa", telefone: "(31) 3246-9016", horario: HORARIO_CRAS },
  { nome: "CRAS Mantiqueira", regional: "Venda Nova", endereco: "Rua Luzia Salomão, 300 – Mantiqueira", telefone: "(31) 3277-1895", horario: HORARIO_CRAS }
];

const UNIDADES_DEFENSORIA = [
  { nome: "DPMG – Sede Guajajaras", endereco: "Rua dos Guajajaras, 1707 – Barro Preto", telefone: "(31) 3526-0500", horario: "8h às 17h" },
  { nome: "DPMG – Sede 2 (Execução Penal)", endereco: "Rua Bernardo Guimarães, 2731 – Santo Agostinho", telefone: "(31) 2522-8790", horario: "Confirmar horário" },
  { nome: "DPMG – Sede 3", endereco: "Rua Araguari, 210 – Barro Preto", telefone: "(31) 2010-3111", horario: "Confirmar horário" },
  { nome: "DPMG – CIA/BH (atendimento ao adolescente)", endereco: "Rua Rio Grande do Sul, 604, 2º andar – Centro", telefone: "(31) 3292-4018", horario: "Confirmar horário" },
  { nome: "DPMG – Unidade IV", endereco: "Avenida Bias Fortes, 431 – Lourdes", telefone: "", horario: "Confirmar horário" },
  { nome: "DPU – Belo Horizonte", endereco: "Rua Pouso Alto, 15 – Serra", telefone: "(31) 3069-6300", horario: "9h às 16h" }
];

/*
  BAIRROS: para cada bairro, a regional e, quando conhecida, a unidade mais próxima.
  Chaves sem acento e em minúsculas. Bairros sem "cras" ou "defensoria" mostram a regional.
  "santa efigenia" aponta para as unidades do Serra, como indicado; confirme.
*/
const BAIRROS_REGIONAL = {
  "santa efigenia": { regional: "Centro-Sul", cras: "CRAS Vila Marçola", defensoria: "DPU – Belo Horizonte" },
  "serra": { regional: "Centro-Sul", cras: "CRAS Vila Marçola", defensoria: "DPU – Belo Horizonte" },
  "vila fatima": { regional: "Centro-Sul", cras: "CRAS Vila Fátima" },
  "vila santa rita de cassia": { regional: "Centro-Sul", cras: "CRAS Santa Rita de Cássia" },
  "barro preto": { regional: "Centro-Sul", defensoria: "DPMG – Sede Guajajaras" },
  "centro": { regional: "Centro-Sul", defensoria: "DPMG – CIA/BH (atendimento ao adolescente)" },
  "lourdes": { regional: "Centro-Sul", defensoria: "DPMG – Unidade IV" },
  "santo agostinho": { regional: "Centro-Sul", defensoria: "DPMG – Sede 2 (Execução Penal)" },
  "funcionarios": { regional: "Centro-Sul" },
  "savassi": { regional: "Centro-Sul" },
  "sion": { regional: "Centro-Sul" },

  "barreiro": { regional: "Barreiro" },
  "independencia": { regional: "Barreiro", cras: "CRAS Independência" },
  "petropolis": { regional: "Barreiro", cras: "CRAS Petrópolis" },
  "flavio marques lisboa": { regional: "Barreiro", cras: "CRAS Vila Cemig" },

  "alto vera cruz": { regional: "Leste", cras: "CRAS Alto Vera Cruz" },
  "granja de freitas": { regional: "Leste", cras: "CRAS Granja de Freitas" },
  "mariano de abreu": { regional: "Leste", cras: "CRAS Mariano de Abreu" },
  "taquaril": { regional: "Leste", cras: "CRAS Taquaril" },

  "jardim vitoria": { regional: "Nordeste", cras: "CRAS Vila Maria" },
  "uniao": { regional: "Nordeste", cras: "CRAS União / Arthur de Sá" },
  "conjunto paulo vi": { regional: "Nordeste", cras: "CRAS Conjunto Paulo VI" },

  "vila california": { regional: "Noroeste", cras: "CRAS Vila Califórnia" },
  "santo andre": { regional: "Noroeste", cras: "CRAS Pedreira Prado Lopes" },
  "prado lopes": { regional: "Noroeste", cras: "CRAS Pedreira Prado Lopes" },
  "aparecida": { regional: "Noroeste", cras: "CRAS Vila Sumaré" },
  "vila senhor dos passos": { regional: "Noroeste", cras: "CRAS Vila Senhor dos Passos" },

  "novo aarao reis": { regional: "Norte", cras: "CRAS Novo Aarão Reis" },
  "minaslandia": { regional: "Norte", cras: "CRAS Providência" },
  "heliopolis": { regional: "Norte", cras: "CRAS Vila Biquinhas" },
  "zilah sposito": { regional: "Norte", cras: "CRAS Zilah Spósito" },

  "havai": { regional: "Oeste", cras: "CRAS Havaí–Ventosa" },
  "ventosa": { regional: "Oeste", cras: "CRAS Havaí–Ventosa" },
  "nova granada": { regional: "Oeste", cras: "CRAS Graça Saboia" },
  "vila antena": { regional: "Oeste", cras: "CRAS Vila Antena" },
  "vista alegre": { regional: "Oeste", cras: "CRAS Vista Alegre I" },

  "pampulha": { regional: "Pampulha" },
  "confisco": { regional: "Pampulha", cras: "CRAS Confisco" },
  "novo ouro preto": { regional: "Pampulha", cras: "CRAS Novo Ouro Preto" },
  "sao francisco": { regional: "Pampulha", cras: "CRAS Santa Rosa" },
  "manacas": { regional: "Pampulha", cras: "CRAS Vila São José" },
  "trevo": { regional: "Pampulha", cras: "CRAS Dandara" },

  "venda nova": { regional: "Venda Nova" },
  "jardim leblon": { regional: "Venda Nova", cras: "CRAS Apolônia" },
  "lagoa": { regional: "Venda Nova", cras: "CRAS Lagoa" },
  "mantiqueira": { regional: "Venda Nova", cras: "CRAS Mantiqueira" }
};
