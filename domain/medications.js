export const MEDICATIONS = [
  ['fentanyl','Fentanyl',100,'mcg',2,'high-alert'],
  ['morphine','Morphine',10,'mg',1,'high-alert'],
  ['atropine','Atropine',1,'mg',1,'emergency'],
  ['labetalol','Labetalol',25,'mg',5,'standard'],
  ['metoclopramide','Metoclopramide',10,'mg',2,'standard'],
  ['ephedrine','Ephedrine',40,'mg',1,'emergency'],
  ['nicardipine','Nicardipine',10,'mg',10,'high-alert',undefined,'Vial'],
  ['norepinephrine','Norepinephrine',4,'mg',4,'high-alert'],
  ['midazolam','Midazolam',15,'mg',3,'high-alert','Midatin'],
  ['meperidine','Meperidine (Pethidine)',50,'mg',1,'high-alert'],
  ['dopamine','Dopamine',200,'mg',5,'high-alert'],
  ['easydopa','Easydopa',400,'mg',250,'high-alert',undefined,'Bot'],
].map(([id,genericName,amount,unit,volumeMl,risk,brandName,container='Amp']) => ({
  id,genericName,brandName,volumeMl,risk,container,reviewStatus:'pending-local-review',image:`./assets/drug-${id}.png`,
  ...(unit === 'mcg' ? { amountMcg: amount } : { amountMg: amount }),
  label: `${genericName}${brandName ? `（${brandName}）` : ''} ${amount} ${unit}/${volumeMl} mL/${container}`,
}))
