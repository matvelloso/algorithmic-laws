// src/rules/index.ts
import { ARTICLE_I_RULES } from './article1';
import { ARTICLE_II_RULES } from './article2';
import { ARTICLE_III_IV_V_VI_RULES } from './article3_4_5_6';
import { AMENDMENTS_I_TO_X_RULES } from './amendments1_10';
import { AMENDMENTS_13_TO_27_RULES } from './amendments13_27';
import { Rule } from '../types';

export const ALL_RULES: Rule[] = [
  ...ARTICLE_I_RULES,
  ...ARTICLE_II_RULES,
  ...ARTICLE_III_IV_V_VI_RULES,
  ...AMENDMENTS_I_TO_X_RULES,
  ...AMENDMENTS_13_TO_27_RULES
];
