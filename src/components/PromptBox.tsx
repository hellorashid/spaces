import { useState } from "react";
import { Button, TextField } from "@radix-ui/themes";

const PromptBox = ({ fetching, updateUI } : { fetching: boolean, updateUI: Function}) => {
  const [prompt, setPrompt] = useState('');

  const handleChange = (event : any) => {
    setPrompt(event.target.value);
  };

  return (
    <TextField.Root
      placeholder="wassup?"
      variant="surface"
      size="3"
      value={prompt}
      onChange={handleChange}
      className="w-96 rounded-full"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          updateUI({ prompt });
        }
      }}
    >
      <TextField.Slot>
      </TextField.Slot>
      <TextField.Slot>
        <Button variant="ghost" size={"3"} onClick={() => updateUI({ prompt })} color="iris" loading={fetching} className="font-serif rounded-full" highContrast>
          update
        </Button>
      </TextField.Slot>
    </TextField.Root>
  );
};

export default PromptBox

