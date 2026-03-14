import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import GlobalMatchNotification from './components/GlobalMatchNotification';
import Footer from './components/Footer';
import ThemeBackground from './components/ThemeBackground';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminStudentDetailsPage from './pages/AdminStudentDetailsPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminAIImportPage from './pages/AdminAIImportPage';
import AdminMatchStatsPage from './pages/AdminMatchStatsPage';
import MatchPage from './pages/MatchPage';
import FarewellPage from './pages/FarewellPage';

function App() {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-transparent bg-mesh flex flex-col relative z-10 transition-colors duration-1000">
        <ThemeBackground />
        <ToastContainer
          position="top-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {!isAuthPage && <Navbar />}
        {!isAuthPage && <GlobalMatchNotification />}
        
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.onboarded ? '/dashboard' : '/onboarding'} />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.onboarded ? '/dashboard' : '/onboarding'} />} />
          
          <Route path="/onboarding" element={
            <ProtectedRoute requireOnboarded={false}>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/exam" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/match" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/farewell" element={<FarewellPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/questions" element={<AdminRoute><AdminQuestionsPage /></AdminRoute>} />
          <Route path="/admin/student/:id" element={<AdminRoute><AdminStudentDetailsPage /></AdminRoute>} />
          <Route path="/admin/ai-import" element={<AdminRoute><AdminAIImportPage /></AdminRoute>} />
          <Route path="/admin/matches" element={<AdminRoute><AdminMatchStatsPage /></AdminRoute>} />

          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : (user.onboarded ? '/dashboard' : '/onboarding')) : '/login'} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {!isAuthPage && <Footer />}
      </div>
    </ThemeProvider>
  );
}

export default App;
