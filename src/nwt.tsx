// @ts-nocheck
import { useState, useEffect } from "react";
import "./App.css";
import { AboutModal } from "./components/AboutModal";
import UserAvatarButton from "./components/UserAvatarButton";
import { useAuth } from "./BasicAuth";

import { db, useDb } from "./Basic";

function SingleNote({ note, deleteNote }) { 
    const update = async (text) => {
        await db.notes.update(note.id, { text: text });
    }
    const [isEmpty, setIsEmpty] = useState( note.text === "")
    return (
        <div className="flex-1 w-full max-w-96 min-h-96 p-4 m-2 rounded bg-base-300 flex"
        >
            <h6 contentEditable
                id="notefield"
                // onFocus={(e) => {
                //     console.log("focus", e)
                // }}
                onKeyDown={(e) => {
                    if (!e.target.innerText == "") {
                        setIsEmpty(false)
                    } 
                    if (e.code === "Backspace" && e.target.innerText == "") { 
                        console.log("DEL", note.id)
                        deleteNote(note.id)
                    }
                    // update(e.target.innerText)
                }}
                onBlur={(e) => {
                    update(e.target.innerText)
                }}
                className="w-full text-left focus:outline-none whitespace-pre-wrap first-line:font-bold"
            >{note.text}</h6>           
            {
                isEmpty && 
                <p className="absolute font-thin opacity-60">write something...</p> 
            }
        </div>
    )
}


function Home() {
    const notes = useDb();
    // const note = useLiveQuery(() => db.notes);
    const { user, signin } = useAuth()

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.id === 'notefield') {
                // Don't do anything if the event came from an input or textarea
                return;
            }
          if (e.code === 'KeyN') { 
            newNote();
          }
        };
    
        window.addEventListener('keydown', handleKeyDown);
    
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      }, []);

    const debuggeroo = async () => {
        // const all = await db.notes.toArray()
        // signin()
        console.log(note)
        console.log(all)
    }

    const newNote = async () => {
        const randomId = Math.floor(Math.random() * 1000000)
        const id = await db.notes.add({
            id: randomId,
            created_at: new Date().toISOString(),
            text: ''
        });
        console.log(id)
    }

    const deleteNote = async (id) => {
        //todo
         await db.notes.delete(id)
        // const newNote = notes.filter( n => n.id !== id)
        // setNotes(newNote)
    }

    const handleNewShortcut = (e) => {
        if (e.code === 'KeyE') {
            newNote()
        }
    }

    return (
        <section className="task-home bg-grey-900 w-screen h-screen lg:max-w-full p-2" >
            <div className="navbar bg-base-100 rounded-md">
                <div className="flex-1">
                    <a className="btn btn-ghost normal-case text-xl"
                        onClick={() => { window.modal_2.showModal(); }}
                    ><img className="w-8 h-8 mr-2" src='nwt-logo.png' />nwt.</a>
                </div>
                <div className="flex-none">
                    <button onClick={debuggeroo} className="btn btn-square btn-ghost">
                        🦄
                    </button>
                    {/* <UserAvatarButton /> */}
                </div>
            </div>
            <dialog id="modal_2" className="modal">
                <AboutModal />
            </dialog>

            <div className="p-4 flex-1 w-full">
                <div className="flex-1 flex justify-end">
                    {/* <button onClick={debuggeroo} className="" >test</button> */}

                    <button onClick={newNote} className="" >new</button>
                </div>


                <div className="flex-1 flex flex-col items-center lg:px-56"
               >

                    {/* <div className="w-full max-w-96 min-h-96 p-4 m-2 rounded bg-slate-800 flex">
                        <h6 contentEditable
                            onKeyDown={(e) => {
                                if (e.code === "Enter") {
                                    console.log(e.target.innerText)
                                }
                            }}
                            className="w-full text-left focus:outline-none whitespace-pre-wrap "
                        ></h6>
                    </div> */}


                    {notes?.map((note, idx) => {
                        return <SingleNote note={note} key={note.id} deleteNote={deleteNote}  />
                    })
                    }

                    { notes?.length === 0 && <p className="text-2xl text-center">no notes. yet...</p>}

                    
                </div>




            </div>
        </section>
    );
}

function App() {
    return (
        <div className="App">
            <Home />
        </div>
    );
}

export default App;
