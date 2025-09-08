import { ReactNode } from 'react';

export interface Option {
  value: string;
  label: string;
  icon: string;
  iconColor: string;
  description?: string;
  bgClass?: string;
  iconElement?: ReactNode;
}