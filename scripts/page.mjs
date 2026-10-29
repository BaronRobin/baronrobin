// Writes docs/, the GitHub Pages site behind `curl card.baronrobin.com`.
// One file for both: curl prints it, and the ANSI codes wipe each bit of
// HTML off the line before the card is drawn; a browser hides the body and
// goes straight on to baronrobin.com. Run after changing src/data.mjs.
import { mkdirSync, writeFileSync } from "node:fs";
import { card } from "../src/data.mjs";
import { render } from "../src/card.mjs";

const DOMAIN = "card.baronrobin.com";
// Back to the start of the line, and clear it.
const WIPE = "\u001b[2K\r";
// Each piece shorter than a narrow terminal, so none wraps onto a line the wipe can't reach.
const html = [
  "<!doctype html>",
  "<meta http-equiv=refresh content=0;url=https://baronrobin.com>",
  "<style>body{display:none}</style>",
];

const out = new URL("../docs/", import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL("index.html", out), html.map((piece) => piece + WIPE).join("") + render(card, { color: true }) + "\n");
writeFileSync(new URL("CNAME", out), DOMAIN + "\n");
writeFileSync(new URL(".nojekyll", out), "");
