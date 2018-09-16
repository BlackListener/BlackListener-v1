# BlackListener [![Documentation](https://readthedocs.org/projects/rht0910-demo/badge/?version=latest)](http://docs.blacklistener.tk/) [![Build Status](https://travis-ci.com/BlackListener/BlackListener.svg?branch=master)](https://travis-ci.com/BlackListener/BlackListener)

Global Banning System for Discord.

[![Discord Bots](https://discordbots.org/api/widget/456966161079205899.svg)](https://discordbots.org/bot/456966161079205899)

## Important

Do not edit src/lang files directly, managed by Crowdin(but can edit English if need).

## Startup options

- You can change default prefix without editing config, and other things!
- If you set ``BL_PREFIX`` as `a:`, BlackListener will be start with changed default prefix, `a:`.
- If you set ``ENABLE_RCON``, Enable remote control feature(Remote shutdown). It is not secure, we **highly** recommend not enable this feature.
  - Listener will start with port: 5123
  - You can remote shutdown by run ``node remote_shutdown.js``. (Target: 127.0.0.1, Port: 5123)
- Start with both options: ``BL_PREFIX="a:" ENABLE_RCON=true node index.js``

## Common Commands (Too long!)

__Default Prefix: `b:`, Configurable with `b:setprefix <Prefix>`__

This bot has in-bot help, but currently supports only English, Japanese.

Server's prefix can be show up in mention the bot.

- Invite command is cannot be used with not allowed, need to be allowed by Guild Admins.

| Command | How does it work | どのように動くか | Is needed Admin permission |
| ------- | ---------------- | ---------------- | - |
| help | Displays Help | ヘルプを表示する | No |
| shutdown \[-f\] | Shutdown a Bot. | シャットダウン | Yes |
| token | Send token to your DM | トークンをDMに送る | No, bot owner only |
| ban \<UserID\/Name\> \<Reason\> \<Probe on __Attachment__\> | Attempt BAN | BANします | Yes |
| unban \<UserID\/Name\> | Attempt UnBAN | Unbanします | Yes |
| language \<ja\/en\> | Change language | 言語を変更します | Yes |
| setprefix \<prefix\> | Set prefix. | 接頭語を設定します。 | Yes |
| setnotifyrep \<0...10\> | Set notify reputation | 通知する評価値を設定します | Yes |
| setbanrep \<0...10\> | Set auto ban reputation | 自動BANする評価値を設定します | Yes |
| antispam | Settings of Anti-spam. Recommended OFF in large servers. | アンチスパムの設定。大規模サーバーではオフ推奨。 | Yes |
| info | Displays Bot environments | ボットの環境を表示します。 | No |
| reload | Reload the guild config. | ギルドの設定をリロードします。 | Yes |
| purge \[all\] | Delete 100 messages. | 100のメッセージを削除します。 | Yes |
| purge \<number\> | Delete messages of specified numbers | 指定された数メッセージを削除します | Yes |
| togglepurge \[enable/disable\] | The `purge` command can not be used as it is, so use it for use. | `purge`コマンドはこのままでは使用できないのでこれを使用して使えるようにします。 | Yes |
| role \<Role\> [user] | Add/Remove role from [user], default [user] is sender. | [ユーザー]から役職を追加/削除します。[ユーザー] はデフォルトでは実行者です。 | Yes |
| autorole \[add \<role\>\/remove\] | Settings for autorole | 自動役職の設定 | Yes |
| status \<fortnite\|minecraft\> | Displays service status | サービスのステータスを表示します。 | No |
| lookup \<User\> | Displays User information. | ユーザー情報を表示します。 | Yes |
| didyouknow \<User\> | Tests if bot know specificed user | ボットが指定されたユーザーを知っているかテストします | No |
| setignore \<Channel\> | Set exclude from logging channel. | ロギングを指定されたチャンネルを除外するようにします | Yes |
| image \<nsfw\|r18\|anime\> | Send nsfw images... be careful. | NSFW画像を送信します...気を付けてくださいね。 | No |
| image anime | Send anime images. | アニメ画像を送信します。 | No |
| invite | Displays bot invite link. | ボットの招待リンクを表示します。 | No |
| dump \[guilds\|users\|channels\|emojis\|messages\] | Dump guilds, users, channels, emojis, messages. default is guilds. | ギルド、ユーザー、チャンネル、メッセージをダンプします。デフォルトはギルドです。 | Yes |
| setnick \| setnickname \<NewNickname\> \[User\] | Set nickname; default user is this Bot. | ニックネームを設定します、デフォルトのユーザーはこのボットです。 | Yes |
| listemojis \[escape\] | Displays all custom emojis on guild. | サーバーのすべてのカスタム絵文字を表示します。 | Yes |
| setwelcome \<message:channel\> \<Message:Channel\> | Set welcome message | ウェルカムメッセージを設定します | Yes |
... and more commands on [documentation](http://docs.blacklistener.tk/) !

---

### Welcome message Placeholder

- `{user}` ... Mention user
- `{tag}` ... `User#0000`
- `{id}` ... User ID
- `{username}` ... User name
- `{rep}` ... Reputation
- `{users}` ... Size of that guild
- `{createdAt}` ... Created that account date
- `{joinedAt}` ... Joined that account date
- `{avatarURL}` ... Avatar URL

---

User has 0 rep, if you're banned a 1 time, you'll added 1 rep.

If you're banned 5 times, you'll added 5 rep.

---

Most servers are using default settings(maybe), notify reputations is `1`, default ban reputation is `3`.

Also you can't ban that users:

- Not cached in Bot
- @Mentions is (currently) not supported
- A unknown error
- User has been deleted by Discord (`Deleted user ???????`)
- You are banned from this Bot
- Server has banned from bot

---

ユーザーは0評価値を持っています。1回BANされると、評価値が1プラスされます。

5回BANされると、評価値が5プラスされます。

---

ほとんどのサーバーはデフォルトの設定を使っています(たぶん)。通知評価値は`1`で、デフォルトの自動BAN評価値は`3`です。

そしてこれらのユーザーはBANできません:

- Botにキャッシュされていない
- @メンション はサポートされていません。
- 不明なエラー
- Discordにユーザーを削除されています (`Deleted user ???????`)
- 執行者がBotからBANされている
- サーバーがBotからBANされている

## Length of downtime

- __The downtime is very tiny, This is only restart the bot.__
- __If very long downtime(e.g. 1 days), we're having problem with Google Cloud Platform, please wait until problem is resolved.__
