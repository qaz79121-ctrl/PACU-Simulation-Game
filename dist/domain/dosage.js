export function parseClinicalNumber(value) {
  const trimmed = String(value).trim()
  const number = Number(trimmed)
  if (!trimmed || !Number.isFinite(number) || number <= 0 || number > 1e6) {
    return { ok:false, reason:'請輸入合理的正數數值' }
  }
  return { ok:true, value:number }
}
export function calculateVolume(orderAmount, stockAmount, stockVolume) {
  if (![orderAmount,stockAmount,stockVolume].every(Number.isFinite) || [orderAmount,stockAmount,stockVolume].some(v => v <= 0)) throw new RangeError('Dose inputs must be positive finite numbers')
  return (orderAmount / stockAmount) * stockVolume
}
export function checkNumericAnswer(answer, expected, tolerance=0.01) {
  const parsed = parseClinicalNumber(answer)
  return parsed.ok && Math.abs(parsed.value - expected) <= tolerance
}
