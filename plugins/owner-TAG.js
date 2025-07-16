import fs from 'fs'

const toMathematicalAlphanumericSymbols = text => {
    const map = {
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯', 'I': '𝑰', 'J': '𝑱', 
    'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷', 'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻', 
    'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿', 'Y': '𝒀', 'Z': '𝒁'
  } 
  return text.split('').map(char => map[char] || char).join('')
}

let handler = m => m
handler.all = async function (m) {
  let chat = global.db.data.chats[m.chat]
  let name = await conn.getName(m.sender) // Utilizza await per ottenere il nome dell'utente

  // Regex per i numeri dell'owner. Assicurati che siano aggiornati e corretti.
  if (/^@\d+|@\+\d+/i.test(m.text) && (m.text.includes('19183829810') || m.text.includes('19173829810') || m.text.includes('393534075737') || m.text.includes('393519633310'))) {
    if (m.sender === conn.user.jid) return // Evita che il bot risponda a se stesso

    let prova = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo" },
      message: {
        locationMessage: {
          name: `${toMathematicalAlphanumericSymbols("OWNER ANTI-TAG")}`,
          jpegThumbnail: null,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      participant: "0@s.whatsapp.net"
    }

    // Modifica qui la risposta per includere il tag dell'utente
    conn.reply(m.chat, `𝐍𝐎𝐍 𝐭𝐚𝐠𝐠𝐚𝐫𝐞 𝐢𝐥 𝐦𝐢𝐨 𝐨𝐰𝐧𝐞𝐫 𝐢𝐧𝐮𝐭𝐢𝐥𝐦𝐞𝐧𝐭𝐞! \n\n> Tag di @${m.sender.split('@')[0]}`, prova, { quoted: prova, mentions: [m.sender] })
  }
  return !0
}

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}