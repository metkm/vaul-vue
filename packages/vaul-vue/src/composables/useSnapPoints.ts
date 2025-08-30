import type { MaybeRefOrGetter, ModelRef } from 'vue'
import { computed, toValue } from 'vue'
import { getClosestNumber } from '../utils'

export interface useSnapPointsProps {
  snapPoints: MaybeRefOrGetter<number[]>
  contentSize: MaybeRefOrGetter<number>
  windowSize: MaybeRefOrGetter<number>
  offset: MaybeRefOrGetter<number>
  modelValueSnapIndex: ModelRef<number>
}

export function useSnapPoints({
  snapPoints,
  contentSize,
  windowSize,
  offset,
  modelValueSnapIndex,
}: useSnapPointsProps) {
  const drawerVisibleSize = computed(
    () => toValue(windowSize) - Math.abs(toValue(offset)),
  )

  const points = computed(() => {
    const _contentSize = toValue(contentSize)
    const _snapPoints = toValue(snapPoints)

    if (_snapPoints.length < 1) {
      return [toValue(_contentSize) / toValue(windowSize)]
    }

    return _snapPoints.sort()
  })

  const closestSnapPoint = computed(() => {
    const _p = toValue(points)

    if (_p.length <= 1)
      return _p[0]

    const offsetNormalized = drawerVisibleSize.value / toValue(windowSize)

    return getClosestNumber(points.value, offsetNormalized)
  })

  const closestSnapPointIndex = computed(
    () => points.value.findIndex(point => point === closestSnapPoint.value),
  )

  const activeSnapPointOffset = computed(() => {
    const wSize = toValue(windowSize)
    return wSize - (wSize * points.value[modelValueSnapIndex.value])
  })

  const shouldDismiss = computed(() => {
    const div = 2
    const wSize = toValue(windowSize)

    const smallestPoint = points.value[0] / div

    return drawerVisibleSize.value < wSize * smallestPoint
  })

  const currentSnapOffset = computed(() => {
    const point = points.value[modelValueSnapIndex.value]

    if (point === undefined) {
      console.error('Snap point not found')
      return 0
    }

    const wSize = toValue(windowSize)
    return wSize - (wSize * point)
  })

  const isPassingLastPoint = computed(() => {
    if (points.value.length <= 1) {
      return true
    }

    return modelValueSnapIndex.value >= points.value.length - 1
  })

  return {
    points,
    activeSnapPointOffset,
    closestSnapPointIndex,
    shouldDismiss,
    isPassingLastPoint,
    currentSnapOffset,
  }
}
