import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  Stack,
  Group,
  TextInput,
  NumberInput,
  Button,
  ActionIcon,
  Table,
  Badge,
  Modal,
  Select,
  Switch,
  Card,
  Text,
  Divider,
  Accordion,
  Box,
  LoadingOverlay,
} from '@mantine/core';
import { Plus, Trash, Edit, Save } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import api from '../../api/axios';

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
}

interface Question {
  id: string;
  text: string;
  inputType: string;
  isRequired: boolean;
  serviceId?: string | null;
  displayOrder: number;
  options?: any[];
}

export function QuestionsManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para edición de preguntas
  const [modalOpened, setModalOpened] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  // Estado para edición de precios de servicios
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, servicesRes] = await Promise.all([
        api.get('/questions'),
        api.get('/services'),
      ]);
      setQuestions(questionsRes.data);
      setServices(servicesRes.data);

      // Inicializar precios locales
      const prices: Record<string, number> = {};
      servicesRes.data.forEach((s: Service) => {
        prices[s.id] = s.basePrice;
      });
      setServicePrices(prices);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServicePrice = async (serviceId: string) => {
    try {
      await api.patch(`/services/${serviceId}`, {
        basePrice: servicePrices[serviceId],
      });
      // Actualizar la lista oficial
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, basePrice: servicePrices[serviceId] } : s));
      alert('Precio actualizado correctamente');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Error al actualizar el precio');
    }
  };

  const handleSaveQuestion = async (values: any) => {
    try {
      if (editingQuestion?.id) {
        await api.patch(`/questions/${editingQuestion.id}`, values);
      } else {
        await api.post('/questions', values);
      }
      setModalOpened(false);
      fetchData(); // Recargar todo para asegurar consistencia
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta pregunta?')) {
      try {
        await api.delete(`/questions/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const openNewQuestionModal = (serviceId: string | null = null) => {
    setEditingQuestion({ serviceId });
    setModalOpened(true);
  };

  // Agrupar preguntas
  const groupedQuestions = useMemo(() => {
    const grouped: Record<string, Question[]> = { 'global': [] };
    services.forEach(s => grouped[s.id] = []);

    questions.forEach(q => {
      if (q.serviceId && grouped[q.serviceId]) {
        grouped[q.serviceId].push(q);
      } else {
        grouped['global'].push(q);
      }
    });
    return grouped;
  }, [questions, services]);

  return (
    <Container size="xl" py="xl" pos="relative">
      <LoadingOverlay visible={loading} />

      <Group justify="space-between" mb="xl">
        <Title order={2}>Configuración de Servicios y Preguntas</Title>
        <Button leftSection={<Plus size={16} />} onClick={() => openNewQuestionModal(null)} variant="outline">
          Nueva Pregunta Global
        </Button>
      </Group>

      <Accordion variant="separated" multiple defaultValue={services.map(s => s.id)}>

        {/* Preguntas Globales */}
        <Accordion.Item value="global">
          <Accordion.Control icon={<Badge color="gray">Global</Badge>}>
            <Text fw={600}>Preguntas Generales (Comunes a todos los servicios)</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <QuestionsList
              questions={groupedQuestions['global']}
              onEdit={(q) => { setEditingQuestion(q); setModalOpened(true); }}
              onDelete={handleDeleteQuestion}
            />
            {groupedQuestions['global'].length === 0 && <Text c="dimmed" size="sm" ta="center" py="md">No hay preguntas globales definidas.</Text>}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Servicios */}
        {services.map(service => (
          <Accordion.Item key={service.id} value={service.id}>
            <Accordion.Control icon={<Badge color="blue">{service.name}</Badge>}>
              <Text fw={600}>{service.description}</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="lg">
                {/* Configuración del Servicio */}
                <Card withBorder padding="sm" bg="gray.0">
                  <Group align="flex-end">
                    <NumberInput
                      label="Precio Base del Servicio"
                      prefix="$ "
                      thousandSeparator=","
                      value={servicePrices[service.id]}
                      onChange={(val) => setServicePrices(prev => ({ ...prev, [service.id]: Number(val) }))}
                      min={0}
                    />
                    <Button
                      leftSection={<Save size={16} />}
                      onClick={() => handleUpdateServicePrice(service.id)}
                      disabled={servicePrices[service.id] === service.basePrice}
                    >
                      Guardar Precio
                    </Button>
                  </Group>
                </Card>

                {/* Lista de Preguntas */}
                <Box>
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="sm">Preguntas Específicas del Servicio:</Text>
                    <Button size="xs" leftSection={<Plus size={14} />} onClick={() => openNewQuestionModal(service.id)}>
                      Agregar Pregunta
                    </Button>
                  </Group>
                  <QuestionsList
                    questions={groupedQuestions[service.id]}
                    onEdit={(q) => { setEditingQuestion(q); setModalOpened(true); }}
                    onDelete={handleDeleteQuestion}
                  />
                  {groupedQuestions[service.id].length === 0 && <Text c="dimmed" size="sm" ta="center" py="md">No hay preguntas específicas para este servicio.</Text>}
                </Box>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}

      </Accordion>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingQuestion?.id ? 'Editar Pregunta' : 'Nueva Pregunta'}
        size="lg"
      >
        <QuestionForm
          key={editingQuestion?.id || 'new'} // Forzar reinicio al cambiar
          initialValues={editingQuestion}
          services={services}
          onSave={handleSaveQuestion}
          onCancel={() => setModalOpened(false)}
          onRefresh={fetchData}
        />
      </Modal>
    </Container>
  );
}

function QuestionsList({ questions, onEdit, onDelete }: { questions: Question[], onEdit: (q: Question) => void, onDelete: (id: string) => void }) {
  if (!questions) return null;
  return (
    <Stack gap="xs">
      {questions.map(q => (
        <Card key={q.id} withBorder shadow="sm" padding="xs" radius="md">
          <Group justify="space-between">
            <Group gap="xs">
              <Badge variant="filled" color="dark" size="sm" circle>{q.displayOrder}</Badge>
              <Text fw={500} size="sm">{q.text}</Text>
              <Badge variant="dot" size="sm" color={q.inputType === 'RADIO' || q.inputType === 'SELECT' ? 'violet' : 'cyan'}>{q.inputType}</Badge>
              {q.isRequired && <Badge color="red" variant="outline" size="sm">Req</Badge>}
            </Group>
            <Group gap={4}>
              <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(q)}>
                <Edit size={16} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="red" onClick={() => onDelete(q.id)}>
                <Trash size={16} />
              </ActionIcon>
            </Group>
          </Group>
          {/* Mostrar opciones si existen */}
          {q.options && q.options.length > 0 && (
            <Text size="xs" c="dimmed" mt={4} ml={30}>
              Opciones: {q.options.map(o => `${o.label} (+$${o.priceModifier})`).join(', ')}
            </Text>
          )}
        </Card>
      ))}
    </Stack>
  )
}

interface QuestionOption {
  id?: string;
  label: string;
  description?: string;
  priceModifier: number;
}

function QuestionForm({ initialValues, services, onSave, onCancel, onRefresh }: any) {
  const isEditing = !!initialValues?.id;

  const [values, setValues] = useState({
    text: initialValues?.text || '',
    inputType: initialValues?.inputType || 'SELECT',
    isRequired: initialValues?.isRequired ?? true,
    isActive: initialValues?.isActive ?? true,
    displayOrder: initialValues?.displayOrder || 0,
    serviceId: initialValues?.serviceId || null,
  });

  const [options, setOptions] = useState<QuestionOption[]>(
    initialValues?.options?.map((o: any) => ({
      id: o.id,
      label: o.label || '',
      description: o.description || '',
      priceModifier: o.priceModifier || 0,
    })) || []
  );

  const [savingOptions, setSavingOptions] = useState(false);

  const addOption = () => {
    setOptions([...options, { label: '', description: '', priceModifier: 0 }]);
  };

  const removeOption = async (index: number) => {
    const option = options[index];
    if (option.id) {
      // Si tiene ID, es una opción existente; eliminarla del servidor
      if (window.confirm('¿Eliminar esta opción permanentemente?')) {
        try {
          await api.delete(`/questions/options/${option.id}`);
          setOptions(options.filter((_, i) => i !== index));
          onRefresh?.();
        } catch (error) {
          console.error('Error eliminando opción:', error);
        }
      }
    } else {
      // Si no tiene ID, solo removerla del estado local
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const handleSaveOptions = async () => {
    if (!initialValues?.id) return;

    setSavingOptions(true);
    try {
      for (const opt of options) {
        if (opt.id) {
          // Actualizar opción existente
          await api.patch(`/questions/options/${opt.id}`, {
            label: opt.label,
            description: opt.description,
            priceModifier: opt.priceModifier,
          });
        } else {
          // Crear nueva opción
          await api.post(`/questions/${initialValues.id}/options`, {
            label: opt.label,
            description: opt.description,
            priceModifier: opt.priceModifier,
          });
        }
      }
      alert('Opciones guardadas correctamente');
      onRefresh?.();
    } catch (error) {
      console.error('Error guardando opciones:', error);
      alert('Error al guardar opciones');
    } finally {
      setSavingOptions(false);
    }
  };

  // ¿Mostrar editor de opciones? Solo para SELECT y RADIO
  const showOptionsEditor = values.inputType === 'SELECT' || values.inputType === 'RADIO';

  return (
    <Stack>
      <TextInput
        label="Texto de la pregunta"
        required
        value={values.text}
        onChange={(e) => setValues({ ...values, text: e.currentTarget.value })}
      />
      <Group grow>
        <Select
          label="Tipo de Input"
          data={[
            { value: 'TEXT', label: 'Texto Libre' },
            { value: 'NUMBER', label: 'Número' },
            { value: 'SELECT', label: 'Desplegable' },
            { value: 'RADIO', label: 'Opción Única' },
          ]}
          value={values.inputType}
          onChange={(val) => setValues({ ...values, inputType: val })}
        />
        <NumberInput
          label="Orden"
          value={values.displayOrder}
          onChange={(val) => setValues({ ...values, displayOrder: val })}
        />
      </Group>

      <Select
        label="Asociar a Servicio"
        placeholder="Global (Ninguno)"
        clearable
        data={services.map((s: any) => ({ value: s.id, label: s.name }))}
        value={values.serviceId}
        onChange={(val) => setValues({ ...values, serviceId: val })}
        description="Si se deja vacío, la pregunta aparecerá para todos los servicios."
      />

      <Group>
        <Switch
          label="Es obligatoria"
          checked={values.isRequired}
          onChange={(e) => setValues({ ...values, isRequired: e.currentTarget.checked })}
        />
        <Switch
          label="Está activa"
          checked={values.isActive}
          onChange={(e) => setValues({ ...values, isActive: e.currentTarget.checked })}
        />
      </Group>

      {/* Editor de Opciones */}
      {showOptionsEditor && (
        <>
          <Divider label="Opciones de Respuesta" labelPosition="center" mt="md" />

          {!isEditing && (
            <Text size="xs" c="orange" ta="center">
              ⚠️ Guardá la pregunta primero para poder agregar opciones.
            </Text>
          )}

          {isEditing && (
            <Stack gap="xs">
              {options.map((opt, index) => (
                <Card key={index} withBorder padding="xs" bg="gray.0">
                  <Group align="flex-end" gap="xs">
                    <TextInput
                      label="Etiqueta"
                      placeholder="Ej: Opción A"
                      size="xs"
                      style={{ flex: 2 }}
                      value={opt.label}
                      onChange={(e) => updateOption(index, 'label', e.currentTarget.value)}
                    />
                    <TextInput
                      label="Descripción"
                      placeholder="Opcional"
                      size="xs"
                      style={{ flex: 2 }}
                      value={opt.description}
                      onChange={(e) => updateOption(index, 'description', e.currentTarget.value)}
                    />
                    <NumberInput
                      label="Precio adicional"
                      prefix="$ "
                      size="xs"
                      style={{ flex: 1 }}
                      value={opt.priceModifier}
                      onChange={(val) => updateOption(index, 'priceModifier', Number(val) || 0)}
                    />
                    <ActionIcon
                      color="red"
                      variant="light"
                      size="lg"
                      onClick={() => removeOption(index)}
                    >
                      <Trash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}

              <Group justify="space-between">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<Plus size={14} />}
                  onClick={addOption}
                >
                  Agregar Opción
                </Button>
                <Button
                  size="xs"
                  leftSection={<Save size={14} />}
                  onClick={handleSaveOptions}
                  loading={savingOptions}
                  disabled={options.length === 0}
                >
                  Guardar Opciones
                </Button>
              </Group>
            </Stack>
          )}
        </>
      )}

      <Divider my="md" />

      <Group justify="flex-end">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave(values)}>
          {isEditing ? 'Actualizar Pregunta' : 'Crear Pregunta'}
        </Button>
      </Group>
    </Stack>
  );
}
