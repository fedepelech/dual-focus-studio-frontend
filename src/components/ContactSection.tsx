import React, { useState } from 'react';
import { Phone, Mail, Linkedin, Instagram, Facebook } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('¡Gracias por contactarnos! Te responderemos a la brevedad.');
    // Resetear el formulario
    setFormData({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <div id="contacto" className="bg-[#d9c5b2] py-20 px-6 md:px-20">
      <h2 className="text-3xl font-bold text-[#1c304a] mb-12">Contacto</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Contact Form Wrapper */}
        <div className="bg-[#1c304a] p-8 rounded-xl shadow-xl text-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider opacity-80">Nombre</label>
                <input
                  type="text"
                  className="w-full bg-white text-gray-900 rounded-md p-3 outline-none focus:ring-2 focus:ring-[#d9c5b2] transition-shadow"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider opacity-80">Correo Electrónico</label>
                <input
                  type="email"
                  className="w-full bg-white text-gray-900 rounded-md p-3 outline-none focus:ring-2 focus:ring-[#d9c5b2] transition-shadow"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider opacity-80">Mensaje</label>
              <textarea
                rows={5}
                className="w-full bg-white text-gray-900 rounded-md p-3 outline-none focus:ring-2 focus:ring-[#d9c5b2] transition-shadow"
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#d9c5b2] text-[#1c304a] font-bold py-4 rounded-md hover:opacity-90 transition-opacity uppercase tracking-widest text-sm"
            >
              Enviar
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-[#1c304a]">Información de Contacto</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-[#1c304a]">
              <Phone size={20} />
              <span className="font-medium">+54 9 11 2133 3333</span>
            </div>
            <div className="flex items-center gap-4 text-[#1c304a]">
              <Mail size={20} />
              <span className="font-medium">contacto@dualfocus.com.ar</span>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="#" className="bg-[#1c304a] text-[#d9c5b2] p-2.5 rounded-lg hover:opacity-80 transition-opacity">
              <Linkedin size={20} />
            </a>
            <a href="#" className="bg-[#1c304a] text-[#d9c5b2] p-2.5 rounded-lg hover:opacity-80 transition-opacity">
              <Instagram size={20} />
            </a>
            <a href="#" className="bg-[#1c304a] text-[#d9c5b2] p-2.5 rounded-lg hover:opacity-80 transition-opacity">
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
