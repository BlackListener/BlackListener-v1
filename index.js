const f = require('string-format'), // Load & Initialize string-format
  now = require("performance-now"),
  Discord = require('discord.js'), // Load discord.js
  client = new Discord.Client(), // Initialize Client.
  c = require('./config.json'), // Config file
  mkdirp = require('mkdirp'), // Make Directory
  util = require('util'),
  fetch = require('node-fetch'),
  os = require('os'),
  DBL = require("dblapi.js"),
  randomPuppy = require("random-puppy"),
  fsp = require('fs').promises, // File System
  exec = util.promisify(require('child_process').exec),
  crypto = require("crypto"),
  StringBuilder = require('node-stringbuilder'), // String Builder
  isWindows = process.platform === "win32", // windows: true, other: false
  FormData = require('form-data'),
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
    welcome_channel: null,
    welcome_message: null,
    mute: [],
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
    {"body": `help`, "args": ` [Command]`},
    {"body": `shutdown`, "args": ` [-f]`},
    {"body": `token`, "args": ``},
    {"body": `setprefix`, "args": ` <Prefix>`},
    {"body": `ban`, "args": ` [<ID/Mentions/Name> <Reason> <Probe>]`},
    {"body": `unban`, "args": ` <ID/Mentions/Name> *Not recommended*`},
    {"body": `language`, "args": ` <ja/en>`},
    {"body": `setnotifyrep`, "args": ` <0...10>`},
    {"body": `setbanrep`, "args": ` <0...10>`},
    {"body": `antispam`, "args": ``},
    {"body": `antispam toggle`, "args": ``},
    {"body": `antispam disable`, "args": ``},
    {"body": `antispam enable`, "args": ``},
    {"body": `antispam ignore`, "args": ` <Channel>`},
    {"body": `antispam status`, "args": ` [Channel]`},
    {"body": `reload`, "args": ``},
    {"body": `setnick`, "args": ` <NewName> [User]`},
    {"body": `setnickname`, "args": ` <NewName> [User]`},
    {"body": `purge`, "args": ` [number/all]`},
    {"body": `purge gdel`, "args": ``},
    {"body": `purge gdel-msg`, "args": ``},
    {"body": `purge gdel-really`, "args": ``},
    {"body": `purge remake`, "args": ` <Channel>`},
    {"body": `togglepurge`, "args": ` [enable/disable]`},
    {"body": `dump`, "args": ` [guilds|users|channels|emojis|messages]`},
    {"body": `listemojis`, "args": ` [escape]`},
    {"body": `invite`, "args": ` [GuildID] [create] or [allow/deny]`},
    {"body": `role`, "args": ` <Role> [User]`},
    {"body": `autorole`, "args": ` [add/remove] <Role>`},
    {"body": `say`, "args": ` <Message>`},
    {"body": `sayd`, "args": ` <Message>`},
    {"body": `saye`, "args": ` <<Name> <ID>>`},
    {"body": `info`, "args": ``},
    {"body": `image`, "args": ``},
    {"body": `image anime`, "args": ``},
    {"body": `image nsfw`, "args": ` confirm`},
    {"body": `image r18`, "args": ` confirm`},
    {"body": `image 閲覧注意`, "args": ` confirm`},
    {"body": `image`, "args": ` nsfw|r18|閲覧注意 confirm`},
    {"body": `image custom`, "args": ` <subreddit>`},
    {"body": `didyouknow`, "args": ` <User:Guild> [:server]`},
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
    {"body": `leave`, "args": ``},
    {"body": `instantban`, "args": ``},
    {"body": `instantkick`, "args": ``},
    {"body": `resetnick`, "args": ` [User]`},
    {"body": `serverinfo`, "args": ``},
    {"body": `setwelcome`, "args": ` [channel:message] [Channel:Message]`},
    {"body": `mute`, "args": ` <User>`},
    {"body": `banned`, "args": ``},
    {"body": `talkja`, "args": ` <話しかけたいこと(日本語のみ)>`},
    {"body": `eval`, "args": ` <program>`},
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
  s, // Tokens, and invite link.
  isTravisBuild = false,
  plugins = {
    run: null,
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
            let embed = new Discord.RichEmbed().setTitle(":wastebasket: ロールから削除").setColor([255,0,0]).setDescription("ロール[" + rolename + "] から削除しました。");
            msg.channel.send(embed);
          } else {
            member.addRole(role).catch(console.error);
            let embed = new Discord.RichEmbed().setTitle(":heavy_plus_sign: ロールへ追加").setColor([0,255,0]).setDescription("ロール[" + rolename + "] へ追加しました。");
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

client.on('warn', (warn) => {
  console.warn(`Got Warning from Client: ${warn}`);
});

client.on('disconnect', () => {
  console.info("Disconnected from Websocket.");
  process.exit();
});

client.on('reconnecting', () => {
  console.error("Got Disconnected from Websocket, Reconnecting!");
});

if (process.argv[2]) {
  if (process.argv[2] === `--travis-build`) {
    s = require("./travis.json");
    isTravisBuild = true;
  }
}
if (!s) s = require("./secret.json");
client.on('ready', async () => {
  if (!isTravisBuild) {
    setInterval(() => {
      dbl.postStats(client.guilds.size, null, null);
    }, 1800000);
  }
  await mkdirp(`./plugins`);
  await mkdirp(`./data/servers`);
  await mkdirp(`./data/users`);
  plugins.run = function () {
    return false; // always return false, not implemented!
  }
  // plugins.files.push();
  bansFile = `./data/bans.json`;
  if (!existsSync(bansFile)) {
    console.log(`Creating ${bansFile}`);
    fsp.writeFile(bansFile, JSON.stringify(defaultBans, null, 4), 'utf8').catch(console.error);
  }
  if (!existsSync(`./data/global_servers.json`)) {
    fsp.writeFile(`./data/global_servers.json`, JSON.stringify(global, null, 4), 'utf8').catch(console.error);
  }
  if (!existsSync(`./data/global_channels.json`)) {
    fsp.writeFile(`./data/global_channels.json`, JSON.stringify(global, null, 4), 'utf8').catch(console.error);
  }
  client.user.setActivity(`${c.prefix}help | Hello @everyone!`);
  client.setTimeout(() => {
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`);
  }, 10000);
  console.log(`Bot has Fully startup.`);
  if (isTravisBuild) {
    console.log(`Shutting down...`);
    await client.destroy();
    process.exit();
  }
});

var dbl;
if (!isTravisBuild) dbl = new DBL(s.dbl, client);

client.on('message', async msg => {
 var attachments = new StringBuilder("Not found");
 if (msg.attachments.first())
 msg.attachments.forEach((attr) => {
   attachments.clear();
   attachments.append(`${attr.url}\n`);
 });
 if (msg.system || msg.author.bot) return;
 //if (msg.channel instanceof Discord.DMChannel && !msg.author.bot) { msg.author.send(`:ok_hand:`); return await client.users.get("254794124744458241").send(`Message: ${msg.content}\nSender: ${msg.author.tag} (${msg.author.id})\nSent at: ${msg.createdAt}\nAttachment: ${attachments.toString()}`); }
  if (!msg.guild) return msg.channel.send("Currently not supported DM");
 guildSettings = `./data/servers/${msg.guild.id}/config.json`;
 await mkdirp(`./data/users/${msg.author.id}`);
 await mkdirp(`./data/servers/${msg.guild.id}`);
 userMessagesFile = `./data/users/${msg.author.id}/messages.log`;
 serverMessagesFile = `./data/servers/${msg.guild.id}/messages.log`;
 let parentName;
 var userFile;
 if (msg.channel.parent) {
  parentName = msg.channel.parent.name;
 }
 try {
  userFile = `./data/users/${msg.author.id}/config.json`;
  if (!existsSync(userFile)) {
   console.log(`Creating ${userFile}`);
   await fsp.writeFile(userFile, JSON.stringify(defaultUser, null, 4));
  }
  if (!existsSync(guildSettings)) {
   console.log(`Creating ${guildSettings}`);
   await fsp.writeFile(guildSettings, JSON.stringify(defaultSettings, null, 4));
  }
 } catch (e) {
  try {
   userFile = `./data/users/${msg.author.id}/config.json`;
   if (!existsSync(userFile)) {
    console.log(`Creating ${userFile}`);
    await fsp.writeFile(userFile, JSON.stringify(defaultUser, null, 4), 'utf8');
   }
   if (!existsSync(guildSettings)) {
    console.log(`Creating ${guildSettings}`);
    await fsp.writeFile(guildSettings, JSON.stringify(defaultSettings, null, 4), 'utf8');
   }
  } catch (e) {console.error(e);}
 }
 user = require(userFile);
 settings = require(guildSettings);
 if (msg.channel.id !== settings.excludeLogging) {
  fsp.appendFile(userMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n`);
  fsp.appendFile(serverMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n`);
 }
 client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`);
 bans = require(bansFile);
  if (!settings.mute) {
    settings.mute = [];
    await fsp.writeFile(guildSettings, JSON.stringify(settings, null, 4), 'utf8');
  }
  // --- Begin of Mute
  if (~settings.mute.indexOf(msg.author.id) && !settings.banned) {
    msg.delete(0);
  }
  // --- End of Mute
 if (!msg.author.bot) {
  var userChanged = false, serverChanged = false;
  if (!user.bannedFromServer) {
    user.bannedFromServer = [];
    userChanged = true;
  }
  if (!user.bannedFromServerOwner) {
    user.bannedFromServerOwner = [];
    userChanged = true;
  }
  if (!user.bannedFromUser) {
    user.bannedFromUser = [];
    userChanged = true;
  }
  if (!user.probes) {
    user.probes = [];
    userChanged = true;
  }
  if (!settings.group) {
    settings.group = [];
    serverChanged = true;
  }
  if (!settings.excludeLogging) {
    settings.excludeLogging = ``;
    serverChanged = true;
  }
  if (!settings.invite) {
    settings.invite = false;
    serverChanged = true;
  }
  if (!settings.welcome_channel) {
    settings.welcome_channel = null;
    serverChanged = true;
  }
  if (!settings.welcome_message) {
    settings.welcome_message = null;
    serverChanged = true;
  }
  if (userChanged) await fsp.writeFile(userFile, JSON.stringify(user, null, 4), 'utf8');
  if (serverChanged) await fsp.writeFile(guildSettings, JSON.stringify(settings, null, 4), 'utf8');
  lang = require(`./lang/${settings.language}.json`); // Processing message is under of this

  // --- Begin of Auto-ban
  if (!settings.banned) {
    if (settings.banRep <= user.rep && settings.banRep != 0) {
      msg.guild.ban(msg.author)
        .then(user => console.log(f(lang.autobanned, msg.author.tag, user.id, msg.guild.name, msg.guild.id)))
        .catch(console.error);
    }
  }
  // --- End of Auto-ban

  // --- Begin of Global chat [ - - - Removed feature, I will create new system - - - ]
  // --- End of Global chat

  // --- Begin of Anti-spam
  if (settings.antispam && !~settings.ignoredChannels.indexOf(msg.channel.id) && !msg.author.bot) {
    var status = false;
    if (/(\S)\1{15,}/gm.test(msg.content)) {
      status = true;
      if (settings.banned) return;
      msg.delete(0);
      msg.channel.send(lang.contains_spam);
    }
  }
  // --- End of Anti-spam

  // Disboard Fucking Message [Permanently Disabled, Never seeing this on Discord.]
  /*
  if (msg.content === "!disboard bump") {
    let embed = new Discord.RichEmbed().setImage("https://i.imgur.com/rc8mMFi.png")
      .setTitle("ディスボード: Discordサーバー掲示板").setURL("https://disboard.org/")
      .setColor([140,190,210]).setDescription("下げました :thumbsdown:\nディスボードでチェックしてね: https://disboard.org");
    msg.channel.send(embed);
  }
  */
  //

  if (msg.content.startsWith(settings.prefix)) {
    if (settings.banned && msg.author.id !== "254794124744458241") { settings = null; return msg.channel.send(f(lang.error, lang.errors.server_banned)); }
    const args = msg.content.replace(settings.prefix, "").split(` `);
    if (msg.content.startsWith(c.prefix + "say ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
          var commandcut = msg.content.substr(`${settings.prefix}say `.length);
          var message = "";
          var argumentarray = commandcut.split(" ");
          argumentarray.forEach(function(element) {
              message += element + " ";
          }, this);
          return msg.channel.send(message);
    } else if (msg.content.startsWith(c.prefix + "saye ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      msg.delete(0).catch(console.error);
      return msg.channel.send(`<:${args[1]}:${args[2]}>`);
    } else if (msg.content.startsWith(c.prefix + "sayd ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
          var commandcut = msg.content.substr(`${settings.prefix}sayd `.length);
          var message = "";
          var argumentarray = commandcut.split(" ");
          argumentarray.forEach(function(element) {
              message += element + " ";
          }, this);
          msg.delete(0).catch(console.error);
          return msg.channel.send(message);
    } else if (args[0] === 'image') {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      const sendImage = async list => {
        msg.channel.send(lang.searching);
        if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw);
        const sub = list[Math.round(Math.random() * (list.length - 1))];
        const url = await randomPuppy(sub);
        const bin = await fetch(url).then(res => res.buffer());
        const embed = new Discord.RichEmbed().attachFile(bin);
        msg.channel.send(embed).catch(msg.channel.send);
      }
      if (args[1] === "custom") {
        if(/\s/gm.test(args[2])) return msg.channel.send(lang.cannotspace);
        return await sendImage([args[2]]);
      } else if (args[1] === "anime") {
        return await sendImage([
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
        ]);
      } else if (["nsfw", "閲覧注意", "r18"].includes(args[1])) {
        if (args[1] !== "r18" && args[2] === "confirm") {
          /* Confirm command! */
          return await sendImage([
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
          ]);
        } else {
          /* Normal NSFW */
          await sendImage([
            'HENTAI_GIF',
            'hentai_irl',
            'NSFW_Wallpapers',
            'SexyWallpapers',
            'HighResNSFW',
            'nsfw_hd',
            'UHDnsfw'
          ]);
          return msg.channel.send("Greater NSFWはこちら: `" + settings.prefix + "image nsfw confirm`");
        }
      } else {
        let embed = new Discord.RichEmbed().setImage("https://i.imgur.com/rc8mMFi.png").setTitle("引数が").setColor([0,255,0])
        .setDescription(":thumbsdown: 足りないのでコマンド実行できなかったよ :frowning:\n:thumbsdown: もしくは引数が間違ってるよ :frowning:");
        return msg.channel.send(embed).catch(console.error);
      }
    } else if (msg.content === settings.prefix + "info") {
        const graph = `Device          Total  Used Avail Use% Mounted on\n`;
        var o1 = `利用不可`,
          o2 = ``,
          loadavg = `利用不可`,
          invite = s.inviteme;
        if (!isWindows) {
          var { stdout, stderr } = await exec("df -h | grep /dev/sda");
          o1 = ":thinking:"; // stdout;
          var { stdout, stderr } = await exec("df -h | grep /dev/sda");
          o2 = stdout;
          loadavg = Math.floor(os.loadavg()[0] * 100) / 100;
        }
        let embed = new Discord.RichEmbed()
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
          .setDescription(`[${lang.info.invite}](${invite})\n[${lang.info.source}](${c.github})\n[![Discord Bots](https://discordbots.org/api/widget/456966161079205899.svg)](https://discordbots.org/bot/456966161079205899)`)
          .setFooter(`Sent by ${msg.author.tag}`);
      return msg.channel.send(embed);
    } else if (msg.content.startsWith(settings.prefix + "encode ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      let cmd = settings.prefix + "encode ";
      return await msg.channel.send(new Buffer.from(msg.content.slice(cmd.length)).toString(`base64`));
    } else if (msg.content.startsWith(settings.prefix + "decode ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      return await msg.channel.send(new Buffer.from(args[1], `base64`).toString(`ascii`));
    } else if (msg.content.startsWith(settings.prefix + "encrypt ")) {
      if (!args[2]) return msg.channel.send(lang.invalid_args);
      var cipher = crypto.createCipher('aes192', args[2]);
      cipher.update(args[1], 'utf8', 'hex');
      var encryptedText = cipher.final('hex');
      return await msg.channel.send(f(lang.encrypted, args[1], args[2], encryptedText));
    } else if (msg.content.startsWith(settings.prefix + "decrypt ")) {
      if (!args[2]) return await msg.channel.send(lang.invalid_args);
      var decipher,dec;
      try {
        decipher = crypto.createDecipher('aes192', args[2]);
        decipher.update(args[1], 'hex', 'utf8');
        dec = decipher.final('utf8');
      } catch (e) {
        return await msg.channel.send(f(lang.invalid_password, args[2]));
      }
      return await msg.channel.send(f(lang.decrypted, args[1], args[2], dec));
    } else if (msg.content.startsWith(settings.prefix + "didyouknow ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      if (args[2] === "server") {
        let know = client.guilds.find("name", args[1]);
        if (!know) know = client.guilds.get(args[1]);
        if (!know) {
          return await msg.channel.send(f(lang.unknown, args[1]));
        } else {
          return await msg.channel.send(f(lang.known, `${know.name} (${know.id})`));
        }
      }
      let know = client.users.find("username", args[1]);
      if (!know) know = msg.mentions.users.first();
      if (!know) know = client.users.get(args[1]);
      if (!know) {
        return await msg.channel.send(f(lang.unknown, args[1]));
      } else {
        return await msg.channel.send(f(lang.known, `${know.tag} (${know.id})`));
      }
    } else if (msg.content === settings.prefix + "members") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      return await msg.channel.send(msg.guild.members.size);
    } else if (msg.content === settings.prefix + "banned") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      return await msg.channel.send(lang.wrong_banned);
    } else if (msg.content.startsWith(settings.prefix + "music") || msg.content.startsWith(settings.prefix + "play")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      return await msg.channel.send(f(lang.musicbotis, s.musicinvite));
    } else if (msg.content.startsWith(settings.prefix + "docs") || msg.content === settings.prefix + "docs") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      msg.channel.send(lang.deprecated);
      if (args[1]) { return await msg.channel.send(f(`http://go.blacklistener.tk/go/commands/${args[1]}`)) } else { return await msg.channel.send(f(`http://go.blacklistener.tk/go/commands`)); }
    } else if (msg.content === settings.prefix + "help" || msg.content.startsWith(settings.prefix + "help ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      if (args[1]) return await msg.channel.send(f(`http://go.blacklistener.tk/go/commands/${args[1]}`));
      let prefix = settings.prefix,
        embed = new Discord.RichEmbed()
        .setTitle(f(lang.commands.title, c.version))
        .setTimestamp()
        .setColor([0,255,0])
        .addField(`${prefix}setprefix`, lang.commands.setprefix)
        .addField(`${prefix}ban [<User> <Reason> <Probe>] | ${prefix}unban`, `${lang.commands.ban} | ${lang.commands.unban}`)
        .addField(`${prefix}language`, lang.commands.language)
        .addField(`${prefix}setnotifyrep | ${prefix}setbanrep`, `${lang.commands.setnotifyrep} | ${lang.commands.setbanrep}`)
        .addField(`${prefix}antispam`, lang.commands.antispam)
        .addField(`${prefix}dump [guilds|users|channels|emojis|messages] [messages:delete/size]`, lang.commands.dump)
        .addField(`${prefix}invite [GuildID] [create] or [allow/deny]`, lang.commands.invite)
        .addField(`${prefix}role <role> [user] __/__ ${prefix}autorole [add/remove] <role>`, `${lang.commands.role}\n${lang.commands.autorole}`)
        .addField(`${prefix}image [nsfw|閲覧注意|anime|custom] [confirm|confirm| |subreddit]`, lang.commands.image)
        .addField(`${prefix}lookup <User>`, lang.lookup.desc)
        .addField(lang.commands.others, lang.commands.athere);
      return await msg.channel.send(embed);
    } else if (msg.content === settings.prefix + "serverinfo") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      var prefix = lang.sunknown,
        language = lang.sunknown,
        notifyRep = lang.unknownorzero,
        banRep = lang.unknownorzero,
        antispam = lang.disabled,
        banned = lang.no,
        disable_purge = lang.yes,
        ignoredChannels = lang.no,
        autorole = lang.disabled,
        global = lang.disabled,
        group = lang.no,
        excludeLogging = lang.disabled,
        invite = lang.disallowed,
        welcome_channel = lang.disabled,
        welcome_message = lang.disabled,
        muteSB = new StringBuilder(lang.no),
        ignoredChannelsSB = new StringBuilder(lang.no);
      if (settings.prefix) prefix = `\`${settings.prefix}\``;
      if (settings.language) language = `\`${settings.language}\``;
      if (settings.notifyRep) notifyRep = settings.notifyRep;
      if (settings.banRep) banRep = settings.banRep;
      if (settings.antispam) antispam = lang.enabled;
      if (settings.banned) banned = lang.yes;
      if (settings.disable_purge) disable_purge = lang.no;
      if (settings.autorole) autorole = `${lang.enabled} (${msg.guild.roles.get(settings.autorole).name}) [${settings.autorole}]`;
      if (settings.global) global = `${lang.enabled} (${client.channels.get(settings.global).name})`;
      if (settings.group.length != 0) group = `${lang.yes} (${settings.group})`;
      if (settings.excludeLogging) excludeLogging = `${lang.enabled} (${client.channels.get(settings.excludeLogging).name}) (\`${client.channels.get(settings.excludeLogging).id}\`)`;
      if (settings.invite) invite = lang.allowed;
      if (settings.welcome_channel) welcome_channel = `${lang.enabled} (${client.channels.get(settings.welcome_channel).name})`;
      if (settings.welcome_message) welcome_message = `${lang.enabled} (\`\`\`${settings.welcome_message}\`\`\`)`;
      if (settings.ignoredChannels.length != 0) {
        ignoredChannelsSB.clear();
        settings.ignoredChannels.forEach((data) => {
          if (data) {
            if (msg.guild.channels.get(data)) {
              ignoredChannelsSB.append(`<#${data}> (${msg.guild.channels.get(data).name}) (${data})\n`);
            } else {
              ignoredChannelsSB.append(`<#${data}> ${data} (${lang.failed_to_get})\n`);
            }
          }
        });
        ignoredChannels = ignoredChannelsSB.toString();
      }
      if (settings.mute.length != 0) {
        muteSB.clear();
        settings.mute.forEach((data) => {
          if (data) {
            if (client.users.has(data)) {
              muteSB.append(`<@${data}> (${client.users.get(data).tag})\n`);
            } else {
              muteSB.append(`<@${data}> ${data} (${lang.failed_to_get})\n`);
            }
          }
        });
      }
      let embed = new Discord.RichEmbed()
        .setTitle(" - Server Information - ")
        .setColor([0,255,0])
        .setTimestamp()
        .addField(lang.serverinfo.prefix, prefix)
        .addField(lang.serverinfo.language, language)
        .addField(lang.serverinfo.notifyRep, notifyRep)
        .addField(lang.serverinfo.banRep, banRep)
        .addField(lang.serverinfo.antispam, antispam)
        .addField(lang.serverinfo.ignoredChannels, ignoredChannels)
        .addField(lang.serverinfo.banned, banned)
        .addField(lang.serverinfo.disable_purge, disable_purge)
        .addField(lang.serverinfo.autorole, autorole)
        .addField(lang.serverinfo.global, global)
        .addField(lang.serverinfo.group, group)
        .addField(lang.serverinfo.excludeLogging, excludeLogging)
        .addField(lang.serverinfo.invite, invite)
        .addField(lang.serverinfo.mute, muteSB.toString())
        .addField(lang.serverinfo.welcome_channel, welcome_channel)
        .addField(lang.serverinfo.welcome_message, welcome_message);
      return await msg.channel.send(embed);
    } else if (msg.content === settings.prefix + "status minecraft") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      msg.channel.send(lang.status.checking);
      var status = ["undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined"];
      var key,leng,data,time;
      var i = 0;
      const startTime = now();
      data = await fetch("https://status.mojang.com/check").then(res => res.json())
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
      let embed = new Discord.RichEmbed()
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
    } else if (msg.content === settings.prefix + "status fortnite") {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      if (s.fortnite_api_key === ``) return msg.channel.send(lang.no_apikey);
      msg.channel.send(lang.status.checking);
      var status = "Unknown";
      var key,leng,data,time;
      var i = 0;
      const startTime = now();
      data = await fetch("https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status", {
        method: "POST",
        headers: {
          "Authorization": s.fortnite_api_key,
          "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
        },
        body: new FormData().append("username", "username")
      }).then(res => res.json())
      if (data.status === "UP") {
        status = lang.status.ok;
      } else if (data.status === "DOWN") {
        status = lang.status.down;
      } else {
        status = lang.status.unknown;
      }
      const endTime = now();
      time = endTime - startTime;
      let embed = new Discord.RichEmbed()
        .setTitle(lang.status.title)
        .setURL("https://status.epicgames.com")
        .setColor([0,255,0])
        .setFooter(f(lang.status.time, Math.floor(time)))
        .setTimestamp()
        .addField(lang.status.servers.fortnite, status);
      return msg.channel.send(embed);
    } else if (msg.content.startsWith(settings.prefix + "talkja ")) {
      console.log(f(lang.issueduser, msg.author.tag, msg.content));
      if (s.talk_apikey === ``) return msg.channel.send(lang.no_apikey);
      var status = "？？？";
      var key,leng,data,time;
      var i = 0;
      const startTime = now();
      const header = {
        "x-api-key": s.talk_apikey,
        "Content-Type": "application/json",
      };
      const resreg = await fetch('https://api.repl-ai.jp/v1/registration', { method: 'POST', body: "{botId: sample}", headers: header });
      if (resreg.status !== 200) return msg.channel.send(lang.returned_invalid_response);
      const resjson = await resreg.json();
      const userId = resjson.appUserId;
      let talkform = `{ "botId": "sample", "appUserId": ${userId}, "initTalkingFlag": true, "voiceText": ${args[1]}, "initTopicId": "docomoapi" }`;
      const talkheader = {
        "x-api-key": s.talk_apikey,
        "Content-Type": "application/json",
      };
      return (async function () {
        const res = await fetch('https://api.repl-ai.jp/v1/dialogue', { method: 'POST', body: talkform, headers: talkheader });
        if (res.status !== 200) return msg.channel.send(lang.returned_invalid_response);
        data = await res.json();
        status = data.systemText.expression;
        const endTime = now();
        time = endTime - startTime;
        await msg.channel.send(status.replace("#", ""));
      }) ();
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
      async function asyncprocess() {
        if (!args[1]) return await msg.channel.send(f(lang.invite_bot, s.inviteme));
        if (args[1] === `allow`) {
          settings.invite = true;
          return writeSettings(guildSettings, settings, msg.channel, "invite");
        } else if (args[1] === `deny`) {
          settings.invite = false;
          return writeSettings(guildSettings, settings, msg.channel, "invite");
        }
        if (/\D/.test(args[1])) return await msg.channel.send(lang.invalid_args);
        if (/\d{19,}/.test(args[1])) return await msg.channel.send(lang.invalid_args);
        if (!client.guilds.get(args[1])) return await msg.channel.send(lang.invalid_args);
        var sb = new StringBuilder(``);
        const thatGuild = require(`./data/servers/${client.guilds.get(args[1]).id}/config.json`);
        if (!thatGuild.invite) return await msg.channel.send(f(lang.disallowed_invite, `<@${client.guilds.get(args[1]).owner.user.id}>`));
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
          let embed = new Discord.RichEmbed()
            .setTitle(lang.invites)
            .setDescription(sb.toString())
            .setFooter(lang.invite_create)
            .setTimestamp();
          msg.channel.send(embed);
        } catch (e) {
          console.error(e);
          if (e.toString() === `TypeError: Cannot read property 'fetchInvites' of undefined`) return await msg.channel.send(lang.noguild);
        }
      }
      asyncprocess();
    } else if (msg.content.startsWith(settings.prefix + "shutdown ") || msg.content === settings.prefix + "shutdown") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (msg.author == "<@254794124744458241>") {
        if (args[1] == "-f") {
          console.log(f(lang.atmpfs, msg.author.tag));
          msg.channel.send(lang.bye);
          client.destroy();
        } else if (args[1] == "-r") {
          async function asyncprocess() {
            console.log(f(lang.rebooting));
            await msg.channel.send(lang.rebooting);
            process.kill(process.pid, 'SIGKILL');
          }
          asyncprocess();
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
      if (msg.mentions.channels.first()) {
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
        var embed = new Discord.RichEmbed();
        embed.description = "You'll need to set - add permission - 'Manage Messages' => 'Save Changes'";
        embed.setColor([255, 0, 0]);
        msg.delete(5000).catch(function (error) { msg.channel.send(":no_good: Missing permission: 'manage message'", embed); console.error("Error: missing 'manage message' permission.");});
      } else {
        msg.reply(lang.youdonthavear);
        console.log(f(lang.issuedfailadmin, msg.author.tag, msg.content, "Doesn't have Admin Role"));
      }
    } else if (msg.content.startsWith(settings.prefix + "lookup ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      var id, force = false;
      if (msg.mentions.users.first()) {
        id = msg.mentions.users.first().id;
      } else {
        if (args[2] === `--force`) { force = true; id = lang.sunknown; }
        if (!force) {
          if (/\D/gm.test(args[1])) { // True if including any 'not digits'
            try {
              id = client.users.find("username", args[1]).id; // Find user
            } catch (e) {
              try {
                id = msg.guild.members.find("nickname", args[1]).id;
              } catch (e) {
                console.error(e);
                return msg.channel.send(f(lang.unknown, args[1]));
              }
            }
          } else if (/\d{18}/.test(args[1])) {
            try {
              id = client.users.get(args[1]).id;
            } catch (e) {
              // do not use {e}
              try {
                id = client.users.find("username", args[1]).id;
              } catch (e) {
                try {
                  id = msg.guild.members.find("nickname", args[1]).id;
                } catch (e) {
                  msg.channel.send(f(lang.unknown, args[1]));
                  return console.error(e);
                }
              }
            }
          } else {
            try {
              id = client.users.find("username", args[1]).id;
            } catch (e) {
              try {
                id = msg.guild.members.find("nickname", args[1]).id;
              } catch (e) {
                console.error(e);
                return msg.channel.send(f(lang.unknown, args[1]));
              }
            }
          }
        }
      }
      var userConfig,
        user2,
        sb = new StringBuilder(`BANされていません`),
        sb2 = new StringBuilder(`BANされていません`),
        sb3 = new StringBuilder(`BANされていません`),
        isBot = lang.no;
      try {
        userConfig = require(`./data/users/${id}/config.json`);
        user2 = client.users.get(id);
      } catch (e) {
        console.error(e);
        return msg.channel.send(f(lang.unknown, args[1]));
      }
      if (!force) { if (user2.bot) isBot = lang.yes; } else { isBot = lang.sunknown; }
      try {
        for (let i=0;i<=userConfig.probes.length;i++) {
          var once = false;
          if (userConfig.bannedFromServer[i] != null) {
            if (!once) {
              sb.clear();
              sb2.clear();
              sb3.clear();
              once = true;
            }
            sb.append(`${userConfig.bannedFromServer[i]} (${userConfig.bannedFromServerOwner[i]})\n`);
          }
          if (userConfig.bannedFromUser[i] != null) sb2.append(userConfig.bannedFromUser[i] + "\n");
          if (userConfig.probes[i] != null) {
            sb3.append(userConfig.probes[i] + "\n");
          }
        }
      } catch (e) {
        sb.clear();
        sb2.clear();
        sb3.clear();
        sb.append(lang.sunknown);
        sb2.append(lang.sunknown);
        sb3.append(lang.sunknown);
      }
      const desc = force ? lang.lookup.desc + " ・ " + f(lang.unknown, args[1]) : lang.lookup.desc;
      const nick = msg.guild.members.get(user2.id) ? msg.guild.members.get(user2.id).nickname : lang.nul;
      const joinedAt = msg.guild.members.get(user2.id) ? msg.guild.members.get(user2.id).joinedAt : lang.sunknown;
      let embed = new Discord.RichEmbed()
        .setTitle(lang.lookup.title)
        .setColor([0,255,0])
        .setFooter(desc)
        .setThumbnail(user2.avatarURL)
        .addField(lang.lookup.rep, userConfig.rep)
        .addField(lang.lookup.bannedFromServer, sb.toString())
        .addField(lang.lookup.bannedFromUser, sb2.toString())
        .addField(lang.lookup.probes, sb3.toString())
        .addField(lang.lookup.tag, user2.tag)
        .addField(lang.lookup.nickname, nick)
        .addField(lang.lookup.id, user2.id)
        .addField(lang.lookup.bot, isBot)
        .addField(lang.lookup.createdAt, user2.createdAt.toLocaleString('ja-JP'))
        .addField(lang.lookup.joinedAt, joinedAt.toLocaleString('ja-JP'))
        .addField(lang.lookup.nowTime, new Date().toLocaleString('ja-JP'));
      msg.channel.send(embed);
    } else if (msg.content.startsWith(settings.prefix + "ban ") || msg.content === settings.prefix + "ban") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (!args[1] || args[1] === ``) {
        var once = false;
        var sb = new StringBuilder(`まだ誰もBANしていません`);
        require(`./data/bans.json`).forEach((data) => {
          if (data) { // Not not operator
            if (!once) {
              sb.clear();
              once = true;
            }
            try {
              sb.append(`${client.users.find("id", data).tag} (${data})\n`);
            } catch (e) {
              sb.append(`${data} (${lang.failed_to_get})\n`);
            }
          }
        });
        let embed = new Discord.RichEmbed()
          .setTitle(lang.banned_users)
          .setColor([0,255,0])
          .setDescription(sb.toString());
        msg.channel.send(embed);
      } else {
        if (msg.guild && msg.guild.available && !msg.author.bot) {
          async function asyncprocess() {
            if (!args[2]) return msg.channel.send(lang.invalid_args);
            var user2,
              fetchedBans,
              attach,
              targetUserFile,
              reason;
            reason = args[2];
            if (args[3] !== `--force`) { if (~user.bannedFromServerOwner.indexOf(msg.guild.ownerID) && ~user.bannedFromServer.indexOf(msg.guild.id) && ~user.bannedFromUser.indexOf(msg.author.id)) return msg.channel.send(lang.already_banned); }
            if (msg.mentions.users.first()) {
              user2 = msg.mentions.users.first();
            } else if (/\d{18}/.test(args[1])) {
              args[1] = args[1].replace("<@", "").replace(">", "");
              fetchedBans = await msg.guild.fetchBans();
              if (fetchedBans.has(args[1])) {
                user2 = fetchedBans.get(args[1]);
              } else {
                user2 = client.users.get(args[1]);
              }
            } else {
              // msg.guild.fetchMembers(args[1]);
              user2 = client.users.find("username", args[1]);
              if (!user2) user2 = client.users.get(args[1]);
            }
            if (!msg.attachments.first()) {
              return msg.channel.send(lang.invalid_args);
            } else {
              attach = msg.attachments.first().url;
            }
            if (!msg.mentions.users.first()) { /* Dummy */ } else { user = msg.mentions.users.first(); }
            if (!user2) { settings = null; return msg.channel.send(lang.invalid_user); }
            let ban = bans,
              userr = existsSync(`./data/users/${user2.id}/config.json`) ? require(`./data/users/${user2.id}/config.json`) : defaultUser;
            userr.bannedFromServerOwner.push(msg.guild.ownerID);
            userr.bannedFromServer.push(msg.guild.id);
            userr.bannedFromUser.push(msg.author.id);
            userr.probes.push(attach);
            ban.push(user2.id);
            userr.rep = ++userr.rep;
            targetUserFile = `./data/users/${user2.id}/config.json`;
            await fsp.writeFile(bansFile, JSON.stringify(ban, null, 4), 'utf8');
            await fsp.writeFile(targetUserFile, JSON.stringify(userr, null, 4), 'utf8');
            if (!msg.guild.members.has(user2.id)) return msg.channel.send(lang.banned);
            msg.guild.ban(user2, { "reason": reason })
              .then(user2 => console.log(`Banned user: ${user2.tag} (${user2.id}) from ${msg.guild.name}(${msg.guild.id})`))
              .catch(console.error);
            return msg.channel.send(lang.banned);
          }
          asyncprocess();
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
          var user2;
          if (/[0-9]................./.test(args[1])) {
            user2 = client.users.get(args[1]);
          } else {
            user2 = client.users.find("username", args[1]);
          }
          if (!msg.mentions.users.first()) { /* Dummy */ } else { user2 = msg.mentions.users.first(); }
          if (!user2) { settings = null; return msg.channel.send(lang.invalid_user); }
          let ban = bans;
          var exe = false;
          for (var i=0; i<=bans.length; i++) {
            if (bans[i] == user2.id) {
              exe = true;
              delete ban[i];
            }
          }
          if (!exe) { settings = null; return msg.channel.send(lang.notfound_user); }
          for (var i=0; i<=client.guilds.length; i++) {
            client.guilds[i].unban(user2)
              .then(user2 => console.log(`Unbanned user(${i}): ${user2.tag} (${user2.id}) from ${client.guilds[i].name}(${client.guilds[i].id})`))
              .catch(console.error);
          }
          user.rep = --user.rep;
          writeSettings(bansFile, ban, null, null, false);
          writeSettings(userFile, user, null, null, false);
          msg.channel.send(lang.unbanned);
        } else {
          msg.channel.send(lang.guild_unavailable);
        }
      }
    } else if (msg.content.startsWith(settings.prefix + "mute")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      var user2;
      try {
        user2 = client.users.find("username", args[1]).id;
      } catch (e) {
        try {
          user2 = client.users.get(args[1]).id;
        } catch (e) {
          try {
            user2 = msg.mentions.users.first().id;
          } catch (e) {
            msg.channel.send(lang.invalid_args);
            console.error(e);
          }
        }
      }
      if (!user2 || user2 === msg.author.id || user2 === client.user.id) return msg.channel.send(lang.invalid_args);
      if (~settings.mute.indexOf(user2) || args[2] === `unmute`) {
        var result = settings.mute.filter(function( item ) {
          return item !== user2;
        });
        settings.mute = result;
        // delete settings.mute[user2];
      } else if (args[2] === `mute`) {
        settings.mute.push(user2);
      } else {
        settings.mute.push(user2);
      }
      writeSettings(guildSettings, settings, msg.channel, "mute");
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
    } else if (msg.content.startsWith(settings.prefix + "setnick ") || msg.content.startsWith(settings.prefix + "setnickname ") || msg.content.startsWith(settings.prefix + "resetnick ") || msg.content === settings.prefix + "resetnick") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (args[0] === "resetnick") {
        if (/\s/gm.test(args[1]) || !args[1]) { msg.guild.me.setNickname(client.user.username); return msg.channel.send(":ok_hand:"); }
        try {
          msg.guild.members.get(client.users.find("username", args[1]).id).setNickname(msg.mentions.members.first().user.username);
          return msg.channel.send(":ok_hand:");
        } catch (e) {
          try {
            msg.guild.members.get(args[1]).setNickname(msg.mentions.members.first().user.username);
            return msg.channel.send(":ok_hand:");
          } catch (e) {
            try {
              msg.mentions.members.first().setNickname(msg.mentions.members.first().user.username);
              return msg.channel.send(":ok_hand:");
            } catch (e) {
              console.error(e);
              msg.channel.send(lang.invalid_args);
            }
          }
        }
      } else {
        if (/\s/gm.test(args[1]) || !args[1]) {
          msg.channel.send(lang.cannotspace);
        } else {
          if (args[2] != null) {
            try {
              msg.guild.members.get(client.users.find("username", args[2]).id).setNickname(args[1]);
              return msg.channel.send(":ok_hand:");
            } catch(e) {
              try {
                msg.guild.members.get(args[2]).setNickname(args[1]);
                return msg.channel.send(":ok_hand:");
              } catch (e) {
                try {
                  msg.mentions.members.first().setNickname(args[1]);
                  return msg.channel.send(":ok_hand:");
                } catch (e) {
                  console.error(e);
                  msg.channel.send(lang.invalid_args);
                }
              }
            }
          } else {
            msg.guild.me.setNickname(args[1]);
            return msg.channel.send(`:ok_hand:`);
          }
        }
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
        let embed = new Discord.RichEmbed()
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
          user2 = msg.mentions.channels.first(),
          id;
        if (!user2) user2 = msg.guild.channels.find("name", args[2]);
        if (!user2) user2 = msg.guild.channels.get(args[2]);
        id = user2 ? user2.id : `:poop:`;
        if (id === `:poop:`) return msg.channel.send(lang.invalid_args);
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
      //if (msg.author.id === "254794124744458241") {
      //  if (!msg.member.hasPermission(8)) return msg.channel.send(lang.noperm);
      //}
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
      return msg.channel.send(lang.create_global);
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
          const {size} = await fs.statSync(`./data/servers/${msg.guild.id}/messages.log`)
          msg.channel.send(f(lang.logsize, size / 1000000.0));
        } else if (args[2] === `delete`) {
          fsp.writeFile(`./data/servers/${msg.guild.id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8');
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
          sb.append(`${guild.name} (${guild.id}) [ ${c.data_baseurl}/servers/${guild.id}/messages.log ]\n`);
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
      let embed = new Discord.RichEmbed().setImage(image)
        .setTitle(lang.dumpmessage)
        .setURL(s.inviteme)
        .setColor([140,190,210])
        .setDescription(f(lang.dumped, link));
      msg.channel.send(embed);
      if (!nowrite) {
        fsp.writeFile(`./dump.txt`, sb.toString(), 'utf8');
      }
    } else if (msg.content.startsWith(settings.prefix + "setwelcome ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (args[1] === "message") {
        if (!args[2]) return msg.channel.send(lang.invalid_args);
        var commandcut = msg.content.substr(`${settings.prefix}setwelcome message `.length);
        var message = "";
        var argumentarray = commandcut.split(" ");
        argumentarray.forEach(function(element) {
          message += element + " ";
        }, this);
        settings.welcome_message = message;
        writeSettings(guildSettings, settings, msg.channel, `welcome_message`);
        msg.channel.send(lang.welcome_warning);
      } else if (args[1] === "channel") {
        if (!args[2]) return msg.channel.send(lang.invalid_args);
        var channel;
        try {
          channel = msg.guild.channels.find("name", args[2]).id;
        } catch (e) {
          try {
            channel = msg.guild.channels.get(args[2]).id;
          } catch (e) {
            try {
              channel = msg.mentions.channels.first().id;
            } catch (e) {
              return msg.channel.send(`${lang.invalid_args} (\`${e}\`)`);
              console.error(e);
            }
          }
        }
        settings.welcome_channel = channel;
        writeSettings(guildSettings, settings, msg.channel, `welcome_channel`);
        msg.channel.send(lang.welcome_warning);
      } else {
        return msg.channel.send(lang.invalid_args);
      }
    } else if (msg.content.startsWith(settings.prefix + "deletemsg ") || msg.content === settings.prefix + "deletemsg") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
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
      } else if (msg.mentions.users.first()) { // true if found a mention
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
      if (!user2) return msg.channel.send(lang.invalid_args);
      id = user2.id;
      if (mode === types.guild) {
        link = `${c.data_baseurl}/servers/${id}/messages.log`;
        fsp.writeFile(`./data/servers/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8');
      } else if (mode === types.user) {
        link = `${c.data_baseurl}/users/${id}/messages.log`;
        fsp.writeFile(`./data/users/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8');
      } else {
        await msg.channel.send(f(lang.error, lang.errors.types_are_not_specified));
        throw new TypeError("Types are not specified or invalid type.");
      }
      let embed = new Discord.RichEmbed()
        .setTitle(lang.dumpmessage)
        .setURL(s.inviteme)
        .setColor([140,190,210])
        .setDescription(f(lang.deleted, link));
      msg.channel.send(embed);
    } else if (msg.content === settings.prefix + "leave") {
      if (!msg.author.id === "254794124744458241") return msg.channel.send(lang.no_permission);
      await msg.channel.send(`:wave:`);
      msg.guild.leave();
    } else if (msg.content.startsWith(settings.prefix + "listemojis ") || msg.content === settings.prefix + "listemojis") {
      const emojiList = msg.guild.emojis.map(e=>e.toString()).join(" ");
      if (args[1] === `escape`) {
        msg.channel.send(`\`\`\`${emojiList}\`\`\``);
      } else {
        msg.channel.send(`${emojiList}`);
      }
     } else if (msg.content.startsWith(settings.prefix + "instantban ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      msg.guild.ban(client.users.get(args[1]));
      msg.channel.send(":ok_hand:");
    } else if (msg.content.startsWith(settings.prefix + "instantkick ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      msg.guild.members.get(args[1]).kick("Instant Kick by BlackListener");
      msg.channel.send(":ok_hand:");
    } else if (msg.content.startsWith(settings.prefix + "language ") || msg.content === settings.prefix + "language") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (!args[1] || args[1] === "help") {
        let embed = new Discord.RichEmbed()
          .setTitle(lang.langnotsupported)
          .setDescription(lang.availablelang)
          .addField(":flag_jp: Japanese - 日本語", "ja")
          .addField(":flag_us: English - English", "en");
        msg.channel.send(embed);
      } else if (args[1] === "en" || args[1] === "ja") {
        let set = settings;
        set.language = args[1];
        writeSettings(guildSettings, set, msg.channel, "language");
      }
    } else if (msg.content.startsWith(settings.prefix + "eval ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (msg.author.id !== "254794124744458241" || ~msg.content.indexOf("token")) return msg.channel.send(lang.noperm);
          var commandcut = msg.content.substr(`${settings.prefix}sayd `.length);
          var message = "";
          var argumentarray = commandcut.split(" ");
          argumentarray.forEach(function(element) {
              message += element + " ";
          }, this);
      try {
        const returned = client._eval(message); // _eval is PRIVATE method
        console.log(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${returned}`);
        msg.channel.send(`:ok_hand: (${returned})`);
      } catch (e) {
        console.log(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${lang.eval_error} (${e})`);
        msg.channel.send(f(lang.eval_error, e));
      }
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
      if (!plugins.run()) {
        let sb = new StringBuilder(``),
        cmd = `${args[0]} ${args[1]}`.replace(` undefined`, ``);
        for (var i = 0; i < commandList.length; i++) {
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
        msg.channel.send(f(lang.no_command, `${settings.prefix}${cmd}`));
        if (sb.toString() != ``) {
          msg.channel.send(f(lang.didyoumean, `\n${sb.toString()}`));
        }
      }
    }
    } else {
      return msg.channel.send(lang.udonthaveperm);
    }
  } else {
    if (msg.content === `<@${client.user.id}>` || msg.content === `<@!${client.user.id}>` || msg.content === `<@!${client.user.id}>`) return msg.channel.send(f(lang.prefixis, settings.prefix));
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
  fsp.writeFile(settingsFile, JSON.stringify(wsettings, null, 4), 'utf8');
  if (message) {
    channel.send(f(lang.setconfig, config));
  }
}

client.on("guildMemberAdd", async (member) => {
  var serverFile;
  await mkdirp(`./data/users/${member.user.id}`);
  await mkdirp(`./data/servers/${member.guild.id}`);
  try {
    userFile = `./data/users/${member.user.id}/config.json`;
    if (!existsSync(userFile)) {
      console.log(`Creating ${userFile}`);
      await fsp.writeFile(userFile, JSON.stringify(defaultUser, null, 4), 'utf8');
    }
    serverFile = `./data/servers/${member.guild.id}/config.json`;
    if (!existsSync(serverFile)) {
      console.log(`Creating ${serverFile}`);
      await fsp.writeFile(serverFile, JSON.stringify(defaultSettings, null, 4), 'utf8');
    }
  } catch (e) {
    try {
      userFile = `./data/users/${member.user.id}/config.json`;
      if (!existsSync(userFile)) {
        console.log(`Creating ${userFile}`);
        await fsp.writeFile(userFile, JSON.stringify(defaultUser, null, 4), 'utf8');
      }
      serverFile = `./data/servers/${member.guild.id}/config.json`;
      if (!existsSync(serverFile)) {
        console.log(`Creating ${serverFile}`);
        await fsp.writeFile(serverFile, JSON.stringify(defaultSettings, null, 4), 'utf8');
      }
    } catch (e) {console.error(e);}
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
    // msg.channel.send(f(lang.error, lang.errors.server_banned));
  }
  if (serverSetting.autorole) {
    (async function () {
      let role = await member.guild.roles.get(serverSetting.autorole);
      member.addRole(role);
      console.log(`Role(${role.name}) granted for: ${member.tag} in ${member.guild.name}(${member.guild.id})`);
    }) ();
  }
  if (!!serverSetting.welcome_channel && !!serverSetting.welcome_message) {
    let message = serverSetting.welcome_message.replace("{user}", `<@${member.user.id}>`);
    message = message.replace("{rep}", `${userSetting.rep}`);
    message = message.replace("{id}", `${member.user.id}`);
    message = message.replace("{username}", `${member.user.username}`);
    message = message.replace("{tag}", `${member.user.tag}`);
    member.guild.channels.get(serverSetting.welcome_channel).send(message);
  }
});

client.on("messageUpdate", async (old, msg) => {
 settings = require(`./data/servers/${msg.guild.id}/config.json`);
 if (msg.channel.id !== settings.excludeLogging) {
  editUserMessagesFile = `./data/users/${msg.author.id}/editedMessages.log`;
  editserverMessagesFile = `./data/servers/${msg.guild.id}/editedMessages.log`;
  fsp.appendFile(editUserMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`);
  fsp.appendFile(editServerMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`);
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

async function existsSync(path)
{
  return false;
  try {
    await fsp.access(path);
  } catch (e) {
    return false;
  }
  return true;
}

try {
  client.login(Buffer.from(Buffer.from(Buffer.from(s.token, `base64`).toString(`ascii`), `base64`).toString(`ascii`), `base64`).toString(`ascii`))
    .catch(console.error);
} catch (e) {
  console.error(e);
}
process.on('unhandledRejection', console.error);
