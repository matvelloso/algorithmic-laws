// src/types.ts

/** Enumerations (subset mirrors of data_model.json) */
export type GovernmentLevel = 'federal' | 'state' | 'territory' | 'district' | 'local';
export type Branch = 'legislative' | 'executive' | 'judicial' | 'other';
export type LawType =
  | 'statute' | 'resolution' | 'treaty' | 'regulation' | 'executive_order'
  | 'state_constitution' | 'ordinance' | 'court_rule' | 'constitutional_amendment';
export type ProceedingType = 'criminal' | 'civil' | 'impeachment' | 'bankruptcy' | 'military' | 'administrative';
export type PunishmentType = 'fine' | 'imprisonment' | 'death' | 'forfeiture' | 'banishment' | 'probation' | 'corporal';
export type SpeechCategory =
  | 'political' | 'commercial' | 'obscenity' | 'incitement' | 'true_threat' | 'fraud'
  | 'defamation' | 'child_exploitation' | 'fighting_words' | 'time_place_manner';
export type ArmsCategory = 'handgun' | 'long_gun' | 'shotgun' | 'knife' | 'nonlethal' | 'military_heavy' | 'explosive';
export type CommerceBucket = 'channels' | 'instrumentalities' | 'substantial_effects' | 'foreign' | 'interstate' | 'indian';
export type SuspectClass = 'race' | 'national_origin' | 'religion' | 'alienage';
export type QuasiSuspectClass = 'sex' | 'illegitimacy';
export type NonSuspectClass = 'age' | 'wealth' | 'residency' | 'occupation' | 'criminal_history' | 'other';

export type EnumeratedPower =
  | 'Tax' | 'Borrow' | 'Commerce' | 'NaturalizationBankruptcy' | 'CoinMoney' | 'Counterfeiting'
  | 'PostOffice' | 'IPProgress' | 'InferiorTribunals' | 'PiracyFeloniesHighSeas'
  | 'DeclareWar' | 'MarqueReprisal' | 'Army' | 'Navy' | 'RulesOfForces'
  | 'MilitiaCallForth' | 'MilitiaOrganize' | 'SeatOfGovernment' | 'NP';

export type VerdictCode =
  | 'CONSTITUTIONAL' | 'UNCONSTITUTIONAL' | 'PARTIAL' | 'PREEMPTED_BY_SUPREMACY'
  | 'STRUCTURALLY_INVALID' | 'AMENDMENT_SUPERSEDES' | 'NONJUSTICIABLE' | 'INSUFFICIENT_FACTS';

export type Right =
  | 'Speech' | 'Press' | 'ReligionFreeExercise' | 'ReligionNoEstablishment' | 'Assembly' | 'Petition'
  | 'Arms' | 'Quartering' | 'SearchSeizure' | 'GrandJury' | 'DoubleJeopardy' | 'SelfIncrimination'
  | 'DueProcess' | 'JustCompensation' | 'SpeedyTrial' | 'PublicTrial' | 'ImpartialJury' | 'NoticeAccusation'
  | 'Confrontation' | 'CompulsoryProcess' | 'AssistanceOfCounsel' | 'ExcessiveBail' | 'ExcessiveFines'
  | 'CruelUnusualPunishment' | 'UnenumeratedRights' | 'ReservedPowers'
  | 'AbolitionSlavery' | 'Citizenship' | 'PrivilegesImmunities' | 'EqualProtection' | 'DueProcess14'
  | 'ApportionmentIncomeTax' | 'AlcoholProhibition' | 'AlcoholRepeal' | 'WomenSuffrage'
  | 'PollTaxBan' | 'DCVotePresident' | 'PresidentialTermLimit' | 'PresidentialSuccession'
  | 'PresidentialDisability' | 'CongressionalCompensationDelay' | 'VotingAge18' | 'LameDuckTransitions';

/** Anchors */
export interface ClauseRef {
  id: string;          // e.g., "Art.I §8 cl.3" or "Amend.I"
  title: string;
  kind: 'Article' | 'Amendment';
  ratified_on: string; // ISO date
}

/** Entities */
export interface GovernmentUnit {
  id: string;
  name: string;
  level: GovernmentLevel;
  branch?: Branch;
  // Optional helper metadata for structural gates:
  chamber_of_origin?: 'House of Representatives' | 'Senate';
}

export interface Office {
  id: string;
  title: string;
  unit: GovernmentUnit;
  term_start?: string;
  term_end?: string;
  qualification_facts?: {
    age?: number;
    years_citizen?: number;
    residency_state?: string;
    natural_born?: boolean;
  };
  oath_taken?: boolean;
  holder_id?: string;
  // Custom fields:
  elections_won_count?: number;
  years_served_if_succeeded?: number;
}

export interface Person {
  id: string;
  age?: number;
  citizenship?: {
    status?: 'citizen' | 'noncitizen' | 'national';
    by_birth?: boolean;
    naturalized_on?: string;
    state_residencies?: string[];
  };
  classes?: string[];
}

export interface NormativeInstrument {
  id: string;
  level: GovernmentLevel;
  type: LawType;
  title?: string;
  text_uri?: string;
  enacted_on: string;
  enacted_by: GovernmentUnit;
  subject_tags?: string[];
  enum_power_claims?: EnumeratedPower[];

  // Structural-gate metadata (optional, supplied in scenarios where relevant)
  meta?: {
    house_passage?: boolean;
    senate_passage?: boolean;
    presented_to_president?: boolean;
    chamber_of_origin?: 'House of Representatives' | 'Senate';
  };

