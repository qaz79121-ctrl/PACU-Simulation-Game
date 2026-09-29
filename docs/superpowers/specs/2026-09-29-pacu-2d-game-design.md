# PACU Medication Mission — 2D Virtual Game Design

Date: 2026-09-29
Status: Design specification for review

## 1. Goal
Create a browser-based 2D PACU medication-safety training game suitable for GitHub Pages. The player controls one primary nurse who physically moves through the PACU and completes a fixed 12-step medication workflow for three patients.

## 2. Visual Direction
Use the user-provided PACU reference image as the visual baseline: bright polished 2D medical-simulation illustration, blue/white clinical palette, three PACU bays across the center, medication/handwashing/preparation zone on the left, nursing/physician station on the right, status bar on top, and 12-step mission bar on the bottom.

## 3. Scene Layout
- PACU-1, PACU-2, PACU-3 patient bays.
- Three visibly different patients.
- Left zone: medication cabinet, handwashing sink, computer medication cart.
- Right zone: physician/ISBAR station and nursing station.
- One stationary second-check nurse near medication preparation area.
- One player-controlled primary nurse with complete body, legs, and white shoes.

## 4. Player Movement
Movement mode: click-to-walk plus smart interaction auto-positioning.

Rules:
1. Clicking walkable floor moves the primary nurse to that point.
2. Clicking an interactive object calculates the object's designated interaction point and moves the nurse there first.
3. The task opens only after the nurse reaches the interaction point.
4. Beds, cabinets, desks, curtains, people, walls, and fixed equipment are collision obstacles.
5. Pathfinding routes the nurse around obstacles instead of passing through them.
6. The nurse has one authoritative game entity only; no duplicate/ghost nurse sprites may be created during movement.
7. Patient complaint bubbles are proximity-bound and disappear when the nurse leaves the assessment zone.

## 5. Core Game State
- 3 patients.
- 12 ordered steps per patient.
- 36 total step completions.
- Total score: 100.
- Patient score allocation: 33 + 33 + 34.
- Only the active step can change game state or award points.
- All 12 bottom icons can be clicked for instructions, but inactive steps cannot execute, score, or skip progression.
- Active step is highlighted yellow.

## 6. Twelve-Step Workflow
1. Assess patient — move to current patient's monitor/IV side; show conversational complaint and assessment data.
2. Notify physician — move to physician/ISBAR area; complete ISBAR interaction.
3. Verify order — verify patient, drug, dose, route, and timing.
4. Hand hygiene — move to sink and perform hand hygiene.
5. Retrieve medication — move to medication cabinet/computer cart and choose from the 38-medication pool.
6. Dose calculation — complete medication-dose/volume calculation at the computer cart.
7. Draw up / prepare medication — perform medication preparation interaction.
8. Independent double check — move to the second-check nurse and complete mandatory verification.
9. Administer medication — move to the patient's right side and complete patient identification/safe administration.
10. Post-medication monitoring — move to bedside/monitor area and reassess symptoms/vital signs.
11. Documentation — complete nursing documentation at the computer/documentation area.
12. Complete mission — close the patient's case, score it, and unlock the next patient.

## 7. Interaction State Machine
Every active task follows the same state sequence:
IDLE -> TARGET_SELECTED -> WALKING -> ARRIVED -> TASK_OPEN -> ANSWER/INTERACTION -> VALIDATION -> STEP_COMPLETE -> NEXT_STEP.

Important: TASK_OPEN is impossible before ARRIVED.

Wrong interactions while WALKING do not trigger the task. Inactive-step icons only open help content and never modify the state machine.

## 8. Medication Safety Rules
- Medication-selection pool: 38 medications.
- Medication retrieval: first incorrect choice triggers feedback and one final retry.
- Dose calculation: first incorrect answer triggers feedback and one final retry.
- Second-check step is mandatory before administration.
- Administration cannot unlock unless all prerequisite steps are complete.

## 9. Patient Progression
PACU-1 must complete all 12 steps before PACU-2 becomes active. PACU-2 must complete all 12 before PACU-3. After PACU-3 step 12, the final result screen opens.

## 10. UI
Top bar:
- PACU Medication Mission title.
- Score /100.
- Completed patients /3.
- Current patient and step /12.
- Progress bar.
- Timer.
- Game instructions.
- Restart.

Bottom mission bar:
- 12 numbered icons.
- Active step: yellow highlight.
- Completed step: completed/check state.
- Future step: normal/locked execution state, but clickable for instructions.

## 11. Feedback and Results
Track:
- First-attempt correct answers.
- Second-attempt correct answers.
- Incorrect medication selections.
- Incorrect dose calculations.
- Other task errors.
- Patient completion scores.
- Final score /100.

Final results show total score, three patient results, errors/retries, and areas requiring reinforcement.

## 12. Technical Architecture
Static GitHub Pages-compatible web app:
- `index.html`: application shell and scene DOM/canvas host.
- `css/game.css`: responsive UI, scene, dialogs, animations.
- `js/game.js`: main state machine and progression.
- `js/movement.js`: click-to-walk, collision, pathfinding, arrival callbacks.
- `js/tasks.js`: 12 task controllers and validation.
- `js/data.js`: patient scenarios, 38-medication pool, scoring configuration.
- `assets/`: reference-derived game artwork and icons.

No server is required for the base version. Game state is held client-side. The implementation should work by opening through a static web server and through GitHub Pages.

## 13. Acceptance Criteria
The build is acceptable only if:
- The primary nurse visibly moves as a complete character.
- Clicking a correct interaction target causes movement first and task activation only after arrival.
- The nurse never duplicates or leaves ghost images.
- The nurse cannot walk through major obstacles.
- Three visibly different patients are present.
- All three patients use the complete 12-step workflow.
- The 38-medication selection pool is supported.
- Inactive mission icons cannot skip or score steps.
- Medication selection and dose calculation enforce the retry rule.
- Total scoring resolves to exactly 100.
- The game can be deployed as a static GitHub Pages site.

