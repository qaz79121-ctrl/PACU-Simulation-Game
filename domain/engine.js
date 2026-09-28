export function createSession(mode='practice') {
  return { mode, startedAt:Date.now(), events:[], feedback:null, step:0 }
}
export function reduceSession(state, action) {
  const events = [...state.events, {...action, at:Date.now()}]
  const feedback = state.mode === 'practice' && action.correct === false ? '請再確認病人、醫囑與藥物標示。' : null
  return {...state, events, feedback, step:state.step+1}
}
