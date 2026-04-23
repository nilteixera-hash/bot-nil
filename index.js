const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

const API_KEY = process.env.API_KEY;

const ligas = {
  serie_b: { id: 72, nome: 'Brasileirão Série B' },
  copa_br: { id: 73, nome: 'Copa do Brasil' },
  la_liga: { id: 140, nome: 'La Liga' },
  premier: { id: 39, nome: 'Premier League' },
  bundesliga: { id: 78, nome: 'Bundesliga' },
  serie_a: { id: 71, nome: 'Brasileirão Série A' }
};

function getDataBrasil() {
  const data = new Date();
  return data.toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}).split('/').reverse().join('-');
}

function getHoraBrasil(dataISO) {
  return new Date(dataISO).toLocaleTimeString('pt-BR', {timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit'});
}

bot.onText(/\/ligas/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Escolha uma liga:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🇧🇷 Brasileirão Série A', callback_data: 'serie_a' }],
        [{ text: '🇧🇷 Brasileirão Série B', callback_data: 'serie_b' }],
        [{ text: '🏆 Copa do Brasil', callback_data: 'copa_br' }],
        [{ text: '🇪🇸 La Liga', callback_data: 'la_liga' }],
        [{ text: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', callback_data: 'premier' }],
        [{ text: '🇩🇪 Bundesliga', callback_data: 'bundesliga' }]
      ]
    }
  });
});

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const liga = callbackQuery.data;
  const ligaInfo = ligas;

  if (!ligaInfo) return;

  bot.answerCallbackQuery(callbackQuery.id);
  bot.sendMessage(msg.chat.id, `Buscando jogos de ${ligaInfo.nome}...`);

  try {
    const hoje = getDataBrasil();

    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: { 'x-apisports-key': API_KEY },
      params: {
        league: ligaInfo.id,
        season: 2025,
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
      const status = jogo.fixture.status.short;

      if (status === 'NS') {
        mensagem += `*${hora}* - ${casa} x ${fora}\n`;
      } else if (status === '1H' || status === '2H' || status === 'HT') {
        mensagem += `🔴 *AO VIVO ${jogo.goals.home} x ${jogo.goals.away}* - ${casa} x ${fora}\n`;
      } else if (status === 'FT') {
        mensagem += `✅ *Finalizado ${jogo.goals.home} x ${jogo.goals.away}* - ${casa} x ${fora}\n`;
      }
    });

        bot.sendMessage(msg.chat.id, mensagem, {parse_mode: 'Markdown'});

  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Erro ao buscar jogos. Tenta de novo!');
    console.error(error.response?.data || error.message);
  }
});

// Dummy server pro Render não matar o bot
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot NIL Online!'));
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));

console.log('Bot iniciado!');
