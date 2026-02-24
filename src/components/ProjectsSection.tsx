import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Group } from '@mantine/core';

interface PortfolioImage {
  id: string;
  filename: string;
  url: string;
  caption?: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  category?: string;
  images: PortfolioImage[];
}

interface ProjectsSectionProps {
  portfolio: PortfolioProject[];
  onProjectClick: (project: PortfolioProject) => void;
  uploadsUrl: string;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ portfolio, onProjectClick, uploadsUrl }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(portfolio.length / itemsPerPage);

  if (portfolio.length === 0) return null;

  const currentProjects = portfolio.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextSlide = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevSlide = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div id="proyectos" className="bg-white py-20 px-6 md:px-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-[#1c304a] mb-4">Trabajos Realizados</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Una muestra de nuestra calidad y profesionalismo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {currentProjects.map((project) => (
          <div key={project.id} className="group cursor-pointer" onClick={() => onProjectClick(project)}>
            <div className="overflow-hidden rounded-2xl mb-6 aspect-[4/3] bg-gray-100">
              {project.images.length > 0 ? (
                <img
                  src={project.images[0].url.startsWith('http') ? project.images[0].url : `${uploadsUrl}${project.images[0].url}`}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sin imágenes
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-[#1c304a] mb-1">{project.title}</h3>
            {project.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>}
            <div className="flex gap-2">
              {project.category && (
                <span className="bg-[#f2e7d5] text-[#1c304a] px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase">
                  {project.category}
                </span>
              )}
              <span className="bg-[#f2e7d5] text-[#1c304a] px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase">
                {project.images.length} FOTO(S)
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Button
            variant="outline"
            color="dark"
            onClick={prevSlide}
            disabled={currentPage === 0}
            leftSection={<ChevronLeft size={16} />}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            color="dark"
            onClick={nextSlide}
            disabled={currentPage === totalPages - 1}
            rightSection={<ChevronRight size={16} />}
          >
            Siguiente
          </Button>
        </Group>
      )}
    </div>
  );
};

export default ProjectsSection;
