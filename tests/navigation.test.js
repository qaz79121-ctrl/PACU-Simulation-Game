import test from 'node:test'
import assert from 'node:assert/strict'
import { ZONE_TARGETS, createNavigator, moveToward, targetForTask } from '../src/game/navigation.js'
import { createGame, updatePlayerPosition } from '../src/game/game.js'

test('every clinical zone has a reachable map target', () => {
  for (const id of ['nurse-station','patient-bay','hand-hygiene','medication-cart','high-alert','crash-cart','preparation','documentation']) {
    assert.ok(ZONE_TARGETS[id])
    assert.ok(ZONE_TARGETS[id].x >= 0 && ZONE_TARGETS[id].x <= 100)
    assert.ok(ZONE_TARGETS[id].y >= 0 && ZONE_TARGETS[id].y <= 100)
  }
})

test('hand hygiene station is located in the upper-left area', () => {
  assert.ok(ZONE_TARGETS['hand-hygiene'].x < 30)
  assert.ok(ZONE_TARGETS['hand-hygiene'].y < 30)
})

test('nurse station uses separate targets for doctor and verification nurse', () => {
  assert.deepEqual(targetForTask('nurse-station','notify'),{x:61,y:57})
  assert.deepEqual(targetForTask('nurse-station','check'),{x:39,y:57})
  assert.deepEqual(targetForTask('nurse-station','verify'),ZONE_TARGETS['nurse-station'])
})

test('clicking a zone starts walking and interaction waits until arrival', () => {
  const nav=createNavigator({x:50,y:82})
  const walking=nav.goTo('patient-bay')
  assert.equal(walking.moving,true)
  assert.equal(walking.pendingZone,'patient-bay')
  assert.equal(walking.arrivedZone,null)
})

test('movement reaches target without overshooting and reports direction', () => {
  const result=moveToward({x:10,y:10},{x:12,y:10},4)
  assert.deepEqual(result.position,{x:12,y:10})
  assert.equal(result.direction,'right')
  assert.equal(result.arrived,true)
})

test('player position persists in game state after arriving at each station', () => {
  const game=createGame('practice','SIM-001')
  const moved=updatePlayerPosition(game,{x:49,y:60},'nurse-station')
  assert.deepEqual(moved.playerPosition,{x:49,y:60})
  assert.equal(moved.playerZone,'nurse-station')
})
