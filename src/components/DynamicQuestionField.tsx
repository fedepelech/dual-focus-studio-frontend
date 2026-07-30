import { TextInput, NumberInput, Select, Radio, Stack, Text, Paper, Box, Group, Badge } from '@mantine/core';
import type { Question, QuestionResponse } from '../types/questions';

// Constantes fijas para los nombres de las preguntas con precios escalonados
const PREGUNTA_CANTIDAD_AMBIENTES = 'Cantidad de ambientes';
const PREGUNTA_METROS_CUADRADOS = 'Metros cuadrados a medir';

interface DynamicQuestionFieldProps {
  question: Question;
  value?: QuestionResponse;
  onChange: (response: QuestionResponse) => void;
  hasPlanos?: boolean;
  hasFotoOrVideo?: boolean;
}

export function DynamicQuestionField({ question, value, onChange, hasPlanos = true, hasFotoOrVideo = true }: DynamicQuestionFieldProps) {
  const handleChange = (val: string | number | null) => {
    if (question.inputType === 'SELECT' || question.inputType === 'RADIO') {
      onChange({
        questionId: question.id,
        optionId: val as string,
      });
    } else {
      onChange({
        questionId: question.id,
        textValue: val?.toString(),
      });
    }
  };

  const getExtraPriceInfo = () => {
    if (
      question.inputType !== 'NUMBER' ||
      question.pricingBaseUnits == null ||
      question.pricingStepSize == null ||
      question.pricingStepPrice == null
    ) {
      return null;
    }

    // Ocultar si la pregunta de ambientes no aplica al servicio (no hay Planos)
    if (question.text === PREGUNTA_CANTIDAD_AMBIENTES && !hasPlanos) return null;

    // Ocultar si la pregunta de m² no aplica al servicio (no hay Foto ni Video)
    if (question.text === PREGUNTA_METROS_CUADRADOS && !hasFotoOrVideo) return null;

    const currentVal = value?.textValue ? parseFloat(value.textValue) : 0;
    const extraUnits = Math.max(0, currentVal - question.pricingBaseUnits);
    const steps = Math.ceil(extraUnits / question.pricingStepSize);
    const extraPrice = steps * question.pricingStepPrice;
    const isAmbientes = question.text === PREGUNTA_CANTIDAD_AMBIENTES;
    const unitLabel = isAmbientes ? 'ambiente(s)' : 'm²';

    // Texto descriptivo para el tramo de precio
    const stepLabel = question.pricingStepSize === 1
      ? `por cada ${unitLabel} extra`
      : `por cada tramo de ${question.pricingStepSize} ${unitLabel} extras`;

    return (
      <Paper withBorder p="xs" mt="xs" bg="blue.0" radius="md">
        <Stack gap={4}>
          <Text size="xs" fw={700} c="blue.9">Estructura de precios adicional:</Text>
          <Text size="xs">• Hasta {question.pricingBaseUnits} {unitLabel}: Incluido en precio base</Text>
          <Text size="xs">• Adicional: ${question.pricingStepPrice.toLocaleString()} {stepLabel}</Text>
          {currentVal > question.pricingBaseUnits && (
            <Text size="sm" fw={700} c="blue.7" mt={4}>
              Costo adicional calculado: ${extraPrice.toLocaleString()} ({extraUnits} {unitLabel} extras)
            </Text>
          )}
        </Stack>
      </Paper>
    );
  };

  const renderField = () => {
    switch (question.inputType) {
      case 'TEXT':
        return (
          <TextInput
            label={question.text}
            required={question.isRequired}
            value={value?.textValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Escribí tu respuesta aquí..."
          />
        );
      case 'NUMBER':
        return (
          <>
            <NumberInput
              label={question.text}
              required={question.isRequired}
              value={value?.textValue ? parseFloat(value.textValue) : undefined}
              onChange={(val) => handleChange(val)}
              placeholder="0"
              min={0}
            />
            {getExtraPriceInfo()}
          </>
        );
      case 'SELECT':
        return (
          <Select
            label={question.text}
            required={question.isRequired}
            data={question.options.map((opt) => ({
              value: opt.id,
              label: opt.priceModifier > 0 ? `${opt.label} (+$${opt.priceModifier.toLocaleString()})` : opt.label
            }))}
            value={value?.optionId}
            onChange={(val) => handleChange(val)}
            placeholder="Seleccioná una opción"
          />
        );
      case 'RADIO':
        return (
          <Radio.Group
            label={question.text}
            required={question.isRequired}
            value={value?.optionId}
            onChange={(val) => handleChange(val)}
          >
            <Stack mt="xs">
              {question.options.map((opt) => (
                <Paper key={opt.id} withBorder p="sm" radius="md">
                  <Radio
                    value={opt.id}
                    label={
                      <Group gap="xs">
                        <Text fw={500}>{opt.label}</Text>
                        {opt.priceModifier > 0 && (
                          <Badge color="green" variant="light" size="sm">
                            +${opt.priceModifier.toLocaleString()}
                          </Badge>
                        )}
                      </Group>
                    }
                    description={opt.description}
                  />
                </Paper>
              ))}
            </Stack>
          </Radio.Group>
        );
      default:
        return null;
    }
  };

  return <Box mt="md">{renderField()}</Box>;
}

