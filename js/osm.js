// ======================================================
// LeadRadar - Integração gratuita com OpenStreetMap
// ======================================================

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";


// ------------------------------------------------------
// Nichos disponíveis no LeadRadar
// ------------------------------------------------------

const NICHOS_OSM = {
  oficina: {
    chave: "shop",
    valor: "car_repair"
  },

  barbearia: {
    chave: "shop",
    valor: "hairdresser"
  },

  petshop: {
    chave: "shop",
    valor: "pet"
  },

  restaurante: {
    chave: "amenity",
    valor: "restaurant"
  },

  dentista: {
    chave: "amenity",
    valor: "dentist"
  }
};


// ------------------------------------------------------
// Localizar uma cidade
// ------------------------------------------------------

async function localizarCidade(cidade) {

  const parametros = new URLSearchParams({
    q: cidade,
    format: "jsonv2",
    limit: "1",
    countrycodes: "br",
    addressdetails: "1"
  });

  const resposta = await fetch(
    `${NOMINATIM_URL}?${parametros.toString()}`
  );

  if (!resposta.ok) {
    throw new Error("Não foi possível localizar a cidade.");
  }

  const dados = await resposta.json();

  if (!dados.length) {
    throw new Error(
      "Cidade não encontrada. Tente usar o formato: Salvador, BA."
    );
  }

  return dados[0];
}


// ------------------------------------------------------
// Criar endereço legível
// ------------------------------------------------------

function criarEndereco(tags = {}) {

  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  const partes = [];

  if (tags["addr:street"]) {

    let rua = tags["addr:street"];

    if (tags["addr:housenumber"]) {
      rua += `, ${tags["addr:housenumber"]}`;
    }

    partes.push(rua);
  }

  if (tags["addr:suburb"]) {
    partes.push(tags["addr:suburb"]);
  }

  if (tags["addr:city"]) {
    partes.push(tags["addr:city"]);
  }

  return partes.join(" - ");
}


// ------------------------------------------------------
// Normalizar telefone
// ------------------------------------------------------

function obterTelefone(tags = {}) {

  return (
    tags.phone ||
    tags["contact:phone"] ||
    tags.mobile ||
    tags["contact:mobile"] ||
    ""
  );
}


// ------------------------------------------------------
// Obter website
// ------------------------------------------------------

function obterWebsite(tags = {}) {

  return (
    tags.website ||
    tags["contact:website"] ||
    tags.url ||
    ""
  );
}


// ------------------------------------------------------
// Obter WhatsApp
// ------------------------------------------------------

function obterWhatsapp(tags = {}) {

  return (
    tags["contact:whatsapp"] ||
    tags.whatsapp ||
    ""
  );
}


// ------------------------------------------------------
// Obter Instagram
// ------------------------------------------------------

function obterInstagram(tags = {}) {

  return (
    tags["contact:instagram"] ||
    tags.instagram ||
    ""
  );
}


// ------------------------------------------------------
// Buscar empresas no OpenStreetMap
// ------------------------------------------------------

async function buscarEmpresasOSM(nicho, cidade) {

  // 1. Verifica se o nicho existe

  const configuracao = NICHOS_OSM[nicho];

  if (!configuracao) {
    throw new Error("Nicho ainda não suportado.");
  }


  // 2. Localiza a cidade

  const local = await localizarCidade(cidade);


  // O Nominatim retorna:
  // sul, norte, oeste, leste

  const [
    sul,
    norte,
    oeste,
    leste
  ] = local.boundingbox;


  // 3. Configuração da categoria OSM

  const chave = configuracao.chave;
  const valor = configuracao.valor;


  // 4. Monta consulta Overpass

  const consulta = `

    [out:json][timeout:25];

    (

      node
        ["${chave}"="${valor}"]
        (${sul},${oeste},${norte},${leste});

      way
        ["${chave}"="${valor}"]
        (${sul},${oeste},${norte},${leste});

      relation
        ["${chave}"="${valor}"]
        (${sul},${oeste},${norte},${leste});

    );

    out center tags;

  `;


  // 5. Consulta Overpass

  const resposta = await fetch(
    OVERPASS_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded;charset=UTF-8"
      },

      body:
        "data=" + encodeURIComponent(consulta)
    }
  );


  if (!resposta.ok) {

    throw new Error(
      "O servidor do OpenStreetMap está ocupado. Tente novamente em alguns segundos."
    );

  }


  const dados = await resposta.json();


  // 6. Organiza os resultados

  const empresas = dados.elements
    .filter(elemento => {

      return (
        elemento.tags &&
        elemento.tags.name
      );

    })

    .map(elemento => {

      const tags = elemento.tags || {};


      return {

        id:
          `${elemento.type}-${elemento.id}`,

        osmId:
          elemento.id,

        tipo:
          elemento.type,

        nome:
          tags.name || "Empresa sem nome",

        telefone:
          obterTelefone(tags),

        website:
          obterWebsite(tags),

        whatsapp:
          obterWhatsapp(tags),

        instagram:
          obterInstagram(tags),

        endereco:
          criarEndereco(tags),

        horario:
          tags.opening_hours || "",

        latitude:
          elemento.lat ||
          elemento.center?.lat ||
          null,

        longitude:
          elemento.lon ||
          elemento.center?.lon ||
          null,

        tags:
          tags

      };

    });


  // 7. Remover possíveis duplicidades

  const empresasUnicas = [];

  const nomesEncontrados = new Set();


  for (const empresa of empresas) {

    const identificador =
      empresa.nome
        .trim()
        .toLowerCase();


    if (!nomesEncontrados.has(identificador)) {

      nomesEncontrados.add(identificador);

      empresasUnicas.push(empresa);

    }

  }


  return {

    cidade:
      local.display_name,

    total:
      empresasUnicas.length,

    empresas:
      empresasUnicas

  };

}


// ------------------------------------------------------
// Disponibiliza função para os outros arquivos JS
// ------------------------------------------------------

window.buscarEmpresasOSM =
  buscarEmpresasOSM;

window.NICHOS_OSM =
  NICHOS_OSM;
