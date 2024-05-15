// @ts-nocheck
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks"
import { motion } from "framer-motion"
import { Resizable } from 're-resizable';
import {
  Card, Flex, Button, TextField,
  Checkbox, IconButton, TextArea,
  Inset,
} from "@radix-ui/themes";
import { ComputerDesktopIcon, SparklesIcon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAppContext } from "./utils/AppContext";

import LoginButton from "@/components/LoginButton";
import DesignToolbar from "@/components/DesignToolbar";
import CreatePromptPage from "@/components/CreatePromptPage";
import Feedback from "@/components/Feedback";
import { TabButton } from "./components/TabButton";
import ChatUI from "@/components/ChatUI";
import CardComponent from "@/components/CardComponent";

// import { Tldraw } from 'tldraw'
// import 'tldraw/tldraw.css'

// import ReactFlow, { Controls, Background, Handle, Position, NodeResizer } from 'reactflow';
// import 'reactflow/dist/style.css';


const invite_codes = ['gtfol', 'YCS24', 'ycs24', 'aiux']
const VERSION = '0.28'

const VERSION_UPDATES = { 
  '0.28': { 
    type: 'auto',
  }
}


const DEV = ({ children }) => {
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


const SingleCard = ({id, value, deleteCard, activeTab, updateCard, fetchingCard, setFetchingCard }) => {

  if (value.type == 'component') {
    return (
      <CardComponent
        key={id}
        id={id}
        value={value}
        showEditor={false}
        updateCard={updateCard}
        fetchingCard={fetchingCard}
        setFetchingCard={setFetchingCard}
        componentCode={value.component_code}

        
        fetching={false}
        isDark={true}
        updateUI={() => { }}
        setComponentCode={() => { }}
        fetchingTab={''}
        activeTab={activeTab}
      />
    )
  }

  if (value.type == 'text') {
    return (
      <Card className=" bg-slate-900 p-0">

        <div className="w-full p-1 px-2 flex flex-row justify-between items-center bg-slate-600 bg-opacity-30 ">
          <p className="text-white">{value.title}</p>
          <IconButton className=" rounded-full w-5 h-5 opacity-30 hover:opacity-100" color="red" variant="soft" onClick={() => deleteCard(id)} > <XMarkIcon width={18} /> </IconButton>
        </div>
        <div className="p-2">

          <textarea className="w-full h-64 bg-slate-800 bg-opacity-0 text-white outline-none" placeholder="type anything..." />
        </div>
      </Card>
    )
  }

  return (
    <Card className=" bg-slate-900 rounded-md p-4">

      <p>oopsy. 404 not found.</p>
      {/* <input className="w-full bg-slate-800 bg-opacity-0 text-white outline-none" placeholder="type anything..." />

      <Button >create app</Button>

      <Button >empty page</Button>
      <Button onClick={() => deleteCard(id)} >delete</Button> */}

    </Card>
  )
}



function Home() {
  const { theme } = useAppContext()
  const spaces = useLiveQuery(() => db.spaces.toArray(), []);
  const [activeTab, setActiveTab] = useState(db.spaces[0]?.id);
  const [fetching, setFetching] = useState(false);

  const [fetchingTab, setFetchingTab] = useState('')
  const [fetchingCard, setFetchingCard] = useState('')

  const [showEditor, setShowEditor] = useState(false);
  const [componentCode, setComponentCode] = useState('<></>');

  const [showChat, setShowChat] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const updateUI = async ({ prompt = '' }: { prompt: string }) => {

    setFetching(true);
    setFetchingTab(activeTab)
    const current_tab = activeTab
    const msg_prompt = prompt

    if (msg_prompt === '') {
      console.log('empty prompt')
      setFetching(false);
      setFetchingTab('')
      return;
    }
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

    console.log({ messages })
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

      newCard({ type: 'component', component_code: comp })
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
      db.spaces.add({
        title: 'welcome', cards: {
          welcome: {
            component_code: WelcomeComponent,
            type: 'component',
            title: 'welcome'
          }
        }
      })
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

  const newCard = (card = undefined) => {
    const timestamp = Date.now();
    const randomId = timestamp
    const curr_space_index = spaces.findIndex((space) => space.id === activeTab)
    // const key = 'card' + (Object.keys(spaces[curr_space_index].cards).length  + 1)
    const key = 'card' + randomId

    const cards = spaces[curr_space_index].cards

    const newCard = card ? card : { type: 'text', title: 'untitled.txt' }

    console.log({ new: card })
    const newcards = {
      ...cards,
      [key]: newCard
    }
    console.log(cards, newcards)
    // db.spaces.update(activeTab, { cards: { ...cards , [key]: { type: 'text', title: 'untitled.txt' } } })
    db.spaces.update(activeTab, { cards: { ...newcards } })

  }

  const updateCard = (cardId, newCard) => {
    const curr_space_index = spaces.findIndex((space) => space.id === activeTab)
    const cards = spaces[curr_space_index].cards
    const updatedCard = { ...cards[cardId], ...newCard }
    db.spaces.update(activeTab, { cards: { ...cards, [cardId]: updatedCard } })
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
    setActiveTab(spaces[0]?.id)
  }

  const curr_space_index = spaces?.findIndex((space) => space.id === activeTab)
  const debugeroo = () => {
    console.log(spaces)

    // Object.entries(spaces[curr_space_index]?.cards)?.map(([key, value]) => {
    //   console.log({ key, value })
    // })



  }

  // const darkmode = `bg-slate-900 `
  const darkmode = `bg-gray-950`

  const isDark = theme.appearance === 'dark';

  const nodes = [
    {
      id: 'node-0', type: 'tableNode', position: { x: 0, y: 50 }, data: { label: 'Node 0' }
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
    <section className={`task-home  w-screen h-screen lg:max-w-full p-2 flex flex-col max-h-screen ${isDark ? darkmode : ''} bg-opacity-90  `}>
      <div className="absolute flex flex-col items-center justify-center h-screen w-screen bg-indigo-400 bg-opacity-40 backdrop-blur-lg z-50 right-0 top-0 sm:hidden ">
        <ComputerDesktopIcon className="h-16 w-16" />
        <h1 className="text-white font-serif text-2xl color-purple-200">pls open on desktop</h1>
      </div>

      <div variant="surface" className={`  flex flex-row justify-between items-center p-2`}>
        <div className="flex gap-2 items-center">
          <Button variant="soft" className={` text-white  font-bold normal-case text-l`} onClick={debugeroo}>spaces.fun</Button>
           <p className="font-mono text-sm opacity-50">alpha v{`${VERSION}`}</p>
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
        <Button variant="soft" className="text-white" onClick={() => newTab()}> + </Button>

        <div className="absolute right-4 gap-2 flex">
          {/* <Button onClick={() => setShowChat(!showChat)} className="font-mono" variant="outline" highContrast={true}> chat </Button> */}
          {/* <Button onClick={() => setShowEditor(!showEditor)} className="font-mono" variant="outline" highContrast={true}> code </Button> */}
          {/* <Button variant="surface" className="" onClick={() => newCard()}>add page +</Button> */}
        </div>

      </div>
      <div className="flex flex-row flex-1 overflow-scroll  rounded p-2 justify-center" >

        {curr_space_index > -1 && Object.entries(spaces[curr_space_index]?.cards).length === 0 ?
          <CreatePromptPage updateUI={updateUI} fetching={fetching} newCard={newCard} />
          :
          <div className="flex-1 flex justify-center overflow-x-auto gap-4">
            {(curr_space_index > -1) && Object.entries(spaces[curr_space_index]?.cards)?.map(([key, value]) => {
              return ( 
                <Resizable minWidth={value.type == "component" ? 600 : 300} className="flex-none w-fit max-w-full min-w-96 h-full" key={`${activeTab}-${key}`} >
                <SingleCard 
                    id={key} 
                    value={value} 
                    deleteCard={deleteCard}
                    updateCard={updateCard}
                    fetchingCard={fetchingCard}
                    setFetchingCard={setFetchingCard}

                    activeTab={activeTab}
                  />
               </Resizable>
              )
            })}
            {/* // <ReactFlow nodes={nodes} nodeTypes={nodeTypes} >
            //   <Background />
            // </ReactFlow> */}


            {/* <Button variant="surface" className="" onClick={()=>setShowNew(true)}>add page +</Button> */}
            {/* { showNew &&  
          <Card className="w-96 bg-slate-900 p-4">
            <p className="text-white">this is a card</p>
          </Card>
          } */}

          </div>
        }



      </div>

      {/* <footer className="font-mono text-sm ml-2 absolute bottom-1 opacity-60 hover:opacity-100 left-2">
        <p>alpha ~ v{`${VERSION}`}</p>
      </footer> */}

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

const Test = () => {
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
}

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

function UpdateScreen({handleUpdate}) { 
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen ">
      <div className="flex flex-col items-center text-center ">
        <h1 className="font-serif font-bold text-pink-950"> spaces.fun  </h1>

        <Card className="m-2 max-w-md mt-8 bg-slate-950 bg-opacity-75" variant="classic">
          <p className="text-white font-mono text-sm ">new update available! click below to upgrade to the latest version</p>
          <Button variant="solid w-full" size={"3"} onClick={handleUpdate} color="iris" className="font-serif" highContrast> Update </Button>
        </Card>

      </div>
    </div>
  )
}

function App() {
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);
  const [showUpdateScreen, setShowUpdateScreen] = useState(false);
  
  useEffect(() => {
    const pass = localStorage.getItem('spaces_pw');
    if (invite_codes.includes(pass)) {
      setShowPassword(false);
    }

    const current_version = localStorage.getItem('spaces_version') 
    
    if (current_version == VERSION) {
      console.log("VERSION:", current_version, "~ latest")
      setIsUpdated(true);
    } else { 
      console.log("VERSION:" ,current_version, "~ out of date! upgrade:", VERSION)
      
      if (VERSION_UPDATES[VERSION]?.type === 'auto') {
        handleUpdate()
      } else if (VERSION_UPDATES[VERSION]?.type === 'manual') {
        setShowUpdateScreen(true)
      } else if (VERSION_UPDATES[VERSION]?.type === 'background') {
        // display optional update screen
      }
    }
    
    setLoading(false);
  }, [])

  const handleUpdate = () => {
    console.log("updating to version:", VERSION)
    // do something to handle update

    // on successful upgrade:
    localStorage.setItem('spaces_version', VERSION);
    setIsUpdated(true);
    setShowUpdateScreen(false);
  }


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
          { showUpdateScreen ?
            <UpdateScreen handleUpdate={handleUpdate} />
            : 
          <>
            {showPassword ?
              <PasswordScreen /> :
              <Home />
            }
          </>
          }
        </>
      }

    </div>
  );
}

export default App;
