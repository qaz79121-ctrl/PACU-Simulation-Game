import test from 'node:test'
import assert from 'node:assert/strict'
import { MEDICATIONS } from '../src/domain/medications.js'
import { calculateVolume, parseClinicalNumber } from '../src/domain/dosage.js'
import { scoreSession } from '../src/domain/scoring.js'

test('contains 12 unique PACU medication entries', () => {
  assert.equal(MEDICATIONS.length, 12)
  assert.equal(new Set(MEDICATIONS.map(item => item.id)).size, 12)
  const dopamine = MEDICATIONS.find(item => item.id === 'dopamine')
  assert.equal(dopamine.amountMg, 200)
  assert.equal(dopamine.volumeMl, 5)
})

test('Easydopa uses the confirmed premixed bottle specification', () => {
  const easydopa=MEDICATIONS.find(item=>item.id==='easydopa')
  assert.equal(easydopa.amountMg,400)
  assert.equal(easydopa.volumeMl,250)
  assert.equal(easydopa.container,'Bot')
  assert.equal(easydopa.label,'Easydopa 400 mg/250 mL/Bot')
})

test('Nicardipine is labeled as a vial', () => {
  const nicardipine=MEDICATIONS.find(item=>item.id==='nicardipine')
  assert.equal(nicardipine.container,'Vial')
  assert.equal(nicardipine.label,'Nicardipine 10 mg/10 mL/Vial')
})

test('norepinephrine replaces epinephrine in the medication set', () => {
  assert.ok(MEDICATIONS.some(item => item.id === 'norepinephrine'))
  assert.equal(MEDICATIONS.some(item => item.id === 'epinephrine'), false)
})

test('calculates ordered volume from stock concentration', () => {
  assert.equal(calculateVolume(50, 100, 2), 1)
  assert.equal(calculateVolume(5, 10, 1), 0.5)
})

test('rejects empty, non-number, infinite, zero and negative input', () => {
  for (const value of ['', 'abc', 'Infinity', '0', '-1']) {
    assert.equal(parseClinicalNumber(value).ok, false)
  }
})

test('critical error forces retraining despite a high score', () => {
  const result = scoreSession({
    patientId: 10, medication: 15, dosage: 20, preparation: 15,
    doubleCheck: 15, administration: 10, monitoring: 10, documentation: 5,
  }, ['wrong-patient'])
  assert.equal(result.total, 100)
  assert.equal(result.status, 'retraining-required')
})
