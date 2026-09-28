import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { homeTemplate, setupTemplate, sceneTemplate, interactionTemplate, resultsTemplate } from '../src/ui/templates.js'
import { createGame, performStep, STEPS } from '../src/game/game.js'

test('home offers only practice and assessment modes with education disclaimer', () => {
  const html=homeTemplate()
  for (const label of ['練習模式','正式評核']) assert.match(html,new RegExp(label))
  assert.doesNotMatch(html,/展示模式/)
  assert.match(html,/本模擬內容僅供教育訓練/)
})

test('setup lists only SIM-01 through SIM-12 without topics or orders', () => {
  const html=setupTemplate('practice')
  assert.match(html,/<select/)
  for (let index=1;index<=12;index++) assert.match(html,new RegExp(`>SIM-${String(index).padStart(2,'0')}<`))
  assert.doesNotMatch(html,/術後疼痛|心搏過緩|Fentanyl 50 mcg IVP stat/)
})

test('workflow follows assessment, physician notification, verification and safe medication sequence', () => {
  assert.deepEqual(STEPS.map(step=>step.title),[
    '評估病人狀態','告知醫師','核對交班與醫囑','給藥前洗手','藥物辨識','藥物配置',
    '執行雙人核對','安全給藥','給藥後監測','給藥後洗手','完成電子紀錄'
  ])
})

test('both hand hygiene tasks are completed at the preparation station', () => {
  const handHygieneSteps=STEPS.filter(step=>step.correct==='wash-before'||step.correct==='wash-after')
  assert.deepEqual(handHygieneSteps.map(step=>step.zone),['preparation','preparation'])
})

test('scene exposes all clinical zones including the hand hygiene station', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  for (const zone of ['護理站','病床區','洗手台','常備藥車','高警訊藥櫃','急救車','配置工作台','雙人核對','電子紀錄']) assert.match(html,new RegExp(zone))
})

test('scene uses the realistic PACU background, walkable nurse and task beacon', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  assert.match(html,/pacu-room-wall-monitor-v5\.png/)
  assert.match(html,/nurse-sprite\.png/)
  assert.match(html,/task-beacon/)
  assert.match(html,/點擊設備，護理師會從目前位置走到下一站/)
})

test('doctor is composited into the nurse-station background instead of floating', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  assert.match(html,/pacu-room-wall-monitor-v5\.png/)
  assert.doesNotMatch(html,/doctor-avatar/)
})

test('verification nurse is composited into the nurse-station background instead of floating', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  assert.match(html,/pacu-room-wall-monitor-v5\.png/)
  assert.doesNotMatch(html,/review-nurse-avatar/)
})

test('scene removes floating staff layers after compositing both upper bodies into the station', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  assert.doesNotMatch(html,/staff-avatar|standing-left|standing-right|computer-screen/)
})

test('scene integrates all four vital signs into the wall monitor', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
  assert.equal((html.match(/wall-monitor-data/g)||[]).length,1)
  assert.match(html,/wall-monitor-data[^>]*>.*vital-hr.*HR.*vital-bp.*BP.*vital-spo2.*SpO₂.*vital-rr.*RR/s)
  assert.doesNotMatch(html,/monitor-overlay|monitor-large|monitor-left|monitor-right/)
  assert.match(css,/\.wall-monitor-data\{left:53\.25%;top:4\.1%;width:4\.25%;height:5\.65%/)
})

test('wall monitor uses a clipped two-by-two layout with prominent nowrap values', () => {
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
  assert.match(css,/\.wall-monitor-data\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)[^}]*overflow:hidden/)
  assert.match(css,/\.wall-monitor-data span\{[^}]*min-width:0[^}]*overflow:hidden/)
  assert.match(css,/\.wall-monitor-data b\{[^}]*white-space:nowrap[^}]*overflow:hidden[^}]*text-overflow:clip/)
  assert.match(css,/\.vital-hr b\{color:#65ff9a\}.*\.vital-bp b\{color:#ffd85a\}.*\.vital-spo2 b\{color:#64d8ff\}.*\.vital-rr b\{color:#fff\}/s)
})

test('walking nurse is enlarged by about twenty percent', () => {
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
  assert.match(css,/\.nurse-avatar\{[^}]*width:112px;height:148px/)
})

test('patient is composited into the central bed without a floating overlay', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  assert.match(html,/pacu-room-wall-monitor-v5\.png/)
  assert.doesNotMatch(html,/patient-avatar|patient-head|patient-blanket/)
})

