export type StyleMetricStatus = 'ok' | 'warning' | 'low' | 'high'

export interface StyleMetricThresholds {
  warningMin: number
  warningMax: number
}

export function getStyleMetricThresholds(min: number, max: number, warningRatio = 0.16): StyleMetricThresholds {
  const range = Math.max(max - min, 0)
  const padding = range > 0 ? range * warningRatio : 0

  return {
    warningMin: min - padding,
    warningMax: max + padding,
  }
}

export function getStyleMetricStatus(current: number, min: number, max: number, warningRatio = 0.16): StyleMetricStatus {
  if (current >= min && current <= max) return 'ok'

  const { warningMin, warningMax } = getStyleMetricThresholds(min, max, warningRatio)

  if (current >= warningMin && current <= warningMax) return 'warning'
  return current < min ? 'low' : 'high'
}