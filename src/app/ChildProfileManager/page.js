'use client';

import ChildProfileManager from '@/components/family/ChildProfileManager';

export default function ChildProfileManagerPage() {
  const dummyChild = {
    id: 'demo-child-id',
    name: 'Luna',
    age: 5,
    interests: 'Unicorns, painting',
    photoURL: ''
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Child Profile Manager</h1>
      <ChildProfileManager
        child={dummyChild}
        onUpdate={(updated) => console.log('Updated:', updated)}
        onCancel={() => console.log('Cancelled')}
      />
    </div>
  );
}
