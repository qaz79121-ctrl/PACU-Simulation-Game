export const ZONE_TARGETS={
  'nurse-station':{x:88,y:47},'patient-bay':{x:51,y:55},'medication-cart':{x:9,y:28},
  'high-alert':{x:88,y:49},'crash-cart':{x:84,y:29},'preparation':{x:14,y:58},
  'preparation-cart':{x:14,y:58},'documentation':{x:89,y:67},'hand-hygiene':{x:8,y:49},
}
const TASK_TARGETS={notify:{x:87,y:48},verify:{x:87,y:48},check:{x:14,y:58},prepare:{x:14,y:58}}
const PATIENT_BEDSIDE_TARGETS=[{x:31,y:55},{x:51,y:55},{x:73,y:55}]
// IV stands are on the left side of each bed in the approved front-facing scene.
const PATIENT_IV_TARGETS=[{x:22,y:53},{x:43,y:53},{x:65,y:53}]
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
