#!/usr/bin/env node
const { run } = require("../src");

run().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
