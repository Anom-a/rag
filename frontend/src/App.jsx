import { Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/layout/TopBar';
import Chat from './components/Chat/Chat';
import Login from './components/Auth/Login';
import AdminLayout from './components/Dashboard/AdminLayout';
import Overview from './components/Dashboard/Overview';
import Documents from './components/Dashboard/Documents';
import SearchTab from './components/Dashboard/SearchTab';
import Settings from './components/Dashboard/Settings';

export default function App() {
  return (
    <div className="min-h-dvh bg-surface text-ink-700 antialiased">
      <TopBar />

      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="documents" element={<Documents />} />
          <Route path="search" element={<SearchTab />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}