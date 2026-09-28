import test from 'node:test'
import assert from 'node:assert/strict'
import { createSession, reduceSession } from '../src/domain/engine.js'

test('assessment feedback is delayed until completion', () => {
  let session = createSession('assessment')
  session = reduceSession(session, { type: 'select-medication', medicationId: 'fentanyl', correct: false })
  assert.equal(session.feedback, null)
  assert.equal(session.events.length, 1)
})

test('practice feedback appears immediately', () => {
  let session = createSession('practice')
  session = reduceSession(session, { type: 'select-medication', medicationId: 'fentanyl', correct: false })
  assert.match(session.feedback, /再確認/)
})
