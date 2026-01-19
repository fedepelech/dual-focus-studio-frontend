export type QuestionInputType = 'TEXT' | 'NUMBER' | 'SELECT' | 'RADIO';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  priceModifier: number;
}

export interface Question {
  id: string;
  text: string;
  inputType: QuestionInputType;
  serviceId?: string;
  displayOrder: number;
  isRequired: boolean;
  options: QuestionOption[];
}

export interface QuestionResponse {
  questionId: string;
  optionId?: string;
  textValue?: string;
}

export const Zone = {
  CABA: 'CABA',
  GBA: 'GBA'
} as const;

export type Zone = typeof Zone[keyof typeof Zone];

export const PropertyType = {
  CASA: 'CASA',
  DEPARTAMENTO: 'DEPARTAMENTO',
  OFICINA: 'OFICINA',
  LOCAL: 'LOCAL',
  TERRENO: 'TERRENO'
} as const;

export type PropertyType = typeof PropertyType[keyof typeof PropertyType];
