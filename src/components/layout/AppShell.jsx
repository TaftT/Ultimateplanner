import { useEffect } from 'react'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { useAuthStore } from '../../store/useAuthStore.js'
import { ItemDetailModal } from '../itemdetail/ItemDetailModal.jsx'
import { CategoryManagerModal } from '../categories/CategoryManagerModal.jsx'
import { SearchModal } from '../search/SearchModal.jsx'
import { DatePickerModal } from '../dayview/DatePickerModal.jsx'
import { AuthModal } from '../auth/AuthModal.jsx'
import { UnlockPrompt } from '../auth/UnlockPrompt.jsx'
import { ReminderScheduler } from '../notifications/ReminderScheduler.jsx'
import { ToastContainer } from '../notifications/ToastContainer.jsx'
import { seedIfEmpty } from '../../data/devSeed.js'

export function AppShell({ children }) {
  const init = useEntityStore((s) => s.init)
  const initialized = useEntityStore((s) => s.initialized)
  const activeModal = useAppStore((s) => s.activeModal)
  const initAuth = useAuthStore((s) => s.init)

  useEffect(() => {
    async function bootstrap() {
      if (import.meta.env.DEV) await seedIfEmpty()
      await init()
    }
    bootstrap()
    initAuth()
  }, [init, initAuth])

  if (!initialized) {
    return <div className="app-loading">Loading…</div>
  }

  return (
    <div className="app-shell">
      {children}
      {activeModal?.type === 'itemDetail' && (
        <ItemDetailModal key={activeModal.props.itemId ?? 'new'} {...activeModal.props} />
      )}
      {activeModal?.type === 'categoryManager' && <CategoryManagerModal />}
      {activeModal?.type === 'search' && <SearchModal />}
      {activeModal?.type === 'datePicker' && <DatePickerModal {...activeModal.props} />}
      {activeModal?.type === 'auth' && <AuthModal />}
      {activeModal?.type === 'unlock' && <UnlockPrompt />}
      <ReminderScheduler />
      <ToastContainer />
    </div>
  )
}
