document.documentElement.classList.add('js');

/* Safari puede ocultar el indicador de foco si no se activa la navegación por teclado. */
document.addEventListener('keydown', e => {
  if(e.key === 'Tab') document.body.classList.add('keyboard-nav');
});
document.addEventListener('pointerdown', () => {
  document.body.classList.remove('keyboard-nav');
});

/* ────────────────────────────────────────────────────────
   NAVEGACIÓN
──────────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
const navLinks = document.getElementById('navLinks');
const burger = document.getElementById('burger');

function toggleNav(e){
  if(e && e.stopPropagation) e.stopPropagation();
  const services = document.getElementById('navServices');
  const servicesBtn = services ? services.querySelector('.nav-caret-btn') : null;
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
  if(services && window.innerWidth <= 768){
    services.classList.toggle('services-open', isOpen);
    if(servicesBtn) servicesBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if(isOpen) navLinks.querySelector('a,button')?.focus();
}
const burgerBtn = document.getElementById('burger');
if(burgerBtn) burgerBtn.addEventListener('click', toggleNav);

function toggleServices(e){
  const item = document.getElementById('navServices');
  if(!item) return;

  e.preventDefault();
  e.stopPropagation();
  const isOpen = item.classList.toggle('services-open');
  e.currentTarget.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
const servicesToggleBtn = document.querySelector('#navServices .nav-caret-btn');
if(servicesToggleBtn) servicesToggleBtn.addEventListener('click', toggleServices);

function applyTheme(theme){
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  const toggle = document.getElementById('themeToggle');
  if(toggle){
    toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    toggle.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
  }
}

function getStoredTheme(){
  try{
    return localStorage.getItem('celdexia-theme');
  }catch(_err){
    return null;
  }
}

function storeTheme(theme){
  try{
    localStorage.setItem('celdexia-theme', theme);
  }catch(_err){
    /* Preferencias bloqueadas: el cambio queda activo solo en la sesión. */
  }
}

const savedTheme = getStoredTheme();
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

const themeToggle = document.getElementById('themeToggle');
if(themeToggle){
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    storeTheme(nextTheme);
    applyTheme(nextTheme);
  });
}

function closeNav(){
  const services = document.getElementById('navServices');
  const servicesBtn = services ? services.querySelector('.nav-caret-btn') : null;
  navLinks.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  if(services){
    services.classList.remove('services-open');
    if(servicesBtn) servicesBtn.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

document.querySelectorAll('#nav a').forEach(link => {
  link.addEventListener('click', closeNav);
});

document.querySelectorAll('#nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const hash = link.getAttribute('href');
    if(!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if(!target) return;

    e.preventDefault();
    closeNav();

    const visualTargets = {
      '#servicios': '.serv-head',
      '#faq': '.faq-head',
      '#contacto': '.ct-wrap'
    };
    const scrollTarget = visualTargets[hash] ? target.querySelector(visualTargets[hash]) || target : target;
    const navHeight = document.getElementById('nav').getBoundingClientRect().height;
    const offset = navHeight + 18;
    const top = scrollTarget.getBoundingClientRect().top + window.pageYOffset - offset;
    window.history.pushState(null, '', hash);
    smoothScrollTo(top, 760);
  });
});

function smoothScrollTo(targetY, duration){
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
    window.scrollTo(0, targetY);
    return;
  }
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function step(now){
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * ease(progress));
    if(progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* Scroll → nav sombra */
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if(scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    scrollTicking = false;
  });
}, { passive:true });

/* Click fuera → cerrar nav */
document.addEventListener('click', e => {
  if(navLinks.classList.contains('open') && !nav.contains(e.target)) closeNav();
});

/* Resize → cerrar nav móvil */
window.addEventListener('resize', () => {
  if(window.innerWidth > 768){
    if(navLinks.classList.contains('open')) closeNav();
  }
});

/* Escape → cerrar todo */
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    closeNav();
    if(chatOpen) toggleChat();
  }
});

