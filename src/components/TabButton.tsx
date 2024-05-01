import { useState } from "react";
import { Button, TextField, ContextMenu } from "@radix-ui/themes";

// @ts-ignore
export function TabButton({ tabId, tabTitle, activeTab, setActiveTab, updateTabTitle, archiveTab }) {
  const [newName, setNewName] = useState('');
  const handleChange = (event : any) => {
    setNewName(event.target.value);
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Button key={tabId} variant={tabId === activeTab ? "surface" : "soft"} onClick={() => setActiveTab(tabId)} className="text-white font-mono">{tabTitle}</Button>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="font-mono" variant="soft">
        <TextField.Root placeholder={tabTitle} value={newName} onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateTabTitle(tabId, newName);

            }
          }}
          className="mb-2"></TextField.Root>
        <ContextMenu.Item onClick={() => updateTabTitle(tabId, newName)}>update name</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onClick={() => archiveTab(tabId)}>archive</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
