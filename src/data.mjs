// Everything the card shows. The copy mirrors baronrobin.com, so when the
// site changes, change it here too.
export const card = {
  name: "Robin Baron",
  title: "3D Generalist",
  location: "Kaiserslautern, Germany",
  tagline: [
    "I like knowing how the tools work, then making",
    "them work together. Mostly 3D, often scans.",
  ],
  // What I'm up to: rows like the links, above them.
  now: [
    { label: "Now", value: "3D scanning and VR at HS Kaiserslautern" },
    { label: "Off hours", value: "35mm film · bouldering · 3D printing" },
  ],
  // Each link opens on a click (cmd-click on a Mac) where the terminal knows OSC 8;
  // href when the value isn't the address itself.
  links: [
    { label: "Web", value: "https://baronrobin.com" },
    { label: "GitHub", value: "https://github.com/BaronRobin" },
    { label: "LinkedIn", value: "https://www.linkedin.com/in/baron-robin" },
    { label: "Email", value: "robinbaron@icloud.com", href: "mailto:robinbaron@icloud.com" },
    // Rows with the same label share it; the note says what each account is.
    { label: "Instagram", value: "@stuffmadebyrob", href: "https://www.instagram.com/stuffmadebyrob/", note: "things I make" },
    { label: "Instagram", value: "@phtorob", href: "https://www.instagram.com/phtorob/", note: "photos" },
    { label: "Instagram", value: "@35mmfilmbyrob", href: "https://www.instagram.com/35mmfilmbyrob/", note: "on film" },
  ],
  skills: [
    "Unreal Engine",
    "Blender",
    "Houdini",
    "TouchDesigner",
    "After Effects",
    "DaVinci Resolve",
    "Photoshop",
  ],
};
