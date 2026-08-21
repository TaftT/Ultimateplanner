import { PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

/** Shared sensor config: a small activation distance lets a plain tap/click
 * through without starting a drag, while still feeling responsive. */
export function usePlannerSensors() {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 8 },
  })
  return useSensors(pointerSensor, touchSensor)
}
