import { Container, Title, Text, Group, Stack, Modal, ActionIcon, Box, Image } from '@mantine/core';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { OrderForm } from './components/OrderForm';
import { useRef, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { QuestionsManager } from './pages/admin/QuestionsManager';
import { PortfolioManager } from './pages/admin/PortfolioManager';
import { OrdersManager } from './pages/admin/OrdersManager';
import api from './api/axios';

// Importar nuevos componentes de diseño
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

interface PortfolioImage {
  id: string;
  filename: string;
  caption?: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  category?: string;
  images: PortfolioImage[];
}

// Componente para proteger rutas de admin
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

// URL base para las imágenes
const UPLOADS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '/uploads');

function HomePage() {
  const formRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    api.get('/portfolio').then(res => setPortfolio(res.data)).catch(console.error);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openProjectModal = (project: PortfolioProject) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject && currentImageIndex < selectedProject.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        <Hero
          onOrderClick={scrollToForm}
          onServicesClick={scrollToServices}
        />

        <div ref={servicesRef}>
          <ServicesSection />
        </div>

        <ProjectsSection
          portfolio={portfolio}
          onProjectClick={openProjectModal}
          uploadsUrl={UPLOADS_URL}
        />

        {/* Order Form Section */}
        <section id="pedido" ref={formRef} className="py-24 bg-[#f2e7d5]">
          <Container size="sm">
            <Stack align="center" gap="xs" mb={40}>
              <h2 className="text-3xl font-bold text-[#1c304a]">Hacé tu pedido</h2>
              <Text color="dimmed" ta="center">Completá el formulario y nos contactaremos en menos de 24hs.</Text>
            </Stack>
            <OrderForm />
          </Container>
        </section>

        {/* How it Works Section (Migrada con el nuevo estilo) */}
        <section className="py-24 bg-white">
          <Container size="lg">
            <Stack align="center" gap="xs" mb={60}>
              <h2 className="text-3xl font-bold text-[#1c304a]">Cómo Trabajamos</h2>
              <Text color="dimmed">Un proceso simple y transparente para resultados excepcionales.</Text>
            </Stack>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Stack align="center" ta="center">
                <div className="w-16 h-16 rounded-full bg-[#f2e7d5] flex items-center justify-center text-[#1c304a] font-bold text-xl border-2 border-[#d9c5b2]">
                  1
                </div>
                <h4 className="text-xl font-bold text-[#1c304a]">Solicitud</h4>
                <Text size="sm" color="dimmed">Elegís el servicio y completás los datos de la propiedad en el formulario.</Text>
              </Stack>

              <Stack align="center" ta="center">
                <div className="w-16 h-16 rounded-full bg-[#f2e7d5] flex items-center justify-center text-[#1c304a] font-bold text-xl border-2 border-[#d9c5b2]">
                  2
                </div>
                <h4 className="text-xl font-bold text-[#1c304a]">Coordinación</h4>
                <Text size="sm" color="dimmed">Te contactamos para coordinar la visita técnica o recibir la documentación.</Text>
              </Stack>

              <Stack align="center" ta="center">
                <div className="w-16 h-16 rounded-full bg-[#f2e7d5] flex items-center justify-center text-[#1c304a] font-bold text-xl border-2 border-[#d9c5b2]">
                  3
                </div>
                <h4 className="text-xl font-bold text-[#1c304a]">Entrega Digital</h4>
                <Text size="sm" color="dimmed">Recibís tus fotos editadas o planos digitalizados en menos de 48hs hábiles.</Text>
              </Stack>
            </div>
          </Container>
        </section>

        <ContactSection />
      </main>

      <Footer />

      {/* Modal de Proyecto con Carrusel (Preservado) */}
      <Modal
        opened={!!selectedProject}
        onClose={closeProjectModal}
        size="xl"
        title={selectedProject?.title}
        centered
        styles={{
          title: { fontWeight: 'bold', color: '#1c304a' }
        }}
      >
        {selectedProject && selectedProject.images.length > 0 && (
          <Stack>
            <Box pos="relative">
              <Image
                src={`${UPLOADS_URL}/${selectedProject.images[currentImageIndex].filename}`}
                alt={selectedProject.images[currentImageIndex].caption || 'Imagen'}
                height={400}
                fit="contain"
                radius="md"
              />
              {selectedProject.images.length > 1 && (
                <>
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    size="lg"
                    radius="xl"
                    pos="absolute"
                    left={10}
                    top="50%"
                    style={{ transform: 'translateY(-50%)' }}
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft size={20} />
                  </ActionIcon>
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    size="lg"
                    radius="xl"
                    pos="absolute"
                    right={10}
                    top="50%"
                    style={{ transform: 'translateY(-50%)' }}
                    onClick={nextImage}
                    disabled={currentImageIndex === selectedProject.images.length - 1}
                  >
                    <ChevronRight size={20} />
                  </ActionIcon>
                </>
              )}
            </Box>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {selectedProject.images[currentImageIndex].caption || 'Sin descripción'}
              </Text>
              <Text size="xs" c="dimmed">
                {currentImageIndex + 1} / {selectedProject.images.length}
              </Text>
            </Group>
            {selectedProject.description && (
              <Text size="sm" mt="md">{selectedProject.description}</Text>
            )}
          </Stack>
        )}
        {selectedProject && selectedProject.images.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">Este proyecto no tiene imágenes.</Text>
        )}
      </Modal>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={
              <div className="p-8">
                <Title order={1} mb="md">Bienvenido Admin</Title>
                <Text size="lg">Desde aquí puedes gestionar las preguntas del formulario y las imágenes del portfolio.</Text>
              </div>
            } />
            <Route path="questions" element={<QuestionsManager />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="orders" element={<OrdersManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