test('medication cart shows a labeled medication image for every medication', () => {
  let game=createGame('practice','SIM-01')
  const prior=[['patient-bay','assess'],['nurse-station','notify'],['nurse-station','verify'],['preparation','wash-before']]
  for(const [zone,value] of prior) game=performStep(game,{zone,value})
  const html=interactionTemplate('medication-cart',game)
  assert.equal((html.match(/class="drug-image medication-photo/g)||[]).length,12)
  for(const id of ['morphine','fentanyl','labetalol','metoclopramide','atropine','nicardipine','ephedrine','midazolam','norepinephrine','meperidine','dopamine','easydopa']) assert.match(html,new RegExp(`drug-${id}\\.png`))
})

test('medication cards use the supplied front-and-back bottle artwork', () => {
  let game=createGame('practice','SIM-01')
  const prior=[['patient-bay','assess'],['nurse-station','notify'],['nurse-station','verify'],['preparation','wash-before']]
  for(const [zone,value] of prior) game=performStep(game,{zone,value})
  const html=interactionTemplate('medication-cart',game)
  assert.match(html,/<img class="drug-image medication-photo" src="\.\/assets\/drug-fentanyl\.png" alt="Fentanyl 藥物正反面">/)
  assert.match(html,/<img class="drug-image medication-photo" src="\.\/assets\/drug-easydopa\.png" alt="Easydopa 藥物正反面">/)
})

test('medication artwork uses one large consistent portrait display frame', () => {
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
  assert.match(css,/\.drug-image\.medication-photo\{[^}]*width:180px[^}]*height:260px[^}]*object-fit:contain[^}]*object-position:center/)
})

test('medication cabinet uses a spacious responsive four-column modal', () => {
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
  assert.match(css,/dialog:has\(\.modal-card\.wide\)\{[^}]*width:min\(1180px,calc\(100% - 32px\)\)/)
  assert.match(css,/\.drug-grid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)[^}]*gap:16px/)
  assert.match(css,/@media\(max-width:900px\)\{[^}]*\.drug-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/)
})

test('double check task is completed at the nurse station', () => {
  const step=STEPS.find(item=>item.title==='執行雙人核對')
  assert.equal(step.zone,'nurse-station')
})

test('scene hides patient details and the top order window before handoff verification', () => {
  const html=sceneTemplate(createGame('practice','SIM-01'))
  assert.doesNotMatch(html,/patient-card|目前醫囑|order-banner/)
})

test('patient details appear after assessment, physician notification and order verification', () => {
  let game=createGame('practice','SIM-01')
  game=performStep(game,{zone:'patient-bay',value:'assess'})
  game=performStep(game,{zone:'nurse-station',value:'notify'})
  game=performStep(game,{zone:'nurse-station',value:'verify'})
  const html=sceneTemplate(game)
  for (const value of ['patient-card','SIM-01','術後疼痛','54 歲','60 kg','NKDA','Fentanyl 50 mcg IVP stat']) assert.match(html,new RegExp(value))
  assert.doesNotMatch(html,/order-banner|目前醫囑/)
})

test('initial patient assessment shows condition and NRS without order details', () => {
  const game=createGame('practice','SIM-01')
  const html=interactionTemplate('patient-bay',game)
  for (const label of ['HR','BP','SpO₂','RR']) assert.match(html,new RegExp(label))
  assert.match(html,/NRS[^<]*8/)
  assert.doesNotMatch(html,/Fentanyl 50 mcg IVP stat|100 mcg\/2 mL\/Amp|clinical-order/)
})

test('post-medication monitoring shows HR SpO2 RR and BP without order details', () => {
  let game=createGame('practice','SIM-01')
  const actions=[
    ['patient-bay','assess'],['nurse-station','notify'],['nurse-station','verify'],['preparation','wash-before'],
    ['medication-cart','fentanyl'],['preparation','calculate'],['nurse-station','check'],['patient-bay','administer'],
    ['patient-bay','monitor'],['preparation','wash-after']
  ]
  for(const [zone,value] of actions) game=performStep(game,{zone,value})
  assert.equal(STEPS[game.currentStep].title,'完成電子紀錄')
})

test('game advances only after a correct action in practice mode', () => {
  const game=createGame('practice','SIM-01')
  const wrong=performStep(game,{zone:'patient-bay',value:'skip'})
  assert.equal(wrong.currentStep,0)
  assert.match(wrong.feedback,/再確認/)
  const correct=performStep(game,{zone:'patient-bay',value:'assess'})
  assert.equal(correct.currentStep,1)
})

test('results disclose critical errors and retraining status', () => {
  const html=resultsTemplate({total:96,status:'retraining-required',stars:1,criticalErrors:['missed-double-check'],dimensions:{}})
  assert.match(html,/需重新訓練/)
  assert.match(html,/未完成高警訊藥物雙人覆核/)
})
