import { useState } from "react";
import { Button, TextField } from "@radix-ui/themes";

const PromptBox = ({ fetching, updateUI } : { fetching: boolean, updateUI: Function}) => {
  const [prompt, setPrompt] = useState('');

  const handleChange = (event : any) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = () => {
    updateUI({ prompt });
    setPrompt('');
  }

  return (
    <TextField.Root
      placeholder="customize..."
      variant="surface"
      size="2"
      value={prompt}
      onChange={handleChange}
      className="w-96 rounded-full opacity-80 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 ease-in-out outline-none"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        }
      }}
    >
      <TextField.Slot>
      </TextField.Slot>
      <TextField.Slot>
        <Button variant="ghost" size={"3"} onClick={handleSubmit} color="iris" loading={fetching} className="font-serif rounded-full" highContrast>
          update
        </Button>
      </TextField.Slot>
    </TextField.Root>
  );
};

export default PromptBox

