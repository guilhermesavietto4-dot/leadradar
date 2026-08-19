// ======================================================
// LeadRadar - Inteligência de mercado
// ======================================================


// ------------------------------------------------------
// Calcular percentual com segurança
// ------------------------------------------------------

function calcularPercentual(valor, total) {

  if (!total) {
    return 0;
  }

  return Number(
    ((valor / total) * 100).toFixed(1)
  );
}


// ------------------------------------------------------
// Gerar balanço de uma busca
// ------------------------------------------------------

function analisarMercado(empresas = []) {

  const total = empresas.length;


  // ----------------------------------------------------
  // Presença digital
  // ----------------------------------------------------

  const semSite =
    empresas.filter(
      empresa => !empresa.website
    ).length;


  const comSite =
    empresas.filter(
      empresa => empresa.website
    ).length;


  // ----------------------------------------------------
  // Contatos
  // ----------------------------------------------------

  const comEmail =
    empresas.filter(
      empresa => empresa.email
    ).length;


  const comWhatsapp =
    empresas.filter(
      empresa => empresa.whatsapp
    ).length;


  const comTelefone =
    empresas.filter(
      empresa => empresa.telefone
    ).length;


  const comInstagram =
    empresas.filter(
      empresa => empresa.instagram
    ).length;


  // ----------------------------------------------------
  // Combinações interessantes
  // ----------------------------------------------------

  const semSiteComEmail =
    empresas.filter(
      empresa =>
        !empresa.website &&
        empresa.email
    ).length;


  const semSiteComWhatsapp =
    empresas.filter(
      empresa =>
        !empresa.website &&
        empresa.whatsapp
    ).length;


  const semSiteComTelefone =
    empresas.filter(
      empresa =>
        !empresa.website &&
        empresa.telefone
    ).length;


  // ----------------------------------------------------
  // Leads contatáveis
  //
  // Basta possuir pelo menos um canal.
  // ----------------------------------------------------

  const contataveis =
    empresas.filter(
      empresa =>
        empresa.email ||
        empresa.whatsapp ||
        empresa.telefone ||
        empresa.instagram
    ).length;


  // ----------------------------------------------------
  // Leads de maior score
  // ----------------------------------------------------

  const score80 =
    empresas.filter(
      empresa => empresa.score >= 80
    ).length;


  const score60 =
    empresas.filter(
      empresa => empresa.score >= 60
    ).length;


  // ----------------------------------------------------
  // Leads especialmente interessantes
  //
  // Sem site + algum canal de contato
  // ----------------------------------------------------

  const oportunidadesDiretas =
    empresas.filter(
      empresa =>
        !empresa.website &&
        (
          empresa.email ||
          empresa.whatsapp ||
          empresa.telefone ||
          empresa.instagram
        )
    ).length;


  // ----------------------------------------------------
  // Resultado
  // ----------------------------------------------------

  return {

    total,

    comSite,

    semSite,

    comEmail,

    comWhatsapp,

    comTelefone,

    comInstagram,

    semSiteComEmail,

    semSiteComWhatsapp,

    semSiteComTelefone,

    contataveis,

    score80,

    score60,

    oportunidadesDiretas,


    percentuais: {

      semSite:
        calcularPercentual(
          semSite,
          total
        ),

      comEmail:
        calcularPercentual(
          comEmail,
          total
        ),

      comWhatsapp:
        calcularPercentual(
          comWhatsapp,
          total
        ),

      contataveis:
        calcularPercentual(
          contataveis,
          total
        ),

      score80:
        calcularPercentual(
          score80,
          total
        ),

      oportunidadesDiretas:
        calcularPercentual(
          oportunidadesDiretas,
          total
        )

    }

  };

}


// ------------------------------------------------------
// Expor para app.js
// ------------------------------------------------------

window.analisarMercado =
  analisarMercado;

window.calcularPercentual =
  calcularPercentual;
