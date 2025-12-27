const axios = require("axios");

/**
 * Sync variables to Bitbucket Deployment Environments
 * * @param {object} cfg - Config containing token, workspace, repo
 * @param {string} envName - Target environment name (e.g., 'demo')
 * @param {Array} variables - Array of { key, value, secured }
 */
async function syncBitbucket(cfg, envName, variables) {
  const { token, workspace, repo } = cfg;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const baseUrl = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}`;

  try {
    // 1. Get Environment UUID mapping
    const envsRes = await axios.get(`${baseUrl}/environments`, { headers });
    const envMap = Object.fromEntries(
      envsRes.data.values.map((env) => [env.name.toLowerCase(), env.uuid])
    );

    const envUUID = envMap[envName.toLowerCase()];
    if (!envUUID) {
      throw new Error(`Environment "${envName}" not found in Bitbucket.`);
    }

    // 2. Get existing variables for this environment to find UUIDs
    const deploymentsUrl = `${baseUrl}/deployments_config/environments/${envUUID}/variables`;
    const varsRes = await axios.get(deploymentsUrl, { headers });
    const existingVars = varsRes.data.values;

    // 3. Sync each variable
    for (const v of variables) {
      // Bitbucket expects values as strings
      const payload = {
        key: v.key,
        value:
          typeof v.value === "object"
            ? JSON.stringify(v.value)
            : String(v.value),
        secured: v.secured ?? true,
      };

      const existing = existingVars.find((ev) => ev.key === v.key);

      try {
        if (existing) {
          // Update (PUT)
          await axios.put(`${deploymentsUrl}/${existing.uuid}`, payload, {
            headers,
          });
          console.log(`✅ Updated: ${envName} - ${v.key}`);
        } else {
          // Create (POST)
          await axios.post(deploymentsUrl, payload, { headers });
          console.log(`✅ Created: ${envName} - ${v.key}`);
        }
      } catch (err) {
        console.log(`❌ Error: ${envName} - ${v.key}`);
        console.error(err.response?.data?.error?.message || err.message);
      }
    }
  } catch (error) {
    console.error(
      "❌ Bitbucket Sync Failed:",
      error.response?.data || error.message
    );
  }
}

module.exports = { syncBitbucket };
