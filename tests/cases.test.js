import test from 'node:test'
import assert from 'node:assert/strict'
import { CASES } from '../src/domain/cases.js'

test('includes 12 PACU medication scenarios without real identifiers', () => {
  assert.equal(CASES.length, 12)
  assert.ok(CASES.every(item => item.patient.code.startsWith('SIM-')))
  assert.deepEqual(CASES.map(item=>item.patient.code),Array.from({length:12},(_,index)=>`SIM-${String(index+1).padStart(2,'0')}`))
  assert.ok(CASES.some(item => item.topic === '術後疼痛'))
  assert.ok(CASES.some(item => item.topic === '持續性低血壓'))
})

test('respiratory depression is not represented as an indication for midazolam', () => {
  assert.equal(CASES.some(item => item.topic === '呼吸抑制' && item.medicationId === 'midazolam'), false)
})

test('all 12 medications have a complete order and answer before selection', () => {
  assert.equal(CASES.length, 12)
  for (const scenario of CASES) {
    assert.ok(scenario.order.text)
    assert.ok(scenario.order.stock)
    assert.ok(Number.isFinite(scenario.order.expectedDraw))
    assert.ok(scenario.order.answerUnit)
    assert.ok(scenario.presentation.summary)
    assert.ok(scenario.presentation.findings.length)
    assert.ok(Number.isFinite(scenario.patient.vitals.rr))
  }
})

test('SIM-12 uses the confirmed Easydopa premix order and whole bottle answer', () => {
  const easydopa=CASES.find(item=>item.patient.code==='SIM-12')
  assert.equal(easydopa.medicationId,'easydopa')
  assert.equal(easydopa.order.text,'Easydopa 1 Bot IV infusion，幫浦設定 400 mg in 250 mL，依醫囑調整速率')
  assert.equal(easydopa.order.stock,'400 mg/250 mL/Bot')
  assert.equal(easydopa.order.expectedDraw,1)
  assert.equal(easydopa.order.answerUnit,'Bot')
  assert.match(easydopa.order.calculation,/1\.6 mg\/mL/)
})

test('pain scenarios include a patient-reported NRS score', () => {
  const fentanyl=CASES.find(item=>item.patient.code==='SIM-01')
  assert.equal(fentanyl.presentation.nrs,8)
})

test('fentanyl and midazolam orders use the confirmed values', () => {
  const fentanyl=CASES.find(item=>item.medicationId==='fentanyl')
  assert.equal(fentanyl.order.text,'Fentanyl 50 mcg IVP stat')
  assert.equal(fentanyl.order.expectedDraw,1)
  const midazolam=CASES.find(item=>item.medicationId==='midazolam')
  assert.equal(midazolam.order.text,'Midazolam 3 mg IVP stat')
  assert.equal(midazolam.order.expectedDraw,0.6)
})
