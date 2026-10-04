# PACU Simulator 3D — Unreal Engine 5 Design Specification

Date: 2026-10-04
Status: Design approved in conversation; written-spec review pending
Target: Windows PC
Engine: Unreal Engine 5

## 1. Product vision

PACU Simulator 3D is a high-fidelity first-person post-anesthesia care unit (PACU) clinical simulation game. The player acts as the PACU nurse and physically moves through a realistic three-bed recovery room, assesses patients, communicates with patients and clinicians, uses equipment, prepares medication, performs safety checks, administers medication, responds to deterioration, documents care, and receives structured debriefing.

The project is an educational simulation, not a substitute for local clinical policy, medication references, supervision, or professional judgment. Medication and emergency-response parameters must remain editable and clinically reviewed before educational deployment.

## 2. Locked product decisions

- Unreal Engine 5.
- Windows PC, keyboard and mouse.
- Pure first-person perspective; the player sees first-person hands and held objects.
- High-fidelity realistic 3D visual direction.
- Three-bed open PACU: PACU-1, PACU-2, PACU-3.
- Progressive multi-patient care rather than three isolated linear levels.
- Teaching Mode and Assessment Mode share the same simulation systems.
- Interactive Traditional Chinese clinical dialogue with Chinese voice and subtitles.
- Dynamic physiology with bounded patient-to-patient variation.
- Detailed clinical interaction plus selected professional-simulator depth.
- Full PACU deterioration framework based around ABCDE assessment, immediate action, escalation/SBAR, ordered treatment, and reassessment.
- Debriefing includes a clinical event timeline, competency profile, major safety events, response times, patient outcomes, and a score out of 100.

## 3. First vertical slice

The first playable milestone is PACU-1 and proves the complete gameplay loop before PACU-2/PACU-3 complexity is enabled.

PACU-1 focuses on postoperative pain and Morphine 3 mg IVP. The player must assess the patient and vital signs, obtain relevant symptom information, communicate using SBAR, review the order, perform hand hygiene, identify the correct medication, complete dosage calculation, prepare medication, complete an independent double check, identify the patient, prepare the IV access safely, administer medication, monitor the patient, detect deterioration, intervene, reassess, and document care.

The first fully implemented complication path is opioid-associated respiratory depression/hypoxemia. The architecture must allow additional complication modules without rewriting the patient controller.

## 4. Three-bed scenario direction

The three medication anchors are retained, while patient histories, surgery types, baseline observations, complication triggers, distractors, and response rules are redesigned for the 3D simulator.

- PACU-1: Morphine-centered postoperative pain scenario with respiratory-depression/hypoxemia risk.
- PACU-2: Ephedrine-centered postoperative hypotension scenario.
- PACU-3: Norepinephrine-centered severe hypotension/hemodynamic-instability scenario.

Teaching progression begins with PACU-1. Later scenarios introduce PACU-2 and PACU-3 at different times. Advanced assessment can run all three beds concurrently and score prioritization, delayed responses, interruption management, and safety outcomes.

## 5. PACU environment

The initial map contains three patient bays with privacy curtains and realistic spacing, bedside monitors, IV poles and pumps, oxygen/suction infrastructure, work surfaces, a nursing station, computer/order/documentation stations, medication storage/cart, hand-hygiene station, emergency cart, clean supply area, and circulation space that supports first-person movement.

Important equipment is interactive rather than decorative. Interactable actors expose a common interaction interface so the same player interaction system can operate beds, monitors, computers, medication storage, sinks, carts, medication objects, syringes, IV access, and NPC interaction points.

## 6. Player controls and interaction

Baseline controls:

- WASD: move.
- Mouse: look.
- E: contextual interaction.
- Shift: faster walking where appropriate.
- Escape: pause/settings.

Interaction uses a center-screen trace from the first-person camera. A valid target can expose an interaction verb and contextual information. Clinical actions that require manipulation transition into focused interaction states rather than being completed by one generic button press.

Examples include inspecting a medication label, selecting a syringe, drawing a measured volume, selecting an IV access point, performing an ordered administration sequence, and operating a monitor/computer UI.

## 7. Teaching and assessment modes

### Teaching Mode

Teaching Mode displays objective-level guidance such as “complete the initial PACU assessment” rather than revealing every required click. The player can request additional hints. Selected catastrophic actions may be blocked or explicitly warned where necessary for teaching. Feedback can be immediate.

