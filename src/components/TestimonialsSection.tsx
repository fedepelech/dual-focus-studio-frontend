import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../api/axios';

interface Testimonial {
  id: string;
  name: string;
  company?: string;
  quote: string;
  rating: number;
}

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Martín López',
    company: 'Inmobiliaria del Sur',
    quote: 'Las fotos que nos entregaron superaron nuestras expectativas. Las propiedades se venden mucho más rápido gracias a la calidad visual.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Carolina Fernández',
    company: 'CF Desarrollos',
    quote: 'Los planos digitales son increíblemente precisos. Nos ahorraron horas de trabajo y nuestros clientes quedan encantados con la presentación.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Ricardo Alonso',
    company: 'Alonso Propiedades',
    quote: 'Excelente atención y tiempos de entrega. Trabajan con un nivel de profesionalismo que se nota en cada detalle del resultado final.',
    rating: 5,
  },
];

const MAX_RATING = 5;

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews');
        if (res.data && res.data.length > 0) {
          // Mapear reviews a formato testimonial
          const dynamicReviews = res.data.map((r: any) => ({
            id: r.id,
            name: r.authorName,
            quote: r.comment || '¡Excelente servicio!',
            rating: r.rating,
          }));

          // Combinar con los iniciales si hay pocos, o reemplazarlos
          if (dynamicReviews.length >= 3) {
            setTestimonials(dynamicReviews);
          } else {
            setTestimonials([...dynamicReviews, ...INITIAL_TESTIMONIALS].slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#1c304a] mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Más de 100 profesionales confían en nosotros para destacar sus propiedades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[#f8f5f0] rounded-xl p-8 border border-[#e4d0bb]/50 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Estrellas */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: MAX_RATING }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                  />
                ))}
              </div>

              {/* Cita */}
              <p className="text-gray-700 text-sm leading-relaxed mb-6 italic flex-grow">
                "{testimonial.quote}"
              </p>

              {/* Nombre y empresa */}
              <div className="border-t border-[#e4d0bb]/50 pt-4">
                <p className="font-bold text-[#1c304a] text-sm">{testimonial.name}</p>
                {testimonial.company && (
                  <p className="text-xs text-gray-500">{testimonial.company}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
