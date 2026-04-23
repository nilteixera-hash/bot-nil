
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
