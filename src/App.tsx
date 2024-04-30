// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks"
import { motion } from "framer-motion"

import { ScrollArea, Card, Flex, Button, TextField, Spinner, Inset, Checkbox, IconButton, ContextMenu, TextArea, } from "@radix-ui/themes";

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { ComputerDesktopIcon, SparklesIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Marquee from "react-fast-marquee";

// import { Resizable } from 're-resizable';

import LoginButton from "@/components/LoginButton";
import PromptBox from "@/components/PromptBox";
import DesignToolbar from "@/components/DesignToolbar";
import { useAppContext } from "./utils/AppContext";

// import ReactFlow, { Controls, Background } from 'reactflow';
// import 'reactflow/dist/style.css';


// import {Button}  from "@/components/button";
import Feedback from "@/components/Feedback";

const invite_codes = ['gtfol', 'YCS24', 'ycs24', 'aiux']

const db = new Dexie('space');
db.version(1).stores({
  spaces: '++id', // Primary key and indexed props,
  space_data: '++id'
});

type Applet = {
  component_code: string,
}

const examples = [
  "a todo app",
  "a pomodoro timer",
  "habit tracker",
  "app to track my finances",
]

function CardComponent({
  componentCode, setComponentCode,
  isDark, updateUI, showEditor,
  fetching, fetchingTab, activeTab, setActiveTab }) {

  const [emptyPrompt, setEmptyPrompt] = useState('');
  const {theme} = useAppContext()
  const handleChange = (e) => {
    setEmptyPrompt(e.target.value)
  }

  const saveCode = () => {
    db.spaces.update(activeTab, { component: componentCode })
  }


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

      <Card variant="classic" className="flex-1 flex flex-col items-center pt-14 " key={activeTab} >

        {(fetching === true && activeTab === fetchingTab) && <Spinner size={"3"} className={`mt-10 ${theme.appearance == "dark" ? "text-white" : "text-black"}`} />}

        {(componentCode != '<></>' && fetching === false) &&
          <div className="absolute top-2 flex flex-row">
            <PromptBox updateUI={updateUI} fetching={fetching} />
          </div>
        }

        {(componentCode == '<></>' && fetching === false) && <div>

          <textarea placeholder="create anything..."
            value={emptyPrompt}
            onChange={handleChange}
            type="textarea"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateUI({ prompt: emptyPrompt })
              }
            }}
            className="w-[1/2] h-96 focus:bg-white focus:bg-opacity-0 bg-white bg-opacity-0 focus:outline-none font-serif text-4xl text-white placeholder:text-white mt-20 ml-20 resize-none"
          />

          <Marquee pauseOnHover>
            {examples.map((ex) => {
              return (<button onClick={() => setEmptyPrompt(ex)}
                key={ex}
                className="text-pink-950 font-serif bg-pink-100 p-2 rounded-sm bg-opacity-50 mx-4 opacity-80 hover:opacity-100">
                {ex}
              </button>)
            })
            }
          </Marquee>

        </div>}

        <LiveError />

        <div className={`w-full flex-1 max-w-lg ${isDark ? "text-white" : "text-black"}`}>
          <ScrollArea className="flex-1 w-full " style={{ height: 'calc(100vh - 200px)' }}>
            <LivePreview />
          </ScrollArea>
        </div>



      </Card>

      {showEditor &&
        <Card className="min-w-[64px] max-w-lg ml-2 font-mono">
          <Inset>
            <ScrollArea style={{ height: '750px' }}>
              <Button onClick={saveCode} className="absolute right-2 top-2 font-mono" variant="outline" highContrast={true}> save </Button>

              <LiveEditor onChange={(e) => setComponentCode(e)} />
            </ScrollArea>
          </Inset>
        </Card>
      }

    </LiveProvider>

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
      setActiveTab(fetchingTab)

      db.spaces.update(activeTab, { component: comp })
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
      db.spaces.add({ title: 'welcome', component: WelcomeComponent })
    }

    if (activeTab === undefined && spaces?.length > 0) {
      setActiveTab(spaces[0]?.id)
    }
  }, [spaces])



  const newTab = () => {
    const timestamp = Date.now();
    const randomId = timestamp
    const key = 'untitled' + spaces.length
    db.spaces.add({ title: key, component: '<></>', id: randomId })
    setActiveTab(randomId);
  }

  const updateTabName = (tabId, newName) => {
    db.spaces.update(tabId, { title: newName })
  }

  const archiveTab = (tabId) => {
    db.spaces.delete(tabId)
  }

  const debugeroo = async () => {
    // console.log(window.location.hostname)
    // console.log(spaces, activeTab)
    // const notes = new Dexie('notes');
    // notes.version(1).stores({
    //   notes: '++id'
    // });

    // const allnotes = await notes.notes.toArray();
    // console.log(allnotes)

    // renderComponent()
  }

  // const renderComponent = () => { 
  //   const comp = eval(componentCode);
  // }

  const darkmode = `bg-slate-900 `
  const isDark = theme.appearance === 'dark';
  return (
    <section className={`task-home  w-screen h-screen lg:max-w-full p-2 flex flex-col max-h-screen ${isDark ? darkmode : ''} bg-opacity-80  `}>

      <div className="absolute flex flex-col items-center justify-center h-screen w-screen bg-indigo-400 bg-opacity-40 backdrop-blur-lg z-50 right-0 top-0 sm:hidden ">
        <ComputerDesktopIcon className="h-16 w-16 " />
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
      </div>
      <div className="flex flex-row flex-1 text-black " >
       

        <CardComponent
          key={activeTab}
          componentCode={componentCode}
          fetching={fetching}
          isDark={isDark}
          updateUI={updateUI}
          showEditor={showEditor}
          setComponentCode={setComponentCode}
          fetchingTab={fetchingTab}
          activeTab={activeTab}
        />

        {showChat &&
          <Card className="w-[400px] ml-2 font-mono">
            <ChatUI />
          </Card>
        }

      </div>

      <div className="font-mono text-sm ml-2 absolute bottom-3 opacity-60 hover:opacity-100 left-2">
        <p>alpha ~ v0.24</p>
      </div>
    </section>
  );
}

