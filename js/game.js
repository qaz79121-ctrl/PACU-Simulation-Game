import {PATIENTS,STEP_DEFINITIONS,SCORE_CONFIG} from './data.js';
export function createInitialState(){return {patientIndex:0,stepIndex:0,score:0,completedPatients:0,phase:'IDLE',history:[],attempts:{}}}
export let state=createInitialState();
export function activePatient(){return PATIENTS[state.patientIndex]}
export function activeStep(){return STEP_DEFINITIONS[state.stepIndex]}
export function restartState(){state=createInitialState();return state}
export function completeStep(result={correct:true,detail:''}){if(state.phase==='STEP_COMPLETE')return false; state.history.push({patient:activePatient().id,step:activeStep().id,...result}); state.phase='STEP_COMPLETE'; return true}
export function advance(){if(state.stepIndex===11){const p=state.patientIndex; state.score+=SCORE_CONFIG.patientTotals[p];state.completedPatients++; if(p===2){state.phase='FINISHED';return} state.patientIndex++;state.stepIndex=0}else state.stepIndex++; state.phase='IDLE'}
export function renderGame(s=state){if(typeof document==='undefined')return; document.querySelector('#score').textContent=s.score;document.querySelector('#done').textContent=s.completedPatients;document.querySelector('#patientStep').textContent=`${PATIENTS[s.patientIndex]?.id||'完成'}｜步驟 ${Math.min(s.stepIndex+1,12)}/12`;document.querySelector('#progressFill').style.width=`${((s.patientIndex*12+s.stepIndex)/36)*100}%`;document.querySelectorAll('.mission').forEach((b,i)=>{b.classList.toggle('active',i===s.stepIndex);b.classList.toggle('completed',i<s.stepIndex)});}
