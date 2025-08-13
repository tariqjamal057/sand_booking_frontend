import React, { useState } from 'react';

export default function NavigationTabs() {
  const [tabs, setTabs] = useState([]);
  const addTab = () => setTabs([...tabs, { id: Date.now(), label: `Session ${tabs.length + 1}` }]);
  const removeTab = (id) => setTabs(tabs.filter(tab => tab.id !== id));

  return (
    <div className="p-4">
      <button onClick={addTab} className="bg-blue-500 text-white px-4 py-2 rounded">Add New Tab</button>
      <div className="flex flex-wrap mt-4">
        {tabs.map(tab => (
          <div key={tab.id} className="bg-gray-100 border rounded px-4 py-2 flex items-center m-2">
            {tab.label}
            <button onClick={() => removeTab(tab.id)} className="ml-2 text-red-500">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}