import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NotificationToast from './components/NotificationToast';
import { useToast } from './hooks/useToast';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import CreateEvent from './pages/CreateEvent';
import Memories from './pages/Memories';
import ManageEvents from './pages/ManageEvents';
import CheckIn from './pages/CheckIn';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <NotificationToast toasts={toasts} onRemove={removeToast} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/manage" element={<ManageEvents />} />
          <Route path="/checkin" element={<CheckIn />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;