import { Customers } from '../components/Customers';
import { Suspense } from 'react';

export default function CustomersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Customers />
    </Suspense>
  );
}
