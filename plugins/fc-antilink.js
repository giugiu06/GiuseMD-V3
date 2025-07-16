let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
export async function before(_0x4da8ca, {
  isAdmin: _0x37f7b6,
  isBotAdmin: _0x590596
}) {
  if (_0x4da8ca.isBaileys && _0x4da8ca.fromMe) {
    return true;
  }
  if (!_0x4da8ca.isGroup) {
    return false;
  }
  let _0x42c611 = global.db.data.chats[_0x4da8ca.chat];
  let _0x7fcfd3 = _0x4da8ca.key.participant;
  let _0xf980b7 = _0x4da8ca.key.id;
  let _0x3c7bdb = global.db.data.settings[this.user.jid] || {};
  const _0xac004a = linkRegex.exec(_0x4da8ca.text);
  if (_0x37f7b6 && _0x42c611.antiLink && _0x4da8ca.text.includes("https://chat.whatsapp.com")) {
    return;
  }
  if (_0x42c611.antiLink && _0xac004a && !_0x37f7b6) {
    if (_0x590596) {
      const _0x3733e1 = "https://chat.whatsapp.com/" + (await this.groupInviteCode(_0x4da8ca.chat));
      if (_0x4da8ca.text.includes(_0x3733e1)) {
        return true;
      }
    }
    if (_0x590596 && _0x3c7bdb.restrict) {
      let _0x6c587 = {
        'key': {
          'participants': "0@s.whatsapp.net",
          'fromMe': false,
          'id': "Halo"
        },
        'message': {
          'locationMessage': {
            'name': "𝐀𝐧𝐭𝐢 - 𝐋𝐢𝐧𝐤 ",
            'jpegThumbnail': await (await fetch("https://telegra.ph/file/a3b727e38149464863380.png")).buffer(),
            'vcard': "BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD"
          }
        },
        'participant': "0@s.whatsapp.net"
      };
      conn.reply(_0x4da8ca.chat, "⚠ 𝐋𝐈𝐍𝐊 𝐃𝐈 𝐀𝐋𝐓𝐑𝐈 𝐆𝐑𝐔𝐏𝐏𝐈 𝐍𝐎𝐍 𝐒𝐎𝐍𝐎 𝐂𝐎𝐍𝐒𝐄𝐍𝐓𝐈𝐓𝐈 ", _0x6c587);
      await conn.sendMessage(_0x4da8ca.chat, {
        'delete': {
          'remoteJid': _0x4da8ca.chat,
          'fromMe': false,
          'id': _0xf980b7,
          'participant': _0x7fcfd3
        }
      });
      let _0x556386 = await conn.groupParticipantsUpdate(_0x4da8ca.chat, [_0x4da8ca.sender], 'remove');
      if (_0x556386[0x0].status === "404") {
        return;
      }
    } else {
      if (!_0x3c7bdb.restrict) {
        return;
      }
    }
  }
  return true;
}
