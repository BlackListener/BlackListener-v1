const util = require(`./util`);
const promisify = require(`util`).promisify;
const exec = promisify(require('child_process').exec);
const mkdirp = require('mkdirp-promise');

module.exports = {
  async initWorkspace(userId) {
    try {
      await mkdirp(`./data/users/${userId}/workspace/lib/`);
      await exec(`cp -R /lib64 ./data/users/${userId}/workspace/`);
      await exec(`cp -R /lib/x86_64-linux-gnu ./data/users/${userId}/workspace/lib/`);
      await exec(`cp -R /bin ./data/users/${userId}/workspace/`);
    } catch (e) {
      return false;
    }
    return true;
  },
  async reinitWorkspace(userId) {
    await exec(`rm -rf ./data/users/${userId}/workspace/`);
    return await this.initWorkspace(userId);
  },
  async execute(userId, cmd) {
    if (await !this.check(userId)) return { status: false, code: 1, message: "Not initialized" };
    var out;
    try {
      out = await exec(`chroot ./data/users/${userId}/workspace ` + cmd);
      return { status: true, code: 0, message: out.stdout};
    } catch (e) {
      return { status: false, code: 2, message: ""};
    }
  },
  async check(userId) {
    if (await util.exists(`./data/users/${userId}/workspace`)) return true;
    return false;
  },
  async reset(userId) {
    return await exec(`rm -rf ./data/users/${userId}/workspace`);
  }
}
