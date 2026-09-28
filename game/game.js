import { CASES } from '../domain/cases.js?v=16.1'
import { scoreSession } from '../domain/scoring.js?v=16.1'

export const STEPS=[
 {zone:'patient-bay',title:'評估病人狀態',prompt:'先觀察病況、生命徵象與臨床表徵。',correct:'assess',dimension:'monitoring',points:5},
 {zone:'nurse-station',title:'告知醫師',prompt:'向醫師報告病人病況與評估結果。',correct:'notify',dimension:'patientId',points:0},
 {zone:'nurse-station',title:'核對交班與醫囑',prompt:'確認病人身分、過敏史及醫師開立的醫囑。',correct:'verify',dimension:'patientId',points:10},
 {zone:'hand-hygiene',title:'給藥前洗手',prompt:'前往配置工作台依手部衛生時機完成洗手。',correct:'wash-before',dimension:'preparation',points:0},
 {zone:'medication-cart',title:'藥物辨識',prompt:'依醫囑選擇正確藥物，留意相似名稱與包裝。',correct:null,dimension:'medication',points:15},
 {zone:'preparation',title:'劑量換算',prompt:'依醫囑與現有規格完成劑量換算。',correct:'calculate',dimension:'dosage',points:20},
 {zone:'preparation-cart',title:'準備藥物',prompt:'前往左側電腦藥物車完成抽藥與藥物準備。',correct:'prepare',dimension:'preparation',points:0},
 {zone:'nurse-station',title:'執行雙人核對',prompt:'與覆核護理師完成病人、藥物、劑量、途徑、時間與配置核對。',correct:'check',dimension:'doubleCheck',points:15},
 {zone:'patient-bay',title:'安全給藥',prompt:'選擇正確途徑、速度與時機。',correct:'administer',dimension:'administration',points:10},
 {zone:'patient-bay',title:'給藥後監測',prompt:'再次觀察療效與不良反應。',correct:'monitor',dimension:'monitoring',points:5},
 {zone:'hand-hygiene',title:'給藥後洗手',prompt:'返回配置工作台完成給藥後手部衛生。',correct:'wash-after',dimension:'preparation',points:0},
 {zone:'documentation',title:'完成電子紀錄',prompt:'記錄藥物、時間、反應與後續評估。',correct:'document',dimension:'documentation',points:5},
]
const CATEGORY_MAX={patient:10,medication:20,dosage:20,safety:20,administration:15,monitoring:15}
const STEP_CATEGORY={
 assess:'patient',notify:'patient',verify:'patient','wash-before':'safety',medication:'medication',calculate:'dosage',prepare:'safety',check:'safety',administer:'administration',monitor:'monitoring','wash-after':'safety',document:'safety'
}
function patientCases(){
 const shuffled=[...CASES]
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 return shuffled.slice(0,3)
}
function freshAttempts(){return {medication:0,dosage:0}}
function awardFor(step,game){
 const key=step.correct??'medication',category=STEP_CATEGORY[key]
 if(!category)return game.categoryScores
 const stepsInCategory=STEPS.filter(item=>STEP_CATEGORY[item.correct??'medication']===category).length
 const base=CATEGORY_MAX[category]/3/stepsInCategory
 const retryFactor=(category==='medication'&&game.attempts.medication>0)||(category==='dosage'&&game.attempts.dosage>0)?0.5:1
 return {...game.categoryScores,[category]:Math.min(CATEGORY_MAX[category],game.categoryScores[category]+base*retryFactor)}
}
export function createGame(mode='practice',caseCode='SIM-01',learnerId=''){
 const patients=patientCases(),caseData=patients[0]
 return {mode,patients,activePatientIndex:0,completedPatients:0,caseData,learnerId,currentStep:0,events:[],feedback:'',playerPosition:{x:20,y:65},playerZone:'entrance',scores:{patientId:0,medication:0,dosage:0,preparation:15,doubleCheck:0,administration:0,monitoring:0,documentation:0},categoryScores:{patient:0,medication:0,dosage:0,safety:0,administration:0,monitoring:0},attempts:freshAttempts(),mistakes:{medication:0,dosage:0,safety:0,monitoring:0},criticalErrors:[],startedAt:Date.now(),completed:false}
}
export function updatePlayerPosition(game,playerPosition,playerZone){return {...game,playerPosition:{...playerPosition},playerZone}}
function advance(game,step,action,feedback){
 const categoryScores=awardFor(step,game)
 const scores={...game.scores,[step.dimension]:Math.min((game.scores[step.dimension]||0)+step.points, step.dimension==='monitoring'?10:step.points)}
 const next=game.currentStep+1
 if(next<STEPS.length)return {...game,scores,categoryScores,currentStep:next,events:[...game.events,{...action,correct:true}],feedback}
 const completedPatients=game.completedPatients+1
 if(completedPatients>=3)return {...game,scores,categoryScores,currentStep:STEPS.length,events:[...game.events,{...action,correct:true}],feedback,completedPatients,completed:true}
 const activePatientIndex=game.activePatientIndex+1
 return {...game,scores,categoryScores,currentStep:0,events:[...game.events,{...action,correct:true}],feedback:`病人 ${completedPatients} 已完成，請開始病人 ${completedPatients+1}。`,completedPatients,activePatientIndex,caseData:game.patients[activePatientIndex],attempts:freshAttempts()}
}
export function performStep(game,action){
 const step=STEPS[game.currentStep]; if(!step||action.zone!==step.zone) return {...game,feedback:'請先完成目前任務，再前往其他區域。'}
 const expected=step.correct ?? game.caseData.medicationId
 const correct=action.value===expected
 if(!correct){
   const critical=action.critical?[...game.criticalErrors,action.critical]:game.criticalErrors
   if(step.correct===null){
     const attempts={...game.attempts,medication:game.attempts.medication+1},mistakes={...game.mistakes,medication:game.mistakes.medication+1}
     if(attempts.medication>=2)return advance({...game,attempts,mistakes,criticalErrors:critical},step,{...action,correct:false},`教學提示：正確藥物為 ${game.caseData.medicationId}。已記錄本題錯誤並繼續。`)
     return {...game,attempts,mistakes,criticalErrors:critical,events:[...game.events,{...action,correct:false}],feedback:'藥物選擇不正確，只剩最後一次機會，請重新核對醫囑與藥物標示。'}
   }
   if(step.correct==='calculate'){
     const attempts={...game.attempts,dosage:game.attempts.dosage+1},mistakes={...game.mistakes,dosage:game.mistakes.dosage+1}
     if(attempts.dosage>=2)return advance({...game,attempts,mistakes,criticalErrors:critical},step,{...action,correct:false},`教學提示：正確換算為 ${game.caseData.order.calculation}。已記錄本題錯誤並繼續。`)
     return {...game,attempts,mistakes,criticalErrors:critical,events:[...game.events,{...action,correct:false}],feedback:'劑量換算不正確，只剩最後一次機會，請重新依醫囑與現有規格計算。'}
   }
   const mistakes={...game.mistakes}
   if(step.correct==='check'||step.correct==='administer')mistakes.safety++
   if(step.correct==='monitor')mistakes.monitoring++
   return {...game,mistakes,criticalErrors:critical,events:[...game.events,{...action,correct:false}],feedback:game.mode==='practice'?'選擇不正確，請再確認病人狀態、醫囑與藥物標示。':''}
 }
 return advance(game,step,action,game.mode==='practice'?'正確，已完成此安全步驟。':'')
}
export function finishGame(game){
 const dimensions=Object.fromEntries(Object.entries(game.categoryScores).map(([k,v])=>[k,Math.round(v*100)/100]))
 const total=Math.round(Object.values(dimensions).reduce((a,b)=>a+b,0))
 const criticalErrors=game.criticalErrors
 const status=criticalErrors.length?'retraining-required':total>=90?'passed':'not-passed'
 const stars=status==='retraining-required'?1:total>=95?3:total>=80?2:1
 return {total,dimensions,criticalErrors,status,stars,completedPatients:game.completedPatients,mistakes:game.mistakes}
}
