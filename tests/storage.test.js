import test from 'node:test'
import assert from 'node:assert/strict'
import { createRecordStore, recordsToCsv } from '../src/storage/records.js'

test('corrupt stored JSON returns empty records and warning', () => {
  const storage = { getItem: () => '{broken', setItem() {}, removeItem() {} }
  const result = createRecordStore(storage).load()
  assert.deepEqual(result.records, [])
  assert.match(result.warning, /無法讀取/)
})

test('CSV export escapes commas and quotes', () => {
  const csv = recordsToCsv([{ learnerId: 'A, "B"', completedAt: '2026-09-22', total: 90, status: 'passed' }])
  assert.match(csv, /"A, ""B"""/)
})
