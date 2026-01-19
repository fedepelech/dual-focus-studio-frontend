import { TextInput, NumberInput, Select, Radio, Stack, Text, Paper, Box } from '@mantine/core';
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
          <NumberInput
            label={question.text}
            required={question.isRequired}
            value={value?.textValue ? parseFloat(value.textValue) : undefined}
            onChange={(val) => handleChange(val)}
            placeholder="0"
          />
        );
      case 'SELECT':
        return (
          <Select
            label={question.text}
            required={question.isRequired}
            data={question.options.map((opt) => ({ value: opt.id, label: opt.label }))}
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
                    label={<Text fw={500}>{opt.label}</Text>}
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

