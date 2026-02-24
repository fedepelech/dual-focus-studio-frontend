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
} from '@mantine/core';
import { Plus, Trash, Upload, ImagePlus } from 'lucide-react';
import api from '../../api/axios';
import { UPLOADS_URL } from '../../config/env';

interface PortfolioImage {
  id: string;
  filename: string;
  url: string;
  caption?: string;
  displayOrder: number;
}

interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  category?: string;
  images: PortfolioImage[];
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
  const [uploading, setUploading] = useState(false);

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
    if (window.confirm('¿Estás seguro de eliminar este proyecto y todas sus imágenes?')) {
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

    setUploading(true);
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
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
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

  const openImageModal = (projectId: string) => {
    setSelectedProjectId(projectId);
    setImageModalOpened(true);
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
                    {project.images.length} imagen(es)
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
                  color="red"
                  leftSection={<Trash size={14} />}
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Eliminar Proyecto
                </Button>
              </Group>

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
        onClose={() => { setImageModalOpened(false); resetImageForm(); }}
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
            <Button type="submit" loading={uploading} fullWidth>
              Subir Imagen
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
