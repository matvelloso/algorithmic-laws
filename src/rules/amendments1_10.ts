// src/rules/amendments1_10.ts
import { CLAUSES } from '../helpers';
import { Action, ClauseResult, EvalContext, Proceeding, Punishment, Rule, NormativeInstrument } from '../types';

const First = CLAUSES.Amend_I;

export const AmendI_Speech: Rule<Action> = {
  id: 'R-AmendI-Speech',
  clause: First,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'ExpressionRegulation'),
  evaluate: (a, ctx) => {
    // Incorporation check (deterministic)
    const actorLevel = (a.actor as any).level ?? 'state';
    if ((actorLevel === 'state' || actorLevel === 'local') && ctx.profile.parameters.incorporation_map && ctx.profile.parameters.incorporation_map['Speech'] !== true) {
      return { clause: First, rule_id: 'R-AmendI-Speech', result: 'NONJUSTICIABLE', pass: false, notes: 'Speech not incorporated in this profile.' };
    }
    const cat = a.facts?.speech_category as string | undefined;
    const unprotected = ctx.profile.parameters.speech_unprotected_categories ?? [];
    if (cat && unprotected.includes(cat)) {
      return { clause: First, rule_id: 'R-AmendI-Speech', result: 'CONSTITUTIONAL', pass: true, notes: `Category '${cat}' unprotected in profile.` };
    }
    const mustBeContentNeutral = !!ctx.profile.parameters.speech_content_neutrality_required;
    const tests = [
      { k: 'is_content_neutral', v: a.facts?.is_content_neutral, need: mustBeContentNeutral ? true : a.facts?.is_content_neutral },
      { k: 'time_place_manner_narrow_tailoring', v: a.facts?.time_place_manner_narrow_tailoring, need: true },
      { k: 'alternative_channels_open', v: a.facts?.alternative_channels_open, need: true }
    ];
    const pass = tests.every(t => t.v === t.need);
    return { clause: First, rule_id: 'R-AmendI-Speech', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendI_FreeExercise: Rule<Action> = {
  id: 'R-AmendI-FreeExercise',
  clause: First,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'ReligiousRegulation'),
  evaluate: (a) => {
    const neutral = !!a.facts?.neutral_and_generally_applicable;
    if (neutral) return { clause: First, rule_id: 'R-AmendI-FreeExercise', result: 'CONSTITUTIONAL', pass: true };
    const pass = !!a.facts?.compelling_interest && !!a.facts?.least_restrictive_means;
    return { clause: First, rule_id: 'R-AmendI-FreeExercise', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendI_Establishment: Rule<Action> = {
  id: 'R-AmendI-Establishment',
  clause: First,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.facts?.government_endorsement_religion || a.facts?.funding_religion),
  evaluate: (a) => {
    const pass =
      !a.facts?.official_church &&
      !a.facts?.preference_among_faiths &&
      !!a.facts?.secular_purpose &&
      !!a.facts?.primary_effect_not_advancing_religion;
    return { clause: First, rule_id: 'R-AmendI-Establishment', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendII_Arms: Rule<Action> = {
  id: 'R-AmendII-Arms',
  clause: CLAUSES.Amend_II,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'ArmsRegulation'),
  evaluate: (a, ctx) => {
    const armsType = a.facts?.arms_category;
    const bearable = new Set(ctx.profile.parameters.arms_bearable_categories ?? []);
    if (!armsType) return { clause: CLAUSES.Amend_II, rule_id: 'R-AmendII-Arms', result: 'INSUFFICIENT_FACTS', pass: false };
    if (!bearable.has(armsType)) {
      return { clause: CLAUSES.Amend_II, rule_id: 'R-AmendII-Arms', result: 'CONSTITUTIONAL', pass: true, notes: 'Arms category outside protected set.' };
    }
    const pass = !!a.facts?.regulation_is_history_consistent_or_objective;
    return { clause: CLAUSES.Amend_II, rule_id: 'R-AmendII-Arms', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendIII_Quartering: Rule<Action> = {
  id: 'R-AmendIII-Quartering',
  clause: CLAUSES.Amend_III,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'Quartering'),
  evaluate: (a) => {
    if (a.facts?.time === 'peacetime') {
      return { clause: CLAUSES.Amend_III, rule_id: 'R-AmendIII-Quartering', result: a.facts?.owner_consent ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass: !!a.facts?.owner_consent };
    }
    if (a.facts?.time === 'wartime') {
      const pass = !!a.facts?.law_prescribes_manner;
      return { clause: CLAUSES.Amend_III, rule_id: 'R-AmendIII-Quartering', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
    }
    return { clause: CLAUSES.Amend_III, rule_id: 'R-AmendIII-Quartering', result: 'INSUFFICIENT_FACTS', pass: false };
    }
};

export const AmendIV_SearchSeizure: Rule<Action> = {
  id: 'R-AmendIV-SearchSeizure',
  clause: CLAUSES.Amend_IV,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'SearchSeizure'),
  evaluate: (a, ctx) => {
    const pc = ctx.profile.parameters.probable_cause_threshold ?? 0.5;
    if (a.facts?.warrant) {
      const pass = (a.facts?.probability_of_illegality ?? 0) >= pc && !!a.facts?.warrant_particularity;
      return { clause: CLAUSES.Amend_IV, rule_id: 'R-AmendIV-SearchSeizure', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
    }
    const exceptions = new Set(ctx.profile.parameters.search_reasonableness_matrix?.exceptions ?? []);
    const pass = exceptions.has(a.facts?.exception);
    return { clause: CLAUSES.Amend_IV, rule_id: 'R-AmendIV-SearchSeizure', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendV_DoubleJeopardy: Rule<Action> = {
  id: 'R-AmendV-DoubleJeopardy',
  clause: CLAUSES.Amend_V,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'CriminalCharge'),
  evaluate: (a) => {
    const pass = !a.facts?.same_offense_same_sovereign_reprosecution;
    return { clause: CLAUSES.Amend_V, rule_id: 'R-AmendV-DoubleJeopardy', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendV_SelfIncrimination: Rule<Proceeding> = {
  id: 'R-AmendV-SelfIncrimination',
  clause: CLAUSES.Amend_V,
  target: 'proceeding',
  trigger: (ctx) => (ctx.scenario.facts.proceedings ?? []).filter(p => p.type === 'criminal'),
  evaluate: (p) => {
    const pass = !((p as any).compelled_testimony_without_immunity);
    return { clause: CLAUSES.Amend_V, rule_id: 'R-AmendV-SelfIncrimination', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendV_Takings: Rule<Action> = {
  id: 'R-AmendV-Takings',
  clause: CLAUSES.Amend_V,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => a.action_type === 'PropertyTaking'),
  evaluate: (a, ctx) => {
    const needPublicUse = !!ctx.profile.parameters.takings_public_use_required;
    const publicUseOk = needPublicUse ? !!a.facts?.public_use : true;
    const compOk = !!a.facts?.just_compensation_paid;
    const pass = publicUseOk && compOk;
    return { clause: CLAUSES.Amend_V, rule_id: 'R-AmendV-Takings', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendVI_SpeedyPublicCounsel: Rule<Proceeding> = {
  id: 'R-AmendVI-SpeedyPublicTrial',
  clause: CLAUSES.Amend_VI,
  target: 'proceeding',
  trigger: (ctx) => (ctx.scenario.facts.proceedings ?? []).filter(p => p.type === 'criminal'),
  evaluate: (p, ctx) => {
    const maxDays = ctx.profile.parameters.speedy_trial_max_days ?? 180;
    const durOk = (p.duration_days_accusation_to_trial ?? Infinity) <= maxDays;
    const pubMin = ctx.profile.parameters.public_trial_visibility_minimum ?? true;
    const publicOk = typeof pubMin === 'boolean' ? (p.public_access === pubMin) : !!p.public_access;
    const counselOk = !!p.counsel_provided;
    const pass = durOk && publicOk && counselOk;
    return { clause: CLAUSES.Amend_VI, rule_id: 'R-AmendVI-SpeedyPublicTrial', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendVIII_BailFines: Rule<Action> = {
    id: 'R-AmendVIII-BailFines',
    clause: CLAUSES.Amend_VIII,
    target: 'action',
    trigger: (ctx) => (ctx.scenario.facts.actions ?? [])
      .filter(a => a.action_type === 'BailSetting' || a.action_type === 'FineImposition'),
    evaluate: (a, ctx) => {
      if (a.action_type === 'BailSetting') {
        const mult = ctx.profile.parameters.excessive_bail_multiplier_vs_max_fine ?? 10;
        const ok = (a.facts?.bail_amount_usd ?? 0) <= mult * (a.facts?.stat_max_fine_usd ?? 1);
        return { clause: CLAUSES.Amend_VIII, rule_id: 'R-AmendVIII-BailFines', result: ok ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass: ok };
      }
      if (a.action_type === 'FineImposition') {
        const mult = ctx.profile.parameters.excessive_fine_multiplier_vs_harm ?? 4;
        const ok = (a.facts?.fine_amount_usd ?? 0) <= mult * (a.facts?.harm_value_usd ?? 1);
        return { clause: CLAUSES.Amend_VIII, rule_id: 'R-AmendVIII-BailFines', result: ok ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass: ok };
      }
      return { clause: CLAUSES.Amend_VIII, rule_id: 'R-AmendVIII-BailFines', result: 'INSUFFICIENT_FACTS', pass: false };
    }
  };
  
  export const AmendVIII_CruelUnusual: Rule<Punishment> = {
    id: 'R-AmendVIII-CruelUnusual',
    clause: CLAUSES.Amend_VIII,
    target: 'punishment',
    trigger: (ctx) => (ctx.scenario.facts.punishments ?? []),
    evaluate: (p, ctx) => {
      const thr = ctx.profile.parameters.cruel_unusual_threshold ?? { severity_min: 80, unusualness_percentile_min: 80 };
      const s = p.severity_score_0_100;
      const u = p.unusualness_percentile_0_100;
      if (u === undefined || s === undefined) {
        return { clause: CLAUSES.Amend_VIII, rule_id: 'R-AmendVIII-CruelUnusual', result: 'INSUFFICIENT_FACTS', pass: false, notes: 'Need severity and unusualness percentiles.' };
      }
      // Pass (constitutional) if NOT both severe and unusual
      const pass = (s < thr.severity_min) || (u < thr.unusualness_percentile_min);
      return { clause: CLAUSES.Amend_VIII, rule_id: 'R-AmendVIII-CruelUnusual', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
    }
  };

export const AmendIX_Unenumerated: Rule<Action> = {
  id: 'R-AmendIX-Unenumerated',
  clause: CLAUSES.Amend_IX,
  target: 'action',
  trigger: (ctx) => (ctx.scenario.facts.actions ?? []).filter(a => !!a.facts?.claimed_unenumerated_right),
  evaluate: (a, ctx) => {
    const catalog = new Set(ctx.profile.parameters.substantive_due_process_catalog ?? []);
    const claim = a.facts?.claimed_unenumerated_right;
    if (!catalog.has(claim)) return { clause: CLAUSES.Amend_IX, rule_id: 'R-AmendIX-Unenumerated', result: 'UNCONSTITUTIONAL', pass: false, notes: 'Claimed right not in profile catalog.' };
    const pass = !a.facts?.countervailing_compelling_interest_without_LRM;
    return { clause: CLAUSES.Amend_IX, rule_id: 'R-AmendIX-Unenumerated', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AmendX_ReservedPowers: Rule<NormativeInstrument> = {
  id: 'R-AmendX-ReservedPowers',
  clause: CLAUSES.Amend_X,
  target: 'instrument',
  trigger: (ctx) => (ctx.scenario.facts.instruments ?? []).filter(n => n.level === 'federal'),
  evaluate: (n) => {
    const powers = new Set(n.enum_power_claims ?? []);
    const hasEnumerated = [...powers].some(p => p !== 'NP');
    const pass = hasEnumerated || powers.has('NP');
    return { clause: CLAUSES.Amend_X, rule_id: 'R-AmendX-ReservedPowers', result: pass ? 'CONSTITUTIONAL' : 'UNCONSTITUTIONAL', pass };
  }
};

export const AMENDMENTS_I_TO_X_RULES = [
  AmendI_Speech,
  AmendI_FreeExercise,
  AmendI_Establishment,
  AmendII_Arms,
  AmendIII_Quartering,
  AmendIV_SearchSeizure,
  AmendV_DoubleJeopardy,
  AmendV_SelfIncrimination,
  AmendV_Takings,
  AmendVI_SpeedyPublicCounsel,
  AmendVIII_BailFines,
  AmendVIII_CruelUnusual,
  AmendIX_Unenumerated,
  AmendX_ReservedPowers
];
