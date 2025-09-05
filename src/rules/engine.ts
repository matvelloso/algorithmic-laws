// src/engine.ts
import profilesJson from '../config/interpretation_profiles.json';
import { ALL_RULES } from './rules';
import { applyPrecedence, aggregateVerdict } from './precedence';
import { EvalContext, EngineVerdict, InterpretationProfile, Rule, Scenario, ClauseResult } from './types';
import { pickProfile } from './helpers';

export function evaluateScenario(scenario: Scenario): EngineVerdict {
  const profiles = (profilesJson as any).profiles as InterpretationProfile[];
  const profile = pickProfile(profiles, scenario.profile_id);

  const ctx: EvalContext = {
    scenario,
    profile,
    nowISO: new Date().toISOString().slice(0, 10)
  };

  // STEP 1–3: Run all rules (the rules themselves encode their Article/Amendment scope and triggers)
  const results: ClauseResult[] = [];
  for (const rule of ALL_RULES) {
    try {
      const targets = rule.trigger(ctx) as any[];
      for (const t of targets) {
        const res = rule.evaluate(t, ctx);
        if (res) results.push(res);
      }
    } catch (e: any) {
      results.push({
        clause: { id: 'Engine', title: 'Rule Execution Error', kind: 'Article', ratified_on: '1788-06-21' },
        rule_id: rule.id,
        result: 'INSUFFICIENT_FACTS',
        pass: false,
        notes: e?.message ?? 'Rule error'
      });
    }
  }

  // STEP 4–6: Precedence & conflicts
  const precedenceOutcome = applyPrecedence(ctx, results);

  // STEP 7–8: Aggregate and return
  const verdict = aggregateVerdict(results, precedenceOutcome.decisions);
  return verdict;
}
