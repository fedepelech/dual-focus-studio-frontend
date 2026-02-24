import { TextInput, NumberInput, Select, Radio, Stack, Text, Paper, Box, Group, Badge } from '@mantine/core';
import type { Question, QuestionResponse } from '../types/questions';

interface DynamicQuestionFieldProps {
  question: Question;
  value?: QuestionResponse;
  onChange: (response: QuestionResponse) => void;
}

export function DynamicQuestionField({ question, value, onChange }: DynamicQuestionFieldProps) {
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

    const currentVal = value?.textValue ? parseFloat(value.textValue) : 0;
    const extraUnits = Math.max(0, currentVal - question.pricingBaseUnits);
    const steps = Math.ceil(extraUnits / question.pricingStepSize);
    const extraPrice = steps * question.pricingStepPrice;

    // Texto descriptivo para el tramo de precio
    const stepLabel = question.pricingStepSize === 1
      ? `por cada m² extra`
      : `por cada tramo de ${question.pricingStepSize}m² extras`;

    return (
      <Paper withBorder p="xs" mt="xs" bg="blue.0" radius="md">
        <Stack gap={4}>
          <Text size="xs" fw={700} c="blue.9">Estructura de precios adicional:</Text>
          <Text size="xs">• Hasta {question.pricingBaseUnits}m²: Incluido en precio base</Text>
          <Text size="xs">• Adicional: ${question.pricingStepPrice.toLocaleString()} {stepLabel}</Text>
          {currentVal > question.pricingBaseUnits && (
            <Text size="sm" fw={700} c="blue.7" mt={4}>
              Costo adicional calculado: ${extraPrice.toLocaleString()} ({extraUnits}m² extras)
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

