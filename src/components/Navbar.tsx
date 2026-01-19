import React from 'react';
import { Building2 } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#d9c5b2] py-4 px-6 md:px-20 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-[#1c304a] p-1.5 rounded-sm">
          <Building2 size={24} className="text-[#d9c5b2]" />
        </div>
      </div>
      <div className="flex gap-8 font-semibold text-[#1c304a] text-sm uppercase tracking-wide">
        <a href="#servicios" className="hover:opacity-70 transition-opacity">Servicios</a>
        <a href="#proyectos" className="hover:opacity-70 transition-opacity">Proyectos</a>
        <a href="#pedido" className="hover:opacity-70 transition-opacity">Contacto</a>
      </div>
    </nav>
  );
};

export default Navbar;
