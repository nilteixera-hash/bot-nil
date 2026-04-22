const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const axios = require('axios')

// FUSO HORÁRIO BRASIL - CORREÇÃO DO BUG 21:30
const hoje = new Date().toLocaleDateString('en-CA', {
  timeZone: 'America/Sao_Paulo'
})

async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const msg = m.message.conversation || m.message.extendedTextMessage?.text
    const sender = m.key.remoteJid

    if (msg === '1' || msg.toLowerCase() === 'série b') {
      try {
        const res = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${hoje}&league=72&season=2024`, {
          headers: { 'x-apisports-key': 'b3d81d001b99b4f213bca5cdf64ec63b }
        })

        let resposta = '*⚽ JOGOS DA SÉRIE B HOJE:*\n\n'
        if (res.data.response.length === 0) {
          resposta += 'Nenhum jogo hoje 😢'
        } else {
          res.data.response.forEach(jogo => {
            const timeCasa = jogo.teams.home.name
            const timeFora = jogo.teams.away.name
            const hora = new Date(jogo.fixture.date).toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
            })
            resposta += `*${timeCasa}* x *${timeFora}*\n⏰ ${hora}\n\n`
          })
        }
        await sock.sendMessage(sender, { text: resposta })
      } catch (err) {
        await sock.sendMessage(sender, { text: 'Erro ao buscar jogos 😢' })
      }
    }
  })
}

connectBot()