/* ────────────────────────────────────────────────────────
   ANIMACIONES SCROLL
──────────────────────────────────────────────────────── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(el => { if(el.isIntersecting) el.target.classList.add('vis'); });
}, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

/* ────────────────────────────────────────────────────────
   FORMULARIO → WHATSAPP
──────────────────────────────────────────────────────── */
function handleForm(e){
  e.preventDefault();
  const f = e.target;
  const nombre  = (f.nombre.value  || '').trim();
  const empresa = (f.empresa.value || '').trim();
  const tel     = (f.tel.value     || '').trim();
  const email   = (f.email.value   || '').trim();
  const area    = (f.area.value    || 'No especificada');
  const reto    = (f.reto.value    || '').trim() || 'No especificado';

  if(!nombre || !empresa || !tel || !email || !f.area.value || !f.privacy.checked){
    f.reportValidity();
    return;
  }

  const msg = [
    '🚀 *AGENDAR DIAGNÓSTICO — GRUPO CELDEXIA SAS*',
    '',
    '👤 *Nombre:* '   + nombre,
    '🏢 *Empresa:* '  + empresa,
    '📱 *Teléfono:* ' + tel,
    '📧 *Email:* '    + email,
    '📋 *Servicio de interés:* ' + area,
    '💬 *Situación actual:*',
    reto,
    '',
    '_Enviado desde celdexia.co_'
  ].join('\n');

  const waURL = 'https://wa.me/573174698050?text=' + encodeURIComponent(msg);
  window.open(waURL, '_blank', 'noopener,noreferrer');

  const btn = document.getElementById('formBtn');
  const orig = btn.textContent;
  btn.textContent = '✅ ¡Abriendo WhatsApp!';
  btn.classList.add('is-sending');
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('is-sending');
    btn.disabled = false;
    f.reset();
  }, 3500);
}
const contactForm = document.getElementById('contactForm');
if(contactForm) contactForm.addEventListener('submit', handleForm);

/* ════════════════════════════════════════════════════════
   CHATBOT INTELIGENTE · GRUPO CELDEXIA SAS
   Embudo conversacional con preguntas estratégicas
   Sin popups · redirige directo a la web destino
════════════════════════════════════════════════════════ */

const WEB_CONTABLE = 'https://contable.celdexia.co/';
const WEB_WEB      = 'https://web.celdexia.co/';
const WEB_ACADEMY  = 'https://www.celdexia.com/inicio';
const CAL_LINK     = 'https://calendar.app.google/tfaqs4YaaFquSDfQA';
const WA_BASE      = 'https://wa.me/573174698050';

/* Estado del chat */
let chatOpen = false;
let chatStarted = false;
let userName = '';
let currentFlow = null;
let navHistory = [];  // pila de estados anteriores para "Regresar"

const msgsEl = document.getElementById('cpMsgs');
const optsEl = document.getElementById('cpOpts');
const inputArea = document.getElementById('cpInputArea');
const inputEl = document.getElementById('cpInput');
const sendBtn = document.getElementById('cpSend');

