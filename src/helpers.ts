// src/helpers.ts
import { ClauseRef, EnumeratedPower, EvalContext, GovernmentLevel, NormativeInstrument, PrecedenceDecision, Scenario, InterpretationProfile } from './types';

export const CLAUSES = {
  ArtI_7_Bicameralism: { id: 'Art.I §7 cl.2-3', title: 'Bicameralism & Presentment', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtI_7_Origination: { id: 'Art.I §7 cl.1', title: 'Origination of Revenue Bills', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtI_8_Commerce: { id: 'Art.I §8 cl.3', title: 'Commerce', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtI_8_NP: { id: 'Art.I §8 cl.18', title: 'Necessary & Proper', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtI_9_BillOfAttainder: { id: 'Art.I §9 cl.3', title: 'No Bill of Attainder', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtI_9_ExPostFacto: { id: 'Art.I §9 cl.3', title: 'No Ex Post Facto', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtI_10_StateLimits: { id: 'Art.I §10', title: 'Restrictions on States', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,

  ArtII_1_PresidentQuals: { id: 'Art.II §1', title: 'President Qualifications & Oath', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtII_2_Treaties: { id: 'Art.II §2', title: 'Treaties & Appointments', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,

  ArtIII_3_Treason: { id: 'Art.III §3', title: 'Treason Defined', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,

  ArtIV_2_PI: { id: 'Art.IV §2', title: 'Privileges and Immunities', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtIV_4_Guarantee: { id: 'Art.IV §4', title: 'Guarantee Clause', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,

  ArtV_Amendment: { id: 'Art.V', title: 'Amendment Process', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,

  ArtVI_Supremacy: { id: 'Art.VI', title: 'Supremacy Clause', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,
  ArtVI_NoReligiousTest: { id: 'Art.VI', title: 'No Religious Test', kind: 'Article', ratified_on: '1788-06-21' } as ClauseRef,

  Amend_I: { id: 'Amend.I', title: 'First Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_II: { id: 'Amend.II', title: 'Second Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_III: { id: 'Amend.III', title: 'Third Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_IV: { id: 'Amend.IV', title: 'Fourth Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_V: { id: 'Amend.V', title: 'Fifth Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_VI: { id: 'Amend.VI', title: 'Sixth Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_VIII: { id: 'Amend.VIII', title: 'Eighth Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_IX: { id: 'Amend.IX', title: 'Ninth Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,
  Amend_X: { id: 'Amend.X', title: 'Tenth Amendment', kind: 'Amendment', ratified_on: '1791-12-15' } as ClauseRef,

  Amend_XIII: { id: 'Amend.XIII §1', title: 'Abolition of Slavery', kind: 'Amendment', ratified_on: '1865-12-06' } as ClauseRef,
  Amend_XIV: { id: 'Amend.XIV §1', title: 'Due Process & Equal Protection', kind: 'Amendment', ratified_on: '1868-07-09' } as ClauseRef,
  Amend_XV_XIX_XXIV_XXVI: { id: 'Amend.XV|XIX|XXIV|XXVI', title: 'Suffrage Protections', kind: 'Amendment', ratified_on: '1919-06-04' } as ClauseRef,
  Amend_XVI: { id: 'Amend.XVI', title: 'Income Tax', kind: 'Amendment', ratified_on: '1913-02-03' } as ClauseRef,
  Amend_XVIII: { id: 'Amend.XVIII', title: 'Prohibition', kind: 'Amendment', ratified_on: '1919-01-16' } as ClauseRef,
  Amend_XXI: { id: 'Amend.XXI', title: 'Repeal of Prohibition', kind: 'Amendment', ratified_on: '1933-12-05' } as ClauseRef,
  Amend_XXII: { id: 'Amend.XXII', title: 'Presidential Term Limits', kind: 'Amendment', ratified_on: '1951-02-27' } as ClauseRef,
  Amend_XXV: { id: 'Amend.XXV', title: 'Presidential Succession & Disability', kind: 'Amendment', ratified_on: '1967-02-10' } as ClauseRef,
  Amend_XXVII: { id: 'Amend.XXVII', title: 'Congressional Pay Changes', kind: 'Amendment', ratified_on: '1992-05-07' } as ClauseRef
};

export function isFederal(n: NormativeInstrument): boolean {
  return n.level === 'federal';
}

export function requiresRevenueOrigination(n: NormativeInstrument): boolean {
  return n.type === 'statute' && (n.subject_tags ?? []).includes('raise_revenue');
}

export function hasEnumeratedClaim(n: NormativeInstrument, p: EnumeratedPower) {
  return (n.enum_power_claims ?? []).includes(p);
}

export function dateISO(d: string | Date): string {
  return typeof d === 'string' ? d : d.toISOString().slice(0, 10);
}

export function pickProfile(profiles: InterpretationProfile[], id: string): InterpretationProfile {
  const p = profiles.find(x => x.id === id);
  if (!p) {
    throw new Error(`Profile '${id}' not found in interpretation_profiles.json`);
  }
  return p;
}

export function sameDomainConflict(a: NormativeInstrument, b: NormativeInstrument): boolean {
  // Deterministic but simple: conflicts_with hints OR overlapping subject_tags
  if ((a.conflicts_with ?? []).includes(b.id) || (b.conflicts_with ?? []).includes(a.id)) return true;
  const sa = new Set(a.subject_tags ?? []);
  return (b.subject_tags ?? []).some(t => sa.has(t));
}

export function clauseAfter(a: ClauseRef, b: ClauseRef): boolean {
  return a.ratified_on > b.ratified_on;
}

export function currency(n?: number) {
  return typeof n === 'number' ? `$${n.toFixed(2)}` : 'n/a';
}