### Assessment Mode

Assessment Mode removes procedural hints. The player retains only information that would reasonably be available in the simulated clinical environment. The simulator records omissions, incorrect sequence, unsafe actions, response latency, communication completeness, medication errors, infection-control errors, monitoring failures, and prioritization decisions. Feedback is primarily deferred to debriefing.

## 8. Patient physiology

Each patient has a simulation state containing at minimum:

- Heart rate.
- Blood pressure/MAP.
- Respiratory rate.
- SpO2.
- Pain score.
- Level of consciousness/sedation state.
- Airway/respiratory state.
- Relevant symptoms such as nausea.
- Active medication effects.
- Active complication state.

Physiology is data-driven. Baseline values and response coefficients may vary within clinically reviewed bounds so repeated runs are not identical. Drug effect, elapsed time, administration parameters, oxygen/supportive measures, complication progression, and player interventions feed the patient-state update loop.

Monitor values, alarms, patient animation/appearance, breathing presentation, and dialogue responses read from the same patient state to avoid contradictory representations.

This is an educational simulation model rather than a validated physiological engine; parameters require clinical review and scenario validation.

## 9. Medication system

The medication architecture is data-driven and designed to host the existing 38-item medication pool. Each medication record can define display name, concentration/presentation, route metadata, visual asset reference, scenario eligibility, safety-check metadata, and simulation effect profile.

Medication selection is performed in the 3D medication area. The player must identify the intended product rather than selecting from a simplified answer list.

Dose calculation is a focused interactive UI. Preparation supports measurable syringe volume. Wrong selection, wrong calculation, wrong prepared amount, omitted checks, and unsafe administration parameters generate structured events for the scoring/debriefing system.

Exact concentrations, dose limits, administration rates, compatibility rules, and rescue algorithms must be editable and clinically validated rather than embedded as immutable code constants.

## 10. Dialogue and NPC system

Patient dialogue is state-aware. Available assessment questions include pain, nausea/vomiting, dyspnea, dizziness/discomfort, and scenario-specific questions. Responses are selected from scenario/state data and presented with Traditional Chinese subtitles and corresponding Chinese voice assets.

Physician communication uses an interactive SBAR structure. The player chooses or assembles clinically relevant information. Missing, incorrect, or delayed information can affect scoring and scenario progression.

A second-nurse NPC supports independent double-check interactions. The NPC system is intentionally task-focused in the vertical slice; broad autonomous hospital AI is outside first-slice scope.

## 11. Deterioration and emergency framework

The reusable complication framework supports respiratory depression, upper-airway obstruction, severe hypotension, arrhythmia, and future PACU complications.

A complication can define:

1. Trigger conditions.
2. Progression stages.
3. Physiological changes over time.
4. Monitor/alarm behavior.
5. Patient visual/animation/dialogue changes.
6. Expected assessment/intervention categories.
7. Escalation requirements.
8. Recovery, persistence, or worsening conditions.
9. Scoring events and critical safety flags.

The intended player pattern is ABCDE assessment, immediate supportive action, call for help/SBAR, execution of available/ordered interventions, and reassessment.

## 12. Multi-patient orchestration

A Scenario Director activates beds and events according to scenario data. It can admit/activate PACU-2 while PACU-1 remains active, trigger alarms or clinical changes, and create interruptions.

The director never directly awards points. It emits scenario events; the scoring service evaluates the player response. This keeps scenario timing separate from assessment logic.

## 13. Scoring and event logging

Every meaningful clinical action generates a timestamped structured event. Example event fields include scenario time, patient/bed, actor, action type, target, result, correctness/safety classification, response latency, and contextual metadata.

The score totals 100 and is composed from configurable competency domains including:

- Patient assessment.
- Clinical judgment/prioritization.
- Medication safety and dose calculation.
- Infection prevention.
- Communication/SBAR.
- Medication-administration technique.
- Post-administration monitoring and reassessment.
- Multi-patient prioritization.

Critical safety events can impose larger penalties and be separately surfaced rather than being hidden inside the total score.

## 14. Debriefing

At scenario completion the game generates:

- Score /100.
- Competency-domain visualization.
- Chronological clinical-event timeline.
- Correct actions.
- Omissions and delayed actions.
- Medication/infection-control/communication errors.
- Critical safety events.
- Patient outcomes.
- Response-time metrics.
- Improvement feedback tied to scenario objectives.

