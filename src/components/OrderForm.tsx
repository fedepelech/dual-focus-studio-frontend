import { useState, useEffect } from 'react';
import { Stepper, Button, Group, TextInput, Textarea, Stack, Title, Paper, LoadingOverlay, Checkbox, Text, Select, Grid, Card, SimpleGrid, Divider, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import api from '../api/client';
import { EMAIL_REGEX } from './types';
import type { Question, QuestionResponse } from '../types/questions';
import { Zone, PropertyType } from '../types/questions';
import { DynamicQuestionField } from './DynamicQuestionField';
import { OrderPriceSummary, calculateOrderPrice } from './OrderPriceSummary';

// Constantes para los pasos del stepper
const STEP_SERVICIO = 0;
const STEP_INMUEBLE = 1;
// const STEP_DETALLES = 2;
const STEP_CONTACTO = 3;
const STEP_RESUMEN = 4;
const TOTAL_STEPS = 5;

// Etiquetas para los tipos de zona y propiedad
const ZONE_OPTIONS = [
  { value: Zone.CABA, label: 'CABA' },
  { value: Zone.GBA, label: 'GBA' },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: PropertyType.CASA, label: 'Casa' },
  { value: PropertyType.DEPARTAMENTO, label: 'Departamento' },
  { value: PropertyType.OFICINA, label: 'Oficina' },
  { value: PropertyType.LOCAL, label: 'Local' },
  { value: PropertyType.TERRENO, label: 'Terreno' },
];

