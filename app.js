import { createGame,performStep,finishGame,updatePlayerPosition,STEPS } from './game/game.js'
import { homeTemplate,setupTemplate,sceneTemplate,interactionTemplate,resultsTemplate,recordsTemplate } from './ui/templates-v10.js'
import { createRecordStore,recordsToCsv } from './storage/records.js'
import { targetForTask,moveToward } from './game/navigation.js'
import { checkNumericAnswer } from './domain/dosage.js'
const app=document.querySelector('#app'); const store=createRecordStore(); let game=null,selectedZone=null
function render(html){app.innerHTML=html;bind()}
function bind(){
 app.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>render(setupTemplate(b.dataset.mode)))
 app.querySelectorAll('[data-home]').forEach(b=>b.onclick=()=>{game=null;render(homeTemplate())})
 app.querySelector('[data-start]')?.addEventListener('click',()=>{const mode=app.querySelector('.eyebrow').textContent.toLowerCase(),id=document.querySelector('#learner-id')?.value.trim()||'',caseCode=document.querySelector('#case-select').value;if(mode==='assessment'&&!id){alert('請輸入姓名或員工代碼');return}game=createGame(mode,caseCode,id);render(sceneTemplate(game))})
 app.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>walkToZone(b.dataset.zone))
 app.querySelector('[data-walkway]')?.addEventListener('click',event=>{if(event.target.closest('[data-zone]'))return;const rect=event.currentTarget.getBoundingClientRect();walkNurseTo({x:(event.clientX-rect.left)/rect.width*100,y:(event.clientY-rect.top)/rect.height*100})})
 app.querySelectorAll('[data-records]').forEach(b=>b.onclick=()=>render(recordsTemplate(store.load().records)))
 app.querySelector('[data-export]')?.addEventListener('click',()=>{const blob=new Blob(['\ufeff'+recordsToCsv(store.load().records)],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PACU_評核紀錄.csv';a.click();URL.revokeObjectURL(a.href)})
 app.querySelector('[data-clear]')?.addEventListener('click',()=>{if(confirm('確定清除本裝置的全部評核紀錄？此操作無法復原。')){store.clear();render(recordsTemplate([]))}})
}
function walkToZone(zone){selectedZone=zone;const target=targetForTask(zone,STEPS[game.currentStep]?.correct,game.activePatientIndex);walkNurseTo(target,()=>{game=updatePlayerPosition(game,target,zone);openInteraction(zone)})}
function walkNurseTo(target,onArrival){const nurse=app.querySelector('[data-nurse]');if(!nurse)return;let position={x:parseFloat(nurse.style.left),y:parseFloat(nurse.style.top)};nurse.classList.add('walking');const tick=()=>{const next=moveToward(position,target,1.15);position=next.position;nurse.style.left=`${position.x}%`;nurse.style.top=`${position.y}%`;nurse.dataset.direction=next.direction;if(next.arrived){nurse.classList.remove('walking');onArrival?.();return}requestAnimationFrame(tick)};requestAnimationFrame(tick)}
function openInteraction(zone){const modal=document.createElement('dialog');modal.id='action-dialog';modal.className='side-panel';modal.innerHTML=interactionTemplate(zone,game);document.body.append(modal);modal.showModal();bindModal(modal)}
function bindModal(modal){modal.querySelector('[data-close]')?.addEventListener('click',()=>modal.remove());modal.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const value=b.dataset.action;if(selectedZone==='preparation'&&value==='calculate'){const input=modal.querySelector('#dose-answer'),expected=Number(input.dataset.expected);if(!checkNumericAnswer(input.value,expected,0.001)){game=performStep(game,{zone:selectedZone,value:'wrong-dose'});modal.remove();render(sceneTemplate(game));return}modal.querySelector('.calculation-answer').hidden=false}game=performStep(game,{zone:selectedZone,value,critical:b.dataset.critical||undefined});modal.remove();if(game.completed){const result=finishGame(game);if(game.mode==='assessment')store.save({learnerId:game.learnerId,completedAt:new Date().toLocaleString('zh-TW'),total:result.total,status:result.status});render(resultsTemplate(result))}else render(sceneTemplate(game))})}
render(homeTemplate())
