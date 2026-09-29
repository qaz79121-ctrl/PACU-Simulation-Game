
import {SCENARIOS,SCORE_WEIGHTS} from './data.js';
export function createGameState(){return {patientIndex:0,step:1,score:0,completed:0,earned:{},attempts:{med:0,dose:0},doubleChecked:false,errors:[],startedAt:Date.now()};}
export function currentScenario(s){return SCENARIOS[s.patientIndex];}
export function completeStep(s,step,correct=true){
 if(step!==s.step) return {status:'blocked'};
 const key=`${s.patientIndex}-${step}`; if(s.earned[key]!==undefined)return {status:'duplicate'};
 const pts=correct?SCORE_WEIGHTS[s.patientIndex][step-1]:0;s.earned[key]=pts;s.score+=pts;s.step++;
 if(step===8)s.doubleChecked=true;
 if(step===12){s.completed++; if(s.patientIndex<2){s.patientIndex++;s.step=1;s.attempts={med:0,dose:0};s.doubleChecked=false;}else{s.step=13;}}
 return {status:'ok',points:pts};
}
export function submitMedication(s,id){
 const sc=currentScenario(s); if(s.step!==5)return {status:'blocked'};
 s.attempts.med++; if(id===sc.drugId){completeStep(s,5,true);return {status:'correct'};}
 s.errors.push(`${sc.id} 選藥錯誤：第 ${s.attempts.med} 次`);
 if(s.attempts.med===1)return {status:'retry'};
 completeStep(s,5,false);return {status:'revealed',answer:sc.drug};
}
export function submitDose(s,value){
 const sc=currentScenario(s);if(s.step!==6)return {status:'blocked'};
 s.attempts.dose++;if(Math.abs(Number(value)-sc.correctVolume)<0.001){completeStep(s,6,true);return {status:'correct'};}
 s.errors.push(`${sc.id} 劑量計算錯誤：第 ${s.attempts.dose} 次`);
 if(s.attempts.dose===1)return {status:'retry'};
 completeStep(s,6,false);return {status:'revealed',answer:sc.correctVolume};
}
export function canAdminister(s){return s.step===9&&s.doubleChecked;}
