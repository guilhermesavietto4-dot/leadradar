// ======================================================
// LeadRadar - Aplicação principal
// ======================================================


// ------------------------------------------------------
// Elementos da tela
// ------------------------------------------------------

const nichoInput = document.getElementById("nicho");
const cidadeInput = document.getElementById("cidade");
const buscarBtn = document.getElementById("buscarBtn");
const statusTexto = document.getElementById("status");
const listaLeads = document.getElementById("listaLeads");
const quantidade = document.getElementById("quantidade");


// Filtros

const filtroSemSite =
  document.getElementById("filtroSemSite");

const filtroWhatsapp =
  document.getElementById("filtroWhatsapp");

const filtroEmail =
  document.getElementById("filtroEmail");

const filtroScore =
  document.getElementById("filtroScore");


// Guarda os resultados da última busca

let empresasAtuais = [];


// ------------------------------------------------------
// Segurança básica para textos externos
// ------------------------------------------------------

function escaparHTML(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ------------------------------------------------------
// Criar link do mapa
// ------------------------------------------------------

function criarLinkMapa(empresa) {

  if (
    empresa.latitude === null ||
    empresa.longitude === null
  ) {
    return "";
  }

  return (
    "https://www.openstreetmap.org/" +
    `?mlat=${empresa.latitude}` +
    `&mlon=${empresa.longitude}` +
    `#map=18/${empresa.latitude}/${empresa.longitude}`
  );
}


// ------------------------------------------------------
// Card do lead
// ------------------------------------------------------

function criarCardLead(empresa) {

  const classeScore =
    obterClasseScore(empresa.score);

  const mapa =
    criarLinkMapa(empresa);


  const siteHTML =
    empresa.website
      ? `
        <p>
          🌐
          <a
            href="${escaparHTML(empresa.website)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Possui site
          </a>
        </p>
      `
      : `
        <p>
          🌐 <strong>Sem site identificado</strong>
        </p>
      `;


  const telefoneHTML =
    empresa.telefone
      ? `
        <p>
          ☎️ ${escaparHTML(empresa.telefone)}
        </p>
      `
      : `
        <p>
          ☎️ Telefone não informado
        </p>
      `;


  const emailHTML =
    empresa.email
      ? `
        <p>
          ✉️
          <a
            href="mailto:${escaparHTML(empresa.email)}"
          >
            ${escaparHTML(empresa.email)}
          </a>
        </p>
      `
      : `
        <p>
          ✉️ E-mail não informado
        </p>
      `;


  const whatsappHTML =
    empresa.whatsapp
      ? `
        <p>
          💬 WhatsApp disponível
        </p>
      `
      : "";


  const instagramHTML =
    empresa.instagram
      ? `
        <p>
          📷 Instagram disponível
        </p>
      `
      : "";


  const enderecoHTML =
    empresa.endereco
      ? `
        <p>
          📍 ${escaparHTML(empresa.endereco)}
        </p>
      `
      : "";


  const mapaHTML =
    mapa
      ? `
        <p>
          🗺️
          <a
            href="${mapa}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver no mapa
          </a>
        </p>
      `
      : "";


  return `
    <article class="lead">

      <div class="lead-info">

        <h3>
          ${escaparHTML(empresa.nome)}
        </h3>

        <p>
          ${empresa.classificacao.emoji}
          ${escaparHTML(
            empresa.classificacao.texto
          )}
        </p>

        ${siteHTML}
        ${telefoneHTML}
        ${emailHTML}
        ${whatsappHTML}
        ${instagramHTML}
        ${enderecoHTML}
        ${mapaHTML}

      </div>


      <div
        class="score ${classeScore}"
        title="Score de oportunidade"
      >
        ${empresa.score}
      </div>

    </article>
  `;
}


// ------------------------------------------------------
// Aplicar filtros comerciais
// ------------------------------------------------------

function filtrarEmpresas(empresas) {

  const somenteSemSite =
    filtroSemSite.checked;

  const somenteWhatsapp =
    filtroWhatsapp.checked;

  const somenteEmail =
    filtroEmail.checked;

  const scoreMinimo =
    Number(filtroScore.value);


  return empresas.filter(empresa => {

    // Sem site

    if (
      somenteSemSite &&
      empresa.website
    ) {
      return false;
    }


    // Com WhatsApp

    if (
      somenteWhatsapp &&
      !empresa.whatsapp
    ) {
      return false;
    }


    // Com e-mail

    if (
      somenteEmail &&
      !empresa.email
    ) {
      return false;
    }


    // Score mínimo

    if (
      empresa.score < scoreMinimo
    ) {
      return false;
    }


    return true;
  });
}


// ------------------------------------------------------
// Atualizar filtros sem fazer nova busca
// ------------------------------------------------------

function aplicarFiltros() {

  const filtradas =
    filtrarEmpresas(empresasAtuais);

  mostrarEmpresas(
    filtradas,
    empresasAtuais.length
  );
}


// ------------------------------------------------------
// Mostrar empresas
// ------------------------------------------------------

function mostrarEmpresas(
  empresas,
  totalOriginal = empresas.length
) {

  listaLeads.innerHTML = "";


  quantidade.textContent =
    `${empresas.length} de ${totalOriginal} resultados`;


  if (!empresas.length) {

    listaLeads.innerHTML = `
      <div class="sem-resultados">

        Nenhum lead corresponde aos filtros selecionados.

        <br><br>

        Tente remover algum filtro.

      </div>
    `;

    return;
  }


  listaLeads.innerHTML =
    empresas
      .map(criarCardLead)
      .join("");
}


// ------------------------------------------------------
// Executar busca
// ------------------------------------------------------

async function executarBusca() {

  const nicho =
    nichoInput.value;

  const cidade =
    cidadeInput.value.trim();


  if (!cidade) {

    statusTexto.textContent =
      "Digite uma cidade antes de buscar.";

    cidadeInput.focus();

    return;
  }


  buscarBtn.disabled = true;

  buscarBtn.textContent =
    "Buscando...";

  statusTexto.textContent =
    "Procurando empresas no OpenStreetMap...";

  listaLeads.innerHTML = "";

  quantidade.textContent =
    "Buscando...";


  try {

    // Buscar empresas

    const resultado =
      await buscarEmpresasOSM(
        nicho,
        cidade
      );


    // Calcular scores

    empresasAtuais =
      analisarEmpresas(
        resultado.empresas
      );


    // Aplicar os filtros escolhidos

    const filtradas =
      filtrarEmpresas(
        empresasAtuais
      );


    // Mostrar

    mostrarEmpresas(
      filtradas,
      empresasAtuais.length
    );


    statusTexto.textContent =
      `${empresasAtuais.length} empresas encontradas. ` +
      `${filtradas.length} correspondem aos filtros atuais.`;


  } catch (erro) {

    console.error(
      "Erro no LeadRadar:",
      erro
    );


    statusTexto.textContent =
      erro.message ||
      "Não foi possível realizar a busca.";


    listaLeads.innerHTML = `
      <div class="sem-resultados">

        Não conseguimos concluir a busca.

        <br><br>

        Tente novamente em alguns segundos.

      </div>
    `;


    quantidade.textContent =
      "Erro";


  } finally {

    buscarBtn.disabled = false;

    buscarBtn.textContent =
      "Buscar clientes";
  }
}


// ------------------------------------------------------
// Eventos
// ------------------------------------------------------

buscarBtn.addEventListener(
  "click",
  executarBusca
);


cidadeInput.addEventListener(
  "keydown",
  function(evento) {

    if (evento.key === "Enter") {
      executarBusca();
    }

  }
);


// ------------------------------------------------------
// Atualizar automaticamente ao mexer nos filtros
// ------------------------------------------------------

filtroSemSite.addEventListener(
  "change",
  aplicarFiltros
);

filtroWhatsapp.addEventListener(
  "change",
  aplicarFiltros
);

filtroEmail.addEventListener(
  "change",
  aplicarFiltros
);

filtroScore.addEventListener(
  "change",
  aplicarFiltros
);
