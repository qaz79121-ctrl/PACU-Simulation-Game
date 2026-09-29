export const ZONE_TARGETS={
  'nurse-station':{x:88,y:47},'patient-bay':{x:51,y:55},
  'high-alert':{x:88,y:49},'crash-cart':{x:84,y:29},'preparation':{x:14,y:58},
  'preparation-cart':{x:14,y:58},'double-check':{x:14,y:72},
  'documentation':{x:89,y:67},'hand-hygiene':{x:8,y:49},
}
const TASK_TARGETS={notify:{x:87,y:48},verify:{x:87,y:48},check:{x:14,y:72},prepare:{x:14,y:58}}
// Assessment/monitoring stops at the physiologic-monitor side of each bed.
const PATIENT_BEDSIDE_TARGETS=[{x:34,y:43},{x:56,y:43},{x:78,y:43}]
// IV stands are on the left side of each bed in the approved front-facing scene.
const PATIENT_IV_TARGETS=[{x:22,y:49},{x:43,y:49},{x:65,y:49}]
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
