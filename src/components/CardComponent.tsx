//@ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea, Card, Button, Spinner, Inset, TextField, Checkbox, Flex } from "@radix-ui/themes";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

import { useAppContext } from "../utils/AppContext";
import PromptBox from "./PromptBox";
import Dexie from "dexie";


// import { db } from "../App";

const InputField = (props) => {
  return <TextField.Root {...props} />
}

function removeWrapper(str) {
  const lines = str.split('\n');
  // console.log(lines)
  if (lines[0].includes('jsx')) {

    lines.shift();
    lines.pop();
  }
  return lines.join('\n');
}

function CardComponent({
  id, 
  value,
  componentCode,
  setComponentCode,
  updateUI,
  showEditor,
  fetchingCard, 
  setFetchingCard,
  fetching,
  fetchingTab,


  activeTab, 
  updateCard
}) {

  const [emptyPrompt, setEmptyPrompt] = useState('');
  const [comp_code, setCompCode] = useState(componentCode);
  const [loading, setLoading] = useState(false);
  const { theme } = useAppContext();

  const handleChange = (e) => {
    setEmptyPrompt(e.target.value);
  };

  const saveCode = () => {
    // db.spaces.update(activeTab, { component: componentCode });
  };

  const updateCompUI = async ({prompt} : {prompt : string}) => {


    // console.log({id, value, activeTab})
    // return
    
    // setFetching(true);
    // setFetchingTab(activeTab)
    // const current_tab = activeTab
    const msg_prompt = prompt

    if (msg_prompt === '') {
      console.log('empty prompt')
      // setFetching(false);
      // setFetchingTab('')
      return;
    }
    setFetchingCard(id);

    const messages = [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "hi"
          }
        ]
      },
      {
        "role": "assistant",
        "content": [
          {
            "type": "text",
            "text": componentCode ? componentCode : "<></>"
          }
        ],
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": msg_prompt
          }
        ]
      },
    ]

    // console.log({ messages })

    const base_url = import.meta.env.PROD ? 'https://api.spaces.fun' : 'http://localhost:3003'
    const resp = await fetch(`${base_url}/generate`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      }
    ).then((response) => {
      return response.json();
    }).catch((err) => {
      console.log(err);
    })

    if (resp.resp) {
      const comp = removeWrapper(resp.resp.content[0].text);
      setCompCode(comp);

      const currentCard = value;
      const updatedCard = { ...currentCard, component_code: comp }

      updateCard(id, updatedCard)
    }

 
    setFetchingCard('')
    setEmptyPrompt('');
    // console.log(resp);
  }


  return (
    <LiveProvider code={comp_code}
      //  noInline={true}
      // transformCode={(code) => {
      //   return code;
      // }}
      scope={{
        useState, useEffect, Dexie, useRef, useCallback,
        Button, Card, InputField, Checkbox, Flex
      }}>

      <Card variant="classic" className=" flex-1 flex flex-col items-center pt-14" key={id}>

        {(componentCode != '<></>' && fetching === false) &&
          <div className="absolute top-0 w-full p-1 flex flex-row justify-center bg-slate-800 bg-opacity-30 ">
            <PromptBox updateUI={updateCompUI} fetching={fetching} />
          </div>
        }

        <LiveError />

        <div className={`w-full flex-1 max-w-lg ${theme.appearance == "dark" ? "text-white" : "text-black"}`}>
          <ScrollArea className="flex-1 w-full " style={{ height: 'calc(100vh - 200px)' }}>
            <LivePreview />
          </ScrollArea>
        </div>


        {(fetchingCard == id) &&
          <div className="w-full h-full absolute bg-slate-800 bg-opacity-10 top-0 backdrop-blur-sm  flex justify-center">
            <Spinner size={"3"} className={`mt-10 ${theme.appearance == "dark" ? "text-white" : "text-black"}`} />
          </div>}


      </Card>

      {/* {showEditor && */}
        {/* <Card className="min-w-[64px] max-w-lg ml-2 font-mono">
          <Inset>
            <ScrollArea style={{ height: '750px' }}>
              <Button onClick={saveCode} className="absolute right-2 top-2 font-mono" variant="outline" highContrast={true}> save </Button>

              <LiveEditor  onChange={(e) => setComponentCode(e)} />
            </ScrollArea>
          </Inset>
        </Card> */}
        {/* } */}

    </LiveProvider>

  );
}

export default CardComponent;