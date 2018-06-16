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
  }, // Default settings, by config.json.
  defaultBans = []; // Default settings for bans.json, blank.
var guildSettings,
  settings,
  lang,
  bansFile,
  bans;


client.on('ready', () => {
  if (!fs.existsSync(`./data/servers`)) {
    mkdirp(`./data/servers`);
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
  if (!msg.guild) return msg.channel.send("Not supported DM or GroupDM");
  guildSettings = `./data/servers/${msg.guild.id}.json`;
  if (!fs.existsSync(guildSettings)) {
    console.log(`Creating ${guildSettings}`);
    fs.writeFileSync(guildSettings, JSON.stringify(defaultSettings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  }
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
      if (msg.author == "<@254794124744458241>") {
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
        msg.channel.send(":x: Arguments are missing.");
      } else {
        if(msg.guild && msg.guild.available) {
          var user;
          if (/[0-9]................./.test(args[1])) {
            user = client.users.get(args[1]);
          } else {
            user = client.users.find("name", args[1]);
          }
          if (!user) return msg.channel.send(lang.invalid_user);
          let ban = bans;
          ban.push(user.id);
          msg.guild.ban(user);
          writeSettings(bansFile, ban, msg.channel, "bans");
          msg.channel.send(lang.banned);
        }
      }
    } else if (msg.content.startsWith(settings.prefix + "unban")) {
      console.log(f(lang.issuedadmin, msg.author.tag, msg.content));
      const args = msg.content.slice(settings.prefix + "unban".length).trim().split(/ +/g);
      if(!args[1] || args[1] === ``) {
        msg.channel.send(":x: Arguments are missing.");
      } else {
        if(msg.guild && msg.guild.available) {
          var user;
          if (/[0-9]................./.test(args[1])) {
            user = client.users.get(args[1]);
          } else {
            user = client.users.find("name", args[1]);
          }
          if (!user) return msg.channel.send(lang.invalid_user);
          let ban = bans;
          var exe = false;
          for (var i=0; i<=bans.length; i++) {
            if (bans[i] == user.id) {
              exe = true;
              delete ban[i];
            }
          }
          if (!exe) return msg.channel.send(lang.notfound_user);
          msg.guild.unban(user);
          writeSettings(bansFile, ban, msg.channel, "bans");
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

function writeSettings(settingsFile, wsettings, channel, config) {
  fs.writeFileSync(settingsFile, JSON.stringify(wsettings, null, 4), 'utf8', (err) => {if(err){console.error(err);}});
  channel.send(f(lang.setconfig, config));
}

client.on("guildMemberAdd", member => {
  for (var i=0; i<=bans.length; i++) {
    if (member.id == bans[i]) {
      member.guild.ban(member);
      console.log(`Auto banned user: ${member.user.tag} (${member.user.id}) in ${member.guild.name}(${member.guild.id})`);
    }
  }
});

client.login(Buffer.from(Buffer.from(Buffer.from(s.token, `base64`).toString(`ascii`), `base64`).toString(`ascii`), `base64`).toString(`ascii`));
