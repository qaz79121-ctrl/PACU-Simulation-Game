# PACU Simulator 3D UE5 Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Unreal Engine 5 Windows project foundation for a third-person, three-bed PACU simulation with a complete PACU-1 Morphine vertical slice and reusable clinical-simulation architecture.

**Architecture:** A UE5 C++ foundation owns interaction, patient state, scenario events, scoring, and clinical data; Blueprint/UMG content plugs into those interfaces for realistic presentation. The first milestone remains source-level because this environment cannot run Unreal Editor or create binary `.uasset`/`.umap` files.

**Tech Stack:** Unreal Engine 5, C++17/UE C++, Enhanced Input, UMG, Automation Tests, Data Assets/Data Tables, Windows PC.

**Spec:** `docs/superpowers/specs/2026-10-04-pacu-simulator-3d-ue5-design.md`

## Global Constraints

- Do not replace or deploy the existing 2D GitHub Pages game.
- Target Windows PC and Unreal Engine 5.
- Current visual reference is third-person behind-the-nurse view, superseding the earlier pure-first-person choice.
- Three-bed open PACU: PACU-1, PACU-2, PACU-3.
- Teaching and Assessment modes share the same clinical systems.
- Clinical medication/emergency values are editable data and require clinical validation before educational use.
- Source-only milestone must not claim to contain Unreal binary assets or a packaged Windows executable.

## Review Focus

- Missing/invalid patient or medication IDs must fail safely without crashing.
- Vital-sign updates must stay inside configured simulation bounds.
- Repeated interaction must not double-award score for a one-time clinical action.
- Assessment Mode must not expose Teaching-only procedural hints.
- Scenario/event timestamps must remain ordered so debriefing reconstructs the run correctly.

---

### Task 1: UE5 project and module scaffold

**Files:**
- Create: `PACUSimulator3D/PACUSimulator3D.uproject`
- Create: `PACUSimulator3D/Config/DefaultGame.ini`
- Create: `PACUSimulator3D/Config/DefaultEngine.ini`
- Create: `PACUSimulator3D/Source/PACUSimulator3D.Target.cs`
- Create: `PACUSimulator3D/Source/PACUSimulator3DEditor.Target.cs`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/PACUSimulator3D.Build.cs`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/PACUSimulator3D.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/PACUSimulator3D.cpp`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUProjectSmokeTests.cpp`

**Interfaces:**
- Produces: UE module `PACUSimulator3D` and automation-test namespace.

- [ ] Write an automation smoke test asserting the module is loaded.
- [ ] Verify the test is initially impossible/failing before module scaffold exists.
- [ ] Add the minimal UE5 project/module/config scaffold.
- [ ] Run Unreal Automation Tool test when UE5 is available; in this environment perform static source/config verification and record UE runtime verification as pending.
- [ ] Commit.

### Task 2: Clinical data types and mode model

**Files:**
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Clinical/PACUClinicalTypes.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Clinical/PACUClinicalTypes.cpp`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUClinicalTypesTests.cpp`

**Interfaces:**
- Produces: `EPACUSimulationMode`, `FPACUVitalSigns`, `FPACUPatientState`, `FPACUClinicalEvent`.

- [ ] Write tests for Teaching/Assessment enum behavior, default vitals, vital clamping, and ordered event timestamps.
- [ ] Verify RED.
- [ ] Implement minimal data types and clamping helpers.
- [ ] Verify GREEN when UE test runner is available; statically inspect now.
- [ ] Commit.

### Task 3: Patient physiology component

**Files:**
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Patient/PACUPatient.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Patient/PACUPatient.cpp`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Patient/PACUPatientPhysiologyComponent.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Patient/PACUPatientPhysiologyComponent.cpp`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUPatientPhysiologyTests.cpp`

**Interfaces:**
- Consumes: `FPACUVitalSigns`, `FPACUPatientState`.
- Produces: `SetBaselineState`, `ApplyDelta`, `GetCurrentState`, `TickSimulation`.

- [ ] Test baseline initialization, bounded deltas, and respiratory-deterioration progression.
- [ ] Verify RED.
- [ ] Implement physiology component and patient facade.
- [ ] Verify GREEN/static consistency.
- [ ] Commit.

### Task 4: Third-person player and generic interaction framework

**Files:**
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Player/PACUPlayerCharacter.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Player/PACUPlayerCharacter.cpp`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Interaction/PACUInteractable.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Interaction/PACUInteractionComponent.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Interaction/PACUInteractionComponent.cpp`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUInteractionTests.cpp`

**Interfaces:**
- Produces: third-person character hooks for Move/Look/Interact and `IPACUInteractable` contract.

- [ ] Test that invalid/null focus is safe and a valid interactable receives exactly one interaction request.
- [ ] Verify RED.
- [ ] Implement spring-arm third-person character and trace-based interaction component using Enhanced Input hooks.
- [ ] Verify GREEN/static consistency.
- [ ] Commit.

### Task 5: Event log and scoring foundation

**Files:**
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Assessment/PACUEventLogSubsystem.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Assessment/PACUEventLogSubsystem.cpp`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Assessment/PACUScoringSubsystem.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Assessment/PACUScoringSubsystem.cpp`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUAssessmentTests.cpp`

