# PACU Medication Mission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Pages-compatible 2D PACU medication-safety game in which one nurse visibly walks to interaction targets before completing 12 ordered tasks for each of three patients.

**Architecture:** A static HTML/CSS/JavaScript app with one authoritative player entity. `game.js` owns progression/state, `movement.js` owns navigation/collision/arrival, `tasks.js` owns task dialogs and validation, and `data.js` owns scenarios, the 38-medication pool, and scoring. DOM-based scene layers keep the illustrated PACU style while deterministic waypoint/A* navigation prevents walking through fixed obstacles.

**Tech Stack:** HTML5, CSS3, vanilla ES modules JavaScript, Vitest + jsdom for logic tests, Playwright for browser acceptance tests, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-29-pacu-2d-game-design.md`

## Global Constraints
- Static GitHub Pages-compatible; no server required.
- Visual baseline is the user-provided bright polished blue/white PACU 2D reference.
- Exactly one movable primary nurse entity; complete body, legs, and white shoes.
- Three visibly different patients; 12 ordered steps each; 36 completions total.
- Interaction tasks may open only after `ARRIVED`.
- Major fixed scene objects are collision obstacles.
- Medication pool contains exactly 38 entries.
- Medication retrieval and dose calculation allow one retry after the first error.
- Patient score allocation is exactly 33 + 33 + 34 = 100.
- Future mission icons may show instructions but cannot execute, score, or skip progression.

## Review Focus
- Rapid repeated target clicks while walking must cancel/replace navigation safely without opening stale tasks.
- Resizing the browser must preserve valid interaction coordinates and prevent the nurse from being stranded inside obstacles.
- Restart during an open task or movement must clear timers/callbacks and restore one player entity at step 1.
- Double-clicking task answers must not award duplicate points or advance multiple steps.
- Exhausting the second medication/dose attempt must record the error deterministically and still follow the configured training flow without bypassing prerequisites.

---

### Task 1: App shell, scene, and deterministic game data

**Files:**
- Create: `index.html`
- Create: `css/game.css`
- Create: `js/data.js`
- Create: `js/game.js`
- Create: `tests/data.test.js`
- Create: `package.json`

**Interfaces:**
- Produces: `PATIENTS`, `MEDICATIONS`, `STEP_DEFINITIONS`, `SCORE_CONFIG`; `createInitialState()` and `renderGame(state)`.

- [ ] **Step 1: Write failing data/state tests** asserting 3 patients, 12 steps, exactly 38 medications, score allocation 33/33/34, and initial state `{patientIndex:0, stepIndex:0, score:0, completedPatients:0}`.
- [ ] **Step 2: Run** `npm test -- tests/data.test.js` and verify failure because modules do not exist.
- [ ] **Step 3: Implement the app shell and data contracts** in the files above; reproduce the reference layout zones, top HUD, three PACU bays, left medication zone, right physician station, one primary nurse node, and 12-step bottom bar.
- [ ] **Step 4: Run** `npm test -- tests/data.test.js` and verify all Task 1 tests pass; open with a static server and verify the complete scene fits a desktop viewport without horizontal overflow.
- [ ] **Step 5: Commit** `feat: scaffold PACU medication mission`.

### Task 2: Movement, collision, pathfinding, and arrival gating

**Files:**
- Create: `js/movement.js`
- Create: `tests/movement.test.js`
- Modify: `js/game.js`
- Modify: `css/game.css`

**Interfaces:**
- Consumes: game state and scene DOM from Task 1.
- Produces: `createMovementController({player, scene, obstacles, onStateChange})`, `walkTo(point, arrivalCallback)`, `walkToTarget(targetId, arrivalCallback)`, `cancelMovement()`, `recalculateSceneGeometry()`.

- [ ] **Step 1: Write failing movement tests** for obstacle avoidance, a single player node, no arrival callback before destination, replacement of stale callbacks after rapid retargeting, and geometry recalculation after resize.
- [ ] **Step 2: Run** `npm test -- tests/movement.test.js` and verify failure.
- [ ] **Step 3: Implement waypoint-grid/A* navigation and CSS walking animation**; keep one authoritative player element and route around beds, cabinets, desks, people, curtains, and walls.
- [ ] **Step 4: Run movement tests** and manually verify floor click-to-walk plus smart object auto-positioning.
- [ ] **Step 5: Commit** `feat: add PACU nurse navigation and collision`.

### Task 3: Ordered 12-step state machine and mission bar

**Files:**
- Modify: `js/game.js`
- Create: `tests/state-machine.test.js`
- Modify: `css/game.css`

**Interfaces:**
- Consumes: `walkToTarget()` from Task 2 and `STEP_DEFINITIONS` from Task 1.
- Produces: `selectInteraction(targetId)`, `openStepHelp(stepIndex)`, `completeActiveStep(result)`, `advanceStep()`, `restartGame()`.

- [ ] **Step 1: Write failing tests** for `IDLE -> TARGET_SELECTED -> WALKING -> ARRIVED -> TASK_OPEN -> VALIDATION -> STEP_COMPLETE -> NEXT_STEP`, future-icon help-only behavior, duplicate-completion protection, and restart clearing movement/task state.
- [ ] **Step 2: Run** `npm test -- tests/state-machine.test.js` and verify failure.
- [ ] **Step 3: Implement progression and mission-bar rendering** so only the active step is yellow and only active-step interactions mutate state.
- [ ] **Step 4: Run tests** and verify no task can open before `ARRIVED`.
- [ ] **Step 5: Commit** `feat: enforce ordered PACU mission state machine`.

### Task 4: Patient assessment, ISBAR, order verification, hand hygiene

**Files:**
- Create: `js/tasks.js`
- Create: `tests/tasks-clinical.test.js`
- Modify: `js/data.js`
- Modify: `js/game.js`
- Modify: `css/game.css`

**Interfaces:**
- Consumes: active patient/step state and `completeActiveStep(result)`.
- Produces: `openTask(stepId, context)`, task controllers for steps 1-4, and proximity-bound complaint UI.

- [ ] **Step 1: Write failing tests** for patient-specific conversational complaint, complaint disappearing outside assessment range, ISBAR validation, five-right order verification, and hand-hygiene completion.
- [ ] **Step 2: Run** `npm test -- tests/tasks-clinical.test.js` and verify failure.
- [ ] **Step 3: Implement steps 1-4 dialogs/interactions** with three distinct patient scenarios and proximity cleanup.
- [ ] **Step 4: Run tests** and manually walk from PACU-1 to physician station, order check, and sink; verify every dialog opens only after arrival.
- [ ] **Step 5: Commit** `feat: add assessment and pre-medication tasks`.

### Task 5: Medication retrieval, dose calculation, preparation, and double check

**Files:**
- Modify: `js/tasks.js`
- Modify: `js/data.js`
- Create: `tests/tasks-medication.test.js`
- Modify: `css/game.css`

**Interfaces:**
- Consumes: 38-medication pool and patient orders.
- Produces: step 5-8 controllers; `validateMedicationChoice()`, `validateDoseAnswer()`, retry tracking, `validateDoubleCheck()`.

- [ ] **Step 1: Write failing tests** proving the medication chooser exposes all 38 entries, wrong retrieval/dose answers get exactly one retry, double-click submission scores once, exhausted retries are recorded, and step 8 is mandatory.
- [ ] **Step 2: Run** `npm test -- tests/tasks-medication.test.js` and verify failure.
- [ ] **Step 3: Implement steps 5-8** including medication cards, calculation input, preparation interaction, and second-nurse verification.
- [ ] **Step 4: Run tests** and manually verify the nurse walks to the medication zone/second-check nurse before each relevant task.
- [ ] **Step 5: Commit** `feat: add medication preparation safety workflow`.

### Task 6: Administration, monitoring, documentation, patient progression, scoring

**Files:**
- Modify: `js/tasks.js`
- Modify: `js/game.js`
- Modify: `js/data.js`
- Create: `tests/progression-scoring.test.js`

**Interfaces:**
- Consumes: prerequisite completion and patient score allocation.
- Produces: steps 9-12; `calculatePatientScore()`, `finishPatient()`, `finishGame()`.

- [ ] **Step 1: Write failing tests** for administration locked before double-check, right-side bedside positioning, post-med monitoring, documentation, PACU-1→2→3 locking, exact 100-point maximum, and error/retry history.
- [ ] **Step 2: Run** `npm test -- tests/progression-scoring.test.js` and verify failure.
- [ ] **Step 3: Implement steps 9-12, scoring, patient unlocking, and final results** with three patient result summaries and reinforcement areas.
- [ ] **Step 4: Run tests** and verify a perfect three-patient run ends at exactly `100/100` and `3/3`.
- [ ] **Step 5: Commit** `feat: complete patient progression and scoring`.

### Task 7: Browser acceptance, visual polish, and GitHub Pages package

**Files:**
- Create: `tests/e2e/game.spec.js`
- Create: `playwright.config.js`
- Create: `.github/workflows/pages.yml`
- Modify: `css/game.css`
- Modify: `index.html`
- Create: `README.md`

**Interfaces:**
- Consumes: completed app from Tasks 1-6.
- Produces: deployable static site and end-to-end acceptance coverage.

- [ ] **Step 1: Write browser acceptance tests** covering visible complete nurse, one nurse node after repeated movement, movement-before-dialog, obstacle avoidance, inactive-icon no-skip, restart mid-walk/mid-dialog, resize recovery, and completion of all three patients.
- [ ] **Step 2: Run** `npx playwright test` and verify failures identify remaining integration gaps.
- [ ] **Step 3: Fix integration gaps and polish responsive visuals** while preserving the supplied reference style and desktop-first layout.
- [ ] **Step 4: Run** `npm test && npx playwright test`; expected all PASS. Serve the site locally and verify `index.html` works with relative asset paths suitable for a GitHub Pages project subpath.
- [ ] **Step 5: Commit** `test: verify PACU game end to end and prepare Pages deployment`.

## Self-review result
- Spec coverage: all 13 design sections map to Tasks 1-7; no uncovered requirement found.
- Interface consistency: movement controller feeds the state machine; task controllers complete only through `completeActiveStep`; scoring is centralized in game progression.
- Review Focus coverage: rapid retargeting and resize are Task 2 tests; restart is Task 3/E2E; duplicate submission is Task 5; exhausted retries are Task 5/6.
- Scope: one integrated browser game; tasks are sequential because later tasks depend on the state/movement interfaces, so one plan is appropriate.
