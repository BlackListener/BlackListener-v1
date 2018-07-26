const util = require(`./util`);
const promisify = require(`util`).promisify;
const exec = promisify(require('child_process').exec);
const mkdirp = require('mkdirp-promise');

module.exports = {
  async initWorkspace(userId) {
    try {
      await mkdirp(`./data/workspace/lib/`);
      await mkdirp(`./data/workspace/usr/lib/x86_64-linux-gnu`);
      await mkdirp(`./data/workspace/usr/bin/`);
      await mkdirp(`./data/workspace/dev`);
      await exec(`cp -R /lib64 ./data/workspace/`);
      await exec(`cp -R /lib/x86_64-linux-gnu ./data/workspace/lib/`);
      await exec(`cp -R /bin ./data/workspace/`);
      await exec(`cp -R /usr/lib/x86_64-linux-gnu/libidn.so* ./data/workspace/usr/lib/x86_64-linux-gnu/`);
      await exec(`cp -R /usr/bin/gcc ./data/workspace/usr/bin/`);
      await exec(`cp -R /usr/bin/tail ./data/workspace/usr/bin/`);
      await exec(`mknod ./data/workspace/dev/random c 1 8`)
      await exec(`chmod 777 ./data/workspace`);
      await exec(`chown anonymous:anonymous -hR ./data/workspace`);
    } catch (e) {
      return false;
    }
    return true;
  },
  async reinitWorkspace(userId) {
    await exec(`rm -rf ./data/workspace/`);
    return await this.initWorkspace(userId);
  },
  async execute(userId, cmd, config) {
    if (cmd.includes(">") || cmd.includes("<")) return { status: false, code: 3, message: "Cannot use < or > character." };
    if (await !this.check(userId)) return { status: false, code: 1, message: "Not initialized" };
    if (cmd.includes("su") || cmd.includes("sudo") || cmd.includes("curl") || cmd.includes("/proc") || cmd.includes("sysrq-trigger") || cmd.includes("mknod")) return { status: false, code: 4, message: `This command has been matched in blacklist.` };
    return exec(`chroot --userspec=anonymous:anonymous ./data/workspace ` + cmd)
      .then((out) => {
        return { status: true, code: 0, message: out.stdout };
      })
      .catch((error) => {
        let err = error.toString().replace(`Error: Command failed: chroot --userspec=anonymous:anonymous ./data/workspace ${cmd}`, "");
        return { status: false, code: 2, message: err };
      });
  },
  async check(userId) {
    if (await util.exists(`./data/workspace`)) return true;
    return false;
  },
  async reset(userId) {
    return await exec(`rm -rf ./data/workspace`);
  }
}
