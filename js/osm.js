// ======================================================
// LeadRadar - OpenStreetMap / Overpass
// Versão com fallback de servidores
// ======================================================

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search";

const OVERPASS_SERVIDORES = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter"
];

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
// Localizar cidade
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
    throw new Error(
      "Não foi possível localizar a cidade."
    );
  }

  const dados = await resposta.json();

  if (!dados.length) {
    throw new Error(
      "Cidade não encontrada. Use algo como: São Paulo, SP."
    );
  }

  return dados[0];
}


// ------------------------------------------------------
// Endereço
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
// Contatos
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

function obterEmail(tags = {}) {
  return (
    tags.email ||
    tags["contact:email"] ||
    ""
  );
}

function obterWebsite(tags = {}) {
  return (
    tags.website ||
    tags["contact:website"] ||
    tags.url ||
    ""
  );
}

function obterWhatsapp(tags = {}) {
  return (
    tags["contact:whatsapp"] ||
    tags.whatsapp ||
    ""
  );
}

function obterInstagram(tags = {}) {
  return (
    tags["contact:instagram"] ||
    tags.instagram ||
    ""
  );
}


// ------------------------------------------------------
// Fazer consulta em um servidor Overpass
// ------------------------------------------------------

async function consultarOverpass(
  servidor,
  consulta
) {

  const resposta = await fetch(
    servidor,
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
      `Servidor respondeu ${resposta.status}`
    );
  }

  return await resposta.json();
}


// ------------------------------------------------------
// Tentar vários servidores
// ------------------------------------------------------

async function consultarComFallback(
  consulta
) {

  let ultimoErro;

  for (
    const servidor of OVERPASS_SERVIDORES
  ) {

    try {

      console.log(
        "Tentando Overpass:",
        servidor
      );

      const resultado =
        await consultarOverpass(
          servidor,
          consulta
        );

      return resultado;

    } catch (erro) {

      console.warn(
        "Falha no servidor:",
        servidor,
        erro
      );

      ultimoErro = erro;

    }
  }

  throw new Error(
    "Os servidores gratuitos de busca estão ocupados. Aguarde alguns segundos e tente novamente."
  );
}


// ------------------------------------------------------
// Buscar empresas
// ------------------------------------------------------

async function buscarEmpresasOSM(
  nicho,
  cidade
) {

  const configuracao =
    NICHOS_OSM[nicho];

  if (!configuracao) {
    throw new Error(
      "Nicho ainda não suportado."
    );
  }


  // 1. Localizar cidade

  const local =
    await localizarCidade(cidade);


  const [
    sul,
    norte,
    oeste,
    leste
  ] = local.boundingbox;


  const chave =
    configuracao.chave;

  const valor =
    configuracao.valor;


  // ----------------------------------------------------
  // Consulta mais enxuta
  // nwr = node + way + relation
  // ----------------------------------------------------

  const consulta = `
    [out:json][timeout:60];

    nwr
      ["${chave}"="${valor}"]
      ["name"]
      (${sul},${oeste},${norte},${leste});

    out center tags qt;
  `;


  // 2. Consulta com fallback

  const dados =
    await consultarComFallback(
      consulta
    );


  // 3. Organizar resultados

  const empresas =
    dados.elements.map(
      elemento => {

        const tags =
          elemento.tags || {};

        return {

          id:
            `${elemento.type}-${elemento.id}`,

          osmId:
            elemento.id,

          tipo:
            elemento.type,

          nome:
            tags.name ||
            "Empresa sem nome",

          telefone:
            obterTelefone(tags),

          email:
            obterEmail(tags),

          website:
            obterWebsite(tags),

          whatsapp:
            obterWhatsapp(tags),

          instagram:
            obterInstagram(tags),

          endereco:
            criarEndereco(tags),

          horario:
            tags.opening_hours ||
            "",

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

      }
    );


  // ----------------------------------------------------
  // Remover duplicidades
  // ----------------------------------------------------

  const empresasUnicas = [];

  const encontrados =
    new Set();


  for (const empresa of empresas) {

    const identificador =
      empresa.nome
        .trim()
        .toLowerCase();

    if (
      !encontrados.has(
        identificador
      )
    ) {

      encontrados.add(
        identificador
      );

      empresasUnicas.push(
        empresa
      );
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
// Exportar para outros arquivos
// ------------------------------------------------------

window.buscarEmpresasOSM =
  buscarEmpresasOSM;

window.NICHOS_OSM =
  NICHOS_OSM;
