//@ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea, Card, Button, Spinner, Inset, TextField, Checkbox, Flex } from "@radix-ui/themes";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

import { useAppContext } from "../utils/AppContext";
import PromptBox from "./PromptBox";
import Dexie from "dexie";


import { db } from "../App";

const InputField = (props) => {
  return <TextField.Root {...props} />
}

function CardComponent({
  componentCode, setComponentCode, isDark, updateUI, showEditor, fetching, fetchingTab, activeTab }) {

  const [emptyPrompt, setEmptyPrompt] = useState('');
  const { theme } = useAppContext();
  const handleChange = (e) => {
    setEmptyPrompt(e.target.value);
  };

  const saveCode = () => {
    db.spaces.update(activeTab, { component: componentCode });
  };


  return (
    <LiveProvider code={componentCode}
      //  noInline={true}
      // transformCode={(code) => {
      //   return code;
      // }}
      scope={{
        useState, useEffect, Dexie, useRef, useCallback,
        Button, Card, InputField, Checkbox, Flex
      }}>

      <Card variant="classic" className="flex-1 flex flex-col items-center pt-14" key={activeTab}>

        {(componentCode != '<></>' && fetching === false) &&
          <div className="absolute top-0 w-full p-1 flex flex-row justify-center bg-slate-800 bg-opacity-30 ">
            <PromptBox updateUI={updateUI} fetching={fetching} />
          </div>}

        <LiveError />

        <div className={`w-full flex-1 max-w-lg ${isDark ? "text-white" : "text-black"}`}>
          <ScrollArea className="flex-1 w-full " style={{ height: 'calc(100vh - 200px)' }}>
            <LivePreview />
          </ScrollArea>
        </div>


        {(fetching === true && activeTab === fetchingTab) &&
          <div className="w-full h-full absolute bg-slate-800 bg-opacity-10 top-0 backdrop-blur-sm  flex justify-center">
            <Spinner size={"3"} className={`mt-10 ${theme.appearance == "dark" ? "text-white" : "text-black"}`} />
          </div>}


      </Card>
      {showEditor &&
        <Card className="min-w-[64px] max-w-lg ml-2 font-mono">
          <Inset>
            <ScrollArea style={{ height: '750px' }}>
              <Button onClick={saveCode} className="absolute right-2 top-2 font-mono" variant="outline" highContrast={true}> save </Button>

              <LiveEditor onChange={(e) => setComponentCode(e)} />
            </ScrollArea>
          </Inset>
        </Card>}

    </LiveProvider>

  );
}

export default CardComponent;