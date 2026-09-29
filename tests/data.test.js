import test from 'node:test'; import assert from 'node:assert/strict';
import {PATIENTS,MEDICATIONS,STEP_DEFINITIONS,SCORE_CONFIG} from '../js/data.js';
import {createInitialState} from '../js/game.js';
test('3 patients and 12 steps',()=>{assert.equal(PATIENTS.length,3);assert.equal(STEP_DEFINITIONS.length,12)});
test('38 medications',()=>assert.equal(MEDICATIONS.length,38));
test('100 point allocation',()=>assert.deepEqual(SCORE_CONFIG.patientTotals,[33,33,34]));
test('initial state',()=>{const s=createInitialState();assert.equal(s.patientIndex,0);assert.equal(s.stepIndex,0);assert.equal(s.score,0);assert.equal(s.completedPatients,0);assert.equal(s.phase,'IDLE')});
