import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

/** Enlaces de navegación del sitio */
const NAV_LINKS = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#faq', label: 'FAQ' },
  { href: '#pedido', label: 'Contacto' },
];

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);


  return (
    <nav className="bg-[#d9c5b2] sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center py-4 px-6 md:px-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img src="/logo.jpg" alt="Dual Focus" className="h-10 w-auto object-contain rounded-sm" />
          <span className="font-bold text-[#1c304a] text-lg hidden sm:block">Dual Focus</span>
        </a>

        {/* Links desktop */}
        <div className="hidden md:flex gap-8 font-semibold text-[#1c304a] text-sm uppercase tracking-wide">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                const targetId = link.href.replace('#', '');
                const element = document.getElementById(targetId);
                if (element) {
                  const top = element.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
              className="hover:opacity-70 transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Botón hamburguesa mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#1c304a] p-1 rounded-md hover:bg-[#1c304a]/10 transition-colors"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú mobile desplegable */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="flex flex-col gap-1 px-6 pb-4 border-t border-[#1c304a]/10">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                const targetId = link.href.replace('#', '');
                const element = document.getElementById(targetId);
                if (element) {
                  const top = element.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
              className="py-3 px-4 text-[#1c304a] font-semibold text-sm uppercase tracking-wide hover:bg-[#1c304a]/10 rounded-md transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
