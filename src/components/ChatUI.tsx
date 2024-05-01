//@ts-nocheck
import { useState } from "react";
import Dexie from "dexie";
import { ScrollArea, Button, TextField } from "@radix-ui/themes";
import { useAppContext } from "../utils/AppContext";

const ChatUI = () => {
  const { theme } = useAppContext();
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

    const final = { notes: allnotes, grocery: allgrocery, todo: alltodo };
    return final;
  };

  const handleSubmit = async () => {
    const updated = [...messages, {
      content: [{
        type: "text",
        text: newMessage
      }],
      role: 'user'
    }];

    setMessages(updated);
    setNewMessage('');


    const data = await getData();
    // console.log(JSON.stringify(data))
    // console.log(messages)
    const base_url = import.meta.env.PROD ? 'https://api.spaces.fun' : 'http://localhost:3003';
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
    });

    if (resp.resp) {

      const newresp = [...updated, {
        content: [{
          type: "text",
          text: resp.resp.content[0].text
        }],
        role: 'assistant'
      }];
      setMessages(newresp);
    }

    console.log(resp);

  };

  return (
    <div className={`flex flex-col items-center justify-center ${theme.appearance == "dark" ? "text-white" : "text-black"}`}>
      <h1 className="font-serif font-bold">ask anything</h1>

      <div className="flex flex-col items-center justify-center w-full">
        <ScrollArea style={{ height: '600px' }}>
          {messages.map((msg) => {
            return (
              <div key={msg.content[0].text} className="flex flex-col items-start justify-start mb-8">
                <h1 className="text-sm">{msg.role}</h1>
                <p className="text-lg font-serif">{msg.content[0].text}</p>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      <div className="absolute bottom-5 flex flex-row  w-full p-2 ">
        <TextField.Root placeholder="ask anything ... " value={newMessage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          onChange={(e) => setNewMessage(e.target.value)} className="flex-1 w-full" />
        <Button variant="solid" onClick={handleSubmit}>send</Button>
      </div>
    </div>
  );
};

export default ChatUI;