  // Optional explicit conflict hints (to make preemption deterministic in examples)
  conflicts_with?: string[]; // array of other instrument IDs this conflicts with
}

export interface Proceeding {
  id: string;
  type: ProceedingType;
  forum: GovernmentUnit;
  jury_size?: number;
  jury_unanimity_required?: boolean;
  public_access?: boolean | string;
  counsel_provided?: boolean;
  steps_completed?: string[];
  duration_days_accusation_to_trial?: number;
}

export interface Punishment {
  type: PunishmentType;
  severity_score_0_100: number;
  unusualness_percentile_0_100?: number;
  fine_amount_usd?: number;
  bail_amount_usd?: number;
}

export interface Action {
  id: string;
  actor: GovernmentUnit | Person;
  date: string;
  action_type:
    | 'SearchSeizure' | 'ExpressionRegulation' | 'ReligiousRegulation' | 'ArmsRegulation'
    | 'Quartering' | 'PropertyTaking' | 'CriminalCharge' | 'BailSetting' | 'FineImposition'
    | 'VotingRegulation' | 'BallotAccessRegulation' | 'Districting' | 'MilitaryDraft'
    | 'MilitiaCall' | 'WarDeclaration' | 'TaxCollection' | 'Appointment' | 'Removal'
    | 'Impeachment' | 'TreatyConclusion' | 'NaturalizationDecision' | 'BankruptcyOrder'
    | 'Vacancy' | 'PresidentialDisability';
  facts?: Record<string, any>; // rule-specific fact bag
}

export interface Scenario {
  id: string;
  profile_id: string;
  facts: {
    instruments?: NormativeInstrument[];
    actions?: Action[];
    proceedings?: Proceeding[];
    punishments?: Punishment[];
    persons?: Person[];
    offices?: Office[];
    context?: {
      commerce_bucket?: CommerceBucket;
      tax_base?: 'income' | 'property' | 'capitation' | 'imports' | 'other';
      war_state?: 'none' | 'declared_war' | 'authorized_force' | 'emergency';
      territorial_applicability?: 'states' | 'district' | 'territories' | 'military_base' | 'high_seas' | 'foreign';
    };
  };
}

/** Verdict types (verdict_types.json aligned) */
export interface ClauseResult {
  clause: ClauseRef;
  rule_id: string;
  result: VerdictCode;
  pass: boolean;
  metrics?: Record<string, any>;
  facts_used?: string[];
  profile_parameters_used?: string[];
  notes?: string;
}

export interface PrecedenceDecision {
  basis: 'AmendmentSupersedes' | 'Supremacy' | 'SpecificOverGeneral' | 'RightsOverPowers' | 'ExplicitRepeal' | 'TemporalLatest' | 'StructuralGate';
  winning_clause: ClauseRef;
  losing_clause: ClauseRef;
  explanation?: string;
}

export interface EngineVerdict {
  code: VerdictCode;
  conclusion: string;
  trace: {
    evaluated_rules: ClauseResult[];
    precedence_steps: PrecedenceDecision[];
    structural_gates: string[];
    unresolved_facts: string[];
  };
  remedies?: ('invalidate_norm' | 'enjoin_action' | 'sever_provision' | 'narrow_construction' | 'remand_for_facts' | 'no_action')[];
  scope?: 'as_applied' | 'facial';
}

/** Profiles (subset typed) */
export interface InterpretationProfile {
  id: string;
  label?: string;
  parameters: {
    incorporation?: 'selective' | 'total';
    incorporation_map?: Record<string, boolean>;
    probable_cause_threshold?: number;
    search_reasonableness_matrix?: {
      warrant_required_default?: boolean;
      exceptions?: string[];
    };
    speedy_trial_max_days?: number;
    public_trial_visibility_minimum?: string | boolean;
    excessive_bail_multiplier_vs_max_fine?: number;
    excessive_fine_multiplier_vs_harm?: number;
    cruel_unusual_threshold?: { severity_min: number; unusualness_percentile_min: number };
    takings_public_use_required?: boolean;
    speech_unprotected_categories?: string[];
    speech_content_neutrality_required?: boolean;
    arms_bearable_categories?: ArmsCategory[];
    commerce_categories_enabled?: CommerceBucket[];
    equal_protection_tiers?: {
      suspect: { classes: string[]; test: 'strict' };
      quasi_suspect: { classes: string[]; test: 'intermediate' };
      other: { classes: string[]; test: 'rational' };
    };
    strict_test_requirements?: string[];
    intermediate_test_requirements?: string[];
    rational_basis_requirements?: string[];
    substantive_due_process_catalog?: string[];
    appointments_definition_officer_us?: { continuous_duties?: boolean; significant_authority?: boolean };
    necessary_and_proper_test?: { plainly_adapted?: boolean; not_prohibited?: boolean; within_scope_of_end?: boolean };
  };
}

/** Rule framework */
export type RuleTargetKind = 'instrument' | 'action' | 'proceeding' | 'office' | 'punishment' | 'conflict';

export interface EvalContext {
  scenario: Scenario;
  profile: InterpretationProfile;
  nowISO: string;
}

export interface Rule<T = any> {
  id: string;
  clause: ClauseRef;
  target: RuleTargetKind;
  trigger: (ctx: EvalContext) => T[];
  evaluate: (input: T, ctx: EvalContext) => ClauseResult | null;
}