/* ────────────────────────────────────────────────────────
   FLUJOS DEL EMBUDO DE VENTAS
──────────────────────────────────────────────────────── */
const FLOWS = {

  /* ════════════════════════════════════════════════════════
     NIVEL 1 · MENÚ PRINCIPAL
  ════════════════════════════════════════════════════════ */
  start: () => ({
    bot: `¡Mucho gusto, ${userName}! 😊 Soy Celex, asistente de Grupo Celdexia SAS.\n\nSomos una firma boutique colombiana que ayuda a empresas como la tuya con contabilidad, página web y formación en datos.\n\n¿En qué te puedo ayudar hoy?`,
    opts: [
      { t: "🚀 Quiero mejorar mi empresa", n: 'transformar' },
      { t: "💼 Conocer un servicio específico", n: 'servicios' },
      { t: "🎯 Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     NIVEL 2A · MEJORAR EMPRESA
  ════════════════════════════════════════════════════════ */
  transformar: () => ({
    bot: `Genial, ${userName} 💡\n\nLas empresas como la tuya suelen tener tres tipos de problemas. ¿Cuál te suena más?`,
    opts: [
      { t: "Mi contabilidad es un desorden", n: 'q_cont_transform' },
      { t: "Pierdo tiempo en tareas manuales", n: 'q_web_transform' },
      { t: "Mi equipo no sabe analizar datos", n: 'datos_root' }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     NIVEL 2B · SERVICIOS
  ════════════════════════════════════════════════════════ */
  servicios: () => ({
    bot: `Tenemos tres servicios. ¿Cuál se ajusta a lo que buscas?`,
    opts: [
      { t: "📊 Celdexia Contable", n: 'cont_root' },
      { t: "💻 Celdexia Web", n: 'web_root' },
      { t: "🎓 Celdexia Academy", n: 'academy_root' }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     RUTA · CONTABLE
  ════════════════════════════════════════════════════════ */
  cont_root: () => ({
    bot: `Perfecto, ${userName}. Celdexia Contable lleva más de 10 años atendiendo empresas en toda Colombia, 100% digital.\n\n¿Qué necesitas resolver?`,
    opts: [
      { t: "Contabilidad mensual de mi empresa", n: 'cont_mensual' },
      { t: "Declaración de renta", n: 'cont_renta' },
      { t: "Auditoría o asesoría tributaria", n: 'cont_audit_advisory' }
    ]
  }),

  cont_mensual: () => ({
    bot: `Llevamos tu contabilidad completa desde $300.000/mes 💼\n\nIncluye software contable en la nube, estados financieros mensuales, declaraciones DIAN y soporte directo por WhatsApp con tu contador.\n\nTenemos 3 planes según el tamaño de tu empresa.`,
    opts: [
      { t: "Ver planes y precios", n: 'go_contable' },
      { t: "¿Mi empresa pequeña aplica?", n: 'cont_tamano' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  cont_tamano: () => ({
    bot: `Por supuesto, ${userName} 🙌\n\nAtendemos desde freelancers e independientes hasta empresas medianas. Trabajamos 100% digital, así que no importa en qué ciudad de Colombia estés.\n\nEl primer paso siempre es un diagnóstico de 30 minutos donde miramos tu caso concreto.`,
    opts: [
      { t: "Agendar mi diagnóstico", n: 'cta_diag' },
      { t: "Ver Celdexia Contable", n: 'go_contable' }
    ]
  }),

  cont_renta: () => ({
    bot: `Hacemos tu declaración de renta desde $120.000 ⚡\n\nProceso 100% digital. Entrega en 24–72 horas. Revisamos todas tus deducciones para que pagues solo lo justo.\n\n¿Quién declara?`,
    opts: [
      { t: "Persona natural 👤", n: 'cont_renta_n' },
      { t: "Empresa (persona jurídica) 🏢", n: 'cont_renta_e' },
      { t: "No sé si estoy obligado", n: 'cont_renta_chk' }
    ]
  }),

  cont_renta_n: () => ({
    bot: `Perfecto. Para personas naturales hacemos el formulario 210 con todos los anexos. Tú nos envías los documentos por WhatsApp y nosotros nos encargamos en menos de 72 horas.\n\n¿Cómo seguimos?`,
    opts: [
      { t: "Hablar por WhatsApp ahora", n: 'cta_wa' },
      { t: "Ver Celdexia Contable", n: 'go_contable' }
    ]
  }),

  cont_renta_e: () => ({
    bot: `Para empresas hacemos análisis tributario completo y aplicamos todas las deducciones legales para que pagues lo justo. Cotizamos según la complejidad.\n\n¿Cómo avanzamos?`,
    opts: [
      { t: "Cotizar por WhatsApp", n: 'cta_wa' },
      { t: "Ver Celdexia Contable", n: 'go_contable' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  cont_renta_chk: () => ({
    bot: `Estás obligado a declarar renta en 2026 si en 2025 tuviste:\n\n• Ingresos superiores a $69.7M COP\n• Patrimonio mayor a $224.1M COP\n• Consignaciones por más de $69.7M\n\nSi no estás seguro, revisamos tu caso sin costo en el diagnóstico.`,
    opts: [
      { t: "Revisar mi caso gratis", n: 'cta_diag' },
      { t: "Hablar por WhatsApp", n: 'cta_wa' }
    ]
  }),

  cont_audit_advisory: () => ({
    bot: `Dos servicios estratégicos:\n\n🔍 **Auditoría financiera** — desde $1.500.000. Revisión independiente de estados financieros y controles internos. Útil para crédito bancario o entrada de socios.\n\n💡 **Asesoría tributaria** — pagar lo justo legalmente y manejo de la DIAN.\n\n¿Cuál te interesa?`,
    opts: [
      { t: "Auditoría financiera", n: 'cta_diag' },
      { t: "Asesoría tributaria", n: 'cta_diag' },
      { t: "Ver Celdexia Contable", n: 'go_contable' }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     RUTA · WEB
  ════════════════════════════════════════════════════════ */
  web_root: () => ({
    bot: `Celdexia Web hace que tu negocio trabaje también cuando tú no estás, ${userName} 💻\n\n¿Qué necesita tu empresa?`,
    opts: [
      { t: "🌐 Una página web profesional", n: 'web_site' },
      { t: "⚙️ Automatizar procesos repetitivos", n: 'web_auto' },
      { t: "💻 Software o app a medida", n: 'web_sw' }
    ]
  }),

  web_site: () => ({
    bot: `Hacemos páginas web profesionales que sí venden:\n\n✓ Diseño moderno y responsive\n✓ Carga rápida y optimizada para Google\n✓ Integración con WhatsApp, pagos y CRMs\n\nLanding pages desde $1.200.000. Webs corporativas desde $3.500.000.`,
    opts: [
      { t: "Ver portafolio", n: 'go_web' },
      { t: "Cotizar mi proyecto", n: 'cta_wa' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  web_auto: () => ({
    bot: `Automatizar te puede ahorrar entre 10 y 30 horas por semana ⚙️\n\n• Facturación automática\n• Reportes que se hacen solos\n• Notificaciones a clientes\n• Sincronización entre sistemas\n• Atención inicial 24/7\n\nCada hora ahorrada es tiempo que recuperas para tu negocio.`,
    opts: [
      { t: "Cotizar mi automatización", n: 'cta_wa' },
      { t: "Ver Celdexia Web", n: 'go_web' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  web_sw: () => ({
    bot: `Cuando lo estándar no te sirve, hacemos software a medida:\n\n• Sistemas para gestionar tu operación\n• Plataformas para tus clientes\n• Integraciones con APIs\n• Apps móviles personalizadas\n\nCada proyecto es distinto, así que cotizamos según el alcance.`,
    opts: [
      { t: "Hablar con un experto", n: 'cta_wa' },
      { t: "Ver Celdexia Web", n: 'go_web' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     RUTA · ACADEMY
  ════════════════════════════════════════════════════════ */
  academy_root: () => ({
    bot: `Celdexia Academy forma equipos para que aprovechen los datos de tu empresa 🎓\n\nMás de 500 personas certificadas en Excel avanzado, Power BI y análisis de datos.\n\n¿Para quién es?`,
    opts: [
      { t: "Para mí (individual)", n: 'ac_indiv' },
      { t: "Para mi equipo de trabajo", n: 'ac_corp' },
      { t: "Ver cursos y precios", n: 'go_academy' }
    ]
  }),

  ac_indiv: () => ({
    bot: `Cursos de Excel avanzado, Power BI y análisis de datos. Todos 100% virtuales, con grabaciones disponibles y certificación incluida.\n\nPrecio de lanzamiento muy accesible.`,
    opts: [
      { t: "Ver catálogo", n: 'go_academy' },
      { t: "Info por WhatsApp", n: 'cta_wa' }
    ]
  }),

  ac_corp: () => ({
    bot: `Para capacitación corporativa hacemos programas a la medida según el nivel y los retos de tu equipo. Incluye seguimiento, ejercicios con tus datos reales y certificación.\n\n¿Cuántas personas son?`,
    opts: [
      { t: "Entre 2 y 5 personas", n: 'cta_wa' },
      { t: "Entre 6 y 15 personas", n: 'cta_wa' },
      { t: "Más de 15 personas", n: 'cta_wa' }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     RUTA · DATOS / IA
  ════════════════════════════════════════════════════════ */
  datos_root: () => ({
    bot: `Esto es lo que mejor hacemos, ${userName} 🤖\n\n¿Sobre qué quieres saber primero?`,
    opts: [
      { t: "Cómo convertimos datos en información útil", n: 'q_data_tech' },
      { t: "Cómo usamos IA en el análisis", n: 'q_ia' },
      { t: "Seguridad de mis datos", n: 'datos_seguridad' }
    ]
  }),

  datos_seguridad: () => ({
    bot: `Esto lo tomamos muy en serio 🛡️\n\n¿Qué te preocupa más?`,
    opts: [
      { t: "Que los datos no tengan errores", n: 'q_fiabilidad' },
      { t: "Dónde se guardan mis datos", n: 'q_custodia' },
      { t: "Que nadie más vea mi información", n: 'q_confidencial' }
    ]
  }),

  q_cont_transform: () => ({
    bot: `Buena pregunta, ${userName} 👇\n\nUna buena contabilidad cambia 4 cosas en tu empresa:\n\n1️⃣ **Sabes cuánto ganas de verdad** — cada mes, sin sorpresas.\n\n2️⃣ **Pagas solo lo justo en impuestos** — legalmente.\n\n3️⃣ **Detectas problemas a tiempo** — antes de que se vuelvan grandes.\n\n4️⃣ **Tomas decisiones con datos** — no con corazonadas.`,
    opts: [
      { t: "Ver Celdexia Contable", n: 'go_contable' },
      { t: "Seguridad de mis datos", n: 'datos_seguridad' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  q_web_transform: () => ({
    bot: `Una web bien hecha y automatizaciones cambian todo, ${userName} 💡\n\n🌐 **Tu negocio nunca cierra** — vende mientras duermes.\n\n🎯 **Te ven más profesional** — la primera impresión cuenta.\n\n⚙️ **Recuperas horas** — formularios, cobros y notificaciones funcionan solos.\n\n📈 **Sabes qué funciona** — Google Analytics te dice qué publicación trae clientes.\n\n🔄 **Todo conectado** — la web habla con tu contabilidad y tu CRM.`,
    opts: [
      { t: "Ver Celdexia Web", n: 'go_web' },
      { t: "Automatizar mis procesos", n: 'web_auto' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  q_data_tech: () => ({
    bot: `Te lo explico simple, ${userName} 🧠\n\nUsamos 5 técnicas para convertir datos brutos en información útil:\n\n📥 **Unificamos fuentes** — bancos, ventas, gastos, nómina, todo en un solo lugar.\n\n🧹 **Limpiamos los datos** — eliminamos errores y duplicados.\n\n📐 **Calculamos lo que importa** — márgenes, flujo de caja, rentabilidad por producto.\n\n📊 **Mostramos en Power BI** — gráficos claros, no tablas enredadas.\n\n🤖 **Aplicamos IA** — encuentra patrones que un humano no vería.`,
    opts: [
      { t: "Cómo usan la IA", n: 'q_ia' },
      { t: "Seguridad de mis datos", n: 'q_fiabilidad' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  q_ia: () => ({
    bot: `Sí, y de forma muy concreta — sin promesas vacías 🤖\n\nUsamos IA donde sí sirve:\n\n🔍 **Detecta cosas raras** — si hay un gasto sospechoso o una factura duplicada, te avisa.\n\n📈 **Proyecciones de flujo de caja** — modelos basados en tu historia real.\n\n🏷️ **Clasifica gastos automáticamente** — sin que tengas que hacerlo tú.\n\n📝 **Lee facturas y soportes solo** — acelera el cierre contable.\n\nLa IA no reemplaza al contador. Lo hace más rápido y preciso.`,
    opts: [
      { t: "Seguridad de mis datos", n: 'datos_seguridad' },
      { t: "Ver Celdexia Contable", n: 'go_contable' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  q_fiabilidad: () => ({
    bot: `Pregunta importante 🛡️\n\nGarantizamos información correcta con 5 controles:\n\n✅ **Doble revisión humana** — cada cierre lo revisan dos personas.\n\n✅ **Conciliación bancaria automática** — cada movimiento se cruza con tu extracto real.\n\n✅ **Alertas en el sistema** — el software detecta errores antes de publicar.\n\n✅ **Cada cifra trazable** — todo se rastrea al documento que lo respalda.\n\n✅ **Auditoría interna mensual** — revisamos muestras al azar para detectar fallas.\n\nResultado: cero sanciones DIAN en nuestros clientes activos.`,
    opts: [
      { t: "Dónde se guardan los datos", n: 'q_custodia' },
      { t: "Confidencialidad", n: 'q_confidencial' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  q_custodia: () => ({
    bot: `${userName}, esto lo cuidamos muy bien 🔐\n\nTus datos viven con 5 capas de protección:\n\n🔒 **Nube certificada ISO 27001** — ni discos sueltos ni correos personales.\n\n🔑 **Acceso solo a quien debe** — con registro de cada consulta.\n\n💾 **Respaldos diarios** — copias en varias ubicaciones distintas.\n\n📜 **Acuerdo de confidencialidad** — todo nuestro equipo firma NDA.\n\n⚖️ **Ley 1581/2012** — Protección de Datos Personales de Colombia.\n\nNi la IA accede a información personal sin tu permiso.`,
    opts: [
      { t: "Confidencialidad del equipo", n: 'q_confidencial' },
      { t: "Ver Celdexia Contable", n: 'go_contable' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  q_confidencial: () => ({
    bot: `${userName}, la confidencialidad es ley en Celdexia 🤝\n\nFirmamos NDA con todos los clientes desde el primer contacto, así no terminemos trabajando juntos.\n\nTu información financiera, tus contratos, tus márgenes, tus clientes... todo es 100% reservado. Nuestro equipo está vinculado por NDA y capacitado en protección de datos.`,
    opts: [
      { t: "Ver Celdexia Contable", n: 'go_contable' },
      { t: "Agendar mi diagnóstico", n: 'cta_diag' }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     CTAs FINALES
  ════════════════════════════════════════════════════════ */
  cta_diag: () => ({
    bot: `¡Perfecto, ${userName}! 🎯\n\nEl diagnóstico es de 30 minutos por videollamada. Te llevas un resumen claro de tu situación, sin compromiso ni costo.\n\n¿Cómo prefieres coordinarlo?`,
    opts: [
      { t: "📅 Agendar en mi calendario", n: '__cal_open', primary: true },
      { t: "💬 Prefiero WhatsApp", n: 'cta_wa' },
      { t: "📝 Llenar el formulario", n: 'cta_form' }
    ]
  }),

  cta_wa: () => ({
    bot: `Listo, ${userName} 🙌\n\nTe abro WhatsApp con un mensaje preparado para que solo presiones enviar.`,
    opts: [
      { t: "💬 Abrir WhatsApp", n: '__wa_open', primary: true }
    ]
  }),

  cta_form: () => ({
    bot: `Genial, ${userName} 📝\n\nTe llevo al formulario al final de la página. Te respondemos en menos de 24 horas hábiles.`,
    opts: [
      { t: "📝 Ir al formulario", n: '__scroll_form', primary: true }
    ]
  }),

  /* ════════════════════════════════════════════════════════
     REDIRECCIONES
  ════════════════════════════════════════════════════════ */
  go_contable: () => ({
    bot: `¡Listo, ${userName}! 📊\n\nTe llevo a Celdexia Contable: planes, precios y servicios detallados.`,
    opts: [
      { t: "🔗 Abrir Celdexia Contable", n: '__open_contable', primary: true },
      { t: "Hablar contigo primero", n: 'cta_wa' }
    ]
  }),

  go_web: () => ({
    bot: `Genial, ${userName} 💻\n\nTe llevo a Celdexia Web: portafolio, servicios y precios.`,
    opts: [
      { t: "🔗 Abrir Celdexia Web", n: '__open_web', primary: true },
      { t: "Hablar contigo primero", n: 'cta_wa' }
    ]
  }),

  go_academy: () => ({
    bot: `¡Perfecto, ${userName}! 🎓\n\nTe llevo a Celdexia Academy: cursos, precios y certificaciones.`,
    opts: [
      { t: "🔗 Abrir Celdexia Academy", n: '__open_academy', primary: true },
      { t: "Capacitar a mi equipo", n: 'cta_wa' }
    ]
  })

};

/* ────────────────────────────────────────────────────────
   MOTOR DEL CHATBOT
──────────────────────────────────────────────────────── */
function addMsg(text, type){
  const d = document.createElement('div');
  d.className = 'msg ' + type;
  const b = document.createElement('div');
  b.className = 'msg-bubble';
  // Permitir negrita simple **texto**
  const html = text
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  b.innerHTML = html;
  d.appendChild(b);
  msgsEl.appendChild(d);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  return d;
}

function showTyping(){
  const t = document.createElement('div');
  t.className = 'msg bot';
  t.id = 'typing-indicator';
  t.innerHTML = '<div class="msg-bubble"><div class="cp-typing"><span></span><span></span><span></span></div></div>';
  msgsEl.appendChild(t);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}
function removeTyping(){
  const t = document.getElementById('typing-indicator');
  if(t) t.remove();
}

function setOpts(opts, addBack){
  optsEl.innerHTML = '';
  if(!opts || opts.length === 0) return;
  opts.forEach(o => {
    const btn = document.createElement('button');
    btn.className = 'cp-opt' + (o.primary ? ' primary' : '');
    btn.textContent = o.t;
    btn.onclick = () => handleOpt(o);
    optsEl.appendChild(btn);
  });
  /* Botón Regresar (cuando hay historial y no estamos en start) */
  if(addBack && navHistory.length > 0){
    const back = document.createElement('button');
    back.className = 'cp-opt cp-back';
    back.textContent = '← Regresar';
    back.onclick = () => handleBack();
    optsEl.appendChild(back);
  }
}

function handleBack(){
  if(navHistory.length === 0) return;
  const previousFlow = navHistory.pop();
  optsEl.innerHTML = '';
  setTimeout(() => {
    showTyping();
    setTimeout(() => {
      removeTyping();
      const flowFn = FLOWS[previousFlow];
      if(flowFn){
        currentFlow = previousFlow;
        const f = flowFn();
        addMsg(f.bot, 'bot');
        setOpts(f.opts, navHistory.length > 0 || previousFlow !== 'start');
      }
    }, 600);
  }, 200);
}

function showInput(placeholder){
  inputArea.classList.remove('is-hidden');
  optsEl.classList.add('is-hidden');
  inputEl.placeholder = placeholder || 'Escribe aquí...';
  inputEl.value = '';
  inputEl.disabled = false;
  setTimeout(() => inputEl.focus(), 350);
}
function hideInput(){
  inputArea.classList.add('is-hidden');
  optsEl.classList.remove('is-hidden');
}

function handleOpt(opt){
  addMsg(opt.t, 'usr');
  optsEl.innerHTML = '';

  /* Acciones especiales (no se guardan en historial) */
  if(opt.n === '__cal_open'){
    window.open(CAL_LINK, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg(`Listo, ${userName} 📅\n\nAbrí mi calendario en otra pestaña para que elijas el horario que mejor te quede. ¡Nos vemos en 30 minutos!`, 'bot');
        setOpts([
          { t: "Volver al inicio", n: 'start' }
        ]);
      }, 700);
    }, 300);
    return;
  }
  if(opt.n === '__wa_open'){
    const msg = `Hola Grupo Celdexia SAS, soy ${userName}. Quiero agendar mi diagnóstico gratuito de 30 minutos.`;
    window.open(WA_BASE + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg(`Listo, ${userName}. Te esperamos en WhatsApp 👋\n\n¿Quieres seguir explorando algo más?`, 'bot');
        setOpts([
          { t: "Sí, volver al inicio", n: 'start' }
        ]);
      }, 700);
    }, 300);
    return;
  }
  if(opt.n === '__scroll_form'){
    document.getElementById('contacto').scrollIntoView({
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
    const nombreInput = document.getElementById('f-nombre');
    if(nombreInput && userName) nombreInput.value = userName;
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg(`Te llevé al formulario, ${userName} 📝\n\nLlénalo y un especialista te contacta en menos de 24h. ¿Te ayudo con algo más?`, 'bot');
        setOpts([
          { t: "Volver al inicio", n: 'start' }
        ]);
      }, 700);
    }, 600);
    return;
  }
  if(opt.n === '__open_contable'){
    window.open(WEB_CONTABLE, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg(`Abrí Celdexia Contable en otra pestaña, ${userName} 😊\n\nCuando termines de revisar, vuelve y agendamos tu diagnóstico si te interesa.`, 'bot');
        setOpts([
          { t: "🎯 Agendar diagnóstico", n: 'cta_diag' },
          { t: "Volver al inicio", n: 'start' }
        ]);
      }, 700);
    }, 300);
    return;
  }
  if(opt.n === '__open_web'){
    window.open(WEB_WEB, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg(`Abrí Celdexia Web en otra pestaña, ${userName} 😊\n\nCuando regreses, podemos seguir o agendar tu diagnóstico.`, 'bot');
        setOpts([
          { t: "🎯 Agendar diagnóstico", n: 'cta_diag' },
          { t: "Volver al inicio", n: 'start' }
        ]);
      }, 700);
    }, 300);
    return;
  }
  if(opt.n === '__open_academy'){
    window.open(WEB_ACADEMY, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg(`Abrí Celdexia Academy en otra pestaña, ${userName} 🎓\n\nCuando termines de revisar, vuelve y conversamos si necesitas algo más.`, 'bot');
        setOpts([
          { t: "🎯 Agendar diagnóstico", n: 'cta_diag' },
          { t: "Volver al inicio", n: 'start' }
        ]);
      }, 700);
    }, 300);
    return;
  }

  /* Si el usuario va al inicio, vaciamos historial */
  if(opt.n === 'start'){
    navHistory = [];
  } else if(currentFlow && currentFlow !== opt.n){
    /* Guardamos el flujo actual antes de navegar al siguiente */
    navHistory.push(currentFlow);
  }

  /* Flujo normal */
  setTimeout(() => {
    showTyping();
    setTimeout(() => {
      removeTyping();
      const flowFn = FLOWS[opt.n];
      if(flowFn){
        currentFlow = opt.n;
        const f = flowFn();
        addMsg(f.bot, 'bot');
        /* Mostrar Regresar si hay historial Y no estamos en start */
        setOpts(f.opts, opt.n !== 'start');
      }
    }, 800 + Math.random() * 400);
  }, 250);
}

function handleTextInput(){
  const value = inputEl.value.trim();
  if(!value) return;
  
  /* Primera entrada: capturar nombre */
  if(!userName){
    const cleanName = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,'').trim().split(' ')[0];
    userName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase() || 'amigo';
    addMsg(value, 'usr');
    inputEl.value = '';
    hideInput();
    
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        const f = FLOWS.start();
        currentFlow = 'start';
        addMsg(f.bot, 'bot');
        setOpts(f.opts);
      }, 900);
    }, 300);
    return;
  }
}

inputEl.addEventListener('keydown', e => {
  if(e.key === 'Enter'){
    e.preventDefault();
    handleTextInput();
  }
});
if(sendBtn) sendBtn.addEventListener('click', handleTextInput);

/* ────────────────────────────────────────────────────────
   FAQ ACORDEÓN
──────────────────────────────────────────────────────── */
const faqItems = Array.from(document.querySelectorAll('#faq .faq-item'));
document.querySelectorAll('#faq .faq-q').forEach(btn => {
  const item = btn.closest('.faq-item');
  const panel = item ? item.querySelector('.faq-a') : null;
  if(item && panel){
    const index = faqItems.indexOf(item) + 1;
    const btnId = `faq-button-${index}`;
    const panelId = `faq-panel-${index}`;
    btn.id = btnId;
    panel.id = panelId;
    btn.setAttribute('aria-controls', panelId);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', btnId);
    panel.setAttribute('aria-hidden', 'true');
  }
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    /* Cierra todos */
    document.querySelectorAll('#faq .faq-item.open').forEach(i => {
      i.classList.remove('open');
      const openBtn = i.querySelector('.faq-q');
      const openPanel = i.querySelector('.faq-a');
      if(openBtn) openBtn.setAttribute('aria-expanded', 'false');
      if(openPanel) openPanel.setAttribute('aria-hidden', 'true');
    });
    /* Abre el actual si estaba cerrado */
    if(!isOpen){
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      const panel = item.querySelector('.faq-a');
      if(panel) panel.setAttribute('aria-hidden', 'false');
    }
  });
});

/* ────────────────────────────────────────────────────────
   ARRANQUE DEL CHAT (pide nombre)
──────────────────────────────────────────────────────── */
function startChat(){
  if(chatStarted) return;
  chatStarted = true;
  msgsEl.innerHTML = '';
  optsEl.innerHTML = '';
  hideInput();

  setTimeout(() => {
    showTyping();
    setTimeout(() => {
      removeTyping();
      addMsg("¡Hola! 👋 Soy Celex, asistente virtual de Grupo Celdexia SAS.", 'bot');
      
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          removeTyping();
          addMsg("Para atenderte mejor, ¿cómo te llamas?", 'bot');
          showInput("Tu nombre...");
        }, 1100);
      }, 700);
    }, 900);
  }, 350);
}

function toggleChat(){
  chatOpen = !chatOpen;
  const panel = document.getElementById('chat-panel');
  const notif = document.getElementById('chat-notif');
  const tooltip = document.getElementById('chat-tooltip');
  const chatBtn = document.getElementById('chat-btn');
  if(!panel || !notif || !tooltip) return;

  if(chatOpen){
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if(chatBtn) chatBtn.setAttribute('aria-expanded', 'true');
    if(chatCloseBtn) chatCloseBtn.focus();
    notif.classList.remove('show');
    tooltip.classList.remove('show');
    
    if(!chatStarted){
      startChat();
    } else if(userName) {
      /* Re-saludar a usuario que vuelve */
      msgsEl.innerHTML = '';
      optsEl.innerHTML = '';
      hideInput();
      navHistory = [];
      currentFlow = 'start';
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          removeTyping();
          addMsg(`¡Hola de nuevo, ${userName}! 😊 ¿En qué te puedo ayudar?`, 'bot');
          const f = FLOWS.start();
          setOpts(f.opts);
        }, 700);
      }, 300);
    }
  } else {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if(chatBtn) chatBtn.setAttribute('aria-expanded', 'false');
    if(chatBtn) chatBtn.focus();
  }
}
const chatBtn = document.getElementById('chat-btn');
if(chatBtn) chatBtn.addEventListener('click', toggleChat);
const chatCloseBtn = document.querySelector('#chat-panel .cp-close');
if(chatCloseBtn) chatCloseBtn.addEventListener('click', toggleChat);

/* Tooltip automático tras 6s */
let tooltipShown = false;
setTimeout(() => {
  if(!chatOpen && !tooltipShown){
    tooltipShown = true;
    try{ if(sessionStorage.getItem('celdexia_chat_seen')) return; }catch(e){}
    try{ sessionStorage.setItem('celdexia_chat_seen','1'); }catch(e){}
    const notif = document.getElementById('chat-notif');
    const tooltip = document.getElementById('chat-tooltip');
    if(!notif || !tooltip) return;
    notif.classList.add('show');
    tooltip.classList.add('show');
    setTimeout(() => tooltip.classList.remove('show'), 5500);
  }
}, 6000);
