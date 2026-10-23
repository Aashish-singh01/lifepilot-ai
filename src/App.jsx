import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppLayout from './components/layout/AppLayout'
import Overview from './pages/Overview'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Goals from './pages/Goals'
import FocusRoom from './pages/FocusRoom'
import Insights from './pages/Insights'
import AlexaSimulator from './pages/AlexaSimulator'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="goals" element={<Goals />} />
            <Route path="focus" element={<FocusRoom />} />
            <Route path="insights" element={<Insights />} />
            <Route path="alexa-simulator" element={<AlexaSimulator />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
