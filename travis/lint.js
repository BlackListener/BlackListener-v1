const Discord = require('discord.js')
const creds = process.env.WEBHOOK.split(':')
const hook = new Discord.WebhookClient(...creds)
const CLIEngine = require('eslint').CLIEngine
const cli = new CLIEngine()
const path = require('path')
function str(severity) {
  switch (severity) {
    case 1: return 'warning'
    case 2: return 'error'
  }
}
  
function codeblock(code) {
  return '```js\n' + code + '```'
}

const report = cli.executeOnFiles(['.'])

if (report.errorCount || report.warningCount) {
  const files = report.results.filter(e => e.source)
  const hasError = report.errorCount
  const all = `${report.errorCount + report.warningCount} problems`
  const counts = `(${report.errorCount} errors, ${report.warningCount} warnings)`
  const embed = {
    description: `:${hasError ? 'x' : 'heavy_multiplication_x'}: ${all} ${counts}`,
    color: hasError ? 0xFF0000 : 0xFFFF00,
    author: {
      name: 'ESLint',
      icon_url: 'http://eslint.org/img/favicon.512x512.png',
    },
    fields: files.map(file => ({
      name: path.relative(path.join(__dirname, '..'), file.filePath),
      value: codeblock(file.messages.map(({
        line: l, column: c, severity, message, ruleId: id,
      }) => `${l}:${c} ${str(severity)} ${message} ${id}`).join('\n')),
    })),
  }
  hook.send({embeds: [embed]})
}