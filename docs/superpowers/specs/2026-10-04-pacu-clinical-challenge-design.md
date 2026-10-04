# PACU Clinical Challenge — Design Specification

Date: 2026-10-04
Status: Proposed for implementation review

## 1. Product goal

Create a browser-based, front-facing 2D Post-Anesthesia Care Unit (PACU) clinical simulation game for nurse education and competency assessment. The game combines whole-PACU prioritization with medication-safety workflows. It must feel like a clinical simulation rather than a sequence of quiz buttons.

## 2. Confirmed experience

- Front-facing horizontal 2D PACU scene.
- Three PACU beds active simultaneously; player freely chooses which patient to address first.
- One primary nurse is the player-controlled physical character.
- Keyboard controls: WASD and arrow keys.
- Pointer/touch controls: tap/click a valid floor destination and the nurse walks there.
- Clinical actions require physical proximity to the correct interaction zone.
- Two modes: Practice and Clinical Challenge.
- Desktop and mobile browser support, with a path to PWA/GitHub Pages deployment.
- Visual direction: polished 2D medical simulation; no purple visual elements.

## 3. Core game loop

1. Observe all three patients and their current clinical status.
2. Decide which patient requires priority attention.
3. Move the nurse to the relevant patient/equipment/staff interaction zone.
4. Assess and identify the problem.
5. Perform the appropriate clinical workflow.
6. Reassess the patient and document care.
7. Continue surveillance of all three patients while other patient states evolve.
8. Finish when all required patient goals are met and discharge/readiness conditions are satisfied, or when the scenario ends because of a critical failure.

The player is never forced into PACU-1 → PACU-2 → PACU-3 order.

## 4. Initial three-patient scenario

### PACU-1 — Postoperative pain / Morphine

Primary problem: significant postoperative pain with otherwise initially acceptable physiology.

Expected workflow includes patient assessment, physician notification/order verification when required, hand hygiene, medication retrieval, dose calculation, medication preparation, independent double check, patient/medication verification, administration, post-administration monitoring, hand hygiene and documentation.

The first implementation should keep medication concentrations and exact dosing scenario data configurable rather than hard-coded into rendering logic.

### PACU-2 — Postoperative hypotension / Ephedrine

Primary problem: falling blood pressure requiring recognition, prioritization and appropriate escalation/intervention. The patient state may worsen if the player ignores clinically significant hypotension.

The medication workflow uses the same safety engine as PACU-1 but scenario data, timing and monitoring criteria are patient-specific.

### PACU-3 — Hypoxemia with PONV

Primary problems: oxygenation deterioration plus postoperative nausea/vomiting. This patient is designed to test prioritization: airway/breathing and oxygenation actions take precedence over lower-acuity symptom management when hypoxemia is clinically significant.

## 5. Patient state model

Each patient owns an independent state machine and clock. Minimum state data:

- heart rate
- blood pressure
- SpO2
- respiratory rate
- pain score
- nausea/PONV state
- consciousness/recovery status
- oxygen/support state
- IV/medication state
- current clinical severity
- completed assessments/interventions
- pending orders
- documentation status
- discharge/readiness status

State changes are event-driven plus time-driven. The simulation clock continues for all patients while the nurse is working with one patient.

Suggested severity states: stable, attention, urgent, critical, recovering, ready.

## 6. Prioritization engine

The game calculates clinical urgency separately from the visible task list. In Practice mode, urgent patients can receive visual guidance. In Clinical Challenge mode, the player must identify priority using clinical data.

Failure to respond within scenario-defined windows may trigger progressive deterioration and score penalties. The system should avoid arbitrary instant failure; deterioration should be understandable from changing clinical signs.

## 7. Medication safety workflow

Reusable medication workflow state machine:

assessment → notify/escalate as required → verify order → hand hygiene → retrieve medication → calculate dose → prepare medication → independent double check → bedside identity/right-medication checks → administer → monitor response/adverse effects → hand hygiene → document

The engine must support the previously defined 38-medication pool as data, while individual scenarios expose only clinically relevant medication choices. Drug images and metadata are assets/data, not embedded in patient-state logic.

Wrong medication selection and wrong dose calculation are scored events. Practice mode explains the error and allows guided correction. Challenge mode records the error and applies the scenario's retry/safety rule.

## 8. World and interaction zones

Scene objects include:

- PACU-1, PACU-2, PACU-3 beds
- bedside monitors
- oxygen/airway equipment
- IV equipment
- handwashing sink
- medication cabinet
- medication/computer cart
- medication preparation area
- physician
- second nurse for independent double check
- documentation workstation

Each interactive object exposes a world-space interaction zone and allowed actions. The nurse must reach a valid walkable stopping point before an action begins. Bed graphics and foreground equipment use collision/occlusion masks so the nurse remains on the floor/walkway and does not visually walk through beds.

