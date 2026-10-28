#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { card } from "../src/data.mjs";
import { render } from "../src/card.mjs";

const USAGE = `Usage: baronrobin [options]

Prints Robin Baron's terminal business card.

Options:
  --json        print the card data as JSON
  --no-color    disable colours (also: NO_COLOR=1, or pipe the output)
  -h, --help    show this help
  -v, --version print the version
`;

function wantsColor(flags) {
  if (flags.has("--no-color")) return false;
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== "0") return true;
  return Boolean(process.stdout.isTTY) && process.env.TERM !== "dumb";
}

const flags = new Set(process.argv.slice(2));
const known = new Set(["--json", "--no-color", "-h", "--help", "-v", "--version"]);
const unknown = [...flags].filter((f) => !known.has(f));

if (unknown.length > 0) {
  process.stderr.write(`Unknown option: ${unknown.join(" ")}\n\n${USAGE}`);
  process.exit(2);
}

if (flags.has("-h") || flags.has("--help")) {
  process.stdout.write(USAGE);
} else if (flags.has("-v") || flags.has("--version")) {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  process.stdout.write(pkg.version + "\n");
} else if (flags.has("--json")) {
  process.stdout.write(JSON.stringify(card, null, 2) + "\n");
} else {
  process.stdout.write(
    render(card, { color: wantsColor(flags), columns: process.stdout.columns ?? Infinity }) + "\n",
  );
}
