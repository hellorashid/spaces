import { useState } from "react";
import { Button, Spinner } from "@radix-ui/themes";
import Marquee from "react-fast-marquee";


const examples = [
  "a todo app",
  "a pomodoro timer",
  "habit tracker",
  "app to track my finances",
]

function CreatePromptPage({ updateUI, fetching, newCard } : { updateUI : Function , newCard: Function, fetching : boolean}) {
  const [emptyPrompt, setEmptyPrompt] = useState('');
  const handleChange = (e : any) => {
    setEmptyPrompt(e.target.value);
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Spinner size={"3"} className="mt-10" />
        <h1 className="font-serif text-2xl mt-2">creating...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <textarea placeholder="create anything..."
        autoFocus={true}
        value={emptyPrompt}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateUI({ prompt: emptyPrompt });
          }
        }}
        className=" w-[1/2] h-32 focus:bg-white focus:bg-opacity-0 bg-white bg-opacity-0 focus:outline-none font-serif text-4xl text-white placeholder:text-white mt-20 ml-20 resize-none" />
{/* 
      <div className="">
        <Button className="mt-4 ml-20" variant="surface" onClick={() => newCard()}>empty page + </Button>
      </div> */}

      <Marquee pauseOnHover>
        {examples.map((ex) => {
          return (<button onClick={() => setEmptyPrompt(ex)}
            key={ex}
            className="text-pink-950 mt-40 font-serif bg-pink-100 p-2 rounded-sm bg-opacity-50 mx-4 opacity-80 hover:opacity-100">
            {ex}
          </button>);
        })}
      </Marquee>

    </div>

  );
}

export default CreatePromptPage;