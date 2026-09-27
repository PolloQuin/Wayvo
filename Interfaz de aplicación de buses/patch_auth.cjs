const fs = require('fs');
let code = fs.readFileSync('src/app/App.tsx', 'utf8');

// Modificamos type AuthMode
code = code.replace(
  'type AuthMode = "select" | "login" | "register" | "forgot" | "sent";',
  'type AuthMode = "login" | "register" | "forgot" | "sent";'
);

// Modificamos AuthLogo para quitar animación del fondo y hacerlo sutil
code = code.replace(
  /<div className="absolute inset-y-2 inset-x-0 rounded-2xl overflow-hidden" style=\{\{background:"#374151"\}\}>\s*\{\/\* Bordes amarillos \*\/\}\s*<div className="absolute top-1\.5 inset-x-0 h-px" style=\{\{background:"rgba\(251,191,36,0\.5\)"\}\}\/>\s*<div className="absolute bottom-1\.5 inset-x-0 h-px" style=\{\{background:"rgba\(251,191,36,0\.5\)"\}\}\/>\s*\{\/\* Rayas centrales en movimiento \*\/\}\s*<div className="road-center-dashes absolute inset-0"\/>\s*<\/div>/,
  '<div className="absolute inset-y-2 inset-x-0 rounded-2xl overflow-hidden" style={{background:"#f3f4f6", border:"1px solid #e5e7eb"}}>\n          {/* Rayas centrales sutiles estáticas */}\n          <div className="absolute inset-0" style={{background: "repeating-linear-gradient(90deg, transparent 0px, transparent 14px, #d1d5db 14px, #d1d5db 26px)", height: "2px", top: "calc(50% - 1px)"}}/>\n        </div>'
);

