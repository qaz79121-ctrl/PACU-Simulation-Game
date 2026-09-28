const base = { age:54, weightKg:60, surgery:'腹腔鏡手術', allergy:'NKDA', vitals:{hr:82,bp:'118/72',spo2:98,rr:16,pain:2} }
const scenarios = [
 ['pain-fentanyl','術後疼痛','fentanyl','Fentanyl 50 mcg IVP stat','100 mcg/2 mL/Amp',1,'mL','50 mcg ÷ 100 mcg × 2 mL = 1 mL'],
 ['pain-morphine','嚴重術後疼痛','morphine','Morphine 3 mg IVP stat','10 mg/1 mL/Amp',0.3,'mL','3 mg ÷ 10 mg × 1 mL = 0.3 mL'],
 ['bradycardia','心搏過緩','atropine','Atropine 0.5 mg IVP stat','1 mg/1 mL/Amp',0.5,'mL','0.5 mg ÷ 1 mg × 1 mL = 0.5 mL'],
 ['hypertension-labetalol','術後高血壓','labetalol','Labetalol 2 mg IVP stat','25 mg/5 mL/Amp',0.4,'mL','2 mg ÷ 25 mg × 5 mL = 0.4 mL'],
 ['ponv','術後噁心嘔吐','metoclopramide','Metoclopramide 10 mg IVP stat','10 mg/2 mL/Amp',2,'mL','10 mg ÷ 10 mg × 2 mL = 2 mL'],
 ['hypotension-ephedrine','術後低血壓','ephedrine','Ephedrine 12 mg IVP stat','40 mg/1 mL/Amp',0.3,'mL','12 mg ÷ 40 mg × 1 mL = 0.3 mL'],
 ['hypertension-nicardipine','持續性術後高血壓','nicardipine','Nicardipine 0.3 mg IVP stat','10 mg/10 mL/Vial',0.3,'mL','0.3 mg ÷ 10 mg × 10 mL = 0.3 mL'],
 ['sedation','術後躁動需鎮靜','midazolam','Midazolam 3 mg IVP stat','15 mg/3 mL',0.6,'mL','3 mg ÷ 15 mg × 3 mL = 0.6 mL'],
 ['vasopressor','持續性低血壓','norepinephrine','Norepinephrine 4 Amp IN D5W 500 mL','4 mg/4 mL/Amp',16,'mL','4 Amp × 4 mL = 16 mL'],
 ['shivering','術後寒顫','meperidine','Meperidine 12.5 mg IVP stat','50 mg/1 mL/Amp',0.25,'mL','12.5 mg ÷ 50 mg × 1 mL = 0.25 mL'],
 ['dopamine-infusion','循環支持','dopamine','Dopamine 400 mg IN NS 500 mL','200 mg/5 mL/Amp',2,'Amp','400 mg ÷ 200 mg/Amp = 2 Amp（共 10 mL）'],
 ['easydopa-infusion','持續性循環支持','easydopa','Easydopa 1 Bot IV infusion，幫浦設定 400 mg in 250 mL，依醫囑調整速率','400 mg/250 mL/Bot',1,'Bot','400 mg ÷ 250 mL = 1.6 mg/mL；使用 1 Bot（整瓶）'],
]
const presentations=[
 {summary:'護理師，我傷口真的很痛，痛到不太敢動，可以幫我止痛嗎？',findings:['NRS 8 分','保護性姿勢','可清楚回答問題'],nrs:8,vitals:{hr:96,bp:'146/88',spo2:98,rr:20}},
 {summary:'護理師，我傷口痛得受不了，躺著也沒辦法休息。',findings:['NRS 9 分','表情痛苦','躁動不安'],nrs:9,vitals:{hr:104,bp:'152/92',spo2:97,rr:22}},
 {summary:'護理師，我頭好暈，整個人很不舒服。',findings:['頭暈','皮膚濕冷','脈搏緩慢'],vitals:{hr:42,bp:'86/52',spo2:96,rr:16}},
 {summary:'護理師，我頭很脹、很痛，感覺很不舒服。',findings:['頭痛','臉部潮紅','無胸痛'],vitals:{hr:88,bp:'184/102',spo2:98,rr:18}},
 {summary:'護理師，我現在很噁心，好像快吐出來了……',findings:['噁心程度 8/10','面色蒼白','出冷汗'],vitals:{hr:92,bp:'132/78',spo2:98,rr:18}},
 {summary:'護理師，我好暈喔，全身都沒有力氣。',findings:['四肢冰冷','頭暈無力','微血管回填延長'],vitals:{hr:106,bp:'78/44',spo2:96,rr:22}},
 {summary:'護理師，我的頭一直痛，覺得臉很熱、不太舒服。',findings:['血壓反覆偏高','輕微頭痛','意識清楚'],vitals:{hr:90,bp:'192/108',spo2:98,rr:18}},
 {summary:'護理師，我現在很煩躁，身上的管子讓我很不舒服！',findings:['躁動不安','無法配合指令','需持續安全監測'],vitals:{hr:112,bp:'158/94',spo2:95,rr:24}},
 {summary:'護理師，我覺得好虛弱，頭很暈，想一直睡。',findings:['嗜睡但可喚醒','四肢冰冷','尿量偏少'],vitals:{hr:118,bp:'72/40',spo2:95,rr:24}},
 {summary:'護理師，我好冷，一直發抖停不下來。',findings:['全身顫抖','主訴寒冷','體溫 35.6°C'],vitals:{hr:102,bp:'138/82',spo2:97,rr:22}},
 {summary:'護理師，我覺得很暈、很虛弱，手腳也冰冰的。',findings:['末梢灌流不佳','皮膚濕冷','意識反應變慢'],vitals:{hr:116,bp:'76/42',spo2:94,rr:24}},
 {summary:'護理師，我還是很暈，感覺整個人都沒有力氣。',findings:['輸液補充後血壓仍偏低','末梢灌流不佳','需使用輸液幫浦持續監測'],vitals:{hr:110,bp:'74/42',spo2:95,rr:22}},
]
export const CASES = scenarios.map(([id,topic,medicationId,text,stock,expectedDraw,answerUnit,calculation],index)=>({id,topic,medicationId,order:{text,stock,expectedDraw,answerUnit,calculation},presentation:presentations[index],patient:{...base,vitals:{...base.vitals,...presentations[index].vitals},code:`SIM-${String(index+1).padStart(2,'0')}`,age:base.age+index},educationOnly:true}))
