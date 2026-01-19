import React from 'react';

interface HeroProps {
  onOrderClick: () => void;
  onServicesClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick, onServicesClick }) => {
  return (
    <div className="bg-[#1c304a] text-white py-20 px-6 md:px-20 flex flex-col items-start min-h-[500px] justify-center">
      <div className="max-w-3xl">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold border border-white/30 px-3 py-1 rounded-full text-white/80 mb-6 inline-block">
          Servicios de Arquitectura Profesional
        </span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Transformamos tu <span className="italic font-light opacity-90 underline decoration-1 underline-offset-4">visión</span> en realidad digital
        </h1>
        <p className="text-white/70 text-lg mb-10 leading-relaxed max-w-2xl">
          Fotografía inmobiliaria de alto impacto y planos digitales precisos en Archicad/Autocad.
          Ayudamos a arquitectos, inmobiliarias y propietarios a destacar sus proyectos.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onServicesClick}
            className="bg-[#d9c5b2] text-[#1c304a] px-8 py-3 rounded-full font-bold hover:bg-white transition-colors text-sm"
          >
            Nuestros Servicios
          </button>
          <button
            onClick={onOrderClick}
            className="border border-white/50 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors text-sm"
          >
            Solicitar presupuesto
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
