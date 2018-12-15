
module.exports = (argv) => {
  const args = { debug: {}, flags: [] }
  argv.forEach(arg => {
    if (arg.includes('--') && arg.includes('=') && !arg.startsWith('--debug=')) {
      arg = arg.replace(/--/gm, '')
      const argval = arg.split('=')
      Object.assign(args, {[argval[0]]: argval[1]})
    } else if (!arg.includes('=') && arg.includes('--enable-')) {
      arg = arg.replace(/--enable-/gm, '')
      if (arg === 'debug') arg = 'debugg'
      Object.assign(args, {[arg]: true})
    } else if (!arg.includes('=') && arg.includes('--disable-')) {
      arg = arg.replace(/--disable-/gm, '')
      if (arg === 'debug') arg = 'debugg'
      Object.assign(args, {[arg]: false})
    } else if (arg.startsWith('--debug=')) {
      arg = arg.replace(/--debug=/gm, '')
      arg.split(',').forEach(a => Object.assign(args.debug, {[a]: true}))
    } else if (arg.startsWith('-')) { // flags
      const flags = arg.replace('-', '').split('')
      Object.assign(args, {flags: flags})
    }
    if (arg === '--dryrun' || arg === '--dry-run') Object.assign(args, {'dryrun': true})
  })
  return args
}
