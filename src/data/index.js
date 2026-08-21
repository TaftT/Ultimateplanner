// Public storage abstraction. UI/store code must import only from here.
// Today this re-exports the IndexedDB implementation; a future
// firestoreRepository.js implementing the same function signatures can be
// swapped in here with no changes required elsewhere in the app.
export * from './indexedDbRepository.js'
