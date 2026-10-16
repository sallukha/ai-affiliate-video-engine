const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const packageJson = require("../package.json");
const storyboard = JSON.parse(fs.readFileSync("src/modules/video/test-pipeline/sample-storyboard.json", "utf8"));

test("prototype dependencies and sample storyboard are ready", () => {
  assert.equal(packageJson.dependencies["@remotion/bundler"], "4.0.522");
  assert.equal(packageJson.dependencies["@remotion/renderer"], "4.0.522");
  assert.equal(packageJson.dependencies.remotion, "4.0.522");
  assert.equal(packageJson.dependencies.zod, "4.5.4");
  assert.equal(storyboard.width, 720);
  assert.equal(storyboard.height, 1280);
  assert.equal(storyboard.fps, 30);
  assert.ok(storyboard.scenes.length > 0);
});
