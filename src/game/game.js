import { CASES } from '../domain/cases.js'
import { scoreSession } from '../domain/scoring.js'

export const STEPS=[
 {zone:'patient-bay',title:'評估病人狀態',prompt:'先觀察病況、生命徵象與臨床表徵。',correct:'assess',dimension:'monitoring',points:5},
 {zone:'nurse-station',title:'告知醫師',prompt:'向醫師報告病人病況與評估結果。',correct:'notify',dimension:'patientId',points:0},
 {zone:'nurse-station',title:'核對交班與醫囑',prompt:'確認病人身分、過敏史及醫師開立的醫囑。',correct:'verify',dimension:'patientId',points:10},
 {zone:'preparation',title:'給藥前洗手',prompt:'前往配置工作台依手部衛生時機完成洗手。',correct:'wash-before',dimension:'preparation',points:0},
 {zone:'medication-cart',title:'藥物辨識',prompt:'依醫囑選擇正確藥物，留意相似名稱與包裝。',correct:null,dimension:'medication',points:15},
 {zone:'preparation',title:'藥物配置',prompt:'完成劑量換算並確認配置。',correct:'calculate',dimension:'dosage',points:20},
 {zone:'nurse-station',title:'執行雙人核對',prompt:'與覆核護理師完成病人、藥物、劑量、途徑、時間與配置核對。',correct:'check',dimension:'doubleCheck',points:15},
 {zone:'patient-bay',title:'安全給藥',prompt:'選擇正確途徑、速度與時機。',correct:'administer',dimension:'administration',points:10},
 {zone:'patient-bay',title:'給藥後監測',prompt:'再次觀察療效與不良反應。',correct:'monitor',dimension:'monitoring',points:5},
 {zone:'preparation',title:'給藥後洗手',prompt:'返回配置工作台完成給藥後手部衛生。',correct:'wash-after',dimension:'preparation',points:0},
 {zone:'documentation',title:'完成電子紀錄',prompt:'記錄藥物、時間、反應與後續評估。',correct:'document',dimension:'documentation',points:5},
]
export function createGame(mode='practice',caseCode='SIM-01',learnerId=''){
 const caseData=CASES.find(c=>c.patient.code===caseCode)||CASES[0]
 return {mode,caseData,learnerId,currentStep:0,events:[],feedback:'',playerPosition:{x:50,y:82},playerZone:'entrance',scores:{patientId:0,medication:0,dosage:0,preparation:15,doubleCheck:0,administration:0,monitoring:0,documentation:0},criticalErrors:[],startedAt:Date.now(),completed:false}
}
export function updatePlayerPosition(game,playerPosition,playerZone){return {...game,playerPosition:{...playerPosition},playerZone}}
export function performStep(game,action){
 const step=STEPS[game.currentStep]; if(!step||action.zone!==step.zone) return {...game,feedback:'請先完成目前任務，再前往其他區域。'}
 const expected=step.correct ?? game.caseData.medicationId
 const correct=action.value===expected
 if(!correct){
   const critical=action.critical?[...game.criticalErrors,action.critical]:game.criticalErrors
   return {...game,criticalErrors:critical,events:[...game.events,{...action,correct:false}],feedback:game.mode==='practice'?'選擇不正確，請再確認病人狀態、醫囑與藥物標示。':''}
 }
 const scores={...game.scores,[step.dimension]:Math.min((game.scores[step.dimension]||0)+step.points, step.dimension==='monitoring'?10:step.points)}
 const next=game.currentStep+1
 return {...game,scores,currentStep:next,events:[...game.events,{...action,correct:true}],feedback:game.mode==='practice'?'正確，已完成此安全步驟。':'',completed:next>=STEPS.length}
}
export function finishGame(game){ return scoreSession(game.scores,game.criticalErrors) }