The event log should be serializable so future educational analytics/export can be added without redesigning gameplay systems.

## 15. UE5 architecture

Recommended hybrid Blueprint/C++ architecture:

### C++ foundations

- `APACUPlayerCharacter`: first-person movement and interaction origin.
- `UPACUInteractionComponent`: tracing, focus, interaction dispatch.
- `IPACUInteractable`: common interaction contract.
- `APACUPatient`: patient actor facade.
- `UPatientPhysiologyComponent`: authoritative patient simulation state/update.
- `UMedicationSimulationComponent`: active drug effects.
- `UComplicationComponent`: complication state machine.
- `APACUScenarioDirector`: scenario activation and timing.
- `UPACUEventLogSubsystem`: structured event collection.
- `UPACUScoringSubsystem`: scoring rules and competency aggregation.
- Data assets/data tables for patients, medications, complications, dialogues, scenarios, and scoring rules.

### Blueprint/content layer

Blueprints assemble room equipment, interaction points, patient presentation, first-person hand animation hooks, NPC task sequences, alarms, audio, visual effects, and scenario-specific presentation. UMG implements teaching HUD, monitor/computer interfaces, calculation UI, dialogue/SBAR, interaction prompts, and debriefing.

Core clinical rules should not depend on a particular mesh or level actor. Visual assets can therefore be replaced as fidelity improves.

## 16. Data flow

Player input -> Interaction Component -> Interactable/Focused UI -> Domain action -> Patient/Medication/Scenario state change -> Event Log -> Scoring evaluation -> presentation updates.

Patient physiology -> monitor UI/alarm + patient presentation + state-aware dialogue.

Scenario Director -> bed/event activation -> patient complication state -> player response -> event log -> scoring/debriefing.

This separation prevents UI widgets from becoming the source of clinical truth.

## 17. Error handling and safety design

- Invalid interaction states fail safely and return contextual feedback.
- Teaching Mode may prevent selected catastrophic actions; Assessment Mode records them where simulation design permits.
- Scenario state must remain recoverable if an optional animation/audio asset is missing.
- Data validation should detect missing medication IDs, scenario references, dialogue IDs, and invalid scoring weights during development.
- Clinical data should be externally reviewable through tables/assets rather than hidden in code.

## 18. Testing strategy

### Automated/core tests

- Dose-calculation rule tests.
- Patient-state transition tests.
- Medication-effect tests using simulation-safe fixture values.
- Complication trigger/progression/recovery tests.
- Event-log ordering and serialization tests.
- Scoring total/domain tests.
- Teaching vs Assessment behavior tests.
- Scenario Director activation/timing tests.

### Play tests

- Player can traverse all required interaction zones without collision traps.
- Every PACU-1 required action can be completed from a fresh run.
- Monitor, patient presentation, and dialogue remain consistent with physiology state.
- Wrong medication/dose/sequence paths are logged correctly.
- Respiratory deterioration is detectable and recoverable through the intended scenario path.
- Debriefing reconstructs the run accurately.

Clinical educators must separately validate scenario realism, expected actions, medication content, scoring weights, and debriefing language.

## 19. Scope boundaries for the first implementation plan

Included: UE5 project foundation, first-person controller, generic interaction framework, three-bed PACU greybox, PACU-1 patient, monitor presentation, Teaching/Assessment mode foundation, dialogue/SBAR foundation, hand hygiene interaction, medication-data framework, PACU-1 Morphine workflow, calculation/preparation interaction, double-check interaction, administration interaction, dynamic PACU-1 physiology, respiratory-depression/hypoxemia complication, event logging, scoring, and debriefing foundation.

Deferred until the vertical slice is stable: final photorealistic art pass, complete 38-medication visual asset production, full Chinese voice recording, PACU-2 complete Ephedrine scenario, PACU-3 complete Norepinephrine scenario, all complication modules, advanced NPC autonomy, VR, multiplayer, and institutional analytics integration.

## 20. Vertical-slice acceptance criteria

The build is considered a successful first vertical slice when a Windows player can launch the simulation, choose Teaching or Assessment Mode, enter the three-bed PACU in first person, complete the PACU-1 medication workflow through physical/contextual interactions, encounter a dynamically represented respiratory deterioration path, respond and reassess, finish documentation, and receive a debriefing timeline and scored result that accurately reflects the run.
