export const ZONE_TARGETS={
  'nurse-station':{x:90,y:43},'patient-bay':{x:49,y:42},'medication-cart':{x:7,y:30},
  'high-alert':{x:88,y:49},'crash-cart':{x:84,y:29},'preparation':{x:13,y:53},
  'preparation-cart':{x:13,y:53},'documentation':{x:89,y:67},'hand-hygiene':{x:7,y:52},
}
const TASK_TARGETS={notify:{x:89,y:43},verify:{x:89,y:43},check:{x:13,y:53},prepare:{x:13,y:53}}
const PATIENT_BEDSIDE_TARGETS=[{x:23,y:50},{x:49,y:50},{x:75,y:50}]
// IV stands are on the left side of each bed in the approved front-facing scene.
const PATIENT_IV_TARGETS=[{x:18,y:45},{x:43,y:45},{x:68,y:45}]
export function targetForTask(zone,task,activePatientIndex=0){
  if(zone==='patient-bay'){
    if(task==='administer')return PATIENT_IV_TARGETS[activePatientIndex]||PATIENT_IV_TARGETS[0]
    if(task==='assess'||task==='monitor')return PATIENT_BEDSIDE_TARGETS[activePatientIndex]||PATIENT_BEDSIDE_TARGETS[0]
  }
  return zone==='nurse-station'&&TASK_TARGETS[task]?TASK_TARGETS[task]:(TASK_TARGETS[task]||ZONE_TARGETS[zone])
}
export function moveToward(position,target,speed=1.2){
  const dx=target.x-position.x,dy=target.y-position.y,distance=Math.hypot(dx,dy)
  const direction=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')
  if(distance<=speed)return {position:{...target},direction,arrived:true}
  return {position:{x:position.x+dx/distance*speed,y:position.y+dy/distance*speed},direction,arrived:false}
}
export function createNavigator(position={x:15,y:62}){return {position,moving:false,pendingZone:null,arrivedZone:null,goTo(zone){return {...this,moving:true,pendingZone:zone,arrivedZone:null,target:ZONE_TARGETS[zone]}}}}
