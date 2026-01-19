import { useState, useEffect } from 'react';
import { Stepper, Button, Group, TextInput, Textarea, Stack, Title, Paper, LoadingOverlay, Checkbox, Text, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import api from '../api/client';
import { EMAIL_REGEX } from './types';
import type { Question, QuestionResponse } from '../types/questions';
import { Zone, PropertyType } from '../types/questions';
import { DynamicQuestionField } from './DynamicQuestionField';

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
    propertySize: '',
    zone: '' as Zone | '',
    propertyType: '' as PropertyType | '',
    responses: [] as QuestionResponse[],
  });

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
      if (formData.serviceIds.length === 0) {
        setQuestions([]);
        return;
      }
      try {
        const res = await api.get(`/questions?serviceIds=${formData.serviceIds.join(',')}`);
        setQuestions(res.data);
      } catch (error) {
        console.error('Error fetching questions', error);
      }
    };
    if (active === 2) {
      fetchQuestions();
    }
  }, [formData.serviceIds, active]);

  const nextStep = () => {
    if (active === 0 && formData.serviceIds.length === 0) {
      notifications.show({
        title: 'Atención',
        message: 'Por favor, selecciona al menos un servicio para continuar.',
        color: 'yellow',
      });
      return;
    }
    if (active === 1 && (!formData.propertySize || !formData.zone || !formData.propertyType || !formData.address)) {
      notifications.show({
        title: 'Atención',
        message: 'Por favor, completa todos los datos del inmueble.',
        color: 'yellow',
      });
      return;
    }
    if (active === 3 && (!formData.name || !EMAIL_REGEX.test(formData.email))) {
      notifications.show({
        title: 'Atención',
        message: 'Por favor, ingresa un nombre y un email válido.',
        color: 'yellow',
      });
      return;
    }
    setActive((current: number) => (current < 4 ? current + 1 : current));
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
      // Create or find user
      const userRes = await api.post('/users/find-or-create', {
        email: formData.email,
        name: formData.name,
        password: 'password123'
      });
      const userId = userRes.data.id;

      // Create an order for each selected service
      const orderPromises = formData.serviceIds.map(serviceId =>
        api.post('/orders', {
          address: formData.address,
          details: formData.details,
          propertySize: formData.propertySize,
          zone: formData.zone,
          propertyType: formData.propertyType,
          customerId: userId,
          serviceId: serviceId,
          responses: formData.responses.filter((r: QuestionResponse) => {
            // Sólo enviar respuestas que pertenecen a este servicio (o comunes)
            const question = questions.find((q: Question) => q.id === r.questionId);
            return !question?.serviceId || question.serviceId === serviceId;
          })
        })
      );

      await Promise.all(orderPromises);

      notifications.show({
        title: 'Éxito',
        message: '¡Pedido realizado con éxito!',
        color: 'green',
      });
      setActive(3); // Final step
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

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

      <Stepper
        active={active}
        onStepClick={(step) => {
          if (step > active) {
            if (active === 0 && formData.serviceIds.length === 0) return;
            if (active === 1 && (!formData.propertySize || !formData.zone || !formData.propertyType || !formData.address)) return;
            if (active === 3 && (!formData.name || !EMAIL_REGEX.test(formData.email))) return;
          }
          setActive(step);
        }}
        color="primary.1"
        orientation="horizontal"
        size="sm"
        styles={{
          steps: { flexWrap: 'nowrap' },
          step: { minWidth: 'auto' },
          stepLabel: { fontSize: 'var(--mantine-font-size-xs)', whiteSpace: 'nowrap' },
          stepDescription: { fontSize: '10px', whiteSpace: 'nowrap' },
          stepIcon: { minWidth: 32, width: 32, height: 32, fontSize: 'var(--mantine-font-size-xs)' }
        }}
      >
        <Stepper.Step label="Servicio" description="Elegí qué necesitas">
          <Stack mt="md">
            <Title order={4}>¿Qué servicios deseas solicitar?</Title>
            <Checkbox.Group
              value={formData.serviceIds}
              onChange={(values) => setFormData({ ...formData, serviceIds: values })}
              label="Servicios disponibles"
              description="Podés seleccionar una o más opciones"
            >
              <Stack mt="xs">
                {services.map((service) => (
                  <Paper key={service.id} withBorder p="md" radius="md">
                    <Checkbox
                      value={service.id}
                      label={<Text fw={500}>{service.name}</Text>}
                      description={service.description}
                      mb={service.description ? 'xs' : 0}
                    />
                    {service.basePrice && (
                      <Text size="sm" c="dimmed" mt={4}>
                        Precio base: ${service.basePrice}
                      </Text>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Checkbox.Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Inmueble" description="Datos básicos">
          <Stack mt="md">
            <Title order={4}>Contanos sobre la propiedad</Title>
            <TextInput
              label="Dirección"
              placeholder="Calle, Número, Ciudad"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <TextInput
              label="Cantidad de metros cuadrados (m2)"
              placeholder="Ej: 100"
              required
              value={formData.propertySize}
              onChange={(e) => setFormData({ ...formData, propertySize: e.target.value })}
            />
            <Select
              label="Zona"
              placeholder="Seleccioná una zona"
              required
              data={[
                { value: Zone.CABA, label: 'CABA' },
                { value: Zone.GBA, label: 'GBA' },
              ]}
              value={formData.zone}
              onChange={(val) => setFormData({ ...formData, zone: val as Zone })}
            />
            <Select
              label="Tipo de inmueble"
              placeholder="Seleccioná tipo"
              required
              data={[
                { value: PropertyType.CASA, label: 'Casa' },
                { value: PropertyType.DEPARTAMENTO, label: 'Departamento' },
                { value: PropertyType.OFICINA, label: 'Oficina' },
                { value: PropertyType.LOCAL, label: 'Local' },
                { value: PropertyType.TERRENO, label: 'Terreno' },
              ]}
              value={formData.propertyType}
              onChange={(val) => setFormData({ ...formData, propertyType: val as PropertyType })}
            />
            <Textarea
              label="Detalles adicionales"
              placeholder="Contanos más sobre la propiedad..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Detalles" description="Preguntas específicas" loading={loading && active === 2}>
          <Stack mt="md">
            <Title order={4}>Preguntas sobre el servicio</Title>
            {questions.length > 0 ? (
              questions.map((q: Question) => (
                <DynamicQuestionField
                  key={q.id}
                  question={q}
                  value={formData.responses.find((r: QuestionResponse) => r.questionId === q.id)}
                  onChange={handleResponseChange}
                />
              ))
            ) : (
              <Text c="dimmed">No hay preguntas adicionales para los servicios seleccionados.</Text>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Contacto" description="Tus datos">
          <Stack mt="md">
            <Title order={4}>¿Cómo te contactamos?</Title>
            <TextInput
              label="Nombre completo"
              placeholder="Tu nombre"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextInput
              label="Email"
              placeholder="tu@email.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formData.email && !EMAIL_REGEX.test(formData.email) ? 'Email inválido' : null}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack align="center" py="xl">
            <Title order={3}>¡Gracias por tu pedido!</Title>
            <p>Nos pondremos en contacto con vos a la brevedad.</p>
            <Button onClick={() => window.location.reload()}>Realizar otro pedido</Button>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      {active < 4 && (
        <Group justify="flex-end" mt="xl">
          {active !== 0 && (
            <Button variant="default" onClick={prevStep}>
              Atrás
            </Button>
          )}
          {active < 3 ? (
            <Button
              onClick={nextStep}
              color="secondary"
              disabled={
                (active === 0 && formData.serviceIds.length === 0) ||
                (active === 1 && (!formData.propertySize || !formData.zone || !formData.propertyType || !formData.address)) ||
                (active === 3 && (!formData.name || !EMAIL_REGEX.test(formData.email)))
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              color="primary.1"
              c="secondary.9"
              disabled={!formData.name || !formData.email}
            >
              Enviar Pedido
            </Button>
          )}
        </Group>
      )}
    </Paper>
  );
}
