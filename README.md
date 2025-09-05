# Algorithmic Laws

I always wondered if laws would be better written/applied if they were expressed as algorithms. This would force them to be more deterministic, and less open to interpretation. You could even "unit test" them for contradictions and lack of coverage. 

Then comes LLMs, and now you can just wish that into existence, then experiment with different ways of doing it. This is what this repo shows, an attempt to express existing law text as algorithms. 

## How to Use

### Construct a Scenario (from data_model.json) with:

any NormativeInstrument(s) (laws, regulations, orders)

Action(s) and Proceeding(s) (searches, speech regulations, trials, taxes, etc.)

a chosen profile_id from interpretation_profiles.json

### Run EvaluateScenario (from precedence_and_conflict.algo). It will:

gate structural requirements;

test rights and powers via constitution_rules.algo;

apply Supremacy, Amendment supersession, Specific-over-General, and Rights-over-Powers;

emit an EngineVerdict of type verdict_types.json#/types/EngineVerdict with a full trace.

## Mini Example (as-applied 1st/4th Amendment)

### Facts (condensed):

City ordinance bans all “political leafletting” in parks.

Police searched a home without a warrant claiming exigency; later data show no exigency.

### Scenario Snippet:

Action{action_type:"ExpressionRegulation", actor: City, facts:{speech_category:"political", is_content_neutral:false, time_place_manner_narrow_tailoring:false, alternative_channels_open:false}}

Action{action_type:"SearchSeizure", actor: CityPolice, facts:{warrant:false, exception:null}}

Profile: textualist_strict

### Engine:

Runs R-AmendI-Speech → UNCONSTITUTIONAL (content-based, fails TPM).

Runs R-AmendIV-SearchSeizure → UNCONSTITUTIONAL (no warrant; no listed exception).

Precedence: Rights vs city police power → rights win.

Verdict: UNCONSTITUTIONAL (as-applied), remedies: enjoin_action.

## Extending & Implementing

Add concrete TriggerIndex mappings so each Action/Instrument is routed to all logically applicable rules.

Flesh out additional rules (e.g., Art.I §5 Journals/Quorum, Art.I §4 Elections, Art.III jurisdiction specifics, Art.II impeachment boundaries) as needed — follow the same pattern: deterministic inputs, thresholds from a profile, explicit pass/fail.

