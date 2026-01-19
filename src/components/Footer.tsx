import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c304a] text-white py-12 px-6 md:px-20 border-t border-white/10 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h3 className="text-xl font-bold mb-2">Real Estate Studio</h3>
          <p className="text-xs opacity-60 max-w-xs">
            Servicios profesionales de arquitectura, fotografía y digitalización de planos.
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-4 text-xs opacity-60">
          <div className="flex gap-6">
            <a href="#" className="hover:opacity-100 transition-opacity">Términos y Condiciones</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Política de Privacidad</a>
          </div>
          <p>
            © {new Date().getFullYear()} Real Estate Studio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
