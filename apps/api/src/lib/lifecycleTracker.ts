/**
 * In-memory tracker for last lifecycle event (dev/debug only)
 */

interface LifecycleEvent {
  event: string;
  addonId: string;
  workspaceId: string;
  timestamp: string;
}

let lastEvent: LifecycleEvent | null = null;

export function recordLifecycleEvent(event: string, addonId: string, workspaceId: string): void {
  lastEvent = {
    event,
    addonId,
    workspaceId,
    timestamp: new Date().toISOString()
  };
}

export function getLastLifecycleEvent(): LifecycleEvent | null {
  return lastEvent;
}
