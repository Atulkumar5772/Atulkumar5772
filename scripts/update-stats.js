const fs = require('fs');
const https = require('https');
const path = require('path');

function getJson(url, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'GitHub-Stats-Updater' };
    if (token) headers['Authorization'] = `token ${token}`;
    https.get(url, { headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function updateStats() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  console.log('Fetching GitHub data for Atulkumar5772...');

  let user = { public_repos: 7 };
  try {
    user = await getJson('https://api.github.com/users/Atulkumar5772', token);
  } catch (e) {
    console.warn('Using default user stats:', e.message);
  }

  let repos = [];
  try {
    repos = await getJson('https://api.github.com/users/Atulkumar5772/repos?per_page=100', token);
    if (!Array.isArray(repos)) repos = [];
  } catch (e) {
    console.warn('Using default repos:', e.message);
  }

  let totalStars = 0;
  const langBytes = {
    'JavaScript': 100821,
    'Java': 70759,
    'CSS': 32033,
    'HTML': 30541,
    'C++': 27254
  };

  if (repos.length > 0) {
    let freshBytes = {};
    for (const r of repos) {
      totalStars += (r.stargazers_count || 0);
      try {
        const langs = await getJson(`https://api.github.com/repos/Atulkumar5772/${r.name}/languages`, token);
        if (langs && typeof langs === 'object') {
          for (const [l, b] of Object.entries(langs)) {
            if (['Dockerfile', 'Makefile', 'Shell'].includes(l)) continue;
            freshBytes[l] = (freshBytes[l] || 0) + b;
          }
        }
      } catch (e) {
        // ignore language fetch errors
      }
    }
    if (Object.keys(freshBytes).length > 0) {
      Object.assign(langBytes, freshBytes);
    }
  }

  totalStars = Math.max(totalStars, 1);
  const totalCommits = 198;
  const totalContributions = 339;
  const publicRepos = user.public_repos || 7;

  // Language calculation
  const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0);
  const topLangs = Object.entries(langBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, bytes]) => ({
      name,
      pct: ((bytes / totalBytes) * 100).toFixed(1)
    }));

  const colors = {
    'JavaScript': '#f1e05a',
    'Java': '#b07219',
    'CSS': '#663399',
    'HTML': '#e34c26',
    'C++': '#f34b7d',
    'Kotlin': '#A97BFF',
    'C': '#555555'
  };

  const statsSvg = `<svg
  width="495"
  height="195"
  viewBox="0 0 495 195"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #fe428e;
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }
    .stat {
      font: 600 14px 'Inter', Ubuntu, 'Helvetica Neue', Sans-Serif;
      fill: #a9fef7;
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.4s ease-in-out forwards;
    }
    .rank-text {
      font: 800 24px 'Inter', Ubuntu, Sans-Serif;
      fill: #a9fef7;
      animation: scaleInAnimation 0.4s ease-in-out forwards;
    }
    .bold { font-weight: 700; }
    .icon {
      fill: #f8d847;
      display: block;
    }
    .rank-circle-rim {
      stroke: #fe428e;
      fill: none;
      stroke-width: 6;
      opacity: 0.2;
    }
    .rank-circle {
      stroke: #fe428e;
      stroke-dasharray: 250;
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      opacity: 0.8;
      transform-origin: -10px 8px;
      transform: rotate(-90deg);
      animation: rankAnimation 1s forwards ease-in-out;
    }
    @keyframes rankAnimation {
      from { stroke-dashoffset: 251.3; }
      to { stroke-dashoffset: 126.6; }
    }
    @keyframes scaleInAnimation {
      from { transform: translate(-5px, 5px) scale(0); }
      to { transform: translate(-5px, 5px) scale(1); }
    }
    @keyframes fadeInAnimation {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  </style>

  <rect
    x="0.5"
    y="0.5"
    rx="12"
    height="99%"
    width="494"
    fill="#141321"
    stroke="#fe428e"
    stroke-opacity="0.15"
  />

  <g transform="translate(25, 35)">
    <text x="0" y="0" class="header">My GitHub Statistics</text>
  </g>

  <g transform="translate(0, 55)">
    <g transform="translate(400, 40)">
      <circle class="rank-circle-rim" cx="-10" cy="8" r="40" />
      <circle class="rank-circle" cx="-10" cy="8" r="40" />
      <g class="rank-text">
        <text
          x="-10"
          y="8"
          alignment-baseline="central"
          dominant-baseline="central"
          text-anchor="middle"
        >A+</text>
      </g>
    </g>

    <g class="stagger" style="animation-delay: 200ms" transform="translate(25, 10)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
        <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>
      </svg>
      <text class="stat bold" x="28" y="13">Total Stars:</text>
      <text class="stat" x="190" y="13">${totalStars}</text>
    </g>

    <g class="stagger" style="animation-delay: 350ms" transform="translate(25, 42)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
        <path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>
      </svg>
      <text class="stat bold" x="28" y="13">Total Commits:</text>
      <text class="stat" x="190" y="13">${totalCommits}</text>
    </g>

    <g class="stagger" style="animation-delay: 500ms" transform="translate(25, 74)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
        <path fill-rule="evenodd" d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 15H2.75A1.75 1.75 0 011 13.25V2.75zm1.75-.25a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H2.75zM4 4.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zm0 5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zm5-5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zm0 5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2z"/>
      </svg>
      <text class="stat bold" x="28" y="13">Total Contributions:</text>
      <text class="stat" x="190" y="13">${totalContributions}</text>
    </g>

    <g class="stagger" style="animation-delay: 650ms" transform="translate(25, 106)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
      </svg>
      <text class="stat bold" x="28" y="13">Public Repos:</text>
      <text class="stat" x="190" y="13">${publicRepos}</text>
    </g>
  </g>
</svg>`;

  const langItemsSvg = topLangs.map((lang, idx) => {
    const c = colors[lang.name] || '#888888';
    const barWidth = (parseFloat(lang.pct) * 2.5).toFixed(1);
    const delay = 150 + idx * 150;
    const yOffset = idx * 27;
    return `    <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(0, ${yOffset})">
      <circle cx="5" cy="8" r="4" fill="${c}" />
      <text x="16" y="12" class="lang-name">${lang.name}</text>
      <text x="250" y="12" class="lang-pct">${lang.pct}%</text>
      <rect x="0" y="18" width="250" height="6" rx="3" fill="#222138" />
      <rect x="0" y="18" width="${barWidth}" height="6" rx="3" fill="${c}" />
    </g>`;
  }).join('\n');

  const langsSvg = `<svg
  width="300"
  height="195"
  viewBox="0 0 300 195"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #fe428e;
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }
    .lang-name {
      font: 500 12px 'Inter', Ubuntu, Sans-Serif;
      fill: #a9fef7;
    }
    .lang-pct {
      font: 600 12px 'Inter', Ubuntu, Sans-Serif;
      fill: #a9fef7;
      text-anchor: end;
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.4s ease-in-out forwards;
    }
    @keyframes fadeInAnimation {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  </style>

  <rect
    x="0.5"
    y="0.5"
    rx="12"
    height="99%"
    width="299"
    fill="#141321"
    stroke="#fe428e"
    stroke-opacity="0.15"
  />

  <g transform="translate(25, 35)">
    <text x="0" y="0" class="header">My Programming Languages</text>
  </g>

  <g transform="translate(25, 50)">
${langItemsSvg}
  </g>
</svg>`;

  const rootDir = path.resolve(__dirname, '..');
  fs.writeFileSync(path.join(rootDir, 'assets/stats.svg'), statsSvg, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'assets/top-langs.svg'), langsSvg, 'utf8');
  console.log('✅ Generated assets/stats.svg and assets/top-langs.svg successfully!');
}

updateStats().catch(err => {
  console.error('Error updating stats:', err);
  process.exit(1);
});
