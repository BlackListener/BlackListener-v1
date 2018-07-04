# BlackListener
Global Banning System for Discord.

Public Bot: [Invite](https://asyn.cf/BlackListener)

公開ボット: [招待](https://asyn.cf/BlackListener)

## All Commands (Too long!)

**If does not respond, please try Japanese. (`b:language ja`)**

__Default Prefix: `b:`, Configurable with `b:setprefix \<Prefix\>`__

 - Invite command is cannot be used with not allowed, need to be allowed by Guild Admins.

| Command | How does it work | どのように動くか | Is needed Admin permission |
| ------- | ---------------- | ---------------- | - |
| help | Displays Help | ヘルプを表示する | No |
| shutdown \[-f\] | Shutdown a Bot. | シャットダウン | Yes |
| token | Send token to your DM | トークンをDMに送る | No, bot owner only |
| fixactivity | Don't use this! | これは使わないで！ | Yes |
| ban \<UserID\/Name\> \<Reason\> \<Probe on __Attachment__\> | Attempt BAN | BANします | Yes |
| unban \<UserID\/Name\> | Attempt UnBAN | Unbanします | Yes |
| language \<ja\/en\> | Change language | 言語を変更します | Yes |
| log | Send all logs to DM(Not working) | すべてのログをDMに送信します(動作しません) | No, bot owner only |
| setprefix \<prefix\> | Set prefix. | 接頭語を設定します。 | Yes |
| setnotifyrep \<0...10\> | Set notify reputation | 通知する評価値を設定します | Yes |
| setbanrep \<0...10\> | Set auto ban reputation | 自動BANする評価値を設定します | Yes |
| antispam | Settings of Anti-spam. Recommended OFF in large servers. | アンチスパムの設定。大規模サーバーではオフ推奨。 | Yes |
| vote \<args\> | It's too much to write everything here. See help. | ここですべてを書くのは多すぎる。ヘルプを参照。 | No |
| info | Displays Bot environments | ボットの環境を表示します。 | No |
| reload | Reload the guild config. | ギルドの設定をリロードします。 | Yes |
| purge \[all\] | Delete 100 messages. | 100のメッセージを削除します。 | Yes |
| purge \<number\> | Delete messages of specified numbers | 指定された数メッセージを削除します | Yes |
| purge gdel | guildDelete\[0\]. Remove all channels, and create only one channel. | guildDelete[0]。 すべてのチャンネルを削除します、そして1つだけチャンネルを作成します。 | Yes |
| purge gdel-msg | guildDelete\[1\]. Remove messages of all channels. | guildDelete[1]。すべてのチャンネルからメッセージを削除します。 | Yes |
| purge gdel-really | guildDelete\[2\]. Remove all channels, and **not** creating any channels. | guildDelete[2]。すべてのチャンネルを削除します。そして、チャンネルは作成しません。 | Yes |
| purge remake \<Channel\> | Remake specified channel. | 指定されたチャンネルを再作成します。 | Yes |
| togglepurge | The `purge` command can not be used as it is, so use it for use. | `purge`コマンドはこのままでは使用できないのでこれを使用して使えるようにします。 | Yes |
| role \<Role\> [user] | Add/Remove role from [user], default [user] is sender. | [ユーザー]から役職を追加/削除します。[ユーザー] はデフォルトでは実行者です。 | Yes |
| autorole \[add \<role\>\/remove\] | Settings for autorole | 自動役職の設定 | Yes |
| status \<fortnite\|minecraft\> | Displays service status | サービスのステータスを表示します。 | No |
| lookup \<User\> | Displays User information. Cannot display bot information. | ユーザー情報を表示します。ボットの情報は表示できません。 | Yes |
| didyouknow \<User\> | Tests if bot know specificed user | ボットが指定されたユーザーを知っているかテストします | No |
| encode/decode \<String\> | Encode / Decode message, in base64. | メッセージをBase64でエンコード/デコードします。 | No |
| encrypt/decrypt \<String\> \<Password\> | Encrypt / Decrypt message. | メッセージを暗号化/復号化します。 | No |
| setignore \<Channel\> | Set exclude from logging channel. | ロギングを指定されたチャンネルを除外するようにします。 | Yes |
| deletemsg \[User\] | Delete messages, default is guild messages file. | メッセージを削除します。デフォルトはギルドのメッセージログです。 | Yes |
| setgroup | __Incomplete feature__ | __未完成の機能__ | Yes |
| image \<nsfw\|閲覧注意\|r18\> \[confirm\] | Send nsfw images... very very be careful. | NSFW画像を送信します...かなりかなり気を付けてくださいね。 | No |
| image anime | Send anime images. | アニメ画像を送信します。 | No |
| say \<Message\> | Send message by bot. | ボットからメッセージを送信します。 | No |
| sayd \<Message\> | Send message and delete `sayd` message. | メッセージを送信、さらに送信された元のメッセージを削除します。 | No |
| invite \[GuildID\] \[create\] or \[allow\/deny\] | Show or creates invite, if not specified, it displays bot invite. | 招待を表示または作成します。指定されない場合は、ボットの招待を表示します。 | No |
| dump \[guilds\|users\|channels\|emojis\|messages\] | Dump guilds, users, channels, emojis, messages. default is guilds. | ギルド、ユーザー、チャンネル、メッセージをダンプします。デフォルトはギルドです。 | Yes |
| setnick \| setnickname | Set nickname | ニックネームを設定します | Yes |
| listemojis \[escape\] | Displays all custom emojis on guild. | サーバーのすべてのカスタム絵文字を表示します。 | Yes |

---

User has 0 rep, if you're banned a 1 time, you'll added 1 rep.

If you're banned 5 times, you'll added 5 rep.

---

Most servers are using default settings(maybe), notify reputations is `2`, default ban reputation is `10`.

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

ほとんどのサーバーはデフォルトの設定を使っています(たぶん)。通知評価値は`2`で、デフォルトの自動BAN評価値は`10`です。

そしてこれらのユーザーはBANできません:
 - Botにキャッシュされていない
 - @メンション はサポートされていません。
 - 不明なエラー
 - Discordにユーザーを削除されています (`Deleted user ???????`)
 - 執行者がBotからBANされている
 - サーバーがBotからBANされている

---
