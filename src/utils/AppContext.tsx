"use client"
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = { 
    appearance: string,
    [key: string]: any
    
}


export const AppContext = createContext<{ 
    unicorn: string, 
    theme: Theme,
    setTheme?: (theme: Theme) => void
}>({
    unicorn: "🦄", 
    theme: {appearance: "dark"},
    setTheme: () => {}
});



export function AppProvider({children, project_id}: {children: React.ReactNode, project_id: string}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [theme, setTheme] = useState<Theme>({appearance: "dark"})


    useEffect(() => {
  
    }, [])



    return (
    <AppContext.Provider value={{
        unicorn: "🦄",
        theme: theme,
        setTheme: setTheme
    }}>
    {children}
    </AppContext.Provider>
    )
  }

export function useAppContext() {
    return useContext(AppContext);
  }
