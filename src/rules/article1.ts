// src/rules/article1.ts
import { CLAUSES, hasEnumeratedClaim, isFederal, requiresRevenueOrigination } from '../helpers';
import { ClauseResult, EnumeratedPower, EvalContext, NormativeInstrument, Rule } from '../types';

function ok(rule_id: string, clause = CLAUSES.ArtI_7_Bicameralism, notes?: string): ClauseResult {
  return { clause, rule_id, result: 'CONSTITUTIONAL', pass: true, notes };
}
function bad(rule_id: string, clause = CLAUSES.ArtI_7_Bicameralism, notes?: string): ClauseResult {
  return { clause, rule_id, result: 'STRUCTURALLY_INVALID', pass: false, notes };
}

export const ArtI_BicameralismPresentment: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§7-BicameralismPresentment',
  clause: CLAUSES.ArtI_7_Bicameralism,
  target: 'instrument',
  trigger: (ctx) =>
    (ctx.scenario.facts.instruments ?? [])
      .filter(n => isFederal(n) && n.type === 'statute'),
  evaluate: (n) => {
    const m = n.meta ?? {};
    const pass = !!(m.house_passage && m.senate_passage && m.presented_to_president);
    return pass ? ok('R-ArtI-§7-BicameralismPresentment')
                : bad('R-ArtI-§7-BicameralismPresentment', CLAUSES.ArtI_7_Bicameralism, 'Missing House/Senate passage or presentment.');
  }
};

export const ArtI_Origination: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§7-Origination',
  clause: CLAUSES.ArtI_7_Origination,
  target: 'instrument',
  trigger: (ctx) =>
    (ctx.scenario.facts.instruments ?? [])
      .filter(n => isFederal(n) && n.type === 'statute' && requiresRevenueOrigination(n)),
  evaluate: (n) => {
    const origin = n.meta?.chamber_of_origin ?? n.enacted_by.chamber_of_origin;
    const pass = origin === 'House of Representatives';
    return pass
      ? { clause: CLAUSES.ArtI_7_Origination, rule_id: 'R-ArtI-§7-Origination', result: 'CONSTITUTIONAL', pass: true }
      : { clause: CLAUSES.ArtI_7_Origination, rule_id: 'R-ArtI-§7-Origination', result: 'STRUCTURALLY_INVALID', pass: false, notes: 'Revenue bill did not originate in House.' };
  }
};

export const ArtI_TaxPower: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§8-TaxPower',
  clause: { id: 'Art.I §8 cl.1', title: 'Tax and Spend', kind: 'Article', ratified_on: '1788-06-21' },
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => hasEnumeratedClaim(n, 'Tax')),
  evaluate: (n, ctx) => {
    const base = ctx.scenario.facts.context?.tax_base;
    if (base === 'income' && n.level === 'federal') {
      // Forward to Amendment XVI in precedence step; raw check passes to be refined later
      return { clause: { id: 'Art.I §8 cl.1', title: 'Tax and Spend', kind: 'Article', ratified_on: '1788-06-21' }, rule_id: 'R-ArtI-§8-TaxPower', result: 'CONSTITUTIONAL', pass: true, notes: 'Income tax validated by Amend. XVI in precedence stage.' };
    }
    // Capitation/apportionment edge cases can be modeled via subject_tags/context
    return { clause: { id: 'Art.I §8 cl.1', title: 'Tax and Spend', kind: 'Article', ratified_on: '1788-06-21' }, rule_id: 'R-ArtI-§8-TaxPower', result: 'CONSTITUTIONAL', pass: true };
  }
};

export const ArtI_Commerce: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§8-Commerce',
  clause: CLAUSES.ArtI_8_Commerce,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => hasEnumeratedClaim(n, 'Commerce')),
  evaluate: (_n, ctx) => {
    const bucket = ctx.scenario.facts.context?.commerce_bucket;
    const enabled = ctx.profile.parameters.commerce_categories_enabled ?? [];
    const pass = !!bucket && enabled.includes(bucket);
    return {
      clause: CLAUSES.ArtI_8_Commerce,
      rule_id: 'R-ArtI-§8-Commerce',
      result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL',
      pass
    };
  }
};

export const ArtI_NecessaryProper: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§8-NecessaryProper',
  clause: CLAUSES.ArtI_8_NP,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => hasEnumeratedClaim(n, 'NP')),
  evaluate: (n, ctx) => {
    const params = ctx.profile.parameters.necessary_and_proper_test ?? { plainly_adapted: true, not_prohibited: true, within_scope_of_end: true };
    const ends: EnumeratedPower[] = (n.enum_power_claims ?? []).filter(p => p !== 'NP');
    const pass = !!params.plainly_adapted && !!params.not_prohibited && !!params.within_scope_of_end && ends.length > 0;
    return { clause: CLAUSES.ArtI_8_NP, rule_id: 'R-ArtI-§8-NecessaryProper', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const ArtI_NoBillOfAttainder: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§9-NoBillOfAttainder',
  clause: CLAUSES.ArtI_9_BillOfAttainder,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => ['statute','resolution'].includes(n.type)),
  evaluate: (n) => {
    const pass = !(n.subject_tags ?? []).includes('punish_named_persons_without_trial');
    return { clause: CLAUSES.ArtI_9_BillOfAttainder, rule_id: 'R-ArtI-§9-NoBillOfAttainder', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const ArtI_NoExPostFacto: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§9-NoExPostFacto',
  clause: CLAUSES.ArtI_9_ExPostFacto,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => ['statute','regulation'].includes(n.type)),
  evaluate: (n) => {
    const pass = !(n.subject_tags ?? []).includes('retroactive_criminalization_or_punishment');
    return { clause: CLAUSES.ArtI_9_ExPostFacto, rule_id: 'R-ArtI-§9-NoExPostFacto', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const ArtI_StateLimits: Rule<NormativeInstrument> = {
  id: 'R-ArtI-§10-StateLimits',
  clause: CLAUSES.ArtI_10_StateLimits,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => n.level === 'state'),
  evaluate: (n) => {
    const tags = new Set(n.subject_tags ?? []);
    const banned = ['treaty', 'coin_money', 'bills_of_credit', 'impair_contracts', 'duties_on_imports_exports_outside_exceptions'];
    const violates = banned.some(b => tags.has(b));
    return { clause: CLAUSES.ArtI_10_StateLimits, rule_id: 'R-ArtI-§10-StateLimits', result: violates ? 'UNCONSTITUTIONAL' : 'CONSTITUTIONAL', pass: !violates };
  }
};

export const ARTICLE_I_RULES: Rule[] = [
  ArtI_BicameralismPresentment,
  ArtI_Origination,
  ArtI_TaxPower,
  ArtI_Commerce,
  ArtI_NecessaryProper,
  ArtI_NoBillOfAttainder,
  ArtI_NoExPostFacto,
  ArtI_StateLimits
];