const WelcomeScreen = () => {
  return (
    <div className="flex flex-col  justify-center w-full bg-slate-700 p-4 rounded-md bg-opacity-20">

      <h1 className="font-serif text-4xl">welcome to spaces</h1>
      <p className="font-serif text-lg">spaces is an infinite workspace to create anything. some things to get you started</p>
      <p className="font-serif text-lg">1. create a new tab to get started (the plus icon) </p>
      <p className="font-serif text-lg">2. type in the kind of app you want, or begin with the examples</p>
      <p className="font-serif text-lg">3. there are some things it cannot create. play around with it to test the limits</p>
      <p className="font-serif text-lg">4. after you create something, use the bottom bar to futher customize. try changing the look, or adding features.</p>
      <p className="font-serif text-lg">5. if something breaks, sometimes best to create a new tab and start over.</p>
    </div>
  )
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


type ChatMessage = {
  id: number
  content: [
    {
      type: "text",
      text: string
    }
  ],
  role: string
}

const ChatUI = () => {
  const {theme} = useAppContext()
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const getData = async () => {
    const notes = new Dexie('notesDB');
    notes.version(1).stores({
      notes: '++id'
    });

    const allnotes = await notes.notes.toArray();

    const grocery = new Dexie('groceryList');
    grocery.version(1).stores({ items: '++id, name' });

    const allgrocery = await grocery.items.toArray();

    const todo = new Dexie('todos');
    todo.version(1).stores({ todos: '++id, text, dueDate' });
    const alltodo = await todo.todos.toArray();

    const final = { notes: allnotes, grocery: allgrocery, todo: alltodo }
    return final;
  }

  const handleSubmit = async () => {
    const updated = [...messages, {
      content: [{
        type: "text",
        text: newMessage
      }],
      role: 'user'
    }]

    setMessages(updated)
    setNewMessage('')


    const data = await getData();
    console.log(JSON.stringify(data))

    console.log(messages)

    const base_url = import.meta.env.PROD ? 'https://api.spaces.fun' : 'http://localhost:3003'
    const resp = await fetch(`${base_url}/ask`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: data, messages: updated })
      }
    ).then((response) => {
      return response.json();
    }).catch((err) => {
      console.log(err);
    })

    if (resp.resp) {

      const newresp = [...updated, {
        content: [{
          type: "text",
          text: resp.resp.content[0].text
        }],
        role: 'assistant'
      }]
      setMessages(newresp)
    }

    console.log(resp)

  }

  return (
    <div className={`flex flex-col items-center justify-center ${theme.appearance == "dark" ? "text-white" : "text-black"}`}>
      <h1 className="font-serif font-bold">ask anything</h1>

      <div className="flex flex-col items-center justify-center w-full">
        <ScrollArea style={{ height: '600px' }} >
          {messages.map((msg) => {
            return (
              <div key={msg.content[0].text} className="flex flex-col items-start justify-start mb-8">
                <h1 className="text-sm">{msg.role}</h1>
                <p className="text-lg font-serif">{msg.content[0].text}</p>
              </div>
            )
          })}
        </ScrollArea>
      </div>

      <div className="absolute bottom-5 flex flex-row  w-full p-2 ">
        <TextField.Root placeholder="ask anything ... " value={newMessage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
          onChange={(e) => setNewMessage(e.target.value)} className="flex-1 w-full" />
        <Button variant="solid" onClick={handleSubmit}>send</Button>
      </div>
    </div>
  )
}

const InputField = (props) => {
  return <TextField.Root {...props} />
}

function TabButton({ tabId, tabTitle, activeTab, setActiveTab, updateTabTitle, archiveTab }) {
  const [newName, setNewName] = useState('');
  const handleChange = (event) => {
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
              updateTabTitle(tabId, newName)

            }
          }}
          className="mb-2"></TextField.Root>
        <ContextMenu.Item onClick={() => updateTabTitle(tabId, newName)}>update name</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onClick={() => archiveTab(tabId)}>archive</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
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
