const fs = require('fs');
let code = fs.readFileSync('src/app/App.tsx', 'utf8');

// Modificamos TabId y BottomNav
code = code.replace(
  'type TabId = "home" | "routes" | "map" | "trips" | "profile";',
  'type TabId = "home" | "routes" | "map" | "trips" | "profile" | "admin";'
);

code = code.replace(
  /function BottomNav\(\{(.+?)\}: \{(.+?)\}\) \{/,
  'function BottomNav({active, onSwitch, user}: {active: TabId; onSwitch: (t: TabId) => void; user: AppUser}) {'
);

code = code.replace(
  /const tabs: \[TabId, React\.FC<\{className\?:string;strokeWidth\?:number\}>, string\]\[\] = \[\n([\s\S]*?)\];/,
  `const tabs: [TabId, React.FC<{className?:string;strokeWidth?:number}>, string][] = [
    ["home",    Home,        "Inicio"],
    ["routes",  Navigation,  "Rutas"],
    ["map",     Map,         "Mapa"],
    ["trips",   Navigation2, "Viajes"],
    ["profile", User,        "Perfil"],
  ];
  if (user.isAdmin) {
    tabs.push(["admin", Shield, "Admin"]);
  }`
);

// Quitar botón de Admin del perfil
code = code.replace(
  /\{user\.isAdmin && \(\s*<div className="px-4 mb-4">\s*<SectionLabel>Administración<\/SectionLabel>[\s\S]*?<\/div>\s*\)\}/,
  ''
);

// Modificar renderización de BottomNav
code = code.replace(
  /<BottomNav active=\{tab\} onSwitch=\{switchTab\}\/>/,
  '<BottomNav active={tab} onSwitch={switchTab} user={user}/>'
);

// Añadir TabId de admin en la navegación del HomeScreen
code = code.replace(
  'const tabs=["home","routes","map","trips","profile"];',
  'const tabs=["home","routes","map","trips","profile","admin"];'
);

fs.writeFileSync('src/app/App.tsx', code);
