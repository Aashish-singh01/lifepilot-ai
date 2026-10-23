import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import TaskModal from '../tasks/TaskModal'
import GoalModal from '../goals/GoalModal'
import PlanModal from '../dashboard/PlanModal'
import SearchModal from './SearchModal'
import { Toaster } from 'sonner'

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-fade-in shadow-2xl">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopNav onOpenMobile={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Dialogs */}
      <TaskModal />
      <GoalModal />
      <PlanModal />
      <SearchModal />

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-card text-foreground border border-border shadow-elevated rounded-xl text-xs',
        }}
      />
    </div>
  )
}
