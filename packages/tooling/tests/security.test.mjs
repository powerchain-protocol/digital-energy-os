import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");

test("GitHub security automation is committed",()=>{
  for(const path of [
    ".github/dependabot.yml",
    ".github/SECURITY.md",
    ".github/workflows/security.yml",
    ".github/workflows/codeql.yml",
    ".github/workflows/dependency-review.yml",
  ])assert.equal(fs.existsSync(path),true,path);
});

test("security workflow uses least privilege and frozen lockfile installation",()=>{
  const workflow=read(".github/workflows/security.yml");
  assert.match(workflow,/permissions:\n  contents: read/);
  assert.match(workflow,/persist-credentials: false/);
  assert.match(workflow,/pnpm install --frozen-lockfile/);
  assert.match(workflow,/pnpm security:check/);
});

test("reported vulnerable lock resolutions are removed",()=>{
  const lock=read("pnpm-lock.yaml");
  for(const token of [
    "deepmerge-ts@7.1.5",
    "image-size@2.0.2",
    "elliptic@6.6.1",
    "postcss@8.4.31",
    "sharp@0.34.5",
    "uuid@8.3.2",
    "uuid@9.0.1",
    "@storybook/nextjs@10.5.10",
  ])assert.doesNotMatch(lock,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
});

test("security overrides are centralized in pnpm-workspace.yaml",()=>{
  const workspace=read("pnpm-workspace.yaml");
  assert.match(workspace,/next@16\.2\.12>postcss/);
  assert.match(workspace,/next@16\.2\.12>sharp/);
  assert.match(workspace,/@prisma\/config@6\.19\.3>deepmerge-ts/);
  assert.match(workspace,/jayson@4\.3\.0>uuid/);
  assert.match(workspace,/minimumReleaseAge: 1440/);
});

test("component catalog no longer depends on Storybook Next.js framework",()=>{
  const pkg=JSON.parse(read("apps/storybook/package.json"));
  assert.equal(pkg.name,"@powerchain/component-catalog");
  assert.equal(pkg.devDependencies?.["@storybook/nextjs"],undefined);
  assert.equal(pkg.dependencies.next,"16.2.12");
});

test("Next local image optimizer is disabled while sharp is removed",()=>{
  assert.match(read("apps/platform/next.config.ts"),/unoptimized: true/);
  assert.match(read("apps/docs/next.config.ts"),/unoptimized:true/);
  assert.doesNotMatch(read("pnpm-lock.yaml"),/sharp@/);
});
