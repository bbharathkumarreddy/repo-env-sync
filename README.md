# repo-env-sync

A simple CLI tool to **sync environment variables and secrets** to GitHub and Bitbucket using a `.repo-env.json` file.

## 📂 Example Configuration

**GitHub Example:** `my-repo/.repo-env.json`

```json
{
  "platform": "github",
  "token": "ghp_xxx",
  "owner": "my-username",
  "repo": "my-demo-repo",
  "dev": {
    "run": true,
    "variables": [
      { "key": "DEV_API", "value": "https://dev.example.com" },
      { "key": "DEV_SECRET", "value": "devsecret", "secured": true }
    ]
  }
}
```

**Bitbucket Example:** `my-repo/.repo-env.json`

```json
{
  "platform": "bitbucket",
  "token": "BITBUCKET_APP_PASSWORD_xxx",
  "workspace": "my-workspace",
  "repo": "my-demo-repo",
  "dev": {
    "run": true,
    "variables": [
      { "key": "DEV_API", "value": "https://dev.example.com" },
      { "key": "DEV_SECRET", "value": "devsecret", "secured": true }
    ]
  }
}
```

## 🚀 How to Run

1. Install the package `npm install repo-env-sync -D`

2. Copy the desired example to your repo root as `.repo-env.json`

3. Run the CLI:

```bash
npx repo-env-sync
```

It will automatically sync all variables in environments with `"run": true`.

###### Note: The environment must exist in GitHub or Bitbucket before running this CLI.

## For development testing locally on this repo

To run in root: `node ./bin/cli.js`
To run in "run/github/.repo-env.json": `node ../../bin/cli.js`
