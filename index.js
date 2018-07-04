const f = require('string-format'), // Load & Initialize string-format
  now = require("performance-now"),
  discord = require('discord.js'), // Load discord.js
  client = new discord.Client(), // Initialize Client.
  s = require('./secret.json'), // Tokens, and invite link.
  c = require('./config.json'), // Config file
  mkdirp = require('mkdirp'), // Make Directory
  XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
  util = require('util'),
  os = require('os'),
  request = require("snekfetch"),
  randomPuppy = require("random-puppy"),
  fs = require('fs'), // File System
  exec = util.promisify(require('child_process').exec),
  crypto = require("crypto");
  StringBuilder = require('node-stringbuilder'), // String Builder
  messages = require('./messages.json'), // Used for vote command
  isWindows = process.platform === "win32", // windows: true, other: false
  FormData = require('form-data'),
  DBL = require("dblapi.js"),
  dbl = new DBL(Buffer.from(Buffer.from(Buffer.from(s.token, `base64`).toString(`ascii`), `base64`).toString(`ascii`), `base64`).toString(`ascii`), client),
  defaultSettings = {
    prefix: c.prefix,
    language: c.lang,
    notifyRep: c.notifyRep,
    banRep: c.banRep,
    antispam: true,
    banned: false,
    disable_purge: true,
    ignoredChannels: [],
    autorole: null,
    global: null,
    group: [],
    excludeLogging: ``,
    invite: false,
  }, // Default settings, by config.json.
  defaultBans = [], // Default settings for bans.json, blank.
  defaultUser = {
    rep: 0,
    bannedFromServer: [],
    bannedFromServerOwner: [],
    bannedFromUser: [],
    probes: [],
  },
  global = [],
  levenshtein = function (s1, s2) {if (s1 == s2) {return 0;}const s1_len = s1.length; const s2_len = s2.length; if (s1_len === 0) {return s2_len;}if (s2_len === 0) {return s1_len;}let split = false; try{split = !(`0`)[0];}catch(e){split = true;}if (split) {s1 = s1.split(``); s2 = s2.split(``);}let v0 = new Array(s1_len + 1); let v1 = new Array(s1_len + 1); let s1_idx = 0, s2_idx = 0, cost = 0; for (s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {v0[s1_idx] = s1_idx;}let char_s1 = ``, char_s2 = ``; for (s2_idx = 1; s2_idx <= s2_len; s2_idx++) {v1[0] = s2_idx; char_s2 = s2[s2_idx - 1]; for (s1_idx = 0; s1_idx < s1_len; s1_idx++) {char_s1 = s1[s1_idx]; cost = (char_s1 == char_s2) ? 0 : 1; let m_min = v0[s1_idx + 1] + 1; const b = v1[s1_idx] + 1; const c = v0[s1_idx] + cost; if (b < m_min) {m_min = b;}if (c < m_min) {m_min = c;}v1[s1_idx + 1] = m_min;}const v_tmp = v0; v0 = v1; v1 = v_tmp;}return v0[s1_len];},
  commandList = [
    {"body": `help`, "args": ``},
    {"body": `shutdown`, "args": ` [-f]`},
    {"body": `token`, "args": ``},
    {"body": `setprefix`, "args": ` <Prefix>`},
    {"body": `ban`, "args": ` [<ID/Mentions/Name> <Reason> <Probe>]`},
    {"body": `unban`, "args": ` <ID/Mentions/Name> *Not recommended*`},
    {"body": `language`, "args": ` <ja/en>`},
    {"body": `log`, "args": ``},
    {"body": `setnotifyrep`, "args": ` <0...10>`},
    {"body": `setbanrep`, "args": ` <0...10>`},
    {"body": `antispam`, "args": ``},
    {"body": `antispam toggle`, "args": ``},
    {"body": `antispam disable`, "args": ``},
    {"body": `antispam enable`, "args": ``},
    {"body": `antispam ignore`, "args": ` <Channel>`},
    {"body": `antispam status`, "args": ` [Channel]`},
    {"body": `reload`, "args": ``},
    {"body": `setnick`, "args": ` <NewName>`},
    {"body": `setnickname`, "args": ` <NewName>`},
    {"body": `purge`, "args": ` [number/all]`},
    {"body": `purge gdel`, "args": ``},
    {"body": `purge gdel-msg`, "args": ``},
    {"body": `purge gdel-really`, "args": ``},
    {"body": `purge remake`, "args": ` <Channel>`},
    {"body": `vote`, "args": ` [args]`},
    {"body": `vote create`, "args": ` <Q> <A1...A10>`},
    {"body": `vote start`, "args": ` <Q> <A1...A10>`},
    {"body": `vote list`, "args": ``},
    {"body": `vote info`, "args": ` <ID>`},
    {"body": `vote end`, "args": ` <ID>`},
    {"body": `vote close`, "args": ` <ID>`},
    {"body": `vote vote`, "args": ` <ID> <Number>`},
    {"body": `togglepurge`, "args": ` [enable/disable]`},
    {"body": `dump`, "args": ` [guilds|users|channels|emojis|messages]`},
    {"body": `listemojis`, "args": ` [escape]`},
    {"body": `invite`, "args": ` [GuildID] [create] or [allow/deny]`},
    {"body": `role`, "args": ` <role> [user]`},
    {"body": `autorole`, "args": ` [add/remove] <role>`},
    {"body": `say`, "args": ` <Message>`},
    {"body": `sayd`, "args": ` <Message>`},
    {"body": `info`, "args": ``},
    {"body": `image`, "args": ``},
    {"body": `image anime`, "args": ``},
    {"body": `image nsfw`, "args": ` confirm`},
    {"body": `image r18`, "args": ` confirm`},
    {"body": `image 閲覧注意`, "args": ` confirm`},
    {"body": `image`, "args": ` nsfw|r18|閲覧注意 confirm`},
    {"body": `image custom`, "args": ` <subreddit>`},
    {"body": `didyouknow`, "args": ` <User>`},
    {"body": `setgroup`, "args": ` [add/remove] [ServerID]`},
    {"body": `lookup`, "args": ` <User>`},
    {"body": `status minecraft`, "args": ``},
    {"body": `status fortnite`, "args": ``},
    {"body": `encode`, "args": ` <String>`},
    {"body": `decode`, "args": ` <Base64String>`},
    {"body": `encrypt`, "args": ` <Text> <Password>`},
    {"body": `decrypt`, "args": ` <EncryptedText> <Password>`},
    {"body": `deletemsg`, "args": ` [User]`},
    {"body": `setignore`, "args": ` <Channel>`},
  ];
var guildSettings,
  settings,
  lang,
  bansFile,
  bans,
  userFile,
  user,
  serverMessagesFile,
  userMessagesFile,
  voteCmd = (msg, split, settings) => {
  if (split[1] === `create` || split[1] === `start`) {
    if (!(/.*?\|.*?/gm).test(split[3])) return msg.channel.send(messages.votes.invalid_usage);
    if (split[3].split(`|`).length > 10) return msg.channel.send(format(messages.votes.too_many_args, split[3].split(`|`).length - 1));
    let voteId = Math.random().toString(36).substr(2, 3);
    const guildId = msg.guild.id;
    while (true) {
      if (fs.existsSync(`./data/votes/${guildId}/${voteId}.json`)) {
        voteId = Math.random().toString(36).substr(2, 5);
        continue;
      } else {
        break;
      }
    }
    const args2 = split[3].split(`|`),
      voteFile = `./data/votes/${guildId}/${voteId}.json`,
      voteData = {
      "title": `${split[2]}`,
      "data1": `${args2[0]}`,
      "data2": `${args2[1]}`,
      "data3": `${args2[2]}`,
      "data4": `${args2[3]}`,
      "data5": `${args2[4]}`,
      "data6": `${args2[5]}`,
      "data7": `${args2[6]}`,
      "data8": `${args2[7]}`,
      "data9": `${args2[8]}`,
      "data10": `${args2[9]}`,
      "closed": false,
      "votes1": 0,
      "votes2": 0,
      "votes3": 0,
      "votes4": 0,
      "votes5": 0,
      "votes6": 0,
      "votes7": 0,
      "votes8": 0,
      "votes9": 0,
      "votes10": 0,
      "creator": `${msg.author.id}`
    };
    fs.writeFileSync(voteFile, JSON.stringify(voteData, null, 4), `utf8`, (err) => {
  console.error(err);
});
   const vote = require(voteFile);
   msg.channel.send(`\`${voteId}\`を作成しました。\n投票には、\`${settings.prefix}vote vote <ID> <数値>\`を入力してください。`);
    const voteEmbed = new discord.RichEmbed().
      setTitle(`投票`).
      addField(vote.data1, vote.votes1).
      addField(vote.data2, vote.votes2);
      if (vote.data3.toString() !== `undefined`) {
        voteEmbed.addField(vote.data3, vote.votes3);
      }
      if (vote.data4.toString() !== `undefined`) {
        voteEmbed.addField(vote.data4, vote.votes4);
      }
      if (vote.data5.toString() !== `undefined`) {
        voteEmbed.addField(vote.data5, vote.votes5);
      }
      if (vote.data6.toString() !== `undefined`) {
        voteEmbed.addField(vote.data6, vote.votes6);
      }
      if (vote.data7.toString() !== `undefined`) {
        voteEmbed.addField(vote.data7, vote.votes7);
      }
      if (vote.data8.toString() !== `undefined`) {
        voteEmbed.addField(vote.data8, vote.votes8);
      }
      if (vote.data9.toString() !== `undefined`) {
        voteEmbed.addField(vote.data9, vote.votes9);
      }
      if (vote.data10.toString() !== `undefined`) {
        voteEmbed.addField(vote.data10, vote.votes10);
      }
      voteEmbed.addField(`作成者`, client.users.get(vote.creator).toString()).
      setFooter(`閉じられているか: ${vote.closed}`);
    msg.channel.send(voteEmbed);
  } else if (split[1] === `close` || split[1] === `end`) {
    if (!split[2]) return msg.channel.send(messages.wrong_args);
    const voteId = split[2],
      guildId = msg.guild.id,
      voteFile = `./data/votes/${guildId}/${voteId}.json`;
    if (!fs.existsSync(voteFile)) return msg.channel.send(messages.votes.no_file);
    let vote = require(voteFile);
    if (vote.creator === msg.author.id) {
      vote.closed = true;
      writeSettings(voteFile, vote, msg.channel, false);
      vote = require(voteFile);
      msg.channel.send(messages.votes.close);
      const voteEmbed = new discord.RichEmbed().
        setTitle(`投票`).
        addField(vote.data1, vote.votes1).
        addField(vote.data2, vote.votes2);
      if (vote.data3.toString() !== `undefined`) {
        voteEmbed.addField(vote.data3, vote.votes3);
      }
      if (vote.data4.toString() !== `undefined`) {
        voteEmbed.addField(vote.data4, vote.votes4);
      }
      if (vote.data5.toString() !== `undefined`) {
        voteEmbed.addField(vote.data5, vote.votes5);
      }
      if (vote.data6.toString() !== `undefined`) {
        voteEmbed.addField(vote.data6, vote.votes6);
      }
      if (vote.data7.toString() !== `undefined`) {
        voteEmbed.addField(vote.data7, vote.votes7);
      }
      if (vote.data8.toString() !== `undefined`) {
        voteEmbed.addField(vote.data8, vote.votes8);
      }
      if (vote.data9.toString() !== `undefined`) {
        voteEmbed.addField(vote.data9, vote.votes9);
      }
      if (vote.data10.toString() !== `undefined`) {
        voteEmbed.addField(vote.data10, vote.votes10);
      }
      voteEmbed.addField(`作成者`, client.users.get(vote.creator).toString()).
        setFooter(`閉じられているか: ${vote.closed}`);
      msg.channel.send(voteEmbed);
    } else {
      msg.channel.send(messages.no_permission);
    }
  } else if (split[1] === `vote`) {
    if (!split[3]) return msg.channel.send(`${messages.wrong_args}\n投票IDを指定してください。一覧は\`${settings.prefix}vote list\`で見れます。`);
    const voteId = split[2],
      guildId = msg.guild.id,
      voteFile = `./data/votes/${guildId}/${voteId}.json`;
    if (!fs.existsSync(voteFile)) return msg.channel.send(messages.votes.no_file);
    let vote = require(voteFile);
    if (vote[`closed`] === true) return msg.channel.send(messages.votes.closed);
    vote[`votes${split[3]}`] = ++vote[`votes${split[3]}`];
    writeSettings(voteFile, vote, msg.channel, false);
    vote = require(voteFile);
    msg.channel.send(messages.votes.voted);
    const voteEmbed = new discord.RichEmbed().
      setTitle(`投票`).
      addField(vote.data1, vote.votes1).
      addField(vote.data2, vote.votes2);
      if (vote.data3.toString() !== `undefined`) {
        voteEmbed.addField(vote.data3, vote.votes3);
      }
      if (vote.data4.toString() !== `undefined`) {
        voteEmbed.addField(vote.data4, vote.votes4);
      }
      if (vote.data5.toString() !== `undefined`) {
        voteEmbed.addField(vote.data5, vote.votes5);
      }
      if (vote.data6.toString() !== `undefined`) {
        voteEmbed.addField(vote.data6, vote.votes6);
      }
      if (vote.data7.toString() !== `undefined`) {
        voteEmbed.addField(vote.data7, vote.votes7);
      }
      if (vote.data8.toString() !== `undefined`) {
        voteEmbed.addField(vote.data8, vote.votes8);
      }
      if (vote.data9.toString() !== `undefined`) {
        voteEmbed.addField(vote.data9, vote.votes9);
      }
      if (vote.data10.toString() !== `undefined`) {
        voteEmbed.addField(vote.data10, vote.votes10);
      }
      voteEmbed.addField(`作成者`, client.users.get(vote.creator).toString()).
      setFooter(`閉じられているか: ${vote.closed}`);
    msg.channel.send(voteEmbed);
  } else if (split[1] === `list`) {
    const embed = new discord.RichEmbed().
      setTitle(`投票ID一覧`).
      setTimestamp(),
      sb = new StringBuilder(``),
      items = fs.readdirSync(`./data/votes/${msg.guild.id}/`);
    for (let i = 0; i < items.length; i++) {
      sb.append(`${items[i].replace(`.json`, ``)}\n`);
    }
    embed.setDescription(sb.toString());
    msg.channel.send(embed);
  } else if (split[1] === `info`) {
    if (!split[2]) return msg.channel.send(`${messages.wrong_args}\n投票IDを指定してください。一覧は\`${settings.prefix}vote list\`で見れます。`);
    const voteId = split[2],
      guildId = msg.guild.id,
      voteFile = `./data/votes/${guildId}/${voteId}.json`;
    if (!fs.existsSync(voteFile)) return msg.channel.send(messages.votes.no_file);
    const vote = require(voteFile);
    const voteEmbed = new discord.RichEmbed().
      setTimestamp().
      setTitle(`投票`).
      addField(vote.data1, vote.votes1).
      addField(vote.data2, vote.votes2);
      if (vote.data3.toString() !== `undefined`) {
        voteEmbed.addField(vote.data3, vote.votes3);
      }
      if (vote.data4.toString() !== `undefined`) {
        voteEmbed.addField(vote.data4, vote.votes4);
      }
      if (vote.data5.toString() !== `undefined`) {
        voteEmbed.addField(vote.data5, vote.votes5);
      }
      if (vote.data6.toString() !== `undefined`) {
        voteEmbed.addField(vote.data6, vote.votes6);
      }
      if (vote.data7.toString() !== `undefined`) {
        voteEmbed.addField(vote.data7, vote.votes7);
      }
      if (vote.data8.toString() !== `undefined`) {
        voteEmbed.addField(vote.data8, vote.votes8);
      }
      if (vote.data9.toString() !== `undefined`) {
        voteEmbed.addField(vote.data9, vote.votes9);
      }
      if (vote.data10.toString() !== `undefined`) {
        voteEmbed.addField(vote.data10, vote.votes10);
      }
      voteEmbed.addField(`作成者`, client.users.get(vote.creator).toString()).
      setFooter(`閉じられているか: ${vote.closed}`);
    msg.channel.send(voteEmbed);
  } else {
      let sb = new StringBuilder(``),
      cmd = `${split[0]} ${split[1]}`.replace(` undefined`, ``);
      for(var i = 0; i < commandList.length; i++) {
        commandList[i].no = levenshtein(`${cmd}`, commandList[i].body);
      }
      commandList.sort((a, b) => {
        return a.no - b.no;
      });
      for (var i = 0; i < commandList.length; i++) {
        if (commandList[i].no <= 2) {
          sb.append(`・\`${settings.prefix}${commandList[i].body}${commandList[i].args}\`\n`);
        }
      }
      msg.channel.send(f(lang.no_command, cmd));
      if (sb.toString() != ``) {
        msg.channel.send(f(lang.didyoumean, `\n${sb.toString()}`));
      }
  }
};

function addRole(msg, rolename, isCommand = true, guildmember = null) {
      var role = null;
      var member = null;
      try {
        role = msg.guild.roles.find("name", rolename);
        if (!guildmember) {
          member = msg.guild.members.get(msg.author.id);
        } else {
          member = msg.guild.members.get(guildmember.id); // Expected GuildMember
        }
        if (isCommand) {
          if (member.roles.has(role.id)) {
            member.removeRole(role).catch(console.error);
            let embed = new discord.RichEmbed().setTitle(":wastebasket: ロールから削除").setColor([255,0,0]).setDescription("ロール[" + rolename + "] から削除しました。");
            msg.channel.send(embed);
          } else {
            member.addRole(role).catch(console.error);
            let embed = new discord.RichEmbed().setTitle(":heavy_plus_sign: ロールへ追加").setColor([0,255,0]).setDescription("ロール[" + rolename + "] へ追加しました。");
            msg.channel.send(embed);
          }
        } else {
            member.addRole(role).catch(console.error);
        }
      } catch (e) {
        msg.channel.send(lang.role_error);
        console.error(e);
      }
}

client.on('ready', () => {
  if (!fs.existsSync(`./data/servers`)) {
    mkdirp(`./data/servers`);
  }
  if (!fs.existsSync(`./data/users`)) {
    mkdirp(`./data/users`);
  }
  bansFile = `./data/bans.json`;
  if (!fs.existsSync(bansFile)) {
    console.log(`Creating ${bans}`);
    fs.writeFileSync(bansFile, JSON.stringify(defaultBans, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!fs.existsSync(`./data/global_servers.json`)) {
    fs.writeFileSync(`./data/global_servers.json`, JSON.stringify(global, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!fs.existsSync(`./data/global_channels.json`)) {
    fs.writeFileSync(`./data/global_channels.json`, JSON.stringify(global, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  client.user.setActivity(`${c.prefix}help | ${client.guilds.size}サーバー`);
  console.log(`Bot has Fully startup.`);
});

client.on('message', async msg => {
 if (!msg.guild && !msg.author.bot) return msg.channel.send("Not supported DM or GroupDM");
 guildSettings = `./data/servers/${msg.guild.id}/config.json`;
 if (!fs.existsSync(`./data/users/${msg.author.id}`)) {
  mkdirp(`./data/users/${msg.author.id}`);
 }
 if (!fs.existsSync(`./data/servers/${msg.guild.id}`)) {
  mkdirp(`./data/servers/${msg.guild.id}`);
 }
 if (!fs.existsSync(guildSettings)) {
  console.log(`Creating ${guildSettings}`);
  fs.writeFileSync(guildSettings, JSON.stringify(defaultSettings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
 }
 if (!fs.existsSync(`./data/votes/${msg.guild.id}`)) {
  mkdirp(`./data/votes/${msg.guild.id}`);
 }
 userMessagesFile = `./data/users/${msg.author.id}/messages.log`;
 serverMessagesFile = `./data/servers/${msg.guild.id}/messages.log`;
 let parentName;
 if (msg.channel.parent) {
  parentName = msg.channel.parent.name;
 }
 settings = require(guildSettings);
 if (msg.channel.id !== settings.excludeLogging) {
  fs.appendFileSync(userMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n`);
  fs.appendFileSync(serverMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n`)
 }
 client.user.setActivity(`${c.prefix}help | ${client.guilds.size}サーバー`);
 bans = require(bansFile);
 if (!msg.author.bot) {
  userFile = `./data/users/${msg.author.id}/config.json`;
  if (!fs.existsSync(userFile)) {
    console.log(`Creating ${userFile}`);
    fs.writeFileSync(userFile, JSON.stringify(defaultUser, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  user = require(userFile);
  if (!user.bannedFromServer) {
    user.bannedFromServer = [];
    fs.writeFileSync(userFile, JSON.stringify(user, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!user.bannedFromServerOwner) {
    user.bannedFromServerOwner = [];
    fs.writeFileSync(userFile, JSON.stringify(user, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!user.bannedFromUser) {
    user.bannedFromUser = [];
    fs.writeFileSync(userFile, JSON.stringify(user, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!user.probes) {
    user.probes = [];
    fs.writeFileSync(userFile, JSON.stringify(user, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!settings.group) {
    settings.group = [];
    fs.writeFileSync(guildSettings, JSON.stringify(settings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!settings.excludeLogging) {
    settings.excludeLogging = ``;
    fs.writeFileSync(guildSettings, JSON.stringify(settings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!settings.invite) {
    settings.invite = false;
    fs.writeFileSync(guildSettings, JSON.stringify(settings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  lang = require(`./lang/${settings.language}.json`); // Processing message is under of this

  // --- Begin of Auto-ban
  if (!settings.banned) {
    if (settings.banRep <= user.rep && settings.banRep != 0) {
      member.guild.ban(member)
        .then(user => console.log(f(lang.autobanned, member.user.tag, user.id, member.guild.name, member.guild.id)))
        .catch(console.error);
    }
  }
  // --- End of Auto-ban

  // --- Begin of Global chat
  /*
  if (settings.global != null && !msg.content.startsWith(settings.prefix)) {
    let g_servers = require('./data/global_servers.json');
    let g_channels = require('./data/global_channels.json');
    for (var i=0;i<=g_servers.length;i++) {
      try {
        if (msg.channel.id == settings.global) {
          if (g_servers[i] != msg.guild.id.toString() && g_servers[i] !== void 0) {
            client.guilds.get(g_servers[i]).channels.get(g_channels[i]).send(`<${msg.author.tag}> ${msg.content}`);
          }
        }
      } catch(e) {/* Dummy *//*}
    }
  }
  */
  // --- End of Global chat

  // --- Begin of Anti-spam
  if (settings.antispam && !~settings.ignoredChannels.indexOf(msg.channel.id) && !msg.author.bot) {
    var status = false;
    if (/(.)\1{15,}/gm.test(msg.content)) status = true;
    if (status) {
      if (settings.banned) { settings = null; return msg.channel.send(f(lang.error, lang.errors.server_banned)); }
      msg.delete(0);
      msg.channel.send(lang.contains_spam);
    }
  }
  // --- End of Anti-spam

  // Disboard Fucking Message
  //

  if (msg.content === "!disboard bump") {
    let embed = new discord.RichEmbed().setImage("https://i.imgur.com/rc8mMFi.png")
      .setTitle("ディスボード: Discordサーバー掲示板").setURL("https://disboard.org/")
      .setColor([140,190,210]).setDescription("下げました :thumbsdown:\nディスボードでチェックしてね: https://disboard.org");
    msg.channel.send(embed);
  }

  //

  if (msg.content.startsWith(settings.prefix)) {
    if (settings.banned && msg.author.id !== "254794124744458241") { settings = null; return msg.channel.send(f(lang.error, lang.errors.server_banned)); }
    const args = msg.content.replace(settings.prefix, "").split(` `);
    if (msg.content.startsWith(`${settings.prefix}vote `) || msg.content === `${settings.prefix}vote`) return voteCmd(msg, args, settings);
    if (msg.content.startsWith(c.prefix + "say ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
          var commandcut = msg.content.substr("!sayd ".length); //cut "!bot " off of the start of the command
          var message = ""; //create message variable
          var argumentarray = commandcut.split(" "); // split array by "," characters
          argumentarray.forEach(function(element) { // foreach argument given
              message += element + " "; // add argument and space to message
          }, this);
          return msg.channel.send(message);
    } else if (msg.content.startsWith(c.prefix + "sayd ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
          var commandcut = msg.content.substr("!sayd ".length); //cut "!bot " off of the start of the command
          var message = ""; //create message variable
          var argumentarray = commandcut.split(" "); // split array by "," characters
          argumentarray.forEach(function(element) { // foreach argument given
              message += element + " "; // add argument and space to message
          }, this);
          msg.delete(0).catch(console.error);
          return msg.channel.send(message);
    } else if (msg.content.startsWith(settings.prefix + "image")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      // const args = msg.content.slice(settings.prefix + "image".length).trim().split(/ +/g);
      if (msg.content.startsWith(settings.prefix + "image custom")) {
        if(/\s/gm.test(args[2])) {
          msg.channel.send(lang.cannotspace);
        } else {
          msg.channel.send(lang.searching);
          /* Normal NSFW */
          if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw)
          var subreddits = [
            args[2]
          ]
          var sub = subreddits[Math.round(Math.random() * (subreddits.length - 1))];
          randomPuppy(sub)
              .then(url => {
                  request.get(url).then(r => {
                      fs.writeFile(`hentai.jpg`, r.body);
                      let embed = new discord.RichEmbed().attachFile(r.body);
                      msg.channel.send(embed).catch(msg.channel.send);
                      fs.unlink(`./hentai.jpg`);
                })
            })
          return;
        }
      } else if (msg.content == settings.prefix + "image anime") {
        msg.channel.send(lang.searching);
        if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw)
        var subreddits = [
            'Undertale',
            'awwnime',
            'Gunime',
            'anime',
            'animemes',
            'anikyar_ja',
            'PopTeamEpic',
            'GJbu',
            'touhou',
            'anime_irl',
            'animegifs',
            'AnimeFigures'
        ];
        var sub = subreddits[Math.round(Math.random() * (subreddits.length - 1))];
        randomPuppy(sub)
            .then(url => {
                request.get(url).then(r => {
                    fs.writeFile(`hentai.jpg`, r.body);
                    let embed = new discord.RichEmbed().attachFile(r.body);
                    msg.channel.send(embed).catch(msg.channel.send);
                    fs.unlink(`./hentai.jpg`);
                })
            })
        return;
      } else if (msg.content == settings.prefix + "image nsfw" || msg.content == settings.prefix + "image 閲覧注意" || msg.content === settings.prefix + "image r18") {
        msg.channel.send(lang.searching);
        /* Normal NSFW */
        if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw)
        var subreddits = [
            'HENTAI_GIF',
            'hentai_irl',
            'NSFW_Wallpapers',
            'SexyWallpapers',
            'HighResNSFW',
            'nsfw_hd',
            'UHDnsfw'
        ];
        var sub = subreddits[Math.round(Math.random() * (subreddits.length - 1))];
        randomPuppy(sub)
            .then(url => {
                request.get(url).then(r => {
                    fs.writeFile(`hentai.jpg`, r.body);
                    let embed = new discord.RichEmbed().attachFile(r.body);
                    msg.channel.send(embed).catch(msg.channel.send);
                    fs.unlink(`./hentai.jpg`);
                    msg.channel.send("Greater NSFWはこちら: `" + settings.prefix + "image nsfw confirm`");
                })
            })
        return;
      } else if(msg.content.startsWith(settings.prefix + "image nsfw confirm") || msg.content.startsWith(settings.prefix + "image 閲覧注意 confirm")) {
        msg.channel.send(lang.searching);
        /* Confirm command! */
        if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw)
        var subreddits = [
            'HENTAI_GIF',
            'hentai_irl',
            'diskpic',
            'cum',
            'cumshot',
            'anal',
            'oral',
            'teen',
            'tits',
            'milf',
            'creampie',
            'NSFW_Wallpapers',
            'SexyWallpapers',
            'HighResNSFW',
            'nsfw_hd',
            'UHDnsfw',
            'NSFW_GIF',
            'nsfw_gifs',
            'porninfifteenseconds',
            '60FPSPorn',
            'porn_gifs',
            'nsfw_Best_Porn_Gif',
            'LipsThatFrip',
            'adultgifs'
        ];
        var sub = subreddits[Math.round(Math.random() * (subreddits.length - 1))];
        randomPuppy(sub)
            .then(url => {
                request.get(url).then(r => {
                    fs.writeFile(`hentai.jpg`, r.body)
                    let embed = new discord.RichEmbed().attachFile(r.body);
                    msg.channel.send(embed).catch(msg.channel.send);
                    fs.unlink(`./hentai.jpg`)
                })
            })
        return;
      } else {
        let embed = new discord.RichEmbed().setImage("https://i.imgur.com/rc8mMFi.png").setTitle("引数が").setColor([0,255,0])
        .setDescription(":thumbsdown: 足りないのでコマンド実行できなかったよ :frowning:\n:thumbsdown: もしくは引数が間違ってるよ :frowning:");
        return msg.channel.send(embed).catch(console.error);
      }
    } else if (msg.content === settings.prefix + "info") {
     async function diskinfo() {
        const graph = `Device          Total  Used Avail Use% Mounted on\n`;
        var o1 = `利用不可`,
          o2 = ``,
          loadavg = `利用不可`,
          invite = s.inviteme;
        if (!isWindows) {
          var { stdout, stderr } = await exec("df -h | grep /dev/sdb");
          o1 = stdout;
          var { stdout, stderr } = await exec("df -h | grep /dev/sda");
          o2 = stdout;
          loadavg = Math.floor(os.loadavg()[1] * 100) / 100;
        }
        let embed = new discord.RichEmbed()
          .setTitle("Bot info")
          .setTimestamp()
          .setColor([0,255,0])
          .addField(lang.info.memory, `${lang.info.memory_max}: ${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_usage}: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_free}: ${Math.round(os.freemem() / 1024 / 1024 * 100) / 100}MB`)
          .addField(lang.info.cpu, `${lang.info.threads}: ${os.cpus().length}\n${lang.info.cpu_model}: ${os.cpus()[0].model}\n${lang.info.cpu_speed}: ${os.cpus()[0].speed}`)
          .addField(lang.info.disk, `${graph}${o1}${o2}`)
          .addField(lang.info.platform, `${os.platform}`)
          .addField(lang.info.loadavg, `${loadavg}`)
          .addField(lang.info.servers, `${client.guilds.size}`)
          .addField(lang.info.users, `${client.users.size}`)
          .addField(lang.info.createdBy, `${client.users.get("254794124744458241").tag} (${client.users.get("254794124744458241").id})`)
          .setDescription(`[${lang.info.invite}](${invite})\n[${lang.info.source}](${c.github})`)
          .setFooter(`Sent by ${msg.author.tag}`);
        return msg.channel.send(embed);
      }
      diskinfo();
    } else if (msg.content.startsWith(settings.prefix + "encode ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      let cmd = settings.prefix + "encode ";
      return msg.channel.send(new Buffer.from(msg.content.slice(cmd.length)).toString(`base64`));
    } else if (msg.content.startsWith(settings.prefix + "decode ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      return msg.channel.send(new Buffer.from(args[1], `base64`).toString(`ascii`));
    } else if (msg.content.startsWith(settings.prefix + "encrypt ")) {
      if (!args[2]) return msg.channel.send(lang.invalid_args);
      var cipher = crypto.createCipher('aes192', args[2]);
      cipher.update(args[1], 'utf8', 'hex');
      var encryptedText = cipher.final('hex');
      return msg.channel.send(f(lang.encrypted, args[1], args[2], encryptedText));
    } else if (msg.content.startsWith(settings.prefix + "decrypt ")) {
      if (!args[2]) return msg.channel.send(lang.invalid_args);
      var decipher,dec;
      try {
        decipher = crypto.createDecipher('aes192', args[2]);
        decipher.update(args[1], 'hex', 'utf8');
        dec = decipher.final('utf8');
      } catch (e) {
        return msg.channel.send(f(lang.invalid_password, args[2]));
      }
      return msg.channel.send(f(lang.decrypted, args[1], args[2], dec));
    } else if (msg.content.startsWith(settings.prefix + "didyouknow ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      let know = client.users.find("username", args[1]);
      if (!know) know = msg.mentions.users.first();
      if (!know) know = client.users.get(args[1]);
      if (!know) {
        return msg.channel.send(f(lang.unknown, args[1]));
      } else {
        return msg.channel.send(f(lang.known, `${know.tag} (${know.id})`));
      }
    } else if (msg.content === settings.prefix + "help") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      let prefix = settings.prefix,
        embed = new discord.RichEmbed()
        .setTitle(f(lang.commands.title, c.version))
        .setTimestamp()
        .setColor([0,255,0])
        .addField(`${prefix}shutdown __/__ ${prefix}token __/__ ${prefix}log`, `${lang.commands.shutdown}\n${lang.commands.token}\n${lang.commands.log}`)
        .addField(`${prefix}setprefix`, lang.commands.setprefix)
        .addField(`${prefix}ban [<User> <Reason> <Probe>] | ${prefix}unban`, `${lang.commands.ban} | ${lang.commands.unban}`)
        .addField(`${prefix}language`, lang.commands.language)
        .addField(`${prefix}setnotifyrep | ${prefix}setbanrep`, `${lang.commands.setnotifyrep} | ${lang.commands.setbanrep}`)
        .addField(`${prefix}antispam`, lang.commands.antispam)
        .addField(`${prefix}purge`, lang.commands.purge)
        .addField(`${prefix}purge <1-99>`, lang.commands.purge_number)
        .addField(`${prefix}purge gdel`, lang.commands.purge_gdel)
        .addField(`${prefix}purge gdel-msg`, lang.commands.purge_gdel_msg) /* 10 */
        .addField(`${prefix}purge gdel-really`, lang.commands.purge_gdel_really)
        .addField(`${prefix}purge remake <Channel>`, lang.commands.purge_remake)
        .addField(`${prefix}vote create|start <Q> <A1...A10>`, lang.commands.vote_create)
        .addField(`${prefix}vote list`, lang.commands.vote_list)
        .addField(`${prefix}vote info <ID>`, lang.commands.vote_info)
        .addField(`${prefix}vote close|end <ID>`, lang.commands.vote_close)
        .addField(`${prefix}vote vote <ID> <1...10>`, lang.commands.vote_vote)
        .addField(`${prefix}togglepurge [enable/disable]`, lang.commands.togglepurge)
        .addField(`${prefix}dump [guilds|users|channels|emojis|messages] [messages:delete/size]`, lang.commands.dump)
        .addField(`${prefix}listemojis [escape]`, lang.commands.listemojis) /* 20 */
        .addField(`${prefix}invite [GuildID] [create] or [allow/deny]`, lang.commands.invite)
        .addField(`${prefix}role <role> [user] __/__ ${prefix}autorole [add/remove] <role>`, `${lang.commands.role}\n${lang.commands.autorole}`)
        .addField(`${prefix}image [nsfw|閲覧注意|anime|custom] [confirm|confirm| |subreddit]`, lang.commands.image)
        .addField(`${prefix}lookup <User>`, lang.lookup.desc)
        .addField(lang.commands.warning, lang.commands.asterisk); /* 25 */
      return msg.channel.send(embed);
    } else if (msg.content === settings.prefix + "status minecraft") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      msg.channel.send(lang.status.checking);
      var status = ["undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined"];
      var key,leng,data,time;
      var i = 0;
      const startTime = now();
      var req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if(req.readyState == 4 && req.status == 200){
          data = JSON.parse(req.responseText);
          for (leng = data.length; i < data.length; i ++) {
            for (key in data[i]){
              switch (data[i][key]){
                case 'green':
                  status[i] = lang.status.ok;
                  break;
                case 'red':
                  status[i] = lang.status.down;
                  break;
                case 'yellow':
                  status[i] = lang.status.unstable;
                  break;
                default:
                  status[i] = lang.status.unknown;
                  break;
              }
            }
          }
          const endTime = now();
          time = endTime - startTime;
          let embed = new discord.RichEmbed()
            .setTitle(lang.status.title)
            .setURL("https://help.mojang.com")
            .setColor([0,255,0])
            .setFooter(f(lang.status.time, Math.floor(time)))
            .setTimestamp()
            .addField(lang.status.servers.minecraft, status[0])
            .addField(lang.status.servers.sessionminecraft, status[1])
            .addField(lang.status.servers.accountmojang, status[2])
            .addField(lang.status.servers.authservermojang, status[3])
            .addField(lang.status.servers.sessionservermojang, status[4])
            .addField(lang.status.servers.apimojang, status[5])
            .addField(lang.status.servers.texturesminecraft, status[6])
            .addField(lang.status.servers.mojang, status[7]);
          return msg.channel.send(embed);
        }
      };
      req.open("GET", "https://status.mojang.com/check", false);
      req.send(null);
    } else if (msg.content === settings.prefix + "status fortnite") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      msg.channel.send(lang.status.checking);
      var status = "Unknown";
      var key,leng,data,time;
      var i = 0;
      const startTime = now();
      var req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if(req.readyState == 4 && req.status == 200){
          data = JSON.parse(req.responseText);
          if (data.status === "UP") {
            status = lang.status.ok;
          } else if (data.status === "DOWN") {
            status = lang.status.down;
          } else {
            status = lang.status.unknown;
          }
          const endTime = now();
          time = endTime - startTime;
          let embed = new discord.RichEmbed()
            .setTitle(lang.status.title)
            .setURL("https://status.epicgames.com")
            .setColor([0,255,0])
            .setFooter(f(lang.status.time, Math.floor(time)))
            .setTimestamp()
            .addField(lang.status.servers.fortnite, status)
          return msg.channel.send(embed);
        }
      };
      req.open("POST", "https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status", false);
      req.setRequestHeader("Authorization", "87be2f95e863a8c9e3dfd9e48873fe82");
      req.setRequestHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
      req.send(new FormData().append("username", "username"));
    }
    if (msg.member.hasPermission(8) || msg.author == "<@254794124744458241>") {
    if (msg.content === settings.prefix + "help") {
      /* Nothing. Dummy. */
    } else if (msg.content.startsWith(settings.prefix + "image")) {
      /* Nothing. Dummy. */
    } else if (msg.content.startsWith(settings.prefix + "say")) {
      /* Nothing. Dummy. */
    } else if (msg.content.startsWith(settings.prefix + "sayd")) {
      /* Nothing. Dummy. */
    } else if (msg.content.startsWith(settings.prefix + "status")) {
      /* Dummy */
    } else if (msg.content === settings.prefix + "togglepurge" || msg.content.startsWith(settings.prefix + "togglepurge ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      let unsavedSettings = settings;
      if (args[1] === "enable") { // enable purge command
        unsavedSettings.disable_purge = false;
      } else if (args[1] === "disable") { // disable purge command
        unsavedSettings.disable_purge = true;
      } else {
        if (settings.disable_purge) {
          unsavedSettings.disable_purge = false;
        } else if (!settings.disable_purge) {
          unsavedSettings.disable_purge = true;
        }
      }
      writeSettings(guildSettings, unsavedSettings, msg.channel, "disable_purge");
    } else if (msg.content.startsWith(settings.prefix + "invite ") || msg.content === settings.prefix + "invite") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      async function process() {
        if (!args[1]) return msg.channel.send(f(lang.invite_bot, s.inviteme));
        if (args[1] === `allow`) {
          settings.invite = true;
          return writeSettings(guildSettings, settings, msg.channel, "invite");
        } else if (args[1] === `deny`) {
          settings.invite = false;
          return writeSettings(guildSettings, settings, msg.channel, "invite");
        }
        if (/\D/.test(args[1])) return msg.channel.send(lang.invalid_args);
        if (/\d{19,}/.test(args[1])) return msg.channel.send(lang.invalid_args);
        if (!client.guilds.get(args[1])) return msg.channel.send(lang.invalid_args);
        var sb = new StringBuilder(``);
        const thatGuild = require(`./data/servers/${client.guilds.get(args[1]).id}/config.json`);
        if (!thatGuild.invite) return msg.channel.send(f(lang.disallowed_invite, `<@${client.guilds.get(args[1]).owner.user.id}>`));
        try {
          if (args[2] === `create`) {
            var invite;
            try {
              invite = await client.guilds.get(args[1]).channels.first().createInvite();
            } catch (e) {
              invite = await client.guilds.get(args[1]).channels.random().createInvite();
            }
          }
          await client.guilds.get(args[1]).fetchInvites()
            .then((invite) => {
              invite.forEach((data) => {
                sb.append(`https://discord.gg/${data.code}\n`);
              });
            })
            .catch(console.error);
          let embed = new discord.RichEmbed()
            .setTitle(lang.invites)
            .setDescription(sb.toString())
            .setFooter(lang.invite_create)
            .setTimestamp();
          msg.channel.send(embed);
        } catch (e) {
          console.error(e);
          if (e.toString() === `TypeError: Cannot read property 'fetchInvites' of undefined`) return msg.channel.send(lang.noguild);
        }
      }
      process();
    } else if (msg.content.startsWith(settings.prefix + "shutdown ") || msg.content === settings.prefix + "shutdown") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (msg.author == "<@254794124744458241>") {
        if (args[1] == "-f") {
          console.log(f(lang.atmpfs, msg.author.tag));
          msg.channel.send(lang.bye);
          client.destroy();
        } else if (args[1] == "-r") {
          async function process() {
            console.log(f(lang.rebooting));
            await msg.channel.send(lang.rebooting);
            process.kill(process.pid, 'SIGKILL');
          }
          process();
        } else {
          console.log(f(lang.success, msg.content));
          msg.channel.send(lang.bye);
          client.destroy();
        }
      } else {
        msg.reply(lang.noperm);
        console.log(f(lang.failednotmatch, msg.content));
      }
    } else if (msg.content.startsWith(settings.prefix + "setignore")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      var channel, id;
      if (!!msg.mentions.channels.first()) {
        channel = msg.mentions.channels.first();
      } else if (/\D/.test(args[1])) {
        channel = msg.guild.channels.find("name", args[1]);
      } else if (/\d{18}/.test(args[1])) {
        try {
          channel = msg.guild.channels.get(args[1]);
        } catch (e) {
          channel = msg.guild.channels.find("name", args[1]);
        }
      } else {
        channel = msg.guild.channels.find("name", args[1]);
      }
      if (!channel) return msg.channel.send(lang.invalid_args);
      id = channel.id;
      settings.excludeLogging = id;
      writeSettings(guildSettings, settings, msg.channel, "excludeLogging");
    } else if (msg.content === settings.prefix + "token") {
      if (msg.author.id === "254794124744458241") {
        msg.author.send(f(lang.mytoken, client.token));
        msg.reply(lang.senttodm);
        console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
        var embed = new discord.RichEmbed();
        embed.description = "You'll need to set - add permission - 'Manage Messages' => 'Save Changes'";
        embed.setColor([255, 0, 0]);
        msg.delete(5000).catch(function (error) { msg.channel.send(":no_good: Missing permission: 'manage message'", embed); console.error("Error: missing 'manage message' permission.");});
      } else {
        msg.reply(lang.youdonthavear);
        console.log(f(lang.issuedfailadmin, msg.author.tag, msg.content, "Doesn't have Admin Role"));
      }
    } else if (msg.content.startsWith(settings.prefix + "lookup ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      var id;
      if (!!msg.mentions.users.first()) {
        id = msg.mentions.users.first().id;
      } else {
        if (/\D/gm.test(args[1])) { // True if including any 'not digits'
          try {
            id = client.users.find("username", args[1]).id; // Find user
          } catch (e) {
            console.error(e);
            return msg.channel.send(f(lang.unknown, args[1]));
          }
        } else if (/\d{18}/.test(args[1])) {
          try {
            id = client.users.get(args[1]).id;
          } catch (e) {
            // do not use {e}
            id = client.users.find("username", args[1]).id;
          }
        } else {
          try {
            id = client.users.find("username", args[1]).id;
          } catch (e) {
            console.error(e);
            return msg.channel.send(f(lang.unknown, args[1]));
          }
        }
      }
      var userConfig,
        user2,
        sb = new StringBuilder(`BANされていません`),
        sb2 = new StringBuilder(`BANされていません`),
        isBot = lang.no;
      try {
        userConfig = require(`./data/users/${id}/config.json`);
        user2 = client.users.get(id);
      } catch (e) {
        console.error(e);
        return msg.channel.send(f(lang.unknown, args[1]));
      }
      if (user2.bot) isBot = lang.yes;
      for (let i=0;i<=userConfig.bannedFromServer.length;i++) {
        if (userConfig.bannedFromServer[i] != null) {
          sb.clear();
          sb2.clear();
          sb.append(`${userConfig.bannedFromServer[i]} (${userConfig.bannedFromServerOwner[i]})`);
        }
        sb2.append(userConfig.bannedFromUser[i])
      }
      let embed = new discord.RichEmbed()
        .setTitle(lang.lookup.title)
        .setColor([0,255,0])
        .setFooter(lang.lookup.desc)
        .addField(lang.lookup.rep, userConfig.rep)
        .addField(lang.lookup.bannedFromServer, sb.toString())
        .addField(lang.lookup.bannedFromUser, sb2.toString())
        .addField(lang.lookup.tag, user2.tag)
        .addField(lang.lookup.id, user2.id)
        .addField(lang.lookup.bot, isBot)
        .addField(lang.lookup.createdAt, user2.createdAt);
      msg.channel.send(embed);
    } else if (msg.content.startsWith(settings.prefix + "ban ") || msg.content === settings.prefix + "ban") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (!args[1] || args[1] === ``) {
        var sb = new StringBuilder(`まだ誰もBANしていません`);
        require(`./data/bans.json`).forEach((data) => {
          if (!!data) { // Doesn'tn't has data => process (translated: does has data => process)
            sb.clear();
            try {
              sb.append(`${client.users.find("id", data).tag} (${client.users.find("id", data).tag})`);
            } catch (e) {
              sb.append(`${data} (${lang.failed_to_get})`)
            }
          }
        });
        let embed = new discord.RichEmbed()
          .setTitle(lang.banned_users)
          .setColor([0,255,0])
          .setDescription(sb.toString());
        msg.channel.send(embed);
      } else {
        if (msg.guild && msg.guild.available && !msg.author.bot) {
          async function process() {
            if (!args[2]) return msg.channel.send(lang.invalid_args);
            reason = args[2];
            if (user.bannedFromServerOwner.indexOf(msg.guild.ownerID) && user.bannedFromServer.indexOf(msg.guild.id) && user.bannedFromUser.indexOf(msg.author.id)) return msg.channel.send(lang.already_banned);
            var user2,
              fetchedBans,
              attach,
              reason;
            if (/\d{18}/.test(args[1])) {
              args[1] = args[1].replace("<@", "").replace(">", "");
              fetchedBans = await msg.guild.fetchBans();
              if (fetchedBans.get(args[1])) {
                user2 = client.users.get(args[1]);
              } else {
                user2 = fetchedBans.get(args[1]);
              }
            } else {
              // msg.guild.fetchMembers(args[1]);
              user2 = client.users.find("username", args[1]);
            }
            if (!msg.attachments.first()) {
              return msg.channel.send(lang.invalid_args);
            } else {
              attach = msg.attachments.first().url;
            }
            if (!msg.mentions.users.first()) { /* Dummy */ } else { user = msg.mentions.users.first(); }
            if (!user) { settings = null; return msg.channel.send(lang.invalid_user); }
            let ban = bans;
            user.bannedFromServerOwner.push(msg.guild.ownerID);
            user.bannedFromServer.push(msg.guild.id);
            user.bannedFromUser.push(msg.author.id);
            user.probes.push(attach);
            ban.push(user.id);
            user.rep = ++user.rep;
            msg.guild.ban(user, { "reason": reason })
              .then(user2 => console.log(`Banned user(${i}): ${user2.tag} (${user2.id}) from ${client.guilds[i].name}(${client.guilds[i].id})`))
              .catch(console.error);
            fs.writeFileSync(bansFile, JSON.stringify(ban, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
            fs.writeFileSync(userFile, JSON.stringify(user, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
            msg.channel.send(lang.banned);
          }
          process();
        }
      }
    } else if (msg.content.startsWith(settings.prefix + "purge ") || msg.content === settings.prefix + "purge") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (msg.author.id === "254794124744458241") {
        if (!msg.member.hasPermission(8)) return msg.channel.send(lang.noperm);
      }
      if (settings.disable_purge) return msg.channel.send(lang.disabled_purge);
      var messages;
      if (args[1] === `` || !args[1] || args[1] === `all`) {
        let clear = () => {
          msg.channel.fetchMessages()
            .then((messages) => {
              msg.channel.bulkDelete(messages);
              if (messages.length >= 100) {
                clear();
              }
            });
        }
        clear();
      } else if (/[^0-9]/.test(args[1]) && args[1] === `gdel-msg`) {
        msg.guild.channels.forEach((channel) => {
          var clear = () => {
            channel.fetchMessages()
              .then((messages) => {
                channel.bulkDelete(messages);
                if (messages.length >= 100) {
                  clear();
                }
              });
          }
          clear();
        });
      } else if (/[^0-9]/.test(args[1]) && args[1] === `gdel`) {
        msg.guild.channels.forEach((channel) => { channel.delete(); });
        msg.guild.createChannel("general", "text");
      } else if (/[^0-9]/.test(args[1]) && args[1] === `gdel-really`) {
        msg.guild.channels.forEach((channel) => { channel.delete(); });
      } else if (args[1] === `remake`) {
        if (!msg.mentions.channels.first()) return msg.channel.send(lang.no_args);
        try {
          async function asyncProcess() {
            let channel = msg.mentions.channels.first();
            msg.channel.send(`:ok_hand:`);
            channel.delete(`Remake of Channel`);
            let created_channel = await msg.guild.createChannel(channel.name, channel.type);
            if (channel.parent) {
              created_channel.setParent(channel.parentID);
            }
            created_channel.setPosition(channel.position);
          }
          asyncProcess();
        } catch (e) {
          console.error(e);
        }
      } else if (/[0-9]/.test(args[1])) {
        if (parseInt(args[1]) > 99 || parseInt(args[1]) < 1) {
          msg.channel.send(lang.outofrange);
        }
        async function clear() {
          messages = await msg.channel.fetchMessages({limit: parseInt(args[1]) + 1});
          msg.channel.bulkDelete(messages)
            .catch(console.error);
        }
        clear();
      } else {
        msg.channel.send(lang.invalid_args);
      }
    } else if (msg.content.startsWith(settings.prefix + "unban ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (!args[1] || args[1] === ``) {
        msg.channel.send(lang.no_args);
      } else {
        if (msg.guild && msg.guild.available && !msg.author.bot) {
          var user;
          if (/[0-9]................./.test(args[1])) {
            user = client.users.get(args[1]);
          } else {
            user = client.users.find("username", args[1]);
          }
          if (!msg.mentions.users.first()) { /* Dummy */ } else { user = msg.mentions.users.first(); }
          if (!user) { settings = null; return msg.channel.send(lang.invalid_user); }
          let ban = bans,
            localUser = user;
          var exe = false;
          for (var i=0; i<=bans.length; i++) {
            if (bans[i] == user.id) {
              exe = true;
              delete ban[i];
            }
          }
          if (!exe) { settings = null; return msg.channel.send(lang.notfound_user); }
          for (var i=0; i<=client.guilds.length; i++) {
            client.guilds[i].unban(user)
              .then(user2 => console.log(`Unbanned user(${i}): ${user2.tag} (${user2.id}) from ${client.guilds[i].name}(${client.guilds[i].id})`))
              .catch(console.error);
          }
          localUser.rep = --localUser.rep;
          writeSettings(bansFile, ban, null, null, false);
          writeSettings(userFile, localUser, null, null, false);
          msg.channel.send(lang.unbanned);
        } else {
          msg.channel.send(lang.guild_unavailable);
        }
      }
    } else if (msg.content === settings.prefix + "fixactivity") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      client.user.setActivity(settings.prefix + "help | ${client.guilds.size}サーバー");
      msg.channel.send(":ok_hand:");
    } else if (msg.content.startsWith(settings.prefix + "setprefix ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      let set = settings;
      if (/\s/gm.test(args[1]) || !args[1]) {
        msg.channel.send(lang.cannotspace);
      } else {
        set.prefix = args[1];
        writeSettings(guildSettings, set, msg.channel, "prefix");
      }
    /*} else if (msg.content.startsWith(settings.prefix + "group ") || msg.content === settings.prefix + "group") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (!args[1]) {
        return msg.channel.send(lang.invalid_args);
      } else if (args[1] === "add") {
        if (/\D/gm.test(args[1])) return msg.channel.send(lang.invalid_args);
        if (!~settings.group.indexOf(args[1])) {
          settings.group.push(args[1]);
          writeSettings(guildSettings, settings, msg.channel, "group");
        } else {
          msg.channel.send(lang.already_set_group);
        }
      } else if (args[1] === "remove") {
        settings.group.forEach({
          if (settings.group[i] === args[1]) {
            delete settings.group[i];
          }
        });
        writeSettings(guildSettings, settings, msg.channel, "group");
      }*/ // under construction
    } else if (msg.content.startsWith(settings.prefix + "setnick ") || msg.content.startsWith(settings.prefix + "setnickname ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (/\s/gm.test(args[1]) || !args[1]) {
        msg.channel.send(lang.cannotspace);
      } else {
        msg.guild.me.setNickname(args[1]);
        msg.channel.send(`:ok_hand:`);
      }
    } else if (msg.content.startsWith(settings.prefix + "setnotifyrep ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      let set = settings,
        n = parseInt(args[1], 10),
        min = 0,
        max = 10,
        status = n >= min && n <= max;
      if (!status || args[1] == null) {
        msg.channel.send(lang.invalid_args);
      } else {
        set.notifyRep = parseInt(args[1], 10);
        writeSettings(guildSettings, set, msg.channel, "notifyRep");
      }
    } else if (msg.content.startsWith(settings.prefix + "setbanrep ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      let set = settings,
        n = parseInt(args[1], 10),
        min = 0,
        max = 10,
        status = n >= min && n <= max;
      if (!status || args[1] == null) {
        msg.channel.send(lang.invalid_args);
      } else {
        set.banRep = parseInt(args[1], 10);
        writeSettings(guildSettings, set, msg.channel, "banRep");
      }
    } else if (msg.content.startsWith(settings.prefix + "antispam ") || msg.content === settings.prefix + "antispam") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const command = `${settings.prefix}antispam`,
        off = `無効`,
        on = `有効`;
      if (!args[1] || args[1] === "help") {
        var status;
        if (settings.antispam) {
          status = on;
        } else {
          status = off;
        }
        let embed = new discord.RichEmbed()
          .setTitle(` - AntiSpam - `)
          .setDescription(f(lang.antispam.description, status))
          .addField(`${command} toggle`, lang.antispam.toggle)
          .addField(`${command} disable`, lang.antispam.disable)
          .addField(`${command} enable`, lang.antispam.enable)
          .addField(`${command} ignore <#Channel>`, lang.antispam.ignore)
          .addField(`${command} status <#Channel>`, lang.antispam.status)
          .setTimestamp();
        msg.channel.send(embed);
      } else if (args[1] === "toggle") {
        if (settings.antispam) {
          let localSettings = settings;
          localSettings.antispam = false;
          writeSettings(guildSettings, localSettings, null, null, false);
          msg.channel.send(lang.antispam.disabled);
        } else {
          let localSettings = settings;
          localSettings.antispam = true;
          writeSettings(guildSettings, localSettings, null, null, false);
          msg.channel.send(lang.antispam.enabled);
        }
      } else if (args[1] === "disable") {
        let localSettings = settings;
        localSettings.antispam = false;
        writeSettings(guildSettings, localSettings, null, null, false);
        msg.channel.send(lang.antispam.disabled);
      } else if (args[1] === "enable") {
        let localSettings = settings;
        localSettings.antispam = true;
        writeSettings(guildSettings, localSettings, null, null, false);
        msg.channel.send(lang.antispam.enabled);
      } else if (args[1] === "ignore") {
        if (!msg.mentions.channels.first()) { settings = null; return msg.channel.send(lang.invalid_args); }
        if (/\s/.test(args[2]) || !args[2]) { settings = null; return msg.channel.send(lang.cannotspace); }
        let localSettings = settings,
          id = msg.mentions.channels.first().id;
        if (~localSettings.ignoredChannels.indexOf(id)) {
          delete localSettings.ignoredChannels[localSettings.ignoredChannels.indexOf(id)];
          writeSettings(guildSettings, localSettings, null, null, false);
          msg.channel.send(lang.antispam.ignore_enabled);
        } else {
          localSettings.ignoredChannels.push(id);
          writeSettings(guildSettings, localSettings, null, null, false);
          msg.channel.send(lang.antispam.ignore_disabled);
        }
      } else if (args[1] === "status") {
        if (!msg.mentions.channels.first()) {
          var sb = new StringBuilder(``);
          settings.ignoredChannels.forEach((channel) => {
            if (channel != null) {
              sb.append(`<#${channel}>\n`);
            }
          });
          return msg.channel.send(f(lang.antispam.disabled_channels, sb.toString()));
        }
        let localSettings = settings,
          id = msg.mentions.channels.first().id;
        if (/\s/.test(args[2]) || !args[2]) { settings = null; return msg.channel.send(lang.cannotspace); }
        if (~settings.ignoredChannels.indexOf(id)) {
          msg.channel.send(f(lang.antispam.status2, off));
        } else {
          msg.channel.send(f(lang.antispam.status2, on));
        }
      }
    } else if (msg.content.startsWith(settings.prefix + "role ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (msg.author.id === "254794124744458241") {
        if (!msg.member.hasPermission(8)) return msg.channel.send(lang.noperm);
      }
      if (!msg.mentions.members.first()) {
        addRole(msg, args[1], true);
      } else {
        addRole(msg, args[1], true, msg.mentions.members.first());
      }
    } else if (msg.content.startsWith(settings.prefix + "info ") || msg.content === settings.prefix + "info") {
      /* Dummy */
    } else if (msg.content === settings.prefix + "autorole" || msg.content.startsWith(settings.prefix + "autorole ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (args[1] === `remove`) {
        let localSettings = settings;
        localSettings.autorole = null;
        writeSettings(guildSettings, localSettings, msg.channel, "autorole");
      } else if (args[1] === `add`) {
        let localSettings = settings;
        if (/\d{18,}/.test(args[2])) {
          localSettings.autorole = args[2];
        } else {
          try {
            let role = msg.mentions.roles.first().id.toString();
            localSettings.autorole = role;
          } catch (e) {
            try {
              let role = msg.guild.roles.find("name", args[2]).id;
              localSettings.autorole = role;
            } catch (e) {
              msg.channel.send(lang.invalid_args);
              console.error(e);
            }
          }
        }
        writeSettings(guildSettings, localSettings, msg.channel, "autorole");
      } else {
        if (settings.autorole != null) {
          msg.channel.send(f(lang.autorole_enabled, msg.guild.roles.get(settings.autorole).name));
        } else if (!settings.autorole) {
          msg.channel.send(lang.autorole_disabled);
        }
      }
    } else if (msg.content === settings.prefix + "global" || msg.content.startsWith(settings.prefix + "global ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (args[1] === `remove`) {
        let global_servers = require('./data/global_servers.json'),
          global_channels = require('./data/global_channels.json'),
          localSettings = settings;
        delete global_servers[args[1]];
        delete global_channels[settings.global];
        writeSettings(`./data/global_servers.json`, global_servers, null, null, false);
        writeSettings(`./data/global_channels.json`, global_channels, null, null, false);
        localSettings.global = null;
        writeSettings(guildSettings, localSettings, msg.channel, "global");
      } else if (args[1] === `add`) {
        var id;
        if (!msg.mentions.channels.first()) { /* Dummy */} else {
          console.log(msg.mentions.channels.first().id);
          id = msg.mentions.channels.first().id;
        }
        console.log(id);
        var localSettings = settings,
          global_servers = require('./data/global_servers.json'),
          global_channels = require('./data/global_channels.json');
        if (/\d{18,}/.test(args[2])) {
          localSettings.global = args[2];
        } else {
          return msg.channel.send(`:x: :bow: まだ使えません - You cannot use this :bow`);
          try {
            console.log(id);
            localSettings.global = id;
            console.log(localSettings.global);
            global_servers.push(msg.guild.id);
            global_channels.push(msg.mentions.channels.first().id);
            writeSettings(`./data/global_servers.json`, global_servers, null, null, false);
            writeSettings(`./data/global_channels.json`, global_channels, null, null, false);
          } catch (e) {
            try {
              localSettings.global = msg.guild.channels.find("name", args[2]).id;
              global_servers.push(msg.guild.id);
              global_channels.push(msg.guild.channels.find("name", args[2]).id);
              writeSettings(`./data/global_servers.json`, global_servers, null, null, false);
              writeSettings(`./data/global_channels.json`, global_channels, null, null, false);
            } catch (e) {
              msg.channel.send(lang.invalid_args);
              console.error(e);
            }
          }
        }
        writeSettings(guildSettings, localSettings, msg.channel, "global");
      } else {
        if (settings.global != null) {
          msg.channel.send(f(lang.global_enabled, msg.guild.channels.get(settings.global).name));
        } else if (!settings.global) {
          msg.channel.send(lang.global_disabled);
        }
      }
    } else if (msg.content === settings.prefix + "dump" || msg.content.startsWith(settings.prefix + "dump ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const url = c.dump_url;
      var sb = new StringBuilder(``),
        link = `${url}`,
        nowrite;
      if (args[1] === `users`) {
        client.users.forEach((user) => {
          sb.append(`${user.tag} (${user.id})\n`);
        });
      } else if (args[1] === `channels`) {
        client.channels.forEach((channel) => {
          sb.append(`<${channel.guild.name}><${channel.guild.id}> ${channel.name} (${channel.id}) [${channel.type}]\n`);
        });
      } else if (args[1] === `messages`) {
        if (args[2] === `size`) {
          msg.channel.send(f(lang.logsize, fs.statSync(`./data/servers/${msg.guild.id}/messages.log`).size / 1000000.0));
        } else if (args[2] === `delete`) {
          fs.writeFileSync(`./data/servers/${msg.guild.id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8', (err) => {if(err){console.error(err);}});
        }
        nowrite = true;
        if (c.data_baseurl == "" || !c.data_baseurl) {
          link = `利用不可`;
        } else {
          link = `${c.data_baseurl}/servers/${msg.guild.id}/messages.log`;
        }
      } else if (args[1] === `emojis`) {
        client.emojis.forEach((emoji) => {
          sb.append(`<${emoji.guild.name}><${emoji.guild.id}> ${emoji.name} (${emoji.id}) [isAnimated:${emoji.animated}] [ ${emoji.url} ]\n`);
        });
      } else if (!args[1] || args[1] === `guilds`) {
        client.guilds.forEach((guild) => {
          sb.append(`${guild.name} (${guild.id})\n`);
        });
      }
      let image1 = `https://img.rht0910.tk/upload/2191111432/72932264/bump.png`,
        image2 = `https://img.rht0910.tk/upload/2191111432/710894583/dump2.png`;
      var image;
      if (!args[2]) {
        image = image1;
      } else {
        image = image2;
      }
      let embed = new discord.RichEmbed().setImage(image)
        .setTitle(lang.dumpmessage)
        .setURL(s.inviteme)
        .setColor([140,190,210])
        .setDescription(f(lang.dumped, link));
      msg.channel.send(embed);
      if (!nowrite) {
        fs.writeFileSync(`./dump.txt`, sb.toString(), 'utf8', (err) => {if(err){console.error(err);}});
      }
    } else if (msg.content.startsWith(settings.prefix + "deletemsg ") || msg.content === settings.prefix + "deletemsg") {
      const url = c.dump_url,
        types = {
          guild: `guild`,
          user: `user`,
        };
      var user2,
        mode = types.user,
        id,
        link = ``;
      if (!args[1]) {
        mode = types.guild;
        user2 = msg.guild;
      } else if (!!msg.mentions.users.first()) { // true if found a mention
        user2 = msg.mentions.users.first();
      } else if (/\D/gm.test(args[1])) {
        user2 = client.users.find("username", args[1]);
      } else if (/\d{18}/.test(args[1])) {
        try {
          user2 = client.users.get(args[1]);
        } catch (e) {
          user2 = client.users.find("username", args[1]);
        }
      } else {
        user2 = client.users.find("username", args[1]);
      }
      if (!user2) return msg.channel.send(invalid_args);
      id = user2.id;
      if (mode === types.guild) {
        link = `${c.data_baseurl}/servers/${id}/messages.log`;
        fs.writeFileSync(`./data/servers/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8', (err) => {if(err){console.error(err);}});
      } else if (mode === types.user) {
        link = `${c.data_baseurl}/users/${id}/messages.log`;
        fs.writeFileSync(`./data/users/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8', (err) => {if(err){console.error(err);}});
      } else {
        await msg.channel.send(f(lang.error, lang.errors.types_are_not_specified));
        throw new TypeError("Types are not specified or invalid type.");
      }
      let embed = new discord.RichEmbed()
        .setTitle(lang.dumpmessage)
        .setURL(s.inviteme)
        .setColor([140,190,210])
        .setDescription(f(lang.deleted, link));
      msg.channel.send(embed);
    } else if (msg.content.startsWith(settings.prefix + "listemojis ") || msg.content === settings.prefix + "listemojis") {
      const emojiList = msg.guild.emojis.map(e=>e.toString()).join(" ");
      if (args[1] === `escape`) {
        msg.channel.send(`\`\`\`${emojiList}\`\`\``);
      } else {
        msg.channel.send(`${emojiList}`);
      }
    } else if (msg.content.startsWith(settings.prefix + "language ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (!args[1] || args[1] === "help") {
        let embed = new discord.RichEmbed()
          .setTitle(lang.langnotsupported)
          .setDescription(lang.availablelang)
          .addField("日本語", "ja")
          .addField("English", "en");
        msg.channel.send(embed);
      } else if (args[1] === "en" || args[1] === "ja") {
        let set = settings;
        set.language = args[1];
        writeSettings(guildSettings, set, msg.channel, "language");
      }
    } else if (msg.content === settings.prefix + "log") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const src = fs.createReadStream("latest.log", "utf8");
      src.on('data', chunk => msg.author.send("```" + chunk + "```"));
    } else if (msg.content === settings.prefix + "reload" || msg.content.startsWith(settings.prefix + "reload ")) {
      if (msg.author.id !== "254794124744458241") return msg.channel.send(lang.noperm);
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      console.log("Reloading!");
      if (args[1] === `restart`) { await msg.channel.send(lang.rebooting); return process.kill(process.pid, 'SIGKILL'); }
      delete require.cache[require.resolve(guildSettings)];
      delete require.cache[require.resolve(userFile)];
      delete require.cache[require.resolve(bansFile)];
      delete require.cache[require.resolve(`./lang/ja.json`)];
      delete require.cache[require.resolve(`./lang/en.json`)];
      msg.channel.send(`:ok_hand:`);
    } else {
      let sb = new StringBuilder(``),
      cmd = `${args[0]} ${args[1]}`.replace(` undefined`, ``);
      for(var i = 0; i < commandList.length; i++) {
        commandList[i].no = levenshtein(`${cmd}`, commandList[i].body);
      }
      commandList.sort((a, b) => {
        return a.no - b.no;
      });
      for (var i = 0; i < commandList.length; i++) {
        if (commandList[i].no <= 2) {
          sb.append(`・\`${settings.prefix}${commandList[i].body}${commandList[i].args}\`\n`);
        }
      }
      msg.channel.send(f(lang.no_command, cmd));
      if (sb.toString() != ``) {
        msg.channel.send(f(lang.didyoumean, `\n${sb.toString()}`));
      }
    }
    } else {
      return msg.channel.send(lang.udonthaveperm);
    }
  }
 }
 settings = null;
});

process.on('SIGINT', function() {
  setTimeout(() => {
    console.log(`Exiting`);
    process.exit();
  }, 5000)
  console.log("Caught INT signal, shutdown.");
  client.destroy();
});

function writeSettings(settingsFile, wsettings, channel, config, message = true) {
  fs.writeFileSync(settingsFile, JSON.stringify(wsettings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  if (message) {
    channel.send(f(lang.setconfig, config));
  }
}

client.on("guildMemberAdd", member => {
  userFile = `./data/users/${member.user.id}/config.json`;
  if (!fs.existsSync(userFile)) {
    console.log(`Creating ${userFile}`);
    fs.writeFileSync(userFile, JSON.stringify(defaultUser, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  var serverFile = `./data/servers/${member.guild.id}/config.json`;
  if (!fs.existsSync(serverFile)) {
    console.log(`Creating ${serverFile}`);
    fs.writeFileSync(serverFile, JSON.stringify(defaultSettings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  let serverSetting = require(serverFile);
  let userSetting = require(userFile);
  if (!serverSetting.banned) {
    if (serverSetting.banRep <= userSetting.rep && serverSetting.banRep != 0) {
      member.guild.ban(member)
        .then(user => console.log(f(lang.autobanned, member.user.tag, user.id, member.guild.name, member.guild.id)))
        .catch(console.error);
    } else if (serverSetting.notifyRep <= userSetting.rep && serverSetting.notifyRep != 0) {
      member.guild.owner.send(`${member.user.tag}は評価値が${serverSetting.notifyRep}以上です(ユーザーの評価値: ${userSetting.rep})`);
    }
  } else {
    msg.channel.send(f(lang.error, lang.errors.server_banned));
  }
  if (serverSetting.autorole != null) {
    async function process() {
      let role = await member.guild.roles.get(serverSetting.autorole);
      member.addRole(role);
      console.log(`Role(${role.name}) granted for: ${member.tag} in ${member.guild.name}(${member.guild.id})`);
    }
    process();
  }
});

function getDateTime()
{
    var date = new Date();
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    ].join( '/' ) + ' ' + date.toLocaleTimeString();
}

try {
  client.login(Buffer.from(Buffer.from(Buffer.from(s.token, `base64`).toString(`ascii`), `base64`).toString(`ascii`), `base64`).toString(`ascii`))
    .catch(error);
  function error() {
    return console.error(`incorrect password`);
  }
} catch (e) {
  console.error(e);
  return console.error(`incorrect password`);
}
