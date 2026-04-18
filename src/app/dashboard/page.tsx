import { Dashboard } from '../components/Dashboard';
import { PinGuard } from '../components/PinGuard';

export default function DashboardPage() {
  return (
    <PinGuard>
      <Dashboard />
    </PinGuard>
  );
}