import { createGame, performStep, finishGame, updatePlayerPosition, STEPS } from './game/game.js'
import { homeTemplate, setupTemplate, sceneTemplate, interactionTemplate, resultsTemplate, recordsTemplate } from './ui/templates-v13.js'
import { createRecordStore, recordsToCsv } from './storage/records.js'
import { targetForTask, moveToward } from './game/navigation.js'
import { checkNumericAnswer } from './domain/dosage.js'

const app = document.querySelector('#app')
const store = createRecordStore()
let game = null
let selectedZone = null
let walkAnimationId = null
let feedbackTimer = null

/* ── Rendering ── */
function stopWalking () {
  if (walkAnimationId) { cancelAnimationFrame(walkAnimationId); walkAnimationId = null }
  document.querySelectorAll('#action-dialog,.patient-complaint').forEach(el => el.remove())
}

function render (html) {
  stopWalking()
  if (feedbackTimer) { clearTimeout(feedbackTimer); feedbackTimer = null }
  app.innerHTML = html
  bind()
  // Auto-dismiss feedback after 4 seconds
  const fb = app.querySelector('.feedback.show')
  if (fb) feedbackTimer = setTimeout(() => fb.classList.remove('show'), 4000)
}

/* ── Event binding ── */
function bind () {
  app.querySelectorAll('[data-mode]').forEach(b =>
    b.onclick = () => render(setupTemplate(b.dataset.mode)))

  app.querySelectorAll('[data-home]').forEach(b =>
    b.onclick = () => { game = null; render(homeTemplate()) })

  app.querySelector('[data-start]')?.addEventListener('click', () => {
    const mode = app.querySelector('.eyebrow').textContent.toLowerCase()
    const id = document.querySelector('#learner-id')?.value.trim() || ''
    const caseCode = document.querySelector('#case-select').value
    if (mode === 'assessment' && !id) { alert('請輸入姓名或員工代碼'); return }
    game = createGame(mode, caseCode, id)
    render(sceneTemplate(game))
  })

  app.querySelectorAll('[data-zone]').forEach(b =>
    b.onclick = () => walkToZone(b.dataset.zone))

  app.querySelector('[data-walkway]')?.addEventListener('click', event => {
    if (event.target.closest('[data-zone]')) return
    const rect = event.currentTarget.getBoundingClientRect()
    walkNurseTo({
      x: (event.clientX - rect.left) / rect.width * 100,
      y: (event.clientY - rect.top) / rect.height * 100,
    })
  })

  app.querySelectorAll('[data-records]').forEach(b =>
    b.onclick = () => render(recordsTemplate(store.load().records)))

  app.querySelector('[data-export]')?.addEventListener('click', () => {
    const blob = new Blob(['﻿' + recordsToCsv(store.load().records)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'PACU_評核紀錄.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  })

  app.querySelector('[data-clear]')?.addEventListener('click', () => {
    if (confirm('確定清除本裝置的全部評核紀錄？此操作無法復原。')) {
      store.clear()
      render(recordsTemplate([]))
    }
  })
}

/* ── Walking + zone interaction ── */
function walkToZone (zone) {
  removeComplaint()
  selectedZone = zone
  const task = STEPS[game.currentStep]?.correct
  const target = targetForTask(zone, task, game.activePatientIndex)
  walkNurseTo(target, () => {
    game = updatePlayerPosition(game, target, zone)
    if (zone === 'patient-bay' && task === 'assess') showComplaint()
    else openInteraction(zone)
  })
}

function walkNurseTo (target, onArrival) {
  if (walkAnimationId) cancelAnimationFrame(walkAnimationId)
  const nurses = app.querySelectorAll('[data-nurse]')
  nurses.forEach((n, i) => { if (i > 0) n.remove() })
  const nurse = nurses[0]
  if (!nurse) return

  let position = {
    x: parseFloat(nurse.style.left) || game.playerPosition.x,
    y: parseFloat(nurse.style.top) || game.playerPosition.y,
  }
  nurse.classList.add('walking')

  const tick = () => {
    const next = moveToward(position, target, 1.15)
    position = next.position
    nurse.style.left = `${position.x}%`
    nurse.style.top = `${position.y}%`
    nurse.dataset.direction = next.direction
    if (next.arrived) {
      walkAnimationId = null
      nurse.classList.remove('walking')
      onArrival?.()
      return
    }
    walkAnimationId = requestAnimationFrame(tick)
  }
  walkAnimationId = requestAnimationFrame(tick)
}

/* ── Patient complaint bubble ── */
function removeComplaint () {
  document.querySelector('.patient-complaint')?.remove()
}

function showComplaint () {
  removeComplaint()
  const c = document.createElement('aside')
  c.className = `patient-complaint complaint-bed-${game.activePatientIndex + 1}`
  c.innerHTML = `
    <small>PACU-${game.activePatientIndex + 1} 病人主訴</small>
    <strong>「${game.caseData.presentation.summary}」</strong>
    <div>${game.caseData.presentation.findings.map(x => `<span>${x}</span>`).join('')}</div>
    <button class="primary" data-assess-complete>完成病人狀態評估</button>`
  app.querySelector('.v13-board')?.append(c)
  c.querySelector('[data-assess-complete]').onclick = () => {
    game = performStep(game, { zone: 'patient-bay', value: 'assess' })
    removeComplaint()
    render(sceneTemplate(game))
  }
}

/* ── Dialog interaction ── */
function openInteraction (zone) {
  const modal = document.createElement('dialog')
  modal.id = 'action-dialog'
  modal.className = 'side-panel'
  modal.innerHTML = interactionTemplate(zone, game)
  document.body.append(modal)
  modal.showModal()
  bindModal(modal)
}

function bindModal (modal) {
  modal.querySelector('[data-close]')?.addEventListener('click', () => modal.remove())

  modal.querySelectorAll('[data-action]').forEach(b => {
    b.onclick = () => {
      const value = b.dataset.action

      // Dose calculation check
      if (selectedZone === 'preparation-cart' && value === 'calculate') {
        const input = modal.querySelector('#dose-answer')
        const expected = Number(input.dataset.expected)
        if (!checkNumericAnswer(input.value, expected, 0.001)) {
          game = performStep(game, { zone: selectedZone, value: 'wrong-dose' })
          modal.remove()
          render(sceneTemplate(game))
          return
        }
        modal.querySelector('.calculation-answer').hidden = false
      }

      game = performStep(game, { zone: selectedZone, value, critical: b.dataset.critical || undefined })
      modal.remove()

      if (game.completed) {
        const result = finishGame(game)
        if (game.mode === 'assessment') {
          store.save({
            learnerId: game.learnerId,
            completedAt: new Date().toLocaleString('zh-TW'),
            total: result.total,
            status: result.status,
          })
        }
        render(resultsTemplate(result))
      } else {
        render(sceneTemplate(game))
      }
    }
  })
}

/* ── Boot ── */
render(homeTemplate())
