// @ts-nocheck
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks"
import { motion } from "framer-motion"
import { Resizable } from 're-resizable';
import {
  Card, Flex, Button, TextField,
  Checkbox, IconButton, TextArea,
} from "@radix-ui/themes";
import { ComputerDesktopIcon, SparklesIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";

import { useAppContext } from "./utils/AppContext";

import LoginButton from "@/components/LoginButton";
import DesignToolbar from "@/components/DesignToolbar";
import CreatePromptPage from "@/components/CreatePromptPage";
import Feedback from "@/components/Feedback";
import { TabButton } from "./components/TabButton";
import ChatUI from "@/components/ChatUI";
import CardComponent  from "@/components/CardComponent";


// import ReactFlow, { Controls, Background, Handle, Position, NodeResizer } from 'reactflow';
// import 'reactflow/dist/style.css';


const invite_codes = ['gtfol', 'YCS24', 'ycs24', 'aiux']
const VERSION = '0.27'

const DEV = ({children}) => {
  if (import.meta.env.DEV) {
    return children
  }
  return <></>
}

export const db = new Dexie('space');
db.version(1).stores({
  spaces: '++id', // Primary key and indexed props,
  space_data: '++id'
});


const SingleCard = ({id, value, deleteCard }) => { 

  if (value.type == 'component') {
    return (
    <CardComponent
      key={id}
      componentCode={value.component_code}
      fetching={false}
      isDark={true}
      updateUI={()=>{}}
      showEditor={false}
      setComponentCode={()=>{}}
      fetchingTab={''}
      activeTab={''}
    />
    )
  }

  return (
    <Card className=" bg-slate-900 rounded-md p-4">
      <h1 className="text-white">{id}</h1>
      <p className="text-white">type: {value.type}</p>
      <button onClick={()=>console.log({id, value})}>hi</button>

      <button onClick={()=>deleteCard(id)}>del</button>

      {/* <CreatePromptPage /> */}

    </Card>
  )
}



function Home() {
  const { theme } = useAppContext()
  const spaces = useLiveQuery(() => db.spaces.toArray(), []);
  const [activeTab, setActiveTab] = useState(db.spaces[0]?.id);
  const [fetching, setFetching] = useState(false);
  const [fetchingTab, setFetchingTab] = useState('')


  const [emptyPrompt, setEmptyPrompt] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [componentCode, setComponentCode] = useState('<></>');
  const [showChat, setShowChat] = useState(false);

  const updateUI = async ({ prompt = '' }: { prompt: string }) => {

    setFetching(true);
    setFetchingTab(activeTab)
    const current_tab = activeTab
    const msg_prompt = prompt !== '' ? prompt : emptyPrompt;

    if (msg_prompt === '') {
      setFetching(false);
      setFetchingTab('')
      return;
    }

    setEmptyPrompt('');
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
            "text": componentCode
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
      setFetching(false);
    })

    if (resp.resp) {
      const comp = removeWrapper(resp.resp.content[0].text);
      setComponentCode(comp);
      setActiveTab(current_tab)

      db.spaces.update(current_tab, { component: comp })
    }

    setFetching(false);
    setFetchingTab('')
    console.log(resp);
  }

  useEffect(() => {
    async function setSpace() {
      const space = await db.spaces.get(activeTab);
      if (space) {
        setComponentCode(space.component)
      }
    }
    if (activeTab) {
      setSpace()
    }
  }, [activeTab])

  useEffect(() => {
    if (spaces?.length === 0) {
      db.spaces.add({ title: 'welcome', cards: { 
        welcome: { 
          component_code: WelcomeComponent,
          title: 'welcome'
        }
      } })
    }

    if (activeTab === undefined && spaces?.length > 0) {
      setActiveTab(spaces[0]?.id)
    }
  }, [spaces])


  const newTab = () => {
    const timestamp = Date.now();
    const randomId = timestamp
    const key = 'untitled' + spaces.length
    db.spaces.add({ title: key, id: randomId, cards: {} })
    setActiveTab(randomId);
  }

  const newCard = () => { 
    const timestamp = Date.now();
    const randomId = timestamp
    const curr_space_index = spaces.findIndex((space) => space.id === activeTab)
    const key = 'card' + Object.keys(spaces[curr_space_index].cards).length
    const cards = spaces[curr_space_index].cards    
    db.spaces.update(activeTab, { cards: { ...cards , [key]: { type: '', title: 'untitled card' } } })
  }

  const deleteCard = (cardId) => {
    const curr_space_index = spaces.findIndex((space) => space.id === activeTab)
    const cards = spaces[curr_space_index].cards
    delete cards[cardId]
    db.spaces.update(activeTab, { cards: cards })
  }

  const updateTabName = (tabId, newName) => {
    db.spaces.update(tabId, { title: newName })
  }

  const archiveTab = (tabId) => {
    db.spaces.delete(tabId)
  }
  
  const curr_space_index = spaces?.findIndex((space) => space.id === activeTab)
  const debugeroo = () => {
    console.log(spaces)

    // Object.entries(spaces[curr_space_index]?.cards)?.map(([key, value]) => {
    //   console.log({ key, value })
    // })

    console.log(
      
    )

   
  }

  const darkmode = `bg-slate-900 `
  const isDark = theme.appearance === 'dark';

  const nodes = [
    { id: 'node-0', type: 'tableNode', position: { x: 0, y: 50 }, data: { label: 'Node 0' }
    },
    {
      id: 'node-1',
      type: 'componentNode',
      position: { x: 350, y: 50 },
      data: { 
        label: 'Node 1',
        componentCode: componentCode,
        fetching: fetching,
        isDark: isDark,
        updateUI: updateUI,
        showEditor: showEditor,
        setComponentCode: setComponentCode,
        fetchingTab: fetchingTab,
        activeTab: activeTab,
       },
    },
  ];

  return (
    <section className={`task-home  w-screen h-screen lg:max-w-full p-2 flex flex-col max-h-screen ${isDark ? darkmode : ''} bg-opacity-80  `}>
      <div className="absolute flex flex-col items-center justify-center h-screen w-screen bg-indigo-400 bg-opacity-40 backdrop-blur-lg z-50 right-0 top-0 sm:hidden ">
        <ComputerDesktopIcon className="h-16 w-16" />
        <h1 className="text-white font-serif text-2xl color-purple-200">pls open on desktop</h1>
      </div>

      <div variant="surface" className={`  flex flex-row justify-between items-center p-2`}>
        <div className="">
          <Button variant="soft" className={` text-white  font-bold normal-case text-l`} onClick={debugeroo}>spaces.fun</Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Feedback />
          <DesignToolbar />
          <LoginButton />
        </div>
      </div>

      <div className="flex justify-start items-center p-1 gap-2 text-white">
        {spaces?.map((tab) => {
          return <TabButton
            key={tab.id}
            tabId={tab.id}
            tabTitle={tab.title}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            updateTabTitle={updateTabName}
            archiveTab={archiveTab}
          />
        })}
        <Button variant="soft" className="text-white" onClick={newTab}> + </Button>

        {/* <div className="absolute right-4 gap-2 flex">
          <Button onClick={() => setShowChat(!showChat)} className="font-mono" variant="outline" highContrast={true}> chat </Button>
          <Button onClick={() => setShowEditor(!showEditor)} className="font-mono" variant="outline" highContrast={true}> code </Button>
        </div> */}

        <DEV><button onClick={newCard}>card+</button></DEV>
          
      </div>
      <div className="flex flex-row flex-1 overflow-scroll  rounded p-2 justify-center" >

        {curr_space_index > -1 && Object.entries(spaces[curr_space_index].cards).length === 0 ?
          <CreatePromptPage updateUI={updateUI} fetching={fetching} />
          :
          // <ReactFlow nodes={nodes} nodeTypes={nodeTypes} >
          //   <Background />
          // </ReactFlow>

          <div className=" flex-1 flex overflow-x-auto gap-4">
            {(curr_space_index > -1) && Object.entries(spaces[curr_space_index]?.cards)?.map(([key, value]) => {
              return ( 
              <Resizable className="flex-none w-fit max-w-full min-w-96 h-full" key={key} >
                <SingleCard 
                    id={key} 
                    value={value} 
                    deleteCard={deleteCard}
                />
               </Resizable>
              )
            })}
          </div>
        }

        {showChat &&
          <Card className="w-[400px] ml-2 font-mono">
            <ChatUI />
          </Card>
        }

      </div>

      <footer className="font-mono text-sm ml-2 absolute bottom-1 opacity-60 hover:opacity-100 left-2">
        <p>alpha ~ v{`${VERSION}`}</p>
      </footer>

    </section>
  );
}