## 9. Player character

The primary nurse is one persistent player character, not a UI marker or background illustration.

Required animation/state set for first production version:

- idle front/back/left/right as required by scene staging
- walk left/right
- turn toward target
- bedside assessment
- monitor observation
- handwashing
- computer/cart operation
- medication retrieval
- medication preparation
- double-check interaction
- medication administration
- documentation

Character feet use a fixed ground anchor to prevent floating or inconsistent sprite alignment.

## 10. Controls

Desktop:

- WASD / arrow keys for movement
- click/tap walkable floor to path toward destination
- click/tap interaction target to walk to its stopping point and then expose/execute the permitted interaction

Mobile:

- tap-to-move is primary
- large touch interaction controls
- no gameplay dependency on hover or keyboard

Input methods feed the same movement controller and cannot bypass interaction-distance checks.

## 11. Practice mode

Practice mode is instructional. It may:

- highlight the currently urgent patient
- show available safe actions
- explain why an attempted action is unsafe or out of sequence
- guide medication calculations
- provide retry opportunities
- show clinical rationale after key decisions

It still requires physical nurse movement and does not become a static quiz.

## 12. Clinical Challenge mode

Challenge mode removes step-by-step guidance. It records:

- time to recognize deterioration
- prioritization choices
- omitted safety steps
- wrong actions
- medication selection errors
- dose-calculation errors
- patient-identification/right-medication failures
- monitoring delays
- documentation completeness
- final patient outcomes

## 13. Scoring

Final score: 0–100.

Proposed category weighting:

- Clinical assessment and recognition: 20
- Prioritization and response time: 20
- Medication safety: 30
- Intervention/reassessment: 20
- Documentation/completion: 10

Critical safety errors may impose larger deductions and can cap the final competency result. The score report should show category-level performance rather than only a single number.

## 14. UI layout

The PACU scene is the dominant visual surface. UI should remain compact.

Top area: mode, simulation time, score/status and essential alerts.

Patient status: three compact cards showing bed identity and key vital signs/status; critical changes should be noticeable without obscuring the scene.

Bottom/action area: context-sensitive clinical actions rather than a permanently oversized menu. In Practice mode, guidance can appear here. In Challenge mode, guidance is minimized.

Modal panels are reserved for tasks that genuinely require focused interaction, such as medication cabinet selection, dose calculation, preparation, order review and final results.

## 15. Architecture

Recommended implementation remains a static web application suitable for GitHub Pages. Separate responsibilities:

- game loop / simulation clock
- patient state machines
- scenario definitions
- movement and walkable-space controller
- interaction-zone manager
- medication workflow engine
- medication dataset
- scoring/event log
- UI/modal layer
- asset/animation manager
- persistence/settings layer

Clinical scenario data should be declarative so future cases can be added without rewriting core movement/UI code.

## 16. Event model

All meaningful actions produce structured events, for example:

- patient_assessed
- vital_change
- deterioration_started
- physician_notified
- order_verified
- hand_hygiene_completed
- medication_selected
- dose_answered
- medication_prepared
- double_check_completed
- medication_administered
- reassessment_completed
- documentation_completed

Scoring, teaching feedback and audit/debrief should consume the same event log to prevent contradictory logic.

## 17. Persistence and debrief

For the initial web version, browser-local persistence is sufficient for settings and recent results. The final screen should provide:

- total score
- five category scores
- patient outcomes
- timeline of important actions
- medication errors/safety omissions
- missed deterioration signals
- suggested learning focus

No identifiable real-patient information should be required.

## 18. Acceptance criteria for first playable release

A release is considered playable only when:

1. The nurse visibly moves with keyboard and pointer/touch controls.
2. The nurse cannot walk through beds or complete tasks remotely.
3. All three patients evolve concurrently.
4. Player can freely choose patient order.
5. At least one complete medication workflow is playable end-to-end.
6. Hypotension and hypoxemia can worsen when not addressed.
7. Practice and Challenge modes behave differently.
8. Scoring reaches a 0–100 final result with category breakdown.
9. Desktop and mobile layouts are usable.
10. The build can run as a static site on GitHub Pages.

## 19. Out of scope for the first release

- Full 3D rendering
- multiplayer
- real EHR integration
- real patient data
- server accounts
- voice recognition
- networked instructor dashboard

These can be future extensions without changing the core patient/event architecture.

## 20. Implementation principle

The key design rule is: **the clinical simulation owns the game; the UI does not.** Patient state, time, movement and safety rules continue independently of which panel is open. This preserves the intended feeling of managing a real three-bed PACU rather than completing a linear checklist.
