import React from 'react';
import { Camera, Layout, Video, ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const services: Service[] = [
  {
    id: 'photo',
    title: 'Fotografía Inmobiliaria',
    description: 'Captura imágenes de alto impacto y calidad para destacar tus activos inmobiliarios de alta calidad.',
    icon: <Camera size={28} className="text-[#1c304a]" />,
  },
  {
    id: 'plans',
    title: 'Digitalización de Planos',
    description: 'Planos digitales a 2D planos digitales de alta precisión y con gran detalle arquitectónico.',
    icon: <Layout size={28} className="text-[#1c304a]" />,
  },
  {
    id: 'video',
    title: 'Producción de Video (Vertical/Horizontal)',
    description: 'Crear tours interactivos para inmobiliarias para diversas propiedades y plataformas digitales.',
    icon: <Video size={28} className="text-[#1c304a]" />,
  }
];

const ServicesSection: React.FC = () => {
  return (
    <div id="servicios" className="bg-[#d9c5b2] py-16 px-6 md:px-20">
      <h2 className="text-3xl font-bold text-[#1c304a] mb-10">Servicios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow group">
            <div className="mb-6 p-2 border border-black/10 inline-block rounded-lg">
              {service.icon}
            </div>
            <h3 className="text-xl font-bold text-[#1c304a] mb-4">{service.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {service.description}
            </p>
            <a href="#pedido" className="flex items-center gap-2 text-[#1c304a] font-bold text-sm hover:opacity-70 transition-opacity">
              Solicitar <ArrowRight size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
