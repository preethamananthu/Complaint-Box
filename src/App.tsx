import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPage from './pages/ForgotPage'
import DashboardPage from './pages/DashboardPage'
import CreateComplaintPage from './pages/CreateComplaintPage'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import AdminPage from './pages/AdminPage'
import LandingPage from './pages/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeProvider } from './contexts/ThemeContext'

export function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<BrowserRouter>
					<div className="min-h-screen flex flex-col">
					<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route path="/forgot" element={<ForgotPage />} />

					<Route
						path="/app"
						element={
							<ProtectedRoute>
								<DashboardPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/create"
						element={
							<ProtectedRoute>
								<CreateComplaintPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/complaints/:id"
						element={
							<ProtectedRoute>
								<ComplaintDetailPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin"
						element={
							<ProtectedRoute>
								<AdminPage />
							</ProtectedRoute>
						}
					/>

					<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
					<footer className="mt-auto border-t border-white/20 bg-white/20 px-4 py-3 text-center text-xs text-muted-foreground backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
						Copyright (c) 2026 Preetham Ananthu
					</footer>
					</div>
				</BrowserRouter>
			</AuthProvider>
		</ThemeProvider>
	)
}

export default App
