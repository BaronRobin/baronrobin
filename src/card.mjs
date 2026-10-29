// Renders the card as a string. No dependencies: the few ANSI codes we need
// are written by hand, and the box is drawn from the lines' visible width.

const ESC = "\u001b[";
const CODES = {
  bold: ["1", "22"],
  dim: ["2", "22"],
  underline: ["4", "24"],
  cyan: ["36", "39"],
  green: ["32", "39"],
  yellow: ["33", "39"],
  magenta: ["35", "39"],
};

// A boulderer topping out over the top edge: the head above it, chin and hands on it. No colour.
const PEEK_HEAD = ['  .-"-.', " ( o o )"];
const PEEK_EDGE = "ooO\\_/Ooo";
const PEEK_FROM_RIGHT = 14; // where the left hand grabs, counted from the right corner

// Kaiserslautern along the bottom, left to right: a Pfälzerwald pine, the Fruchthalle, the
// Marienkirche, the Rathaus tower, the Stiftskirche, the Betze with its floodlights, another
// pine. Each piece is [column, rows from the top, colour]; the pieces stand on the bottom edge.
const pine = ["   ^   ", "  /^\\  ", " /^^^\\ ", "/^^^^^\\", "   |   "];
const pineSmall = ["  ^  ", " /^\\ ", "/^^^\\", "  |  "];
const SKYLINE = [
  [2, pine, "green"],
  [10, [" _____ ", "/_____\\", "|n|n|n|"]],
  [18, [" | ", "/ \\", "| |", "| |", "|o|"]],
  [22, [" ___ ", "|:::|", "|:::|", "|:::|", "|:::|", "|:::|"]],
  [28, [" |       | ", "/ \\  ^  / \\", "| |_/ \\_| |", "| | |n| | |"]],
  [41, ["#     #", "|_____|", "/_____\\"]],
  [50, pineSmall, "green"],
];
const SKYLINE_HEIGHT = 6;

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

  const labelWidth = Math.max("Skills".length, ...[...data.now, ...data.links].map((l) => l.label.length));
  // The notes line up after the longest value that has one.
  const noteAt = Math.max(0, ...data.links.filter((l) => l.note).map((l) => l.value.length));
  const row = (label, value) => `${accent(label.padEnd(labelWidth))}  ${value}`;
  const continuation = (value) => `${" ".repeat(labelWidth)}  ${value}`;

  const skillLines = wrapItems(data.skills, SKILLS_WIDTH);

  const lines = [
    bold(data.name),
    dim(`${data.title} · ${data.location}`),
    "",
    ...data.tagline,
    "",
    ...data.now.map((r) => row(r.label, r.value)),
    "",
    ...data.links.map((l, i) => {
      const url = l.href ?? (/^https?:\/\//.test(l.value) ? l.value : null);
      const value = (url ? link(underline(l.value), url) : l.value) + (l.note ? " ".repeat(noteAt - l.value.length + 2) + dim(l.note) : "");
      return i > 0 && data.links[i - 1].label === l.label ? continuation(value) : row(l.label, value);
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
  const boxed = (line) =>
    edge("│") +
    " ".repeat(MARGIN) +
    line +
    " ".repeat(inner - MARGIN - visibleWidth(line)) +
    edge("│");
  const grab = inner - PEEK_FROM_RIGHT;
  const head = PEEK_HEAD.map((l) => " ".repeat(1 + grab) + l).map((l) => l + " ".repeat(inner + 2 - visibleWidth(l)));
  const top = edge("╭" + "─".repeat(grab)) + PEEK_EDGE + edge("─".repeat(inner - grab - PEEK_EDGE.length) + "╮");
  // The skyline as a grid of cells, each painted as its piece asks; it spans the box's full inside.
  const cells = Array.from({ length: SKYLINE_HEIGHT }, () => Array(inner).fill(" "));
  for (const [col, rows, colour] of SKYLINE) {
    rows.forEach((row, i) => {
      [...row].forEach((ch, j) => {
        if (ch !== " ") cells[SKYLINE_HEIGHT - rows.length + i][col + j] = colour ? style(colour)(ch) : ch;
      });
    });
  }
  const skyline = cells.map((row) => edge("│") + row.join("") + edge("│"));
  const bottom = edge("╰" + "─".repeat(inner) + "╯");

  return ["", ...head, top, boxed(""), ...lines.map(boxed), boxed(""), ...skyline, bottom, ""].join("\n");
}
