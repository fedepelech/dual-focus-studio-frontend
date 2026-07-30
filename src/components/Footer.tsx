import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c304a] text-white py-12 px-6 md:px-20 border-t border-white/10 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h3 className="text-xl font-bold mb-2">Dual Focus</h3>
          <p className="text-xs opacity-60 max-w-xs">
            Servicios profesionales de arquitectura, fotografía y digitalización de planos.
          </p>
        </div>
        <div className="flex flex-col md:items-end text-xs opacity-60">
          <p>
            © {new Date().getFullYear()} Dual Focus. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
