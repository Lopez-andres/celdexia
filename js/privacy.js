/* Navegación y tema de la página informativa. No carga lógica del chatbot ni del formulario. */
const navLinks = document.getElementById('navLinks');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const services = document.getElementById('navServices');
const servicesToggle = services?.querySelector('.nav-caret-btn');

function closeNav(){
  navLinks?.classList.remove('open');
  burger?.classList.remove('open');
  burger?.setAttribute('aria-expanded', 'false');
  services?.classList.remove('services-open');
  servicesToggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function toggleNav(event){
  event?.stopPropagation?.();
  if(!navLinks || !burger) return;
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  if(open) navLinks.querySelector('a,button')?.focus();
}

function toggleServices(event){
  event.preventDefault();
  event.stopPropagation();
  if(!services || !servicesToggle) return;
  const open = services.classList.toggle('services-open');
  servicesToggle.setAttribute('aria-expanded', String(open));
}

document.getElementById('burger')?.addEventListener('click', toggleNav);
servicesToggle?.addEventListener('click', toggleServices);
document.querySelectorAll('#nav a').forEach(link => link.addEventListener('click', closeNav));

document.addEventListener('click', event => {
  if(navLinks?.classList.contains('open') && !document.getElementById('nav')?.contains(event.target)){
    closeNav();
  }
});

document.addEventListener('keydown', event => {
  if(event.key === 'Escape') closeNav();
});

window.addEventListener('resize', () => {
  if(window.innerWidth > 768 && navLinks?.classList.contains('open')) closeNav();
});

window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive:true });

function applyTheme(theme){
  const dark = theme === 'dark';
  document.body.classList.toggle('dark-mode', dark);
  const toggle = document.getElementById('themeToggle');
  if(toggle){
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
  }
}

let savedTheme = null;
try{ savedTheme = localStorage.getItem('celdexia-theme'); }catch(_err){}
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  try{ localStorage.setItem('celdexia-theme', next); }catch(_err){}
  applyTheme(next);
});
