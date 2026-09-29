
import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, MEDICATIONS } from '../js/data.js';
import { createGameState, completeStep, submitMedication, submitDose, canAdminister } from '../js/game-state.js';

test('three scenarios have 12 steps and score maximum totals 100', () => {
  assert.equal(SCENARIOS.length, 3);
  assert.deepEqual(SCENARIOS.map(s=>s.maxScore), [33,33,34]);
  assert.equal(SCENARIOS.reduce((a,s)=>a+s.maxScore,0),100);
});
test('medication library exposes 38 choices', ()=> assert.equal(MEDICATIONS.length,38));
test('approved doses are 0.3, 2 and 3 mL', ()=>{
  assert.deepEqual(SCENARIOS.map(s=>s.correctVolume), [0.3,2,3]);
});
test('step progression cannot double score', ()=>{
  const s=createGameState();
  completeStep(s,1,true); const score=s.score;
  completeStep(s,1,true);
  assert.equal(s.score,score);
  assert.equal(s.step,2);
});
test('wrong medication gets only two attempts', ()=>{
  const s=createGameState(); s.step=5;
  assert.equal(submitMedication(s,'wrong').status,'retry');
  assert.equal(submitMedication(s,'wrong').status,'revealed');
  assert.equal(s.step,6);
});
test('wrong dose gets only two attempts', ()=>{
  const s=createGameState(); s.step=6;
  assert.equal(submitDose(s,9).status,'retry');
  assert.equal(submitDose(s,9).status,'revealed');
  assert.equal(s.step,7);
});
test('administration is blocked before double check', ()=>{
  const s=createGameState(); s.step=9;
  assert.equal(canAdminister(s),false);
  s.doubleChecked=true;
  assert.equal(canAdminister(s),true);
});
