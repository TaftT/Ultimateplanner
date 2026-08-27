import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

/** Shared sensor config: a small activation distance lets a plain tap/click
 * through without starting a drag, while still feeling responsive.
 *
 * Deliberately MouseSensor, not PointerSensor, alongside TouchSensor.
 * PointerSensor listens to the unified Pointer Events API, which also
 * fires for touch input in every modern browser — so pairing it with
 * TouchSensor means BOTH sensors react to the same touch, and whichever
 * one's activation constraint resolves first hijacks the gesture. Since
 * PointerSensor's constraint here is just 6px of movement (no delay), it
 * would frequently win that race before TouchSensor's long-press delay
 * even gets a chance, making the long-press feel unreliable and the drag
 * itself feel jumpy where ownership flips mid-gesture. MouseSensor only
 * listens for actual mouse events, so touch is unambiguously TouchSensor's
 * alone.
 *
 * Touch uses a real long-press delay (not just a token one) because touch
 * and scroll share the same gesture — a quick touch-and-move has to read as
 * "scrolling the list", and only a deliberate hold-then-move should pick the
 * item up. If the finger travels past `tolerance` before `delay` elapses,
 * TouchSensor cancels the pending drag and lets the browser scroll instead
 * (see the matching `touch-action: pan-y` on draggable rows in
 * components.css — `touch-action: none` would block that native scroll
 * regardless of this delay). Tolerance is a bit looser than the default so a
 * genuine long-press isn't cancelled by ordinary hand tremor while holding
 * still. */
export function usePlannerSensors() {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 6 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 12 },
  })
  return useSensors(mouseSensor, touchSensor)
}
