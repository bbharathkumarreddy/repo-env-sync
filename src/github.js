const axios = require("axios");
const sodium = require("libsodium-wrappers");

/**
 * Sync variables to GitHub environment secrets or environment variables
 *
 * @param {object} cfg - Config with token, owner, repo
 * @param {string} envName - GitHub environment name
 * @param {Array} variables - Array of { key, value, secured }
 */
async function syncGitHub(cfg, envName, variables) {
  const { token, owner, repo } = cfg;
  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  await sodium.ready;

  try {
    for (const v of variables) {
      if (v.secured) {
        // --- SECRETS: Use PUT (Upsert by default) ---
        const keyRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/environments/${envName}/secrets/public-key`,
          { headers: commonHeaders }
        );

        const encrypted = sodium.crypto_box_seal(
          Buffer.from(v.value),
          Buffer.from(keyRes.data.key, "base64")
        );

        const payload = {
          encrypted_value: Buffer.from(encrypted).toString("base64"),
          key_id: keyRes.data.key_id,
        };

        await axios.put(
          `https://api.github.com/repos/${owner}/${repo}/environments/${envName}/secrets/${v.key}`,
          payload,
          { headers: commonHeaders }
        );

        console.log(`✅ Secret ${v.key} synced`);
      } else {
        // --- VARIABLES: Handle Create (POST) or Update (PATCH) ---
        const baseUrl = `https://api.github.com/repos/${owner}/${repo}/environments/${envName}/variables`;

        try {
          // 1. Attempt to create the variable
          await axios.post(
            baseUrl,
            { name: v.key, value: String(v.value) },
            { headers: commonHeaders }
          );
          console.log(`✅ Variable ${v.key} created`);
        } catch (err) {
          // 2. If it exists (409) or validation fails because it exists (422), Update it
          if (
            err.response &&
            (err.response.status === 409 || err.response.status === 422)
          ) {
            await axios.patch(
              `${baseUrl}/${v.key}`,
              { name: v.key, value: String(v.value) },
              { headers: commonHeaders }
            );
            console.log(`✅ Variable ${v.key} updated`);
          } else {
            // Re-throw if it's a 404 (Env not found) or 401 (Auth error)
            throw err;
          }
        }
      }
    }
  } catch (error) {
    console.error(
      "❌ Error syncing to GitHub:",
      error.response?.data || error.message
    );
  }
}

module.exports = { syncGitHub };
