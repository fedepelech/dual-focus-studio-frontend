import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Image,
  Text,
  Badge,
  Group,
  Button,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  FileInput,
  LoadingOverlay,
  Accordion,
  Box,
  Tabs,
  Progress,
} from '@mantine/core';
import { Plus, Trash, Upload, ImagePlus, Video } from 'lucide-react';
import api from '../../api/axios';
import { UPLOADS_URL } from '../../config/env';

interface PortfolioImage {
  id: string;
  filename: string;
  url: string;
  caption?: string;
  displayOrder: number;
}

interface PortfolioVideo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  title?: string;
  displayOrder: number;
}

interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  category?: string;
  images: PortfolioImage[];
  videos?: PortfolioVideo[];
}

export function PortfolioManager() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para crear proyecto
  const [projectModalOpened, setProjectModalOpened] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState<string | null>(null);

  // Modal para subir imagen
  const [imageModalOpened, setImageModalOpened] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal para subir video (Cloudflare R2)
  const [videoModalOpened, setVideoModalOpened] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/portfolio');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      await api.post('/portfolio/projects', {
        title: newProjectTitle,
        description: newProjectDescription || undefined,
        category: newProjectCategory || undefined,
      });
      setProjectModalOpened(false);
      resetProjectForm();
      fetchProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      const msg = error?.response?.data?.message || 'Error desconocido al crear el proyecto';
      alert(`Error al crear el proyecto: ${msg}. ¿Estás logueado como admin?`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto, sus imágenes y sus videos?')) {
      try {
        await api.delete(`/portfolio/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedProjectId) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    try {
      await api.post(`/portfolio/projects/${selectedProjectId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageModalOpened(false);
      resetImageForm();
      fetchProjects();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const msg = error?.response?.data?.message || 'Error al subir la imagen';
      alert(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm('¿Eliminar esta imagen?')) {
      try {
        await api.delete(`/portfolio/images/${imageId}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !selectedProjectId) return;

    // Validación preventiva en frontend (máximo 150MB para proxies como Cloudflare/Railway)
    const MAX_MB = 150;
    if (videoFile.size > MAX_MB * 1024 * 1024) {
      alert(`El archivo pesa ${(videoFile.size / (1024 * 1024)).toFixed(1)}MB. Para evitar cortes de red o límites de Cloudflare/Railway, el peso máximo recomendado es de ${MAX_MB}MB.`);
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', videoFile);
    if (videoTitle) formData.append('title', videoTitle);

    try {
      await api.post(`/portfolio/projects/${selectedProjectId}/videos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      setVideoModalOpened(false);
      resetVideoForm();
      fetchProjects();
      alert('¡Video subido con éxito!');
    } catch (error: any) {
      console.error('Error uploading video:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        alert('Error de red al subir el video (ERR_NETWORK). Esto ocurre cuando el archivo excede los límites permitidos por la red/proxy o por tiempo de espera. Se recomienda optimizar o comprimir el video a un peso menor.');
      } else {
        const msg = error?.response?.data?.message || 'Error al subir el video a Cloudflare R2';
        alert(`Error al subir el video: ${msg}`);
      }
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('¿Eliminar este video de Cloudflare R2 y del portfolio?')) {
      try {
        await api.delete(`/portfolio/videos/${videoId}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const resetProjectForm = () => {
    setNewProjectTitle('');
    setNewProjectDescription('');
    setNewProjectCategory(null);
  };

  const resetImageForm = () => {
    setFile(null);
    setCaption('');
    setSelectedProjectId(null);
  };

  const resetVideoForm = () => {
    setVideoFile(null);
    setVideoTitle('');
    setUploadProgress(0);
    setSelectedProjectId(null);
  };

  const openImageModal = (projectId: string) => {
    setSelectedProjectId(projectId);
    setImageModalOpened(true);
  };

  const openVideoModal = (projectId: string) => {
    setSelectedProjectId(projectId);
    setVideoModalOpened(true);
  };

  return (
    <Container size="xl" py="xl" pos="relative">
      <LoadingOverlay visible={loading} />

      <Group justify="space-between" mb="xl">
        <Title order={2}>Gestión de Portfolio</Title>
        <Button leftSection={<Plus size={16} />} onClick={() => setProjectModalOpened(true)}>
          Nuevo Proyecto
        </Button>
      </Group>

      {projects.length === 0 && !loading && (
        <Text c="dimmed" ta="center" py="xl">
          No hay proyectos en el portfolio. ¡Creá el primero!
        </Text>
      )}

      <Accordion variant="separated">
        {projects.map((project) => (
          <Accordion.Item key={project.id} value={project.id}>
            <Accordion.Control>
              <Group justify="space-between" pr="md">
                <Group>
                  <Text fw={600}>{project.title}</Text>
                  {project.category && (
                    <Badge variant="light" size="sm">
                      {project.category}
                    </Badge>
                  )}
                  <Badge variant="outline" size="xs">
                    {project.images?.length || 0} imagen(es)
                  </Badge>
                  <Badge variant="outline" color="teal" size="xs">
                    {project.videos?.length || 0} video(s)
                  </Badge>
                </Group>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {project.description && (
                <Text size="sm" c="dimmed" mb="md">
                  {project.description}
                </Text>
              )}

              <Group mb="md">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<ImagePlus size={14} />}
                  onClick={() => openImageModal(project.id)}
                >
                  Agregar Imagen
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="teal"
                  leftSection={<Video size={14} />}
                  onClick={() => openVideoModal(project.id)}
                >
                  Agregar Video
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<Trash size={14} />}
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Eliminar Proyecto
                </Button>
              </Group>

              <Tabs defaultValue="images">
                <Tabs.List mb="sm">
                  <Tabs.Tab value="images">
                    Imágenes ({project.images?.length || 0})
                  </Tabs.Tab>
                  <Tabs.Tab value="videos">
                    Videos ({project.videos?.length || 0})
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="images">
                  {(!project.images || project.images.length === 0) ? (
                    <Text size="xs" c="dimmed" py="md">No hay imágenes en este proyecto.</Text>
                  ) : (
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                      {project.images.map((img) => (
                        <Card key={img.id} padding="xs" withBorder>
                          <Card.Section>
                            <Image
                              src={img.url.startsWith('http') ? img.url : `${UPLOADS_URL}${img.url}`}
                              height={100}
                              alt={img.caption || 'Imagen'}
                            />
                          </Card.Section>
                          <Box pt="xs">
                            <Text size="xs" lineClamp={1}>
                              {img.caption || 'Sin descripción'}
                            </Text>
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="red"
                              mt={4}
                              onClick={() => handleDeleteImage(img.id)}
                            >
                              <Trash size={12} />
                            </ActionIcon>
                          </Box>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="videos">
                  {(!project.videos || project.videos.length === 0) ? (
                    <Text size="xs" c="dimmed" py="md">No hay videos en este proyecto.</Text>
                  ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
                      {project.videos.map((vid) => {
                        const videoUrl = vid.url.startsWith('http') ? vid.url : `${UPLOADS_URL}${vid.url}`;
                        return (
                          <Card key={vid.id} padding="xs" withBorder>
                            <Card.Section style={{ position: 'relative', backgroundColor: '#000' }}>
                              <video
                                src={videoUrl}
                                controls
                                preload="metadata"
                                style={{ width: '100%', height: 140, objectFit: 'cover' }}
                              />
                            </Card.Section>
                            <Box pt="xs">
                              <Text size="xs" fw={500} lineClamp={1}>
                                {vid.title || vid.originalName || 'Video de R2'}
                              </Text>
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color="red"
                                mt={4}
                                onClick={() => handleDeleteVideo(vid.id)}
                              >
                                <Trash size={12} />
                              </ActionIcon>
                            </Box>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </Tabs.Panel>
              </Tabs>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Modal para crear proyecto */}
      <Modal
        opened={projectModalOpened}
        onClose={() => setProjectModalOpened(false)}
        title="Nuevo Proyecto de Portfolio"
      >
        <Stack>
          <TextInput
            label="Título del proyecto"
            placeholder="Ej: Casa en Nordelta"
            required
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.currentTarget.value)}
          />
          <Select
            label="Categoría"
            data={[
              { value: 'FOTOGRAFIA', label: 'Fotografía' },
              { value: 'PLANOS', label: 'Planos' },
              { value: 'VIDEO', label: 'Video' },
            ]}
            value={newProjectCategory}
            onChange={setNewProjectCategory}
          />
          <Textarea
            label="Descripción"
            placeholder="Breve descripción del proyecto"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.currentTarget.value)}
          />
          <Button fullWidth onClick={handleCreateProject}>
            Crear Proyecto
          </Button>
        </Stack>
      </Modal>

      {/* Modal para subir imagen */}
      <Modal
        opened={imageModalOpened}
        onClose={() => {
          setImageModalOpened(false);
          resetImageForm();
        }}
        title="Agregar imagen al proyecto"
      >
        <form onSubmit={handleUploadImage}>
          <Stack>
            <FileInput
              label="Imagen"
              placeholder="Seleccionar archivo"
              required
              leftSection={<Upload size={14} />}
              accept="image/*"
              value={file}
              onChange={setFile}
            />
            <TextInput
              label="Descripción de la imagen"
              placeholder="Ej: Vista del living"
              value={caption}
              onChange={(e) => setCaption(e.currentTarget.value)}
            />
            <Button type="submit" loading={uploadingImage} fullWidth>
              Subir Imagen
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Modal para subir video a Cloudflare R2 */}
      <Modal
        opened={videoModalOpened}
        onClose={() => {
          setVideoModalOpened(false);
          resetVideoForm();
        }}
        title="Subir Video"
      >
        <form onSubmit={handleUploadVideo}>
          <Stack>
            <FileInput
              label="Archivo de Video"
              placeholder="Seleccionar video (MP4, MOV, WebM...)"
              required
              leftSection={<Video size={14} />}
              accept="video/*"
              value={videoFile}
              onChange={setVideoFile}
            />
            <TextInput
              label="Título / Descripción del video"
              placeholder="Ej: Recorrido 3D en Video"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.currentTarget.value)}
            />
            {uploadingVideo && (
              <Box>
                <Text size="xs" c="dimmed" mb={4} ta="center">
                  Subiendo... {uploadProgress}%
                </Text>
                <Progress value={uploadProgress} animated color="teal" size="sm" radius="xl" />
              </Box>
            )}
            <Button type="submit" loading={uploadingVideo} color="teal" fullWidth>
              {uploadingVideo ? `Subiendo al servidor (${uploadProgress}%)...` : 'Subir Video a Cloudflare R2'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
