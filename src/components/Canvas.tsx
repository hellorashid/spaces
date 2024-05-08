import React, { useCallback, useEffect, useState } from 'react';
import CardComponent from './CardComponent';
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

import {Card } from '@radix-ui/themes'

const deeb = new Dexie('todos');
deeb.version(1).stores({
  todos: '++id, text'
});


// const nodeTypes = useMemo(() => ({ componentNode: ComponentNode, tableNode: TableNode}), []);


function TableNode({ data } : { data: any}) {
  // const [ todos, setTodos ] = useState([])
 
  //@ts-ignore
  const todos = useLiveQuery(() => deeb.todos.toArray(), []);


  useEffect(() => {
    const debug = async () => { 
      // const deeb = new Dexie('todos');
      // deeb.version(1).stores({
      //   todos: '++id, text'
      // });
      // const all = await deeb.todos.toArray()
      // setTodos(all)
    }
    debug()
  }, [])

  const debug = async () => { 
    // const deeb = new Dexie('todos');
    // deeb.version(1).stores({
    //   todos: '++id, text'
    // });
    // const all = await deeb.todos.toArray()
    // console.log(all)
    
  }
 
  return (
    <>
      <Card className="w-64 h-auto" >
          <button onClick={debug}>data:</button>
          <ul>
            {todos?.map((todo : any) => {
              return <li key={todo.id}>{todo.text}</li>
            })}
          </ul>
        
      </Card>
    </>
  );
}

 


function ComponentNode({ data } : { data: any}) {
    const { componentCode, fetching, isDark, updateUI, showEditor, setComponentCode, fetchingTab, activeTab } = data;
    const onChange = useCallback((evt : any) => {
      console.log(evt.target.value);
    }, []);
   
    return (
      <>
        <div className="w-[500px] h-96" >
       
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
        </div>
        {/* <Handle type="source" position={Position.Bottom} id="a" /> */}
      </>
    );
  }

  
