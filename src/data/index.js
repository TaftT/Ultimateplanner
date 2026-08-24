// Public storage abstraction. UI/store code must import only from here.
// syncedRepository.js wraps the IndexedDB implementation with Firebase
// cloud-sync side effects (see src/sync/syncEngine.js) while keeping the same
// function signatures and local-first behavior.
export * from './syncedRepository.js'
