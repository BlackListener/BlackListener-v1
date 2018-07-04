# BlackListener
Global Banning System for Discord.

Public Bot: [Invite](https://asyn.cf/BlackListener)

公開ボット: [招待](https://asyn.cf/BlackListener)

## How to start bot (Currently disabled)
 - `node index.js <Password>`

## How to configure `secret.json`
| Config | How to configure | 設定方法 |
| ------ | ---------------- | -------- |
| inviteme | `YOUR_CLIENT_ID_HERE` for your client id | `YOUR_CLIENT_ID_HERE` にクライアントIDを指定します |
| token | Base64 x3 encoding  | Base64で3重エンコードされたトークン |

## Commands
| Command | How does it work | どのように動くか |
| ------- | ---------------- | ---------------- |
| help | Displays Help | ヘルプを表示する |
| shutdown \[-f\] | Shutdown a Bot. | シャットダウン |
| token | Send token to your DM | トークンをDMに送る |
| fixactivity | Don't use this! | これは使わないで！ |
| ban <UserID/Name> | Attempt BAN | BANします |
| unban <UserID/Name> | Attempt UnBAN | Unbanします |
| language <./lang/*.json> | Change language | 言語を変更します |
| log | Send all logs to DM(Not working) | すべてのログをDMに送信します(動作しません) |
| setnotifyrep | Set notify reputation | 通知する評価値を設定します |
| setbanrep | Set auto ban reputation | 自動BANする評価値を設定します |
| antispam | Seeing is believing. Try it. | 百聞は一見に如かず。試してみよう。 |
| vote <args> | It's too much to write everything here. See help. | ここですべてを書くのは多すぎる。ヘルプを参照。 |
| info | Displays Bot environments | ボットの環境を表示します。 |
| reload | Reload the guild config. | ギルドの設定をリロードします。 |
| purge [all] | Delete 100 messages. | 100のメッセージを削除します。 |
| purge <number> | Delete messages of specified numbers | 指定された数メッセージを削除します |
| purge gdel | guildDelete[0]. Remove all channels, and create only one channel. | guildDelete[0]。 すべてのチャンネルを削除します、そして1つだけチャンネルを作成します。 |
| purge gdel-msg | guildDelete[1]. Remove messages of all channels. | guildDelete[1]。すべてのチャンネルからメッセージを削除します。 |
| purge gdel-really | guildDelete[2]. Remove all channels, and **not** creating any channels. | guildDelete[2]。すべてのチャンネルを削除します。そして、チャンネルは作成しません。 |
| purge remake <Channel> | Remake specified channel. | 指定されたチャンネルを再作成します。 |
| togglepurge | The `purge` command can not be used as it is, so use it for use. | `purge`コマンドはこのままでは使用できないのでこれを使用して使えるようにします。 |
| role <Role> [user] | Add/Remove role from [user], default [user] is sender. | [ユーザー]から役職を追加/削除します。[ユーザー] はデフォルトでは実行者です。
| autorole [add <role>/remove] | Settings for autorole | 自動役職の設定 |
| status <fortnite|minecraft> | Displays service status | サービスのステータスを表示します。(権限なしで実行可能) |
| lookup <User> | Displays User information. Cannot display bot information. | ユーザー情報を表示します。ボットの情報は表示できません。 |
| didyouknow <User> | Tests if bot know specificed user | ボットが指定されたユーザーを知っているかテストします |
| deletemsg [User] | Delete Messages in data folder. |
---

User has 0 rep, if you're banned a 1 time, you'll added 1 rep.

If you're banned 5 times, you'll added 5 rep.

---

Most servers are using default settings(maybe), notify reputations is `3`, default ban reputation is `5`.

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

ほとんどのサーバーはデフォルトの設定を使っています(たぶん)。通知評価値は`3`で、デフォルトの自動BAN評価値は`5`です。

そしてこれらのユーザーはBANできません:
 - Botにキャッシュされていない
 - @メンション はサポートされていません。
 - 不明なエラー
 - Discordにユーザーを削除されています (`Deleted user ???????`)
 - 執行者がBotからBANされている
 - サーバーがBotからBANされている

---

