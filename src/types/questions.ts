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
  pricingBaseUnits?: number;
  pricingStepSize?: number;
  pricingStepPrice?: number;
  dependsOnOptionId?: string;
  displaySection?: number;
}

export interface QuestionResponse {
  questionId: string;
  optionId?: string;
  textValue?: string;
}

export interface BarrioConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  price: number;
}

export const PropertyType = {
  CASA: 'CASA',
  DEPARTAMENTO: 'DEPARTAMENTO',
  OFICINA: 'OFICINA',
  LOCAL: 'LOCAL',
  TERRENO: 'TERRENO'
} as const;

export type PropertyType = typeof PropertyType[keyof typeof PropertyType];
