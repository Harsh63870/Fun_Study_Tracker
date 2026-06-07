export const DEFAULT_SUBJECTS = [
  "DSA",
  "DBMS",
  "Web Dev",
  "AI/ML",
  "Cloud",
  "System Design",
  "Competitive Programming",
  "LeetCode",
  "Projects",
];

export function normalizeSubject(name) {
  const aliases = {
    dsa: "DSA",
    dbms: "DBMS",
    "web dev": "Web Dev",
    webdev: "Web Dev",
    "web development": "Web Dev",
    "ai/ml": "AI/ML",
    aiml: "AI/ML",
    cloud: "Cloud",
    "system design": "System Design",
    sd: "System Design",
    cp: "Competitive Programming",
    leetcode: "LeetCode",
    projects: "Projects",
    cncf: "Projects",
    candee: "Projects",
  };
  const lower = name.trim().toLowerCase();
  if (aliases[lower]) return aliases[lower];
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
