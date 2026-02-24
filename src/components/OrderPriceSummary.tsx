import { Paper, Stack, Text, Group, Divider, Badge } from '@mantine/core';
import { ShoppingCart } from 'lucide-react';
import type { Question, QuestionResponse } from '../types/questions';

// Precio base por defecto cuando no hay servicios seleccionados
const PRECIO_INICIAL = 0;

/** Etiquetas del disclaimer de precio */
const DISCLAIMER_TEXT = 'Precio estimado sujeto a confirmación del equipo';

interface PriceLineItem {
  label: string;
  amount: number;
  type: 'servicio' | 'opcion' | 'adicional';
}

interface OrderPriceSummaryProps {
  /** Servicios disponibles (todos) */
  services: { id: string; name: string; basePrice: number }[];
  /** IDs de servicios seleccionados */
  selectedServiceIds: string[];
  /** Preguntas cargadas */
  questions: Question[];
  /** Respuestas del usuario */
  responses: QuestionResponse[];
}

/**
 * Calcula el precio total desglosado del pedido.
 * Reutilizable tanto para el componente visual como para el envío al backend.
 */
export function calculateOrderPrice(
  services: { id: string; name: string; basePrice: number }[],
  selectedServiceIds: string[],
  questions: Question[],
  responses: QuestionResponse[],
): { items: PriceLineItem[]; total: number } {
  const items: PriceLineItem[] = [];

  // 1. Precios base de servicios seleccionados
  for (const serviceId of selectedServiceIds) {
    const service = services.find(s => s.id === serviceId);
    if (service && service.basePrice > 0) {
      items.push({
        label: service.name,
        amount: service.basePrice,
        type: 'servicio',
      });
    }
  }

  // 2. Modificadores de opciones seleccionadas
  for (const response of responses) {
    if (response.optionId) {
      // Buscar la opción en las preguntas
      for (const question of questions) {
        const option = question.options.find(o => o.id === response.optionId);
        if (option && option.priceModifier > 0) {
          items.push({
            label: `${question.text}: ${option.label}`,
            amount: option.priceModifier,
            type: 'opcion',
          });
          break;
        }
      }
    }

    // 3. Pricing escalonado para preguntas numéricas
    if (response.textValue) {
      const question = questions.find(q => q.id === response.questionId);
      if (
        question &&
        question.inputType === 'NUMBER' &&
        question.pricingBaseUnits != null &&
        question.pricingStepSize != null &&
        question.pricingStepPrice != null
      ) {
        const valor = parseFloat(response.textValue);
        if (!isNaN(valor) && valor > question.pricingBaseUnits) {
          const unidadesExtra = valor - question.pricingBaseUnits;
          const pasos = Math.ceil(unidadesExtra / question.pricingStepSize);
          const precioExtra = pasos * question.pricingStepPrice;
          if (precioExtra > 0) {
            items.push({
              label: `${question.text} (+${unidadesExtra}m² extras)`,
              amount: precioExtra,
              type: 'adicional',
            });
          }
        }
      }
    }
  }

  const total = items.reduce((sum, item) => sum + item.amount, PRECIO_INICIAL);
  return { items, total };
}

/**
 * Componente visual que muestra el resumen de precio en tiempo real.
 * Se integra en el formulario de pedido.
 */
export function OrderPriceSummary({ services, selectedServiceIds, questions, responses }: OrderPriceSummaryProps) {
  const { items, total } = calculateOrderPrice(services, selectedServiceIds, questions, responses);

  // No mostrar si no hay servicios seleccionados
  if (selectedServiceIds.length === 0) return null;

  const getBadgeColor = (type: PriceLineItem['type']) => {
    switch (type) {
      case 'servicio': return 'blue';
      case 'opcion': return 'violet';
      case 'adicional': return 'orange';
    }
  };

  const getBadgeLabel = (type: PriceLineItem['type']) => {
    switch (type) {
      case 'servicio': return 'Servicio';
      case 'opcion': return 'Opción';
      case 'adicional': return 'Adicional';
    }
  };

  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={{
        position: 'sticky',
        top: 80,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderColor: '#d9c5b2',
      }}
    >
      <Group gap="xs" mb="sm">
        <ShoppingCart size={18} color="#1c304a" />
        <Text fw={700} size="sm" c="#1c304a">
          Resumen del Pedido
        </Text>
      </Group>

      <Stack gap={8}>
        {items.map((item, index) => (
          <div key={index}>
            <Text size="xs" mb={2}>{item.label}</Text>
            <Group justify="space-between">
              <Badge
                size="xs"
                variant="light"
                color={getBadgeColor(item.type)}
              >
                {getBadgeLabel(item.type)}
              </Badge>
              <Text size="sm" fw={600}>
                ${item.amount.toLocaleString()}
              </Text>
            </Group>
          </div>
        ))}
      </Stack>

      {items.length > 0 && (
        <>
          <Divider my="sm" />
          <Group justify="space-between">
            <Text fw={700} size="md" c="#1c304a">Total estimado</Text>
            <Text fw={800} size="lg" c="#1c304a">
              ${total.toLocaleString()}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" ta="center" mt={4} fs="italic">
            {DISCLAIMER_TEXT}
          </Text>
        </>
      )}

      {items.length === 0 && (
        <Text size="xs" c="dimmed" ta="center" mt="xs">
          Seleccioná servicios y opciones para ver el precio.
        </Text>
      )}
    </Paper>
  );
}
