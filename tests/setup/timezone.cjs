// Fixa o fuso dos testes fora de UTC para pegar erros de data local
// (docs/designs/tela-inicial-base.md, Etapa 1).
module.exports = async () => {
  process.env.TZ = 'America/Sao_Paulo';
};
