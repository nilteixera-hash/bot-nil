const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '8525555279:AAGK_JJo0csz-f_stwnNs1NLI9JtJGcHo-0';
const API_KEY = 'f7ce32c9ad9f4a7a0d42ef91fe0b2e3a';

const bot = new TelegramBot(token, {polling: true});

const ligas = {
  'serie_a': { id: 71, nome: 'Brasileirão Série A' },
  'serie_b': { id: 72, nome: 'Brasileirão Série B' },
  'copa_br': { id: 73, nome: 'Copa do Brasil' },
  'liberta': { id: 13, nome: 'Libertadores' }
};

function getDataBrasil() {
  return new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Sao_Paulo'});
}

function getHoraBrasil(dateString) {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Fala Nil! Bot de palpites no ar 🔥\n\nUsa /ligas pra ver os jogos de hoje');
});

bot.onText(/\/ligas/, (msg) => {
  const opcoes = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Brasileirão Série A', callback_data: 'serie_a' }],
        [{ text: 'Brasileirão Série B', callback_data: 'serie_b' }],
        [{ text: 'Copa do Brasil', callback_data: 'copa_br' }],
        [{ text: 'Libertadores', callback_data: 'liberta' }]
      ]
    }
  };
  bot.sendMessage(msg.chat.id, 'Escolhe a liga:', opcoes);
});

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
        timezone: 'America/Sao_Paulo
