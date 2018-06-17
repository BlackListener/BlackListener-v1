const f = require('string-format'), // Load & Initialize string-format
  discord = require('discord.js'), // Load discord.js
  client = new discord.Client(), // Initialize Client.
  s = require('./secret.json'), // Tokens, and invite link.
  c = require('./config.json'), // Config file
  mkdirp = require('mkdirp'), // Make Directory
  fs = require('fs'), // File System
  defaultSettings = {
    prefix: c.prefix,
    language: c.lang,
    notifyRep: c.notifyRep,
    banRep: c.banRep,
  }, // Default settings, by config.json.
  defaultBans = [], // Default settings for bans.json, blank.
  defaultUser = {
    rep: 0,
  }
var guildSettings,
  settings,
  lang,
  bansFile,
  bans,
  userFile,
  user;

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
  client.user.setActivity(c.prefix + "help");
  console.log(`Bot has Fully startup.`);
});

client.on('message', msg => {
 bans = require(bansFile);
 if (!msg.author.bot) {
  userFile = `./data/users/${msg.author.id}.json`;
  if (!msg.guild) return msg.channel.send("Not supported DM or GroupDM");
  guildSettings = `./data/servers/${msg.guild.id}.json`;
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
  lang = require(`./lang/${settings.language}.json`);
  if (msg.content.startsWith(settings.prefix)) {
    if (!msg.member.hasPermission(8) || msg.author != "<@254794124744458241>") return msg.channel.send(lang.udonthaveperm);
    if (msg.content === settings.prefix + "help") {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      msg.channel.send(f(lang.adminhelp, settings.prefix, settings.prefix));
    } else if (msg.content.startsWith(settings.prefix + "shutdown")) {
      console.log(f(lang.processing_cmd, msg.content, msg.author, msg.author.tag));
      if(msg.author == "<@254794124744458241>") {
        const args = msg.content.slice(settings.prefix + "shutdown".length).trim().split(/ +/g);
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
    } else if (msg.content === settings.prefix + "token") {
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
    } else if (msg.content.startsWith(settings.prefix + "ban")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(settings.prefix + "ban".length).trim().split(/ +/g);
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
    } else if (msg.content.startsWith(settings.prefix + "unban")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(settings.prefix + "unban".length).trim().split(/ +/g);
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
          writeSettings(bansFile, ban, msg.channel, null, false);
          writeSettings(userFile, localUser, msg.channel, null, false);
          msg.channel.send(lang.unbanned);
        } else {
          msg.channel.send(lang.guild_unavailable);
        }
      }
    } else if (msg.content.startsWith(settings.prefix + "fixactivity")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      client.user.setActivity(settings.prefix + "help");
      msg.channel.send(":ok_hand:");
    } else if (msg.content.startsWith(settings.prefix + "setprefix")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(settings.prefix + "setprefix".length).trim().split(/ +/g);
      let set = settings;
      if (/\s/gm.test(args[1]) || args[1] == null) {
        msg.channel.send(lang.cannotspace);
      } else {
        set.prefix = args[1];
        writeSettings(guildSettings, set, msg.channel, "prefix");
      }
    } else if (msg.content.startsWith(settings.prefix + "setnotifyrep")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(settings.prefix + "setnotifyrep".length).trim().split(/ +/g);
      let set = settings;
      let n = parseInt(args[1], 10);
      let min = 0;
      let max = 10;
      let status = n >= min && n <= max;
      if (!status || args[1] == null) {
        msg.channel.send(lang.invalid_args);
      } else {
        set.notifyRep = parseInt(args[1], 10);
        writeSettings(guildSettings, set, msg.channel, "notifyRep");
      }
    } else if (msg.content.startsWith(settings.prefix + "setbanrep")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(settings.prefix + "setbanrep".length).trim().split(/ +/g);
      let set = settings;
      let n = parseInt(args[1], 10);
      let min = 0;
      let max = 10;
      let status = n >= min && n <= max;
      if (!status || args[1] == null) {
        msg.channel.send(lang.invalid_args);
      } else {
        set.banRep = parseInt(args[1], 10);
        writeSettings(guildSettings, set, msg.channel, "banRep");
      }
    } else if (msg.content.startsWith(settings.prefix + "language")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(settings.prefix + "language".length).trim().split(/ +/g);
      if (!args[1]) {
        let embed = new discord.RichEmbed()
          .setTitle(lang.langnotsupported)
          .setDescription(lang.availablelang)
          .addField("日本語", "ja")
          .addField("English", "en");
        msg.channel.send(embed);
      } else if (~args[1].indexOf("en") || ~args[1].indexOf("ja")) {
        let set = settings;
        set.language = args[1];
        writeSettings(guildSettings, set, msg.channel, "language");
      }
    } else if (msg.content.startsWith(settings.prefix + "log")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const src = fs.createReadStream("latest.log", "utf8");
      src.on('data', chunk => msg.author.send("```" + chunk + "```"));
    }
  }
 }
});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal, shutdown.");
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
  if (serverSetting.banRep <= userSetting.rep) {
//  for (var i=0; i<=bans.length; i++) {
//    if (member.id == bans[i]) {
//      for (var i=0; i<=client.guilds.array.length; i++) {
//        console.log(`${member.user.tag} will be banned from ${client.guilds.get( Array.from( client.guilds.keys() )[i] )}`);
//        client.guilds.get(Array.from(client.guilds.keys())[i]).ban(member)
//          .then(user => console.log(`Auto banned user(${i}): ${user.tag} (${user.id}) from ${client.guilds.get(Array.from(client.guilds.keys())[i])}`))
//          .catch(console.error);
          member.guild.ban(member)
//          .then(user => console.log(`Auto banned user: ${member.user.tag} (${user.id}) from ${member.guild.name}(${member.guild.id})`))
            .then(user => console.log(f(lang.autobanned, member.user.tag, user.id, member.guild.name, member.guild.id)))
            .catch(console.error);
//      }
//    } else { continue; }
//  }
  } else if (serverSetting.notifyRep <= userSetting.rep) {
    member.guild.owner.send(`${member.user.tag}は評価値が${serverSetting.notifyRep}以上です(ユーザーの評価値: ${userSetting.rep})`);
  }
});

client.login(Buffer.from(Buffer.from(Buffer.from(s.token, `base64`).toString(`ascii`), `base64`).toString(`ascii`), `base64`).toString(`ascii`));
