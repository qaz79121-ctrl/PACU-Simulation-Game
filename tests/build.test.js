import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import fs from 'node:fs'

test('build output includes index, app, styles and favicon', () => {
  for (const path of ['dist/index.html','dist/app.js','dist/styles.css','dist/favicon.svg']) assert.equal(fs.existsSync(path),true,path)
})

test('clinical team asset uses a valid WebP container', () => {
  const asset=readFileSync(new URL('../src/assets/clinical-team-v2.webp',import.meta.url))
  assert.equal(asset.subarray(0,4).toString(),'RIFF')
  assert.equal(asset.subarray(8,12).toString(),'WEBP')
  assert.ok(asset.length>50000)
})

test('patient illustration uses a valid WebP container', () => {
  const asset=readFileSync(new URL('../src/assets/patient-illustration-v1.webp',import.meta.url))
  assert.equal(asset.subarray(0,4).toString(),'RIFF')
  assert.equal(asset.subarray(8,12).toString(),'WEBP')
  assert.ok(asset.length>20000)
})

test('composited PACU room with patient uses a valid WebP container', () => {
  const asset=readFileSync(new URL('../src/assets/pacu-room-patient-v1.webp',import.meta.url))
  assert.equal(asset.subarray(0,4).toString(),'RIFF')
  assert.equal(asset.subarray(8,12).toString(),'WEBP')
  assert.ok(asset.length>100000)
})

test('PACU room with enlarged wall monitor uses a valid PNG container', () => {
  const asset=readFileSync(new URL('../src/assets/pacu-room-wall-monitor-v5.png',import.meta.url))
  assert.equal(asset.subarray(0,8).toString('hex'),'89504e470d0a1a0a')
  assert.ok(asset.length>100000)
})

test('all 12 medication illustrations use matching portrait PNG canvases', () => {
  const ids=['morphine','fentanyl','labetalol','metoclopramide','atropine','nicardipine','ephedrine','midazolam','norepinephrine','meperidine','dopamine','easydopa']
  for (const id of ids) {
    const asset=readFileSync(new URL(`../src/assets/drug-${id}.png`,import.meta.url))
    assert.equal(asset.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id)
    assert.equal(asset.readUInt32BE(16),360,`${id} width`)
    assert.equal(asset.readUInt32BE(20),520,`${id} height`)
    assert.ok(asset.length>20000,id)
  }
})
