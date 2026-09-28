const WEIGHTS = { patientId:10, medication:15, dosage:20, preparation:15, doubleCheck:15, administration:10, monitoring:10, documentation:5 }
export const CRITICAL_ERRORS = ['wrong-patient','wrong-medication','severe-dose-error','missed-double-check','missed-critical-vital']
export function scoreSession(dimensions, criticalErrors=[]) {
  const normalized = Object.fromEntries(Object.entries(WEIGHTS).map(([key,max]) => [key, Math.max(0,Math.min(max,Number(dimensions[key] ?? 0)))]))
  const total = Object.values(normalized).reduce((a,b)=>a+b,0)
  const critical = criticalErrors.filter(v => CRITICAL_ERRORS.includes(v))
  const status = critical.length ? 'retraining-required' : total >= 90 ? 'passed' : 'not-passed'
  const stars = status === 'retraining-required' ? 1 : total >= 95 ? 3 : total >= 80 ? 2 : 1
  return { total, dimensions:normalized, criticalErrors:critical, status, stars }
}
