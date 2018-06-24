const f = require('string-format'), // Load & Initialize string-format
  discord = require('discord.js'), // Load discord.js
  client = new discord.Client(), // Initialize Client.
  s = require('./secret.json'), // Tokens, and invite link.
  c = require('./config.json'), // Config file
  mkdirp = require('mkdirp'), // Make Directory
  fs = require('fs'), // File System
  StringBuilder = require('node-stringbuilder'), // String Builder
  messages = require('./messages.json'), // Used for vote command
  defaultSettings = {
    prefix: c.prefix,
    language: c.lang,
    notifyRep: c.notifyRep,
    banRep: c.banRep,
    antispam: true,
    banned: false,
    disable_purge: true,
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
    {"body": `unban`, "args": ` <ID/Mentions/Name> *Not recommended*`},
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
    {"body": `reload`, "args": ``},
    {"body": `setnick`, "args": ` <NewName>`},
    {"body": `setnickname`, "args": ` <NewName>`},
    {"body": `purge`, "args": ` [数値/all]`},
    {"body": `purge gdel`, "args": ``},
    {"body": `purge gdel-msg`, "args": ``},
    {"body": `purge gdel-really`, "args": ``},
    {"body": `vote`, "args": ` [引数]`},
    {"body": `vote create`, "args": ` <問題> <回答1...回答10>`},
    {"body": `vote start`, "args": ` <問題> <回答1...回答10>`},
    {"body": `vote list`, "args": ``},
    {"body": `vote info`, "args": ` <ID>`},
    {"body": `vote end`, "args": ` <ID>`},
    {"body": `vote close`, "args": ` <ID>`},
    {"body": `vote vote`, "args": ` <ID> <投票先番号>`},
    {"body": `togglepurge`, "args": ` [enable/disable]`},
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
      writeSettings(voteFile, vote, msg.channel);
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
    writeSettings(voteFile, vote, msg.channel);
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
        if (commandList[i].no <= 3) { // Max. Levenshtein length: 3
          sb.append(`・\`${settings.prefix}${commandList[i].body}${commandList[i].args}\`\n`);
        }
      }
      msg.channel.send(f(lang.no_command, cmd));
      if (sb.toString() != ``) {
        msg.channel.send(f(lang.didyoumean, `\n${sb.toString()}`));
      }
  }
};

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
 if (!fs.existsSync(`./data/users/${msg.author.id}`)) {
  mkdirp(`./data/users/${msg.author.id}`);
 }
 if (!fs.existsSync(`./data/servers/${msg.guild.id}`)) {
  mkdirp(`./data/servers/${msg.guild.id}`);
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
 fs.appendFileSync(userMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}::${msg.author.tag}:${msg.author.id}] ${msg.content}\n`);
 fs.appendFileSync(serverMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}::${msg.author.tag}:${msg.author.id}] ${msg.content}\n`)
 client.user.setActivity(`${c.prefix}help | ${client.guilds.size}サーバー`);
 bans = require(bansFile);
 if (!msg.author.bot) {
  if (!msg.guild) return msg.channel.send("Not supported DM or GroupDM");
  userFile = `./data/users/${msg.author.id}/config.json`;
  guildSettings = `./data/servers/${msg.guild.id}/config.json`;
  if (!fs.existsSync(guildSettings)) {
    console.log(`Creating ${guildSettings}`);
    fs.writeFileSync(guildSettings, JSON.stringify(defaultSettings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  if (!fs.existsSync(userFile)) {
    console.log(`Creating ${userFile}`);
    fs.writeFileSync(userFile, JSON.stringify(defaultUser, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
  user = require(userFile);
  settings = require(guildSettings);
  lang = require(`./lang/${settings.language}.json`); // Processing message is under of this

  if (!settings.banned) {
    if (settings.banRep <= user.rep && settings.banRep != 0) {
      member.guild.ban(member)
        .then(user => console.log(f(lang.autobanned, member.user.tag, user.id, member.guild.name, member.guild.id)))
        .catch(console.error);
    }
  }


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

  if (msg.content.startsWith(settings.prefix)) {
    if (settings.banned && msg.author.id !== "254794124744458241") { settings = null; return msg.channel.send(f(lang.error, lang.errors.server_banned)); }
    const args = msg.content.replace(settings.prefix, "").split(` `);
    if (msg.content.startsWith(`${settings.prefix}vote `) || msg.content === `${settings.prefix}vote`) return voteCmd(msg, args, settings);
    if (msg.member.hasPermission(8) || msg.author == "<@254794124744458241>") {
    if (msg.content === settings.prefix + "help") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      let prefix = settings.prefix,
        embed = new discord.RichEmbed()
        .setTitle(f(lang.commands.title, c.version))
        .setTimestamp()
        .setColor([0,255,0])
        .addField(`${prefix}shutdown`, lang.commands.shutdown)
        .addField(`${prefix}token`, lang.commands.token)
        .addField(`${prefix}setprefix`, lang.commands.setprefix)
        .addField(`${prefix}ban`, lang.commands.ban)
        .addField(`${prefix}unban`, lang.commands.unban)
        .addField(`${prefix}language`, lang.commands.language)
        .addField(`${prefix}log`, lang.commands.log)
        .addField(`${prefix}setnotifyrep`, lang.commands.setnotifyrep)
        .addField(`${prefix}setbanrep`, lang.commands.setbanrep)
        .addField(`${prefix}antispam`, lang.commands.antispam)
        .addField(`${prefix}purge`, lang.commands.purge)
        .addField(`${prefix}purge <1-99>`, lang.commands.purge_number)
        .addField(`${prefix}purge gdel`, lang.commands.purge_gdel)
        .addField(`${prefix}purge gdel-msg`, lang.commands.purge_gdel_msg)
        .addField(`${prefix}purge gdel-really`, lang.commands.purge_gdel_really)
        .addField(`${prefix}vote create <Q> <A1...A10>`, lang.commands.vote_create)
        .addField(`${prefix}vote start <Q> <A1...A10>`, lang.commands.vote_create)
        .addField(`${prefix}vote list`, lang.commands.vote_list)
        .addField(`${prefix}vote info <ID>`, lang.commands.vote_info)
        .addField(`${prefix}vote end <ID>`, lang.commands.vote_close)
        .addField(`${prefix}vote close <ID>`, lang.commands.vote_close)
        .addField(`${prefix}vote vote <ID> <1...10>`, lang.commands.vote_vote)
        .addField(`${prefix}togglepurge [enable/disable]`, lang.commands.togglepurge)
        .addField(lang.commands.warning, lang.commands.asterisk);
      msg.channel.send(embed);
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
    } else if (msg.content.startsWith(settings.prefix + "shutdown ")) {
      if (msg.author == "<@254794124744458241>") {
        if (args[1] == "-f") {
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
          if (!user) { settings = null; return msg.channel.send(lang.invalid_user); }
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
    } else if (msg.content.startsWith(settings.prefix + "purge ") || msg.content === settings.prefix + "purge") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      if (msg.author.id === "254794124744458241") {
        if (!msg.member.hasPermission(8)) return msg.channel.send(lang.no_perm);
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
    } else if (msg.content.startsWith(settings.prefix + "setnick") || msg.content.startsWith(settings.prefix + "setnickname ")) {
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
        if (!msg.mentions.channels.first()) { settings = null; return msg.channel.send(lang.invalid_args); }
        let localSettings = settings,
          id = msg.mentions.channels.first().id;
        if (/\s/.test(args[2]) || !args[2]) { settings = null; return msg.channel.send(lang.cannotspace); }
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
    } else if (msg.content === settings.prefix + "log") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const src = fs.createReadStream("latest.log", "utf8");
      src.on('data', chunk => msg.author.send("```" + chunk + "```"));
    } else if (msg.content === settings.prefix + "reload") {
      if (msg.author.id !== "254794124744458241") return msg.channel.send(lang.noperm);
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      console.log("Reloading!");
      delete require.cache[require.resolve(guildSettings)];
      delete require.cache[require.resolve(userFile)];
      delete require.cache[require.resolve(bansFile)];
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
