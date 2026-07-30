import { Container, Title, Text, Group, Stack, Modal, ActionIcon, Box, Loader } from '@mantine/core';
import { ChevronRight, ChevronLeft, PlayCircle } from 'lucide-react';
import { OrderForm } from './components/OrderForm';
import { useRef, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { QuestionsManager } from './pages/admin/QuestionsManager';
import { PortfolioManager } from './pages/admin/PortfolioManager';
import ZonasManager from './pages/admin/ZonasManager';
import ReviewPage from './pages/ReviewPage';
import { OrdersManager } from './pages/admin/OrdersManager';
import { FaqManager } from './pages/admin/FaqManager';
import api from './api/axios';
import { UPLOADS_URL } from './config/env';

// Importar nuevos componentes de diseño
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import TestimonialsSection from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';

interface PortfolioImage {
  id: string;
  filename: string;
  url: string;
  caption?: string;
}

interface PortfolioVideo {
  id: string;
  filename: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url: string;
  title?: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  category?: string;
  images: PortfolioImage[];
  videos?: PortfolioVideo[];
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
}

// Componente para proteger rutas de admin
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

function HomePage() {
  const formRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    api.get('/portfolio').then(res => setPortfolio(res.data)).catch(console.error);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Construir lista combinada de archivos multimedia (fotos y videos)
  const mediaList: MediaItem[] = selectedProject
    ? [
        ...(selectedProject.images || []).map((img) => ({
          id: img.id,
          type: 'image' as const,
          url: img.url.startsWith('http') ? img.url : `${UPLOADS_URL}${img.url}`,
          title: img.caption,
        })),
        ...(selectedProject.videos || []).map((vid) => ({
          id: vid.id,
          type: 'video' as const,
          url: vid.url.startsWith('http') ? vid.url : `${UPLOADS_URL}${vid.url}`,
          title: vid.title || vid.originalName,
        })),
      ]
    : [];

  // Pre-cargar todas las imágenes en segundo plano cuando se abre un proyecto
  useEffect(() => {
    if (selectedProject && mediaList.length > 0) {
      mediaList.forEach((item) => {
        if (item.type === 'image') {
          const img = new window.Image();
          img.src = item.url;
        }
      });
    }
  }, [selectedProject?.id]);

  const openProjectModal = (project: PortfolioProject) => {
    setSelectedProject(project);
    setCurrentMediaIndex(0);
    setMediaLoading(true);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setCurrentMediaIndex(0);
    setMediaLoading(false);
  };

  const nextMedia = () => {
    if (currentMediaIndex < mediaList.length - 1) {
      setMediaLoading(true);
      setCurrentMediaIndex((prev) => prev + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setMediaLoading(true);
      setCurrentMediaIndex((prev) => prev - 1);
    }
  };

  const currentItem = mediaList[currentMediaIndex];

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
          <Container size="lg">
            <Stack align="center" gap="xs" mb={40}>
              <h2 className="text-3xl font-bold text-[#1c304a]">Hacé tu pedido</h2>
              <Text color="dimmed" ta="center">Completá el formulario y nos contactaremos en menos de 24hs.</Text>
            </Stack>
            <OrderForm />
          </Container>
        </section>

        {/* How it Works Section */}
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
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>

      <Footer />
      <WhatsAppButton />

      {/* Modal de Proyecto con Carrusel Multimedia (Fotos y Videos R2) */}
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
        {selectedProject && mediaList.length > 0 && currentItem && (
          <Stack>
            <Box pos="relative" style={{ minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
              {mediaLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
                  <Loader color="dark" size="lg" type="dots" />
                  <Text size="xs" fw={600} c="dark" mt="xs">
                    Cargando...
                  </Text>
                </div>
              )}
              
              {currentItem.type === 'image' ? (
                <img
                  key={currentItem.url}
                  src={currentItem.url}
                  alt={currentItem.title || 'Imagen del proyecto'}
                  style={{ maxHeight: 450, width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  onLoad={() => setMediaLoading(false)}
                  onError={() => setMediaLoading(false)}
                />
              ) : (
                <div key={currentItem.url} className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
                  <video
                    src={currentItem.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    onLoadedData={() => setMediaLoading(false)}
                    onCanPlay={() => setMediaLoading(false)}
                    onError={() => setMediaLoading(false)}
                  />
                </div>
              )}

              {mediaList.length > 1 && (
                <>
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    size="lg"
                    radius="xl"
                    pos="absolute"
                    left={10}
                    top="50%"
                    style={{ transform: 'translateY(-50%)', zIndex: 10 }}
                    onClick={prevMedia}
                    disabled={currentMediaIndex === 0}
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
                    style={{ transform: 'translateY(-50%)', zIndex: 10 }}
                    onClick={nextMedia}
                    disabled={currentMediaIndex === mediaList.length - 1}
                  >
                    <ChevronRight size={20} />
                  </ActionIcon>
                </>
              )}
            </Box>
            <Group justify="space-between">
              <Group gap="xs">
                {currentItem.type === 'video' && (
                  <PlayCircle size={16} className="text-[#1c304a]" />
                )}
                <Text size="sm" c="dimmed">
                  {currentItem.title || (currentItem.type === 'video' ? 'Video' : 'Sin descripción')}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {currentMediaIndex + 1} / {mediaList.length}
              </Text>
            </Group>
            {selectedProject.description && (
              <Text size="sm" mt="md">{selectedProject.description}</Text>
            )}
          </Stack>
        )}
        {selectedProject && mediaList.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">Este proyecto no tiene imágenes ni videos.</Text>
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
          <Route path="/valorar/:token" element={<ReviewPage />} />
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
                <Text size="lg">Desde aquí puedes gestionar las preguntas del formulario, imágenes y videos del portfolio.</Text>
              </div>
            } />
            <Route path="questions" element={<QuestionsManager />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="zones" element={<ZonasManager />} />
            <Route path="orders/:orderId?" element={<OrdersManager />} />
            <Route path="faq" element={<FaqManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
