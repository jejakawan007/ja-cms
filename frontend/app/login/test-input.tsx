'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TestInput() {
  const [value, setValue] = useState('test value');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', e.target.value);
    setValue(e.target.value);
  };

  const handleClick = () => {
    console.log('Button clicked, current value:', value);
    setValue('button clicked');
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Test Input Field</h1>
      
      <div className="space-y-2">
        <label>Test Input:</label>
        <Input
          value={value}
          onChange={handleChange}
          placeholder="Type here..."
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label>Current Value:</label>
        <div className="p-2 bg-gray-100 rounded">{value}</div>
      </div>

      <Button onClick={handleClick}>
        Change Value
      </Button>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <p className="text-sm">
          <strong>Instructions:</strong>
        </p>
        <ul className="text-sm mt-2 space-y-1">
          <li>• Try typing in the input field above</li>
          <li>• Check if the value updates in real-time</li>
          <li>• Click the button to test programmatic changes</li>
          <li>• Open browser console to see change logs</li>
        </ul>
      </div>
    </div>
  );
}

