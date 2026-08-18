// ======================================================
// LeadRadar - Sistema de pontuação de oportunidades
// ======================================================


// ------------------------------------------------------
// Calcula o score comercial de uma empresa
// ------------------------------------------------------

function calcularScore(empresa) {

  let score = 0;

  const motivos = [];


  // ----------------------------------------------------
  // 1. Empresa NÃO possui site
  // Principal indicador para nossa oferta
  // ----------------------------------------------------

  if (!empresa.website) {

    score += 40;

    motivos.push(
      "Não possui site identificado"
    );

  }


  // ----------------------------------------------------
  // 2. Possui telefone
  // Facilita a prospecção
  // ----------------------------------------------------

  if (empresa.telefone) {

    score += 20;

    motivos.push(
      "Possui telefone para contato"
    );

  }


  // ----------------------------------------------------
  // 3. Possui WhatsApp
  // Excelente canal comercial
  // ----------------------------------------------------

  if (empresa.whatsapp) {

    score += 15;

    motivos.push(
      "Possui WhatsApp"
    );

  }


  // ----------------------------------------------------
  // 4. Possui Instagram
  // Indica presença digital ativa
  // ----------------------------------------------------

  if (empresa.instagram) {

    score += 10;

    motivos.push(
      "Possui Instagram"
    );

  }


  // ----------------------------------------------------
  // 5. Possui endereço
  // Indica que os dados da empresa estão mais completos
  // ----------------------------------------------------

  if (empresa.endereco) {

    score += 10;

    motivos.push(
      "Possui endereço cadastrado"
    );

  }


  // ----------------------------------------------------
  // 6. Possui horário de funcionamento
  // Pequeno sinal de cadastro mais completo
  // ----------------------------------------------------

  if (empresa.horario) {

    score += 5;

    motivos.push(
      "Possui horário de funcionamento"
    );

  }


  // Garante que nunca ultrapasse 100

  score = Math.min(score, 100);


  return {
    score,
    motivos,
    classificacao: classificarScore(score)
  };

}


// ------------------------------------------------------
// Classificação do lead
// ------------------------------------------------------

function classificarScore(score) {

  if (score >= 80) {

    return {
      nivel: "excelente",
      texto: "Excelente oportunidade",
      emoji: "🔥"
    };

  }


  if (score >= 60) {

    return {
      nivel: "bom",
      texto: "Boa oportunidade",
      emoji: "🟡"
    };

  }


  if (score >= 40) {

    return {
      nivel: "medio",
      texto: "Oportunidade média",
      emoji: "⚪"
    };

  }


  return {
    nivel: "baixo",
    texto: "Baixa prioridade",
    emoji: "❌"
  };

}


// ------------------------------------------------------
// Define a classe CSS baseada no score
// ------------------------------------------------------

function obterClasseScore(score) {

  if (score >= 80) {
    return "score-alto";
  }

  if (score >= 60) {
    return "score-medio";
  }

  return "score-baixo";
}


// ------------------------------------------------------
// Analisa uma lista inteira de empresas
// ------------------------------------------------------

function analisarEmpresas(empresas) {

  const analisadas = empresas.map(empresa => {

    const analise =
      calcularScore(empresa);


    return {

      ...empresa,

      score:
        analise.score,

      motivos:
        analise.motivos,

      classificacao:
        analise.classificacao

    };

  });


  // ----------------------------------------------------
  // Ordenar do melhor lead para o pior
  // ----------------------------------------------------

  analisadas.sort(
    (a, b) => b.score - a.score
  );


  return analisadas;
}


// ------------------------------------------------------
// Disponibilizar funções para app.js
// ------------------------------------------------------

window.calcularScore =
  calcularScore;

window.classificarScore =
  classificarScore;

window.obterClasseScore =
  obterClasseScore;

window.analisarEmpresas =
  analisarEmpresas;
