// ======================================================
// LeadRadar - Aplicação principal
// ======================================================

const nichoInput = document.getElementById("nicho");
const cidadeInput = document.getElementById("cidade");
const buscarBtn = document.getElementById("buscarBtn");
const statusTexto = document.getElementById("status");
const listaLeads = document.getElementById("listaLeads");
const quantidade = document.getElementById("quantidade");


function escaparHTML(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function criarLinkMapa(empresa) {
  if (!empresa.latitude || !empresa.longitude) {
    return "";
  }

  return (
    "https://www.openstreetmap.org/" +
    `?mlat=${empresa.latitude}` +
    `&mlon=${empresa.longitude}` +
    `#map=18/${empresa.latitude}/${empresa.longitude}`
  );
}


function criarCardLead(empresa) {
  const classeScore = obterClasseScore(empresa.score);
  const mapa = criarLinkMapa(empresa);

  const siteHTML = empresa.website
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

  const telefoneHTML = empresa.telefone
    ? `<p>☎️ ${escaparHTML(empresa.telefone)}</p>`
    : `<p>☎️ Telefone não informado</p>`;

  const emailHTML = empresa.email
  ? `
    <p>
      ✉️
      <a href="mailto:${escaparHTML(empresa.email)}">
        ${escaparHTML(empresa.email)}
      </a>
    </p>
  `
  : `
    <p>
      ✉️ E-mail não informado
    </p>
  `;
  
  const whatsappHTML = empresa.whatsapp
    ? `<p>💬 WhatsApp disponível</p>`
    : "";

  const instagramHTML = empresa.instagram
    ? `<p>📷 Instagram disponível</p>`
    : "";

  const enderecoHTML = empresa.endereco
    ? `<p>📍 ${escaparHTML(empresa.endereco)}</p>`
    : "";

  const mapaHTML = mapa
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

        <h3>${escaparHTML(empresa.nome)}</h3>

        <p>
          ${empresa.classificacao.emoji}
          ${escaparHTML(empresa.classificacao.texto)}
        </p>

 ${siteHTML}
${telefoneHTML}
${emailHTML}
${whatsappHTML}
${instagramHTML}
${enderecoHTML}
${mapaHTML}
 
      </div>

      <div class="score ${classeScore}">
        ${empresa.score}
      </div>

    </article>
  `;
}


function mostrarEmpresas(empresas) {
  listaLeads.innerHTML = "";

  if (!empresas.length) {
    quantidade.textContent = "0 resultados";

    listaLeads.innerHTML = `
      <div class="sem-resultados">
        Nenhuma empresa encontrada para esta busca.
      </div>
    `;

    return;
  }

  quantidade.textContent =
    `${empresas.length} resultados`;

  listaLeads.innerHTML =
    empresas.map(criarCardLead).join("");
}


async function executarBusca() {
  const nicho = nichoInput.value;
  const cidade = cidadeInput.value.trim();

  if (!cidade) {
    statusTexto.textContent =
      "Digite uma cidade antes de buscar.";

    cidadeInput.focus();
    return;
  }

  buscarBtn.disabled = true;
  buscarBtn.textContent = "Buscando...";

  statusTexto.textContent =
    "Procurando empresas no OpenStreetMap...";

  listaLeads.innerHTML = "";
  quantidade.textContent = "Buscando...";

  try {
    const resultado =
      await buscarEmpresasOSM(nicho, cidade);

    const empresasAnalisadas =
      analisarEmpresas(resultado.empresas);

    mostrarEmpresas(empresasAnalisadas);

    statusTexto.textContent =
      `${empresasAnalisadas.length} empresas encontradas em ${resultado.cidade}.`;

  } catch (erro) {
    console.error("Erro no LeadRadar:", erro);

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

    quantidade.textContent = "Erro";

  } finally {
    buscarBtn.disabled = false;
    buscarBtn.textContent = "Buscar clientes";
  }
}


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