const WelcomeComponent = `function WelcomeScreen () { 
  return (
    <div className="flex flex-col  justify-center w-full bg-slate-700 p-4 rounded-md bg-opacity-20">

      <h1 className="font-serif text-4xl">welcome to spaces</h1>
      <p className="font-serif text-lg pb-2">an infnite workspace to create personal tools ~ to get started: </p>
      <p className="font-serif text-lg">1. create a new tab to get started (the plus icon) </p>
      <p className="font-serif text-lg">2. type in the kind of app you want, or begin with the examples</p>
      <p className="font-serif text-lg">3. there are some things it cannot create. play around with it to test the limits</p>
      <p className="font-serif text-lg">4. after you create something, use the top bar to futher customize. try changing the look, or adding features.</p>
      <p className="font-serif text-lg">5. if something breaks, sometimes best to create a new tab and start over.</p>
      <p className="font-serif text-lg">6. have fun :) dm me with feedback pls!</p>

    </div>
  )
}`

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (error) {
      setHasError(true);
    }
  }, [error]);

  if (hasError) {
    return <h1>Something went wrong.</h1>;
  }

  return children;
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

function PasswordScreen() {
  const [passInput, setPassInput] = useState('');

  const getInviteQueryParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('invite');
  };

  useEffect(() => {
    const getInviteQueryParam = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const inv = urlParams.get('invite');
      if (invite_codes.includes(inv)) {
        setPassInput(inv);
      }
    };
    getInviteQueryParam()
  }
    , [])

  const handleChange = (event) => {
    setPassInput(event.target.value);
  };

  const handleSubit = () => {
    if (invite_codes.includes(passInput)) {
      localStorage.setItem('spaces_pw', passInput);
      window.location.reload();
    } else {
      console.log("wrong password. pls.")
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen ">
      <div className="flex flex-col items-center text-center ">
        <h1 className="font-serif font-bold text-pink-950"> an infinite workspace  </h1>




        <Button variant="solid" size={"4"} color="pink" className="mt-4 font-serif font-bold"
          onClick={() => {
            window.open("https://airtable.com/appGmjWlr4Af06Q7h/pagUTO8HKMWMSWZpP/form", "_blank")
          }}>sign up for beta access
          <SparklesIcon className="h-8 w-8 text-white" /></Button>





        <Card className="m-2 max-w-md mt-8 bg-slate-950 bg-opacity-75" variant="classic">

          <TextField.Root placeholder="invite code" className="w-full font-mono mb-4" value={passInput} onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubit()
              }
            }}
          >
            <TextField.Slot >
            </TextField.Slot>
            <TextField.Slot >
              <Button variant="ghost" size={"3"} onClick={handleSubit} color="iris" className="font-serif" highContrast>
                enter
              </Button>
            </TextField.Slot>
          </TextField.Root>

          <p className="text-white font-mono text-sm ">want an invite code? DM me your favorite productivity app on twitter <a className="text-white font-bold" href="https://x.com/razberrychai">@razberrychai</a> :) </p>
        </Card>

      </div>
    </div>
  )
}

function App() {
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const pass = localStorage.getItem('spaces_pw');
    if (invite_codes.includes(pass)) {
      setShowPassword(false);
    }
    setLoading(false);
  }, [])

  return (
    <div className="App"
      style={{
        backgroundImage: `url('./bg.webp')`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >

      {!loading &&
        <>
          {showPassword ?
            <PasswordScreen /> :
            <Home />
          }
        </>
      }

    </div>
  );
}

export default App;
