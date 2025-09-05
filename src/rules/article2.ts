// src/rules/article2.ts
import { CLAUSES } from '../helpers';
import { ClauseResult, EvalContext, Office, Rule, Action } from '../types';

export const ArtII_PresidentQualifications: Rule<Office> = {
  id: 'R-ArtII-§1-Qualifications-President',
  clause: CLAUSES.ArtII_1_PresidentQuals,
  target: 'office',
  trigger: (ctx) => (ctx.scenario.facts.offices ?? []).filter(o => o.title === 'President'),
  evaluate: (o) => {
    const q = o.qualification_facts ?? {};
    const pass = !!q.natural_born && (q.age ?? 0) >= 35 && (q.years_citizen ?? 0) >= 14 && !!o.oath_taken;
    return { clause: CLAUSES.ArtII_1_PresidentQuals, rule_id: 'R-ArtII-§1-Qualifications-President', result: pass ? 'CONSTITUTIONAL' : 'STRUCTURALLY_INVALID', pass };
  }
};

export const ArtII_TreatiesConsent: Rule<Action> = {
  id: 'R-ArtII-§2-Treaties-Consent',
  clause: CLAUSES.ArtII_2_Treaties,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'TreatyConclusion'),
  evaluate: (a) => {
    const pass = !!a.facts?.senate_consent_two_thirds_present;
    return { clause: CLAUSES.ArtII_2_Treaties, rule_id: 'R-ArtII-§2-Treaties-Consent', result: pass ? 'CONSTITUTIONAL' : 'STRUCTURALLY_INVALID', pass };
  }
};

export const ARTICLE_II_RULES = [ArtII_PresidentQualifications, ArtII_TreatiesConsent];
