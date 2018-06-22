const f = require('string-format'), // Load & Initialize string-format
  discord = require('discord.js'), // Load discord.js
  client = new discord.Client(), // Initialize Client.
  s = require('./secret.json'), // Tokens, and invite link.
  c = require('./config.json'), // Config file
  mkdirp = require('mkdirp'), // Make Directory
  fs = require('fs'), // File System
  StringBuilder = require('node-stringbuilder'), // String Builder
  defaultSettings = {
    prefix: c.prefix,
    language: c.lang,
    notifyRep: c.notifyRep,
    banRep: c.banRep,
    antispam: true,
    ignoredChannels: [],
  }, // Default settings, by config.json.
  defaultBans = [], // Default settings for bans.json, blank.
  defaultUser = {
    rep: 0,
  },
  levenshtein = function (s1, s2) {if (s1 == s2) {return 0;}const s1_len = s1.length; const s2_len = s2.length; if (s1_len === 0) {return s2_len;}if (s2_len === 0) {return s1_len;}let split = false; try{split = !(`0`)[0];}catch(e){split = true;}if (split) {s1 = s1.split(``); s2 = s2.split(``);}let v0 = new Array(s1_len + 1); let v1 = new Array(s1_len + 1); let s1_idx = 0, s2_idx = 0, cost = 0; for (s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {v0[s1_idx] = s1_idx;}let char_s1 = ``, char_s2 = ``; for (s2_idx = 1; s2_idx <= s2_len; s2_idx++) {v1[0] = s2_idx; char_s2 = s2[s2_idx - 1]; for (s1_idx = 0; s1_idx < s1_len; s1_idx++) {char_s1 = s1[s1_idx]; cost = (char_s1 == char_s2) ? 0 : 1; let m_min = v0[s1_idx + 1] + 1; const b = v1[s1_idx] + 1; const c = v0[s1_idx] + cost; if (b < m_min) {m_min = b;}if (c < m_min) {m_min = c;}v1[s1_idx + 1] = m_min;}const v_tmp = v0; v0 = v1; v1 = v_tmp;}return v0[s1_len];},
  commandList = [
    {"body": `help`, "args": ``},
    {"body": `shutdown`, "args": ` [-f]`},
    {"body": `token`, "args": ``},
    {"body": `setprefix`, "args": ` <Prefix>`},
    {"body": `ban`, "args": ` <ID/Mentions/Name>`},
    {"body": `unban`, "args": ` <ID/Mentions/Name> __Not recommended__`},
    {"body": `language`, "args": ` <ja/en>`},
    {"body": `log`, "args": ``},
    {"body": `setnotifyrep`, "args": ` <0...10>`},
    {"body": `setbanrep`, "args": ` <0...10>`},
    {"body": `antispam`, "args": ``},
    {"body": `antispam toggle`, "args": ``},
    {"body": `antispam disable`, "args": ``},
    {"body": `antispam enable`, "args": ``},
    {"body": `antispam ignore`, "args": ` <チャンネル>`},
    {"body": `antispam status`, "args": ` <チャンネル>`},
  ];
var guildSettings,
  settings,
  lang,
  bansFile,
  bans,
  userFile,
  user,
  serverMessagesFile,
  userMessagesFile;

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
  client.user.setActivity(`${c.prefix}help | ${client.guilds.size}サーバー`);
  console.log(`Bot has Fully startup.`);
});

