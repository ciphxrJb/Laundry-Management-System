import { Settings } from '../components/Settings';
import { PinGuard } from '../components/PinGuard';

export default function SettingsPage() {
  return (
    <PinGuard>
      <Settings />
    </PinGuard>
  );
}
