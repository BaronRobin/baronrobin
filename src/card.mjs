// Renders the card as a string. No dependencies: the few ANSI codes we need
// are written by hand, and the box is drawn from the lines' visible width.

const ESC = "\u001b[";
const CODES = {
  bold: ["1", "22"],
  dim: ["2", "22"],
  underline: ["4", "24"],
  cyan: ["36", "39"],
};

// SGR codes (colour, bold) and OSC 8 hyperlinks: neither takes a column.
const ANSI_PATTERN = /\u001b\[[0-9;]*m|\u001b\]8;;[^\u001b]*\u001b\\/g;

export function stripAnsi(text) {
  return text.replace(ANSI_PATTERN, "");
}

function visibleWidth(text) {
  return stripAnsi(text).length;
}

// Greedy word wrap over whole items, joined with a middle dot.
export function wrapItems(items, maxWidth, separator = " · ") {
  const lines = [];
  let current = "";
  for (const item of items) {
    const candidate = current ? current + separator + item : item;
    if (current && candidate.length > maxWidth) {
      lines.push(current);
      current = item;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const MARGIN = 3; // spaces between the border and the text
const SKILLS_WIDTH = 36; // wrap width for the skills list

export function render(data, { color = false, columns = Infinity } = {}) {
  const style = (name) => (text) =>
    color ? `${ESC}${CODES[name][0]}m${text}${ESC}${CODES[name][1]}m` : text;
  const bold = style("bold");
  const dim = style("dim");
  const underline = style("underline");
  const accent = style("cyan");
  // OSC 8: the text becomes a link in terminals that support it, and stays plain text elsewhere.
  const link = (text, url) => (color && url ? `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\` : text);

  const labelWidth = Math.max("Skills".length, ...data.links.map((l) => l.label.length));
  const row = (label, value) => `${accent(label.padEnd(labelWidth))}  ${value}`;
  const continuation = (value) => `${" ".repeat(labelWidth)}  ${value}`;

  const skillLines = wrapItems(data.skills, SKILLS_WIDTH);

  const lines = [
    bold(data.name),
    dim(`${data.title} · ${data.location}`),
    "",
    ...data.tagline,
    "",
    ...data.links.map((l) => {
      const url = l.href ?? (/^https?:\/\//.test(l.value) ? l.value : null);
      return row(l.label, url ? link(underline(l.value), url) : l.value);
    }),
    "",
    ...skillLines.map((l, i) => (i === 0 ? row("Skills", l) : continuation(l))),
  ];

  const textWidth = Math.max(...lines.map(visibleWidth));
  const inner = textWidth + MARGIN * 2;

  // A narrow terminal would wrap the border mid-line, so drop the box there.
  if (columns < inner + 2) {
    return "\n" + lines.join("\n") + "\n";
  }

  const edge = dim;
  const top = edge("╭" + "─".repeat(inner) + "╮");
  const bottom = edge("╰" + "─".repeat(inner) + "╯");
  const boxed = (line) =>
    edge("│") +
    " ".repeat(MARGIN) +
    line +
    " ".repeat(inner - MARGIN - visibleWidth(line)) +
    edge("│");

  return ["", top, boxed(""), ...lines.map(boxed), boxed(""), bottom, ""].join("\n");
}
