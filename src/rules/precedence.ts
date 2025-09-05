// src/precedence.ts
import { ClauseRef, ClauseResult, EngineVerdict, EvalContext, NormativeInstrument, PrecedenceDecision, VerdictCode } from './types';
import { CLAUSES, clauseAfter, sameDomainConflict } from '../helpers';

export interface PrecedenceOutcome {
  decisions: PrecedenceDecision[];
  // Optionally adjust/annotate results here if a higher clause overrides a lower one
}

export function applyPrecedence(ctx: EvalContext, results: ClauseResult[]): PrecedenceOutcome {
  const decisions: PrecedenceDecision[] = [];

  // Supremacy: valid federal norm vs conflicting state norm
  const instruments = ctx.scenario.facts.instruments ?? [];
  for (const f of instruments.filter(n => n.level === 'federal')) {
    for (const s of instruments.filter(n => n.level === 'state')) {
      if (sameDomainConflict(f, s)) {
        decisions.push({
          basis: 'Supremacy',
          winning_clause: CLAUSES.ArtVI_Supremacy,
          losing_clause: { id: 'Art.I §10', title: 'State Limits / conflicting norm', kind: 'Article', ratified_on: '1788-06-21' },
          explanation: `Federal instrument '${f.id}' preempts state instrument '${s.id}'.`
        });
      }
    }
  }

  // Amendment supersession (e.g., XXI > XVIII)
  const repeal = { earlier: CLAUSES.Amend_XVIII, later: CLAUSES.Amend_XXI };
  decisions.push({
    basis: 'AmendmentSupersedes',
    winning_clause: repeal.later,
    losing_clause: repeal.earlier,
    explanation: 'Amendment XXI repeals Amendment XVIII (alcohol).'
  });

  // Specific over general (sketch: rights constraint beats general power unless later carveout)
  // We annotate but do not change individual ClauseResult objects here—engine.ts will use these decisions to pick final code.
  return { decisions };
}

export function aggregateVerdict(results: ClauseResult[], precedence: PrecedenceDecision[]): EngineVerdict {
  const hasStructuralFail = results.some(r => r.result === 'STRUCTURALLY_INVALID');
  if (hasStructuralFail) {
    return {
      code: 'STRUCTURALLY_INVALID',
      conclusion: 'One or more structural gates failed.',
      trace: { evaluated_rules: results, precedence_steps: precedence, structural_gates: [], unresolved_facts: [] },
      remedies: ['invalidate_norm']
    };
  }

  const anyUnconst = results.some(r => r.result === 'UNCONSTITUTIONAL');
  const anyConst = results.some(r => r.result === 'CONSTITUTIONAL');

  if (anyUnconst && anyConst) {
    return {
      code: 'PARTIAL',
      conclusion: 'Some rules passed; others failed. Consider severability.',
      trace: { evaluated_rules: results, precedence_steps: precedence, structural_gates: [], unresolved_facts: [] },
      remedies: ['sever_provision'],
      scope: 'as_applied'
    };
  }
  if (anyUnconst) {
    return {
      code: 'UNCONSTITUTIONAL',
      conclusion: 'One or more controlling rights/power rules failed.',
      trace: { evaluated_rules: results, precedence_steps: precedence, structural_gates: [], unresolved_facts: [] },
      remedies: ['enjoin_action'],
      scope: 'as_applied'
    };
  }
  if (results.every(r => r.result === 'INSUFFICIENT_FACTS')) {
    return {
      code: 'INSUFFICIENT_FACTS',
      conclusion: 'Insufficient facts across controlling rules.',
      trace: { evaluated_rules: results, precedence_steps: precedence, structural_gates: [], unresolved_facts: [] },
      remedies: ['remand_for_facts']
    };
  }

  return {
    code: 'CONSTITUTIONAL',
    conclusion: 'All controlling rules passed (subject to recorded precedence steps).',
    trace: { evaluated_rules: results, precedence_steps: precedence, structural_gates: [], unresolved_facts: [] },
    remedies: ['no_action']
  };
}
