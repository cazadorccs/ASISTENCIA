import { AttendanceProvider } from './context/AttendanceContext';
import { Dashboard } from './components/attendance/Dashboard';

function App() {
  return (
    <AttendanceProvider>
      <Dashboard />
    </AttendanceProvider>
  );
}

export default App;