export function OrderForm() {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formData, setFormData] = useState({
    serviceIds: [] as string[],
    name: '',
    email: '',
    address: '',
    details: '',
    zone: '' as Zone | '',
    propertyType: '' as PropertyType | '',
    gbaSubzone: '',
    responses: [] as QuestionResponse[],
  });
  const [gbaSubzones, setGbaSubzones] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data);
      } catch (error) {
        console.error('Error fetching services', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const query = formData.serviceIds.length > 0 ? `?serviceIds=${formData.serviceIds.join(',')}` : '';
        const res = await api.get(`/questions${query}`);
        setQuestions(res.data);
      } catch (error) {
        console.error('Error fetching questions', error);
      }
    };
    fetchQuestions();
  }, [formData.serviceIds]);

  useEffect(() => {
    if (formData.zone === Zone.GBA) {
      const fetchSubzones = async () => {
        try {
          const res = await api.get('/zones/gba-subzones');
          setGbaSubzones(res.data);
        } catch (error) {
          console.error('Error fetching subzones:', error);
        }
      };
      fetchSubzones();
    } else {
      setFormData(prev => ({ ...prev, gbaSubzone: '' }));
    }
  }, [formData.zone]);

  const isQuestionVisible = (q: Question) => {
    if (!q.dependsOnOptionId) return true;
    return formData.responses.some(r => r.optionId === q.dependsOnOptionId);
  };

  const nextStep = () => {
    if (active === STEP_SERVICIO && formData.serviceIds.length === 0) {
      notifications.show({
        title: 'Atención',
        message: 'Por favor, selecciona al menos un servicio para continuar.',
        color: 'yellow',
      });
      return;
    }
    if (active === STEP_INMUEBLE) {
      const isSubzoneBlocked = formData.zone === Zone.GBA &&
        formData.gbaSubzone &&
        gbaSubzones.find(z => z.name === formData.gbaSubzone)?.isEnabled === false;

      if (!formData.zone || !formData.propertyType || !formData.address || (formData.zone === Zone.GBA && !formData.gbaSubzone)) {
        notifications.show({
          title: 'Atención',
          message: 'Por favor, completa todos los datos del inmueble.',
          color: 'yellow',
        });
        return;
      }

      if (isSubzoneBlocked) {
        notifications.show({
          title: 'Sin cobertura',
          message: 'Lamentablemente no prestamos servicio en la subzona seleccionada actualmente.',
          color: 'red',
        });
        return;
      }
    }
    if (active === STEP_CONTACTO && (!formData.name || !EMAIL_REGEX.test(formData.email))) {
      notifications.show({
        title: 'Atención',
        message: 'Por favor, ingresa un nombre y un email válido.',
        color: 'yellow',
      });
      return;
    }
    setActive((current: number) => (current < TOTAL_STEPS ? current + 1 : current));
  };
  const prevStep = () => setActive((current: number) => (current > 0 ? current - 1 : current));

  const handleResponseChange = (response: QuestionResponse) => {
    setFormData((prev: any) => {
      const existing = prev.responses.find((r: QuestionResponse) => r.questionId === response.questionId);
      if (existing) {
        return {
          ...prev,
          responses: prev.responses.map((r: QuestionResponse) => (r.questionId === response.questionId ? response : r)),
        };
      }
      return {
        ...prev,
        responses: [...prev.responses, response],
      };
    });
  };

  const handleSubmit = async () => {
    if (formData.serviceIds.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Por favor, selecciona al menos un servicio.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const userRes = await api.post('/users/find-or-create', {
        email: formData.email,
        name: formData.name,
        password: 'password123'
      });
      const userId = userRes.data.id;

      const { total } = calculateOrderPrice(services, formData.serviceIds, questions, formData.responses);

      await api.post('/orders', {
        address: formData.address,
        details: formData.details,
        zone: formData.zone,
        propertyType: formData.propertyType,
        customerId: userId,
        serviceIds: formData.serviceIds,
        gbaSubzone: formData.gbaSubzone,
        totalPrice: total,
        responses: formData.responses.map((r: QuestionResponse) => ({
          questionId: r.questionId,
          optionId: r.optionId || null,
          textValue: r.textValue || null,
        }))
      });

      notifications.show({
        title: 'Éxito',
        message: '¡Pedido realizado con éxito!',
        color: 'green',
      });
      setActive(TOTAL_STEPS);
    } catch (error) {
      console.error('Error submitting order', error);
      notifications.show({
        title: 'Error',
        message: 'Error al realizar el pedido.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const getZoneLabel = (zone: string) => ZONE_OPTIONS.find(z => z.value === zone)?.label || zone;
  const getPropertyTypeLabel = (type: string) => PROPERTY_TYPE_OPTIONS.find(p => p.value === type)?.label || type;
  const getSelectedServices = () => services.filter(s => formData.serviceIds.includes(s.id));

  const renderResumenStep = () => {
    const { items, total } = calculateOrderPrice(services, formData.serviceIds, questions, formData.responses);
    const selectedServices = getSelectedServices();

    return (
      <Stack mt="md" gap="md">
        <Title order={4}>Resumen de tu pedido</Title>
        <Card withBorder p="md" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Servicios solicitados</Text>
          <Group gap={6}>
            {selectedServices.map(s => (
              <Badge key={s.id} variant="filled" color="blue" size="md">{s.name}</Badge>
            ))}
          </Group>
        </Card>
        <Card withBorder p="md" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Datos del inmueble</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Dirección</Text>
              <Text size="sm" fw={500}>{formData.address}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Zona</Text>
              <Text size="sm" fw={500}>{getZoneLabel(formData.zone)} {formData.gbaSubzone && `(${formData.gbaSubzone})`}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Tipo de inmueble</Text>
              <Text size="sm" fw={500}>{getPropertyTypeLabel(formData.propertyType)}</Text>
            </Stack>
          </SimpleGrid>
        </Card>
        {formData.responses.length > 0 && (
          <Card withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Opciones seleccionadas</Text>
            <Stack gap="xs">
              {formData.responses.map(resp => {
                const question = questions.find(q => q.id === resp.questionId);
                if (!question) return null;
                const option = question.options.find(o => o.id === resp.optionId);
                return (
                  <Group key={resp.questionId} justify="space-between">
                    <Text size="sm" c="dimmed">{question.text}</Text>
                    <Text size="sm" fw={500}>{option ? option.label : resp.textValue}</Text>
                  </Group>
                );
              })}
            </Stack>
          </Card>
        )}
        <Card withBorder p="md" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Datos de contacto</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Nombre</Text>
              <Text size="sm" fw={500}>{formData.name}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Email</Text>
              <Text size="sm" fw={500}>{formData.email}</Text>
            </Stack>
          </SimpleGrid>
        </Card>
        <Card withBorder p="md" radius="md" bg="blue.0">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Precio estimado</Text>
          <Stack gap={4}>
            {items.map((item, i) => (
              <Group key={i} justify="space-between">
                <Text size="sm">{item.label}</Text>
                <Text size="sm" fw={600}>${item.amount.toLocaleString()}</Text>
              </Group>
            ))}
          </Stack>
          <Divider my="sm" />
          <Group justify="space-between">
            <Text fw={700} size="lg">Total</Text>
            <Text fw={800} size="xl" c="blue.9">${total.toLocaleString()}</Text>
          </Group>
        </Card>
      </Stack>
    );
  };

  return (
    <Paper shadow="md" p={{ base: 'sm', sm: 'xl' }} radius="md" withBorder style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, xl: active < TOTAL_STEPS ? 8 : 12 }}>
          <Stepper
            active={active}
            onStepClick={(step) => {
              if (step > active) {
                if (active === STEP_SERVICIO && formData.serviceIds.length === 0) return;
                if (active === STEP_INMUEBLE && (!formData.zone || !formData.propertyType || !formData.address)) return;
                if (active === STEP_CONTACTO && (!formData.name || !EMAIL_REGEX.test(formData.email))) return;
              }
              setActive(step);
            }}
            color="#1c304a"
            size="sm"
          >
            <Stepper.Step label="Servicio">
              <Stack mt="md">
                <Title order={4}>¿Qué servicios deseas solicitar?</Title>
                <Stack mt="md">
                  {services.map((service) => {
                    const isSelected = formData.serviceIds.includes(service.id);
                    return (
                      <Paper
                        key={service.id}
                        withBorder
                        p="md"
                        radius="md"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderColor: isSelected ? '#1c304a' : '#e0e0e0',
                          backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                        }}
                        onClick={() => {
                          const newIds = isSelected
                            ? formData.serviceIds.filter(id => id !== service.id)
                            : [...formData.serviceIds, service.id];
                          setFormData({ ...formData, serviceIds: newIds });
                        }}
                      >
                        <Group align="flex-start" wrap="nowrap">
                          <Checkbox
                            color="#1c304a"
                            checked={isSelected}
                            onChange={() => { }} // dummy onChange since parent handles it
                            mt={2}
                          />
                          <div>
                            <Text fw={600} size="md" c="#1c304a">{service.name}</Text>
                            <Text size="sm" c="dimmed" mt={2}>{service.description}</Text>
                            {service.basePrice && (
                              <Text size="sm" fw={600} c="dark.4" mt={6}>
                                Precio base: ${service.basePrice.toLocaleString()}
                              </Text>
                            )}
                          </div>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </Stack>
            </Stepper.Step>
            <Stepper.Step label="Inmueble">
              <Stack mt="md">
                <Title order={4}>Contanos sobre la propiedad</Title>
                <TextInput label="Dirección" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                <Select label="Zona" required data={ZONE_OPTIONS} value={formData.zone} onChange={(val) => setFormData({ ...formData, zone: val as Zone })} />
                <Select label="Tipo de inmueble" required data={PROPERTY_TYPE_OPTIONS} value={formData.propertyType} onChange={(val) => setFormData({ ...formData, propertyType: val as PropertyType })} />
                {formData.zone === Zone.GBA && (
                  <Select
                    label="Partido / Subzona GBA"
                    required
                    data={gbaSubzones.map(z => ({ value: z.name, label: z.name + (z.isEnabled ? '' : ' (Sin cobertura)') }))}
                    value={formData.gbaSubzone}
                    onChange={(val) => setFormData({ ...formData, gbaSubzone: val || '' })}
                    error={formData.gbaSubzone && gbaSubzones.find(z => z.name === formData.gbaSubzone)?.isEnabled === false ? 'Sin cobertura en este partido.' : null}
                  />
                )}
                <Textarea label="Detalles adicionales" value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} />
                {questions.filter(q => q.displaySection === 1 && isQuestionVisible(q)).map(q => (
                  <DynamicQuestionField key={q.id} question={q} value={formData.responses.find(r => r.questionId === q.id)} onChange={handleResponseChange} />
                ))}
              </Stack>
            </Stepper.Step>
            <Stepper.Step label="Detalles">
              <Stack mt="md">
                <Title order={4}>Preguntas sobre el servicio</Title>
                {questions.filter(q => (q.displaySection === 2 || !q.displaySection) && isQuestionVisible(q)).map(q => (
                  <DynamicQuestionField key={q.id} question={q} value={formData.responses.find(r => r.questionId === q.id)} onChange={handleResponseChange} />
                ))}
              </Stack>
            </Stepper.Step>
            <Stepper.Step label="Contacto">
              <Stack mt="md">
                <Title order={4}>¿Cómo te contactamos?</Title>
                <TextInput label="Nombre completo" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <TextInput label="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={formData.email && !EMAIL_REGEX.test(formData.email) ? 'Email inválido' : null} />
              </Stack>
            </Stepper.Step>
            <Stepper.Step label="Resumen">
              {renderResumenStep()}
            </Stepper.Step>
            <Stepper.Completed>
              <Stack align="center" py="xl">
                <Title order={3}>¡Gracias por tu pedido!</Title>
                <Button onClick={() => window.location.reload()}>Realizar otro pedido</Button>
              </Stack>
            </Stepper.Completed>
          </Stepper>
        </Grid.Col>
        {active < TOTAL_STEPS && formData.serviceIds.length > 0 && (
          <Grid.Col span={{ base: 12, xl: 4 }}>
            <OrderPriceSummary services={services} selectedServiceIds={formData.serviceIds} questions={questions} responses={formData.responses} />
          </Grid.Col>
        )}
      </Grid>
      <Group justify="flex-end" mt="xl">
        {active !== 0 && <Button variant="default" onClick={prevStep}>Atrás</Button>}
        {active < STEP_RESUMEN ? (
          <Button onClick={nextStep} color="secondary">Siguiente</Button>
        ) : (
          <Button onClick={handleSubmit} color="primary.1" c="secondary.9" loading={loading}>Confirmar y Enviar Pedido</Button>
        )}
      </Group>
    </Paper>
  );
}
