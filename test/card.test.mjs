import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { card } from "../src/data.mjs";
import { render, stripAnsi, wrapItems } from "../src/card.mjs";

const cli = fileURLToPath(new URL("../bin/cli.mjs", import.meta.url));
const run = (args, env = {}) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", env: { ...process.env, ...env } });

test("card contains every piece of content", () => {
  const out = stripAnsi(render(card));
  for (const text of [card.name, card.title, card.location, ...card.tagline, ...card.skills, ...card.now.flatMap((r) => [r.label, r.value])]) {
    assert.ok(out.includes(text), `missing: ${text}`);
  }
  for (const link of card.links) {
    assert.ok(out.includes(link.label) && out.includes(link.value), `missing link: ${link.value}`);
    if (link.note) assert.ok(out.includes(link.note), `missing note: ${link.note}`);
  }
});

test("box lines all have the same visible width, with colour on and off", () => {
  for (const color of [true, false]) {
    const lines = render(card, { color }).split("\n").filter((l) => l !== "");
    const widths = new Set(lines.map((l) => stripAnsi(l).length));
    assert.equal(widths.size, 1, `widths differ (color=${color}): ${[...widths]}`);
  }
});

test("colour off produces no escape codes, colour on produces some", () => {
  assert.ok(!render(card, { color: false }).includes("\u001b"));
  assert.ok(render(card, { color: true }).includes("\u001b"));
});

test("narrow terminal drops the box", () => {
  const out = render(card, { columns: 20 });
  assert.ok(!out.includes("╭") && !out.includes("ooO"));
  assert.ok(out.includes(card.name));
});

test("wrapItems keeps items whole", () => {
  assert.deepEqual(wrapItems(["aa", "bb", "cc"], 7), ["aa · bb", "cc"]);
  assert.deepEqual(wrapItems(["a-very-long-item"], 3), ["a-very-long-item"]);
});

test("cli prints the card and exits 0", () => {
  const { status, stdout } = run([]);
  assert.equal(status, 0);
  assert.ok(stdout.includes(card.name));
});

test("cli --json is valid JSON with the expected keys", () => {
  const { status, stdout } = run(["--json"]);
  assert.equal(status, 0);
  const data = JSON.parse(stdout);
  assert.equal(data.name, card.name);
  assert.ok(Array.isArray(data.links) && Array.isArray(data.skills));
});

test("cli respects NO_COLOR and --no-color, and FORCE_COLOR when piped", () => {
  assert.ok(!run([], { NO_COLOR: "1" }).stdout.includes("\u001b"));
  assert.ok(!run(["--no-color"], { FORCE_COLOR: "1" }).stdout.includes("\u001b"));
  assert.ok(run([], { FORCE_COLOR: "1", NO_COLOR: "" }).stdout.includes("\u001b"));
});

test("cli rejects unknown options with exit code 2", () => {
  const { status, stderr } = run(["--bogus"]);
  assert.equal(status, 2);
  assert.ok(stderr.includes("Unknown option"));
});

test("every link is an OSC 8 hyperlink with colour on, and none with colour off", () => {
  const on = render(card, { color: true });
  for (const l of card.links) {
    const url = l.href ?? l.value;
    assert.ok(on.includes(`\u001b]8;;${url}\u001b\\`), `missing link for ${l.label}`);
  }
  assert.ok(!render(card, { color: false }).includes("\u001b]8;;"));
});

test("the boulderer holds the top edge and the skyline stands on the bottom one", () => {
  const lines = stripAnsi(render(card)).split("\n");
  assert.ok(lines.find((l) => l.startsWith("╭")).includes("ooO\\_/Ooo"));
  const bottom = lines.findIndex((l) => l.startsWith("╰"));
  assert.ok(lines[bottom - 1].includes("|:::|"), "the Rathaus reaches the ground");
});
