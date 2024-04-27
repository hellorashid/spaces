"use client"
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = { 
    appearance: string,
    [key: string]: any
}


export const AuthContext = createContext<{ 
    unicorn: string, 
    theme: Theme,

}>({
    unicorn: "🦄", 
    theme: {appearance: "dark"},
});



export function AuthProvider({children, project_id}: {children: React.ReactNode, project_id: string}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [theme, setTheme] = useState<Theme>({appearance: "dark"})


    useEffect(() => {
  
    }, [])



    return (
    <AuthContext.Provider value={{
        unicorn: "🦄",
        theme: theme,
    }}>
    {children}
    </AuthContext.Provider>
    )
  }

export function useAuth() {
    return useContext(AuthContext);
  }
