const fs = require("fs");
const path = require("path");
const { syncGitHub } = require("./github");
const { syncBitbucket } = require("./bitbucket");

async function run() {
  const file = path.join(process.cwd(), ".repo-env.json");
  if (!fs.existsSync(file)) throw new Error(".repo-env.json not found");

  const config = JSON.parse(fs.readFileSync(file));
  const { platform } = config;

  for (const [envName, env] of Object.entries(config)) {
    if (!env?.run || !env.variables) continue;

    console.log(`\n🚀 Syncing ${envName} → ${platform}`);

    if (platform === "github") await syncGitHub(config, envName, env.variables);
    else if (platform === "bitbucket")
      await syncBitbucket(config, envName, env.variables);
    else throw new Error(`Unsupported platform: ${platform}`);
  }
}

module.exports = { run };
