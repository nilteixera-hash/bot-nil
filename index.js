const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

const API_KEY = process.env.API_KEY;

const ligas = {
  serie_b: { id: 72, nome: 'Brasileirão Série B' },
  copa_br: { id: 73, nome: 'Copa do Brasil' }
};

function getDataBrasil() {
  const data = new Date();
  return data.toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}).split('/').reverse().join('-');
}

function getHoraBrasil(dataISO) {
  return new Date(dataISO).toLocaleTimeString('pt-BR', {timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit'});
}

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const liga = callbackQuery.data;
  const ligaInfo = ligas[liga];

  bot.sendMessage(msg.chat.id, `Buscando jogos de ${ligaInfo.nome}...`);

  try {
    const hoje = getDataBrasil();

    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: { 'x-apisports-key': API_KEY },
      params: {
        league: ligaInfo.id,
        season: 2024,
        date: hoje,
        timezone: 'America/Sao_Paulo'
      }
    });

    const jogos = response.data.response;

    if (jogos.length === 0) {
      bot.sendMessage(msg.chat.id, `Nenhum jogo de ${ligaInfo.nome} hoje.`);
      return;
    }

    let mensagem = `*${ligaInfo.nome} - Hoje ${hoje.split('-').reverse().join('/')}*\n\n`;

    jogos.forEach(jogo => {
      const hora = getHoraBrasil(jogo.fixture.date);
      const casa = jogo.teams.home.name;
      const fora = jogo.teams.away.name;
      mensagem += `*${hora}* - ${casa} x ${fora}\n`;
    });

    bot.sendMessage(msg.chat.id, mensagem, {parse_mode: 'Markdown'});

  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Erro ao buscar jogos. Tenta de novo!');
    console.error(error);
  }
});
