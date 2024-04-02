// @ts-nocheck
import { useState, useEffect } from "react";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks"
import { motion } from "framer-motion"

import { ScrollArea, Card, Button, TextField, Spinner, Inset, IconButton, ContextMenu, } from "@radix-ui/themes";

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { ComputerDesktopIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Marquee from "react-fast-marquee";

import LoginButton from "./components/LoginButton";
// import Feedback from "./components/Feedback";

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

function Home() {
  const spaces = useLiveQuery(() => db.spaces.toArray(), []);
  const [activeTab, setActiveTab] = useState(db.spaces[0]?.id);
  const [fetching, setFetching] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [emptyPrompt, setEmptyPrompt] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [componentCode, setComponentCode] = useState('<></>');

  const updateUI = async () => {
    setFetching(true);
    const msg_prompt = prompt !== '' ? prompt : emptyPrompt;

    if (msg_prompt === '') {
      setFetching(false);
      return;
    }

    setPrompt('')
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
    const base_url = 'https://api.spaces.fun'
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


      db.spaces.update(activeTab, { component: comp })
    }

    setFetching(false);
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
      db.spaces.add({ title: 'new', component: '<></>' })
    }

    if (activeTab === undefined && spaces?.length > 0) {
      setActiveTab(spaces[0]?.id)
    }


  }, [spaces])

  const handleChange = (event) => {
    setPrompt(event.target.value);
  };

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
    console.log(spaces, activeTab)
  }
  const darkmode = "bg-slate-900 opacity-80"

  return (
    <section className={`task-home bg-grey-900 w-screen h-screen lg:max-w-full p-2 flex flex-col max-h-screen `}>

      <div className="absolute flex flex-col items-center justify-center h-screen w-screen bg-indigo-400 bg-opacity-40 backdrop-blur-lg z-50 right-0 top-0 sm:hidden ">
        <ComputerDesktopIcon className="h-16 w-16 text-white" />
        <h1 className="text-white font-serif text-2xl color-purple-200">pls open on desktop</h1>
      </div>

      <div variant="surface" className="flex flex-row justify-between items-center p-2">

        <div className="">
          <a className="btn btn-ghost normal-case text-lg" onClick={debugeroo}>spaces.</a>
        </div>

        <div className="flex flex-row">
          <TextField.Root placeholder="wassup?"
            variant="surface"
            size="3"
            value={prompt}
            onChange={handleChange}
            className="w-96"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateUI()
              }
            }}
          >
            <TextField.Slot >
            </TextField.Slot>
            <TextField.Slot >
              <Button variant="ghost" size={"3"} onClick={updateUI} color="iris" loading={fetching} className="font-serif" highContrast>
                create
              </Button>
            </TextField.Slot>
          </TextField.Root>
        </div>

        <div className="flex flex-row items-center gap-2">
          
          <LoginButton />
          {/* <Feedback /> */}
          {/* <Button onClick={() => setShowEditor(!showEditor)} className="font-mono" variant="outline" highContrast={true}> code </Button> */}
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
      </div>
      <div className="flex flex-row flex-1 text-black" >


        <LiveProvider code={componentCode} scope={{ useState, Button, Card, InputField, useEffect, Dexie }}>
          <Card variant="classic" variant="classic" className="flex-1 flex flex-col items-center lg:px-56 border-nose" >

            {fetching && <Spinner size={"3"} className="mt-20" />}

            {(componentCode == '<></>' && fetching === false) && <div>

              <textarea placeholder="create anything..."
                value={prompt}
                onChange={handleChange}
                type="textarea"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateUI()
                  }
                }}
                className="w-[1/2] h-96 focus:bg-white focus:bg-opacity-0 bg-white bg-opacity-0 focus:outline-none font-serif text-4xl text-white placeholder:text-white mt-20 resize-none"
              />

              <Marquee pauseOnHover>
                {examples.map((ex) => {
                  return (<button onClick={() => setPrompt(ex)} 
                  key={ex}
                  className="text-pink-950 font-serif bg-pink-100 p-2 rounded-sm bg-opacity-50 mx-4 opacity-80 hover:opacity-100">
                    {ex}
                  </button>)
                })
              }
              </Marquee>

            </div>}
            <LiveError />
            <LivePreview />
          </Card>

          {showEditor &&
            <Card className="min-w-[64px] max-w-lg ml-2 font-mono">
              <Inset>
                <ScrollArea style={{ height: '750px' }}>
                  <LiveEditor onChange={(e) => setComponentCode(e)} />
                </ScrollArea>
              </Inset>
            </Card>
          }
        </LiveProvider>
      </div>

      <div className="font-mono text-sm ml-2 absolute bottom-3 opacity-60 hover:opacity-100 right-4">
        <p>powered by basic.id ~ v0.16</p>
      </div>
    </section>
  );
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
  if (lines[0].includes('jsx')) {
    lines.shift();
    lines.pop();
  }
  return lines.join('\n');
}


function PasswordScreen() {
  const [passInput, setPassInput] = useState('');
  const handleChange = (event) => {
    setPassInput(event.target.value);
  };

  const handleSubit = () => {
    if (passInput === 'gtfol') {
      localStorage.setItem('spaces_pw', 'gtfol');
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
          onClick={()=>{ 
          window.open("https://airtable.com/appGmjWlr4Af06Q7h/pagUTO8HKMWMSWZpP/form", "_blank")
        }}>sign up for beta access
        <SparklesIcon className="h-8 w-8 text-white" /></Button>


     
  
   
        <Card className="m-2 max-w-md mt-8 bg-slate-950 bg-opacity-75" variant="classic">

        <TextField.Root placeholder="invite code" className="w-full font-mono mb-4" type="password" value={passInput} onChange={handleChange}
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
    if (pass === 'gtfol') {
      setShowPassword(false);
    }
    setLoading(false);
  }, [])

  return (
    <div className="App"
      style={{
        backgroundImage: `url('./bg.webp')`,
        // backgroundImage: `url('./room.jpg')`,
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