// Rehacemos AuthScreen
const newAuthScreen = `function AuthScreen({onLogin}: {onLogin: (u: AppUser) => void}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [cpass, setCpass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState("");
  const [success, setSuccess] = useState("");

  const clearForm = () => { setEmail(""); setPass(""); setName(""); setCpass(""); setErr(""); setSuccess(""); };

  const field = (label: string, type: string, value: string, onChange: (v: string) => void, ph: string, onEnter?: () => void) => (
    <AuthField
      label={label} type={type} value={value}
      onChange={v => { onChange(v); setErr(""); }}
      placeholder={ph} onEnter={onEnter}
    />
  );

  const doLogin = () => {
    if (!email.trim() || !pass) { setErr("Completa todos los campos."); return; }
    setLoading(true);
    setTimeout(() => {
      if (email === "admin@metrobus.com" && pass === "admin1234") {
        onLogin({ name: "Administrador", email, isAdmin: true }); return;
      }
      if (email === "usuario@demo.com" && pass === "demo1234") {
        onLogin({ name: "Usuario Demo", email, isAdmin: false }); return;
      }
      const users = getUsers();
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!found) {
        setErr("No existe una cuenta con ese correo.");
        setLoading(false); return;
      }
      if (found.password !== pass) {
        setErr("Contraseña incorrecta. Verifica e intenta de nuevo.");
        setLoading(false); return;
      }
      onLogin({ name: found.name, email: found.email, isAdmin: found.role === "worker" });
    }, 700);
  };

  const doRegister = () => {
    if (!name.trim() || !email.trim() || !pass || !cpass) { setErr("Completa todos los campos."); return; }
    if (pass !== cpass) { setErr("Las contraseñas no coinciden."); return; }
    if (pass.length < 8) { setErr("La contraseña debe tener al menos 8 caracteres."); return; }
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      setErr("Ya existe una cuenta con ese correo."); return;
    }
    setLoading(true);
    setTimeout(() => {
      users.push({ name: name.trim(), email: email.toLowerCase().trim(), password: pass, role: "client" });
      saveUsers(users);
      setLoading(false);
      setMode("login");
      clearForm();
      setSuccess("¡Cuenta creada! Ya puedes iniciar sesión.");
    }, 700);
  };

  const doForgot = () => {
    if (!email.trim()) { setErr("Ingresa tu correo electrónico."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setMode("sent"); }, 900);
  };

  const f = (label: string, type: string, value: string, set: (v: string) => void, ph: string, onEnter?: () => void) => (
    <AuthField label={label} type={type} value={value}
      onChange={v => { set(v); setErr(""); }} placeholder={ph} onEnter={onEnter}/>
  );

  if (mode === "login") return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-10">
      <AuthLogo/>
      <Card className="w-full max-w-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Iniciar sesión</h2>
        {success && <div className="bg-green-50 text-green-700 text-xs rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>{success}</div>}
        {err && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>{err}</div>}
        <div className="space-y-3">
          {f("Correo electrónico", "email", email, setEmail, "correo@ejemplo.com")}
          {f("Contraseña", "password", pass, setPass, "••••••••", doLogin)}
          <button onClick={doLogin} disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>}Iniciar sesión
          </button>
        </div>
        <button onClick={() => { setMode("forgot"); setErr(""); setEmail(""); }}
          className="w-full text-center text-xs text-green-700 mt-3 hover:underline font-medium py-1">
          ¿Olvidaste tu contraseña?
        </button>
      </Card>
      <p className="text-xs text-gray-400 mt-4">
        ¿No tienes cuenta?{" "}
        <button onClick={() => { setMode("register"); clearForm(); }}
          className="text-green-700 font-semibold hover:underline">
          Regístrate
        </button>
      </p>
    </div>
  );

  if (mode === "register") return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-10">
      <AuthLogo/>
      <Card className="w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => { setMode("login"); setErr(""); }} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4 text-gray-600"/>
          </button>
          <h2 className="text-base font-bold text-gray-900">Crear cuenta</h2>
        </div>
        {err && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>{err}</div>}
        <div className="space-y-3">
          {f("Nombre completo", "text", name, setName, "Tu nombre completo")}
          {f("Correo electrónico", "email", email, setEmail, "correo@ejemplo.com")}
          {f("Contraseña", "password", pass, setPass, "Mínimo 8 caracteres")}
          {f("Confirmar contraseña", "password", cpass, setCpass, "Repite la contraseña", doRegister)}
          <button onClick={doRegister} disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>}Crear cuenta
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          ¿Ya tienes cuenta?{" "}
          <button onClick={() => { setMode("login"); setErr(""); }}
            className="text-green-700 font-semibold hover:underline">
            Inicia sesión
          </button>
        </p>
      </Card>
    </div>
  );

  if (mode === "forgot") return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-10">
      <AuthLogo/>
      <Card className="w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => { setMode("login"); setErr(""); }} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4 text-gray-600"/>
          </button>
          <h2 className="text-base font-bold text-gray-900">Recuperar contraseña</h2>
        </div>
        {err && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>{err}</div>}
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer tu contraseña.</p>
        {f("Correo electrónico", "email", email, setEmail, "correo@ejemplo.com", doForgot)}
        <button onClick={doForgot} disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 mt-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin"/>}Enviar enlace
        </button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-10">
      <AuthLogo/>
      <Card className="w-full max-w-sm p-6 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" strokeWidth={1.5}/>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">¡Correo enviado!</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-2">Hemos enviado un enlace de recuperación a:</p>
        <p className="text-sm font-bold text-gray-800 bg-gray-50 rounded-xl px-4 py-2.5 mb-5 break-all">{email}</p>
        <button onClick={() => { setMode("login"); setEmail(""); setErr(""); }}
          className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 text-sm font-bold transition-colors">
          Volver al inicio de sesión
        </button>
      </Card>
    </div>
  );
}`;

code = code.replace(/function AuthScreen\(\{[^]*?(?=\/\/\s*─── TRANSIT MAP SVG)/, newAuthScreen + '\n\n');

fs.writeFileSync('src/app/App.tsx', code);
