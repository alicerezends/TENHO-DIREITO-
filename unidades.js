/*
  ARQUIVO: unidades.js
  O QUE É: a lista de onde a pessoa pode ser encaminhada.
    - CRAS de Belo Horizonte, organizados por regional.
    - Defensorias Públicas de Belo Horizonte (DPMG e DPU).

  COMO ATUALIZAR: edite só os dados abaixo. Cada item tem:
    nome, regional (só CRAS), endereco, telefone (vazio se não informado) e horario.
  "Confirmar horário" significa que o horário ainda não foi verificado.
  Antes de divulgar, confira telefones e horários nos canais oficiais.
  Fonte informada: Prefeitura de Belo Horizonte (CRAS) e Defensorias (DPMG e DPU).
*/

/* Horário geral informado para os CRAS. */
const HORARIO_CRAS = "Segunda a sexta, 8h às 18h";

/* CRAS de Belo Horizonte. A "regional" precisa ser igual às opções do campo na página. */
const UNIDADES_CRAS = [
  { nome: "CRAS Independência", regional: "Barreiro", endereco: "Rua Maria Antonieta Ferreira, 151", telefone: "(31) 3277-5977", horario: HORARIO_CRAS },
  { nome: "CRAS Petrópolis", regional: "Barreiro", endereco: "Rua Frederico Boy Prussiano, 137", telefone: "(31) 3277-9578", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Cemig", regional: "Barreiro", endereco: "Rua Faisão, 1071", telefone: "(31) 3277-1355", horario: HORARIO_CRAS },

  { nome: "CRAS Vila Fátima", regional: "Centro-Sul", endereco: "Rua Dona Benta, 145", telefone: "(31) 3277-9913", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Marçola", regional: "Centro-Sul", endereco: "Rua Eng. Lucas Júlio de Proença, 73", telefone: "(31) 3246-5006", horario: HORARIO_CRAS },
  { nome: "CRAS Santa Rita de Cássia", regional: "Centro-Sul", endereco: "Rua São Tomaz de Aquino, 640", telefone: "(31) 3277-9415", horario: HORARIO_CRAS },

  { nome: "CRAS Alto Vera Cruz", regional: "Leste", endereco: "Rua Padre Júlio Maria, 1550", telefone: "(31) 98866-0839", horario: HORARIO_CRAS },
  { nome: "CRAS Granja de Freitas", regional: "Leste", endereco: "Rua do Grupo, 12", telefone: "(31) 3277-5660", horario: HORARIO_CRAS },
  { nome: "CRAS Mariano de Abreu", regional: "Leste", endereco: "Rua Cinco de Janeiro, s/n", telefone: "(31) 3277-5643", horario: HORARIO_CRAS },
  { nome: "CRAS Taquaril", regional: "Leste", endereco: "Rua Ludgero Felipe Ferreira, 42", telefone: "(31) 3277-9010", horario: HORARIO_CRAS },

  { nome: "CRAS União / Arthur de Sá", regional: "Nordeste", endereco: "Rua Professor Geraldo Fontes, 30", telefone: "(31) 3277-9155", horario: HORARIO_CRAS },
  { nome: "CRAS Conjunto Paulo VI", regional: "Nordeste", endereco: "Rua Neblina, 120", telefone: "(31) 3277-6840", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Maria", regional: "Nordeste", endereco: "Rua Professor Amílcar Viana Martins, 65", telefone: "(31) 3246-8051", horario: HORARIO_CRAS },

  { nome: "CRAS Vila Califórnia", regional: "Noroeste", endereco: "Avenida Avaí, 700", telefone: "(31) 3246-3045", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Coqueiral", regional: "Noroeste", endereco: "Rua Rainha das Flores, 102", telefone: "(31) 3277-7179", horario: HORARIO_CRAS },
  { nome: "CRAS Pedreira Prado Lopes", regional: "Noroeste", endereco: "Rua Guapé, 307", telefone: "(31) 3277-6032", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Sumaré", regional: "Noroeste", endereco: "Rua Cirilo Gaspar Araújo, 522", telefone: "(31) 3246-7552", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Senhor dos Passos", regional: "Noroeste", endereco: "Rua Evaristo da Veiga, 239", telefone: "(31) 3277-6119", horario: HORARIO_CRAS },

  { nome: "CRAS Novo Aarão Reis", regional: "Norte", endereco: "Avenida Risoleta Neves, 347", telefone: "(31) 3277-1327", horario: HORARIO_CRAS },
  { nome: "CRAS Jardim Felicidade", regional: "Norte", endereco: "Rua Cecília Trindade da Silva, 55", telefone: "(31) 3246-9503", horario: HORARIO_CRAS },
  { nome: "CRAS Providência", regional: "Norte", endereco: "Rua São Sebastião, 140", telefone: "(31) 3277-6635", horario: HORARIO_CRAS },
  { nome: "CRAS Zilah Spósito", regional: "Norte", endereco: "Rua Coquilhos, 75", telefone: "(31) 3277-1848", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Biquinhas", regional: "Norte", endereco: "Rua Coronel Joaquim Tibúrcio, 850", telefone: "(31) 3246-8004", horario: HORARIO_CRAS },

  { nome: "CRAS Havaí – Ventosa", regional: "Oeste", endereco: "Rua Manila, 432", telefone: "(31) 3277-9976", horario: HORARIO_CRAS },
  { nome: "CRAS Graça Saboia", regional: "Oeste", endereco: "Avenida Silva Lobo, 2379", telefone: "(31) 3277-7091", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Antena", regional: "Oeste", endereco: "Rua Central, 78", telefone: "(31) 98874-0972", horario: HORARIO_CRAS },
  { nome: "CRAS Vista Alegre I", regional: "Oeste", endereco: "Rua Aguanil, 425", telefone: "(31) 3246-2008", horario: HORARIO_CRAS },
  { nome: "CRAS Vila Betânia", regional: "Oeste", endereco: "Rua Demiza, 770", telefone: "", horario: HORARIO_CRAS },
  { nome: "CRAS Cabana", regional: "Oeste", endereco: "Rua Capim Branco, 231", telefone: "", horario: HORARIO_CRAS },

  { nome: "CRAS Confisco", regional: "Pampulha", endereco: "Rua Cecília Magalhães Gomes, 127", telefone: "(31) 3277-7146", horario: HORARIO_CRAS },
  { nome: "CRAS Novo Ouro Preto", regional: "Pampulha", endereco: "Rua Geraldina Cândida de Jesus, 92", telefone: "(31) 3277-7964", horario: HORARIO_CRAS },
  { nome: "CRAS Santa Rosa", regional: "Pampulha", endereco: "Avenida Major Delfino de Paula, 2553", telefone: "(31) 3277-6698", horario: HORARIO_CRAS },
  { nome: "CRAS Vila São José", regional: "Pampulha", endereco: "Rua Joaquim José Ribeiro, 50", telefone: "(31) 3277-7149", horario: HORARIO_CRAS },
  { nome: "CRAS Dandara", regional: "Pampulha", endereco: "Rua José Simplício Moreira, 1144", telefone: "(31) 98906-6792", horario: HORARIO_CRAS },

  { nome: "CRAS Apolônia", regional: "Venda Nova", endereco: "Rua Visconde de Itaboraí, 304", telefone: "(31) 3277-1816", horario: HORARIO_CRAS },
  { nome: "CRAS Lagoa", regional: "Venda Nova", endereco: "Rua José Sabino Maciel, 120", telefone: "(31) 3246-9016", horario: HORARIO_CRAS },
  { nome: "CRAS Mantiqueira", regional: "Venda Nova", endereco: "Rua Luzia Salomão, 300", telefone: "(31) 3277-1895", horario: HORARIO_CRAS }
];

/* Defensorias Públicas de Belo Horizonte. */
const UNIDADES_DEFENSORIA = [
  { nome: "Defensoria Pública MG – Unidade I", endereco: "Rua dos Guajajaras, 1707 – Barro Preto", telefone: "(31) 3526-0500", horario: "8h às 17h" },
  { nome: "Defensoria Pública MG – Unidade Barreiro", endereco: "Rua Flávio Marques Lisboa, 466 – Barreiro", telefone: "(31) 3526-0500", horario: "Confirmar horário" },
  { nome: "Defensoria Pública MG – Unidade II", endereco: "Rua Bernardo Guimarães, 2731 – Santo Agostinho", telefone: "(31) 3526-0500", horario: "Confirmar horário" },
  { nome: "Defensoria Pública MG – Unidade IV", endereco: "Avenida Bias Fortes, 431 – Lourdes", telefone: "(31) 2010-2108", horario: "Confirmar horário" },
  { nome: "Defensoria Pública da União – Belo Horizonte", endereco: "Rua Pouso Alto, 15 – Serra", telefone: "(31) 3069-6300", horario: "9h às 15h" }
];


/* Bairros de Belo Horizonte e a regional a que pertencem.
   LISTA PARCIAL: complete com a tabela oficial de bairros por regional da Prefeitura.
   As chaves ficam sem acento e em minúsculas, para a busca funcionar. */
const BAIRROS_REGIONAL = {
  "santa efigenia": "Centro-Sul",
  "funcionarios": "Centro-Sul",
  "lourdes": "Centro-Sul",
  "savassi": "Centro-Sul",
  "serra": "Centro-Sul",
  "sion": "Centro-Sul",
  "santo agostinho": "Centro-Sul",
  "centro": "Centro-Sul",
  "barro preto": "Centro-Sul",
  "barreiro": "Barreiro",
  "venda nova": "Venda Nova",
  "pampulha": "Pampulha",
  "taquaril": "Leste",
  "granja de freitas": "Leste",
  "alto vera cruz": "Leste",
  "prado lopes": "Noroeste"
};