client.on('message', msg => {
 client.user.setActivity(`${c.prefix}help | ${client.guilds.size}サーバー`);
 bans = require(bansFile);
 if (!msg.author.bot) {
  if (!msg.guild) return msg.channel.send("Not supported DM or GroupDM");
  userFile = `./data/users/${msg.author.id}/config.json`;
  userMessagesFile = `./data/users/${msg.author.id}/messages.log`;
  guildSettings = `./data/servers/${msg.guild.id}/config.json`;
  serverMessagesFile = `./data/servers/${msg.guild.id}/messages.log`;
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
  if (!fs.existsSync(userFile)) {
    console.log(`Creating ${userFile}`);
    fs.writeFileSync(userFile, JSON.stringify(defaultUser, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  let parentName;
  if (msg.channel.parent) {
    parentName = msg.channel.parent.name;
  }
  fs.appendFileSync(userMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}::${msg.author.name}:${msg.author.id}] ${msg.content}\n`);
  fs.appendFileSync(serverMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}::${msg.author.name}:${msg.author.id}] ${msg.content}\n`)
  user = require(userFile);
  settings = require(guildSettings);
  lang = require(`./lang/${settings.language}.json`); // Processing message is under of this

  // --- Begin of Anti-spam
  if (settings.antispam && !~settings.ignoredChannels.indexOf(msg.channel.id)) {
    var status = false;
    if (/(.)\1{15,}/gm.test(msg.content)) status = true;
    if (status) {
      msg.delete(0);
      msg.channel.send(lang.contains_spam);
    }
  }
  // --- End of Anti-spam

  if (msg.content.startsWith(settings.prefix)) {
    const args = msg.content.replace(settings.prefix, "").split(` `);
    if (!msg.member.hasPermission(8) || msg.author != "<@254794124744458241>") return msg.channel.send(lang.udonthaveperm);
    if (msg.content === settings.prefix + "help") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      msg.channel.send(f(lang.adminhelp, settings.prefix, settings.prefix));
    } else if (msg.content.startsWith(settings.prefix + "shutdown ")) {
      console.log(f(lang.processing_cmd, msg.content, msg.author, msg.author.tag));
      if(msg.author == "<@254794124744458241>") {
        if(args[1] == "-f") {
          console.log(f(lang.atmpfs, msg.author.tag));
          msg.channel.send(lang.bye);
          client.destroy();
        } else {
          console.log(f(lang.success, msg.content));
          msg.channel.send(lang.bye);
          client.destroy();
        }
      } else {
        msg.reply(lang.noperm);
        console.log(f(lang.failednotmatch, msg.content));
      }
    } else if (msg.content === settings.prefix + "token ") {
      if (msg.author.id === "254794124744458241") {
        msg.author.send(f(lang.mytoken, client.token));
        msg.reply(lang.senttodm);
        console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
        var embed = new discord.RichEmbed();
        embed.description = "You'll need to add permission - 'Manage Messages' => 'Save Changes'";
        embed.setColor([255, 0, 0]);
        msg.delete(5000).catch(function (error) { msg.channel.send(":no_good: Missing permission: 'manage message'", embed); console.error("Error: missing 'manage message' permission.");});
      } else {
        msg.reply(lang.youdonthavear);
        console.log(f(lang.issuedfailadmin, msg.author.tag, msg.content, "Doesn't have Admin Role"));
      }
    } else if (msg.content.startsWith(settings.prefix + "ban ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if(!args[1] || args[1] === ``) {
        msg.channel.send(lang.no_args);
      } else {
        if(msg.guild && msg.guild.available && !msg.author.bot) {
          var user;
          if (/[0-9]................./.test(args[1])) {
            user = client.users.get(args[1]);
            console.log(`Caught user id: ${args[1]}(${user})`);
          } else {
            user = client.users.find("name", args[1]);
          }
          if (!msg.mentions.users.first()) { /* Dummy */ } else { user = msg.mentions.users.first(); }
          if (!user) return msg.channel.send(lang.invalid_user);
          let ban = bans,
            localUser = user;
          ban.push(user.id);
          localUser.rep = ++localUser.rep;
          for (var i=0; i<=client.guilds.length; i++) {
            client.guilds[i].ban(user)
              .then(user2 => console.log(`Banned user(${i}): ${user2.tag} (${user2.id}) from ${client.guilds[i].name}(${client.guilds[i].id})`))
              .catch(console.error);
          }
          writeSettings(bansFile, ban, msg.channel, null, false);
          writeSettings(userFile, localUser, msg.channel, null, false);
          msg.channel.send(lang.banned);
        }
      }
    } else if (msg.content.startsWith(settings.prefix + "unban ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if(!args[1] || args[1] === ``) {
        msg.channel.send(lang.no_args);
      } else {
        if(msg.guild && msg.guild.available && !msg.author.bot) {
          var user;
          if (/[0-9]................./.test(args[1])) {
            user = client.users.get(args[1]);
          } else {
            user = client.users.find("name", args[1]);
          }
          if (!msg.mentions.users.first()) { /* Dummy */ } else { user = msg.mentions.users.first(); }
          if (!user) return msg.channel.send(lang.invalid_user);
          let ban = bans,
            localUser = user;
          var exe = false;
          for (var i=0; i<=bans.length; i++) {
            if (bans[i] == user.id) {
              exe = true;
              delete ban[i];
            }
          }
          if (!exe) return msg.channel.send(lang.notfound_user);
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
    } else if (msg.content.startsWith(settings.prefix + "fixactivity ")) {
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
    } else if (msg.content.startsWith(settings.prefix + "antispam ")) {
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
        if (!msg.mentions.channels.first()) return msg.channel.send(lang.invalid_args);
        if (/\s/.test(args[2]) || !args[2]) return msg.channel.send(lang.cannotspace);
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
        if (!msg.mentions.channels.first()) return msg.channel.send(lang.invalid_args);
        let localSettings = settings,
          id = msg.mentions.channels.first().id;
        if (/\s/.test(args[2]) || !args[2]) return msg.channel.send(lang.cannotspace);
        if (~settings.ignoredChannels.indexOf(id)) {
          msg.channel.send(f(lang.antispam.status2, off));
        } else {
          msg.channel.send(f(lang.antispam.status2, on));
        }
      }
    } else if (msg.content.startsWith(settings.prefix + "language ")) {
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
    } else if (msg.content.startsWith(settings.prefix + "log ")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const src = fs.createReadStream("latest.log", "utf8");
      src.on('data', chunk => msg.author.send("```" + chunk + "```"));
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
  }
 }
});

process.on('SIGINT', function() {
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
  userFile = `./data/users/${member.user.id}.json`;
  if (!fs.existsSync(userFile)) {
    console.log(`Creating ${userFile}`);
    fs.writeFileSync(userFile, JSON.stringify(defaultUser, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  var serverFile = `./data/servers/${member.guild.id}.json`;
  if (!fs.existsSync(serverFile)) {
    console.log(`Creating ${serverFile}`);
    fs.writeFileSync(serverFile, JSON.stringify(defaultSettings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  let serverSetting = require(serverFile);
  let userSetting = require(userFile);
  if (serverSetting.banRep <= userSetting.rep && serverSetting.banRep != 0) {
    member.guild.ban(member)
      .then(user => console.log(f(lang.autobanned, member.user.tag, user.id, member.guild.name, member.guild.id)))
      .catch(console.error);
  } else if (serverSetting.notifyRep <= userSetting.rep && serverSetting.notifyRep != 0) {
    member.guild.owner.send(`${member.user.tag}は評価値が${serverSetting.notifyRep}以上です(ユーザーの評価値: ${userSetting.rep})`);
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

client.login(Buffer.from(Buffer.from(Buffer.from(s.token, `base64`).toString(`ascii`), `base64`).toString(`ascii`), `base64`).toString(`ascii`));
