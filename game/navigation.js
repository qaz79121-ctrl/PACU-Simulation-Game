export const ZONE_TARGETS={
  'nurse-station':{x:54,y:58},'patient-bay':{x:49,y:31},'medication-cart':{x:18,y:57},
  'high-alert':{x:88,y:49},'crash-cart':{x:84,y:29},'preparation':{x:12,y:48},
  'documentation':{x:89,y:67},'hand-hygiene':{x:12,y:18},
}
const TASK_TARGETS={notify:{x:61,y:57},check:{x:39,y:57}}
const PATIENT_BEDSIDE_TARGETS=[{x:25,y:52},{x:50,y:52},{x:75,y:52}]
const PATIENT_RIGHT_TARGETS=[{x:37,y:47},{x:59,y:47},{x:80,y:47}]
export function targetForTask(zone,task,activePatientIndex=0){
  if(zone==='patient-bay'){
    if(task==='administer')return PATIENT_RIGHT_TARGETS[activePatientIndex]||PATIENT_RIGHT_TARGETS[0]
    if(task==='assess'||task==='monitor')return PATIENT_BEDSIDE_TARGETS[activePatientIndex]||PATIENT_BEDSIDE_TARGETS[0]
  }
  return zone==='nurse-station'&&TASK_TARGETS[task]?TASK_TARGETS[task]:ZONE_TARGETS[zone]
}
export function moveToward(position,target,speed=1.2){
  const dx=target.x-position.x,dy=target.y-position.y,distance=Math.hypot(dx,dy)
  const direction=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')
  if(distance<=speed)return {position:{...target},direction,arrived:true}
  return {position:{x:position.x+dx/distance*speed,y:position.y+dy/distance*speed},direction,arrived:false}
}
export function createNavigator(position={x:50,y:82}){
  return {position,moving:false,pendingZone:null,arrivedZone:null,goTo(zone){return {...this,moving:true,pendingZone:zone,arrivedZone:null,target:ZONE_TARGETS[zone]}}}
}
