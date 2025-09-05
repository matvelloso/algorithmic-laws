// src/rules/article3_4_5_6.ts
import { CLAUSES } from '../helpers';
import { Action, NormativeInstrument, Proceeding, Rule } from '../types';

export const ArtIII_Treason: Rule<Action> = {
  id: 'R-ArtIII-§3-Treason',
  clause: CLAUSES.ArtIII_3_Treason,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'CriminalCharge' && a.facts?.offense === 'treason'),
  evaluate: (a) => {
    const f = a.facts ?? {};
    const pass = !!f.levying_war_or_adhering_enemies && (!!f.two_witnesses_same_overt_act || !!f.open_court_confession);
    return { clause: CLAUSES.ArtIII_3_Treason, rule_id: 'R-ArtIII-§3-Treason', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const ArtV_AmendmentProcess: Rule<NormativeInstrument> = {
  id: 'R-ArtV-AmendmentProcess',
  clause: CLAUSES.ArtV_Amendment,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => n.type === 'constitutional_amendment'),
  evaluate: (n) => {
    const pass = !!n.subject_tags?.includes('proposed_by_2_3_congress') || !!n.subject_tags?.includes('convention_called_by_2_3_states');
    const ratified = !!n.subject_tags?.includes('ratified_by_3_4_states');
    const ok = pass && ratified;
    return { clause: CLAUSES.ArtV_Amendment, rule_id: 'R-ArtV-AmendmentProcess', result: ok ? 'CONSTITUTIONAL' : 'STRUCTURALLY_INVALID', pass: ok };
  }
};

export const ArtVI_NoReligiousTest: Rule<Action> = {
  id: 'R-ArtVI-NoReligiousTest',
  clause: CLAUSES.ArtVI_NoReligiousTest,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'Appointment' || a.action_type === 'BallotAccessRegulation'),
  evaluate: (a) => {
    const pass = !a.facts?.requires_religious_affirmation;
    return { clause: CLAUSES.ArtVI_NoReligiousTest, rule_id: 'R-ArtVI-NoReligiousTest', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const ARTICLE_III_IV_V_VI_RULES = [ArtIII_Treason, ArtV_AmendmentProcess, ArtVI_NoReligiousTest];
