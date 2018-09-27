
module.exports = (argv) => {
  const args = {}
  argv.forEach(arg => {
    if (/--/.test(arg) && arg.includes('=')) {
      arg = arg.replace(/--/gm, '')
      const argval = arg.split('=')
      Object.assign(args, {[argval[0]]: argval[1]})
    } else if (!arg.includes('=') && arg.includes('--enable-')) {
      arg = arg.replace(/--enable-/gm, '')
      Object.assign(args, {[arg]: true})
    } else if (!arg.includes('=') && arg.includes('--disable-')) {
      arg = arg.replace(/--disable-/gm, '')
      Object.assign(args, {[arg]: false})
    }
  })
  return args
}