**Interfaces:**
- Consumes: `FPACUClinicalEvent`.
- Produces: `RecordEvent`, `GetEvents`, `AwardOnce`, `ApplyPenalty`, `GetTotalScore`.

- [ ] Test chronological logging, duplicate one-time awards, penalties, and score clamping 0–100.
- [ ] Verify RED.
- [ ] Implement event log and scoring subsystems.
- [ ] Verify GREEN/static consistency.
- [ ] Commit.

### Task 6: Medication and PACU-1 scenario data model

**Files:**
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Medication/PACUMedicationData.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Medication/PACUMedicationData.cpp`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Scenario/PACUScenarioData.h`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUMedicationScenarioTests.cpp`

**Interfaces:**
- Produces: editable medication definition, dose-calculation helper, PACU-1 objective/action IDs, safe lookup semantics.

- [ ] Test missing medication lookup, Morphine fixture calculation, and scenario action ordering.
- [ ] Verify RED.
- [ ] Implement data structures/helpers with fixture values explicitly marked simulation-only pending clinical validation.
- [ ] Verify GREEN/static consistency.
- [ ] Commit.

### Task 7: Scenario Director and Teaching/Assessment behavior

**Files:**
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Scenario/PACUScenarioDirector.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Scenario/PACUScenarioDirector.cpp`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUScenarioDirectorTests.cpp`

**Interfaces:**
- Consumes: simulation mode, patient state, event/scoring subsystems.
- Produces: `StartScenario`, `SubmitClinicalAction`, `GetCurrentObjective`, `ShouldShowProceduralHint`.

- [ ] Test PACU-1 action progression, wrong-order recording, Teaching hint visibility, Assessment hint suppression, and no duplicate completion scoring.
- [ ] Verify RED.
- [ ] Implement scenario state machine.
- [ ] Verify GREEN/static consistency.
- [ ] Commit.

### Task 8: Respiratory deterioration complication module

**Files:**
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Patient/PACUComplicationComponent.h`
- Create: `PACUSimulator3D/Source/PACUSimulator3D/Patient/PACUComplicationComponent.cpp`
- Test: `PACUSimulator3D/Source/PACUSimulator3D/Tests/PACUComplicationTests.cpp`

**Interfaces:**
- Consumes: physiology state and clinical actions.
- Produces: staged respiratory-depression/hypoxemia simulation state with recover/worsen transitions.

- [ ] Test trigger, progression, bounded SpO2/RR changes, appropriate-response recovery, and delayed-response worsening.
- [ ] Verify RED.
- [ ] Implement reusable staged complication component with PACU-1 respiratory fixture.
- [ ] Verify GREEN/static consistency.
- [ ] Commit.

### Task 9: Blueprint/UMG integration contracts and three-bed greybox guide

**Files:**
- Create: `PACUSimulator3D/Content/README_Blueprint_Setup.md`
- Create: `PACUSimulator3D/Content/README_PACU_Greybox.md`
- Create: `PACUSimulator3D/Content/README_UI_Setup.md`
- Create: `PACUSimulator3D/README.md`

**Interfaces:**
- Consumes: all C++ gameplay contracts.
- Produces: exact Editor steps for BP_PACUPlayer, BP_Patient, BP_Monitor, BP_Sink, BP_MedicationCabinet, BP_ComputerCart, BP_ScenarioDirector, WBP_HUD, WBP_PatientDialogue, WBP_Debriefing, and three-bed map layout.

- [ ] Write a documentation validation checklist before the guides.
- [ ] Verify required assets/contracts are currently undocumented.
- [ ] Document exact Blueprint parent classes, required component bindings, three-bed placement, UI bindings, and input mapping.
- [ ] Check every referenced C++ symbol exists and no guide claims binary assets are already generated.
- [ ] Commit.

### Task 10: Source-level verification and handoff

**Files:**
- Create: `PACUSimulator3D/VERIFY.md`

**Interfaces:**
- Consumes: complete source milestone.
- Produces: reproducible Unreal Editor build/test checklist and explicit environment limitations.

- [ ] Check project JSON, Build.cs dependencies, include paths, UCLASS/USTRUCT/UENUM declarations, and cross-file symbol names.
- [ ] Search for accidental HTML/GitHub Pages coupling and assert none exists inside `PACUSimulator3D`.
- [ ] Record Unreal Editor commands needed to generate project files, compile Development Editor, run Automation Tests, create Blueprint assets, and package Win64.
- [ ] Record runtime verification as pending until executed on a machine with UE5 installed.
- [ ] Commit.
