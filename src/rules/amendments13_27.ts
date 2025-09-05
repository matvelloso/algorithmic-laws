// src/rules/amendments13_27.ts
import { CLAUSES } from '../helpers';
import { Action, InterpretationProfile, NormativeInstrument, Office, Proceeding, Rule } from '../types';

export const AmendXIII_Abolition: Rule<Action> = {
  id: 'R-AmendXIII-Abolition',
  clause: CLAUSES.Amend_XIII,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.facts?.involuntary_servitude_imposed),
  evaluate: (a) => {
    const pass = !!a.facts?.as_punishment_for_crime;
    return { clause: CLAUSES.Amend_XIII, rule_id: 'R-AmendXIII-Abolition', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendXIV_DP_EP: Rule<Action> = {
  id: 'R-AmendXIV-DueProcess-EqualProtection',
  clause: CLAUSES.Amend_XIV,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => (a.actor as any).level === 'state' || (a.actor as any).level === 'local'),
  evaluate: (a, ctx) => {
    // Procedural DP: if a proceeding exists and action affects rights, ensure minima steps are present.
    const minima = ctx.profile.parameters.due_process_procedural_minima ?? [];
    const p = (ctx.scenario.facts.proceedings ?? [])[0]; // simple deterministic association
    const dpOK = minima.length === 0 || (!!p && minima.every(m => (p.steps_completed ?? []).includes(m)));

    // Equal Protection (tiers)
    const cls = a.facts?.classification as string | undefined;
    const tiers = ctx.profile.parameters.equal_protection_tiers!;
    let tier: 'strict' | 'intermediate' | 'rational' = 'rational';
    if (cls && tiers.suspect.classes.includes(cls)) tier = 'strict';
    else if (cls && tiers.quasi_suspect.classes.includes(cls)) tier = 'intermediate';

    const reqs =
      tier === 'strict' ? ctx.profile.parameters.strict_test_requirements ?? []
      : tier === 'intermediate' ? ctx.profile.parameters.intermediate_test_requirements ?? []
      : ctx.profile.parameters.rational_basis_requirements ?? [];

    const epOK = reqs.every(r => !!a.facts?.[r]);
    const pass = dpOK && epOK;
    return { clause: CLAUSES.Amend_XIV, rule_id: 'R-AmendXIV-DueProcess-EqualProtection', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendXV_XIX_XXIV_XXVI_Voting: Rule<Action> = {
  id: 'R-AmendXV-XIX-XXIV-XXVI-Voting',
  clause: CLAUSES.Amend_XV_XIX_XXIV_XXVI,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'VotingRegulation'),
  evaluate: (a) => {
    const banned = new Set(['race','color','previous_condition_of_servitude','sex','failure_to_pay_poll_tax','age>=18']);
    const basis = a.facts?.denial_or_abridgment_based_on;
    const pass = !banned.has(basis);
    return { clause: CLAUSES.Amend_XV_XIX_XXIV_XXVI, rule_id: 'R-AmendXV-XIX-XXIV-XXVI-Voting', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendXVI_IncomeTax: Rule<NormativeInstrument> = {
  id: 'R-AmendXVI-IncomeTax',
  clause: CLAUSES.Amend_XVI,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => n.type === 'statute' && ctx.scenario.facts.context?.tax_base === 'income' && n.level === 'federal'),
  evaluate: () => ({ clause: CLAUSES.Amend_XVI, rule_id: 'R-AmendXVI-IncomeTax', result: 'CONSTITUTIONAL', pass: true })
};

export const AmendXXII_TermLimits: Rule<Office> = {
  id: 'R-AmendXXII-TermLimits',
  clause: CLAUSES.Amend_XXII,
  target: 'office',
  trigger: (ctx) => (ctx.scenario.facts.offices ?? []).filter(o => o.title === 'President'),
  evaluate: (o) => {
    const won = o.elections_won_count ?? 0;
    const yearsSucc = o.years_served_if_succeeded ?? 0;
    const pass = won <= 2 && yearsSucc <= 10;
    return { clause: CLAUSES.Amend_XXII, rule_id: 'R-AmendXXII-TermLimits', result: pass ? 'CONSTITUTIONAL' : 'STRUCTURALLY_INVALID', pass };
  }
};

export const AmendXXV_SuccessionDisability: Rule<Action> = {
  id: 'R-AmendXXV-SuccessionDisability',
  clause: CLAUSES.Amend_XXV,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'Vacancy' || a.action_type === 'PresidentialDisability'),
  evaluate: (a) => {
    const pass = !!a.facts?.procedures_followed_sections_1_to_4;
    return { clause: CLAUSES.Amend_XXV, rule_id: 'R-AmendXXV-SuccessionDisability', result: pass ? 'CONSTITUTIONAL' : 'STRUCTURALLY_INVALID', pass };
  }
};

export const AmendXXVII_CongressPay: Rule<NormativeInstrument> = {
  id: 'R-AmendXXVII-CompensationDelay',
  clause: CLAUSES.Amend_XXVII,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => n.level === 'federal' && (n.subject_tags ?? []).includes('congressional_compensation')),
  evaluate: (n) => {
    const pass = !!(n.subject_tags ?? []).includes('change_effective_after_next_election');
    return { clause: CLAUSES.Amend_XXVII, rule_id: 'R-AmendXXVII-CompensationDelay', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AMENDMENTS_13_TO_27_RULES = [
  AmendXIII_Abolition,
  AmendXIV_DP_EP,
  AmendXV_XIX_XXIV_XXVI_Voting,
  AmendXVI_IncomeTax,
  AmendXXII_TermLimits,
  AmendXXV_SuccessionDisability,
  AmendXXVII_CongressPay
];
