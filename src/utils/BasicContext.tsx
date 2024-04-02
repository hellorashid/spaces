"use client"
import { createContext, useContext, useEffect, useState } from 'react'

type User = { 
    name?: string,
    email?: string,
    id?: string,
    primaryEmailAddress?: {
        emailAddress: string
    }, 
    fullName?: string
}

export const AuthContext = createContext<{ 
    unicorn: string, 
    isLoaded: boolean,
    isSignedIn: boolean,
    user: User | null,
    signout: () => void,
    signin: () => void,
    getToken: () => string | undefined,
    getSignInLink: () => string, 
}>({
    unicorn: "🦄", 
    isLoaded: false,
    isSignedIn: false,
    user: null,
    signout: () => {},
    signin: () => {},
    getToken: () => undefined,
    getSignInLink: () => "",
});

type Token = { 
    access_token: string,
    token_type: string,
    expires_in: number,
    refresh_token: string,
}

export function AuthProvider({children, project_id}: {children: React.ReactNode, project_id: string}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [token, setToken] = useState<Token | null>(null)
    const [authCode, setAuthCode] = useState<string | null>(null)
    const [user, setUser] = useState<User>({})
    const [state, setState] = useState({})    


    const signin = () => { 

        console.log('signing in: ', getSignInLink()) 
        const signInLink = getSignInLink()
        window.location.href = signInLink;

        // setUser({name: "testuser", id: 1})
    }

    const signout = () => {
        console.log('signing out')
        setUser({})
        setIsSignedIn(false)
        setToken(null)
        setAuthCode(null)
        document.cookie = `basic_token=; Secure; SameSite=Strict`;
    }
    const getToken = () => {
        console.log('getting token')
        return token?.access_token
    }
    const getSignInLink = () => {
        console.log('getting sign in link')

        const randomState = Math.random().toString(36).substring(7);

        let baseUrl = "https://api.basic.tech/auth/authorize"
        baseUrl += `?client_id=${project_id}`
        baseUrl += `&redirect_uri=${encodeURIComponent(window.location.href)}`
        baseUrl += `&response_type=code`
        baseUrl += `&scope=profile`
        baseUrl += `&state=1234zyx`

        return baseUrl;
    }

    function getCookie(name: string) {
        let cookieValue = '';
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    useEffect(() => {
        let cookie_token = getCookie('basic_token')
        if (cookie_token !== '') {
            // console.log('cookie token found', cookie_token)
            setToken(JSON.parse(cookie_token))
        }


        async function fetchToken (code: string) { 
            const token = await fetch('https://api.basic.tech/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({code: code})
            })
            .then(response => response.json())
            .catch(error => console.error('Error:', error))

            if (token.error) {
                console.log('error fetching token', token.error)
                return
            } else { 
                console.log('token', token)
                setToken(token)
            }
        
        }
        
        if (window.location.search.includes('code')) {
            let code = window.location.search.split('code=')[1].split('&')[0]
            console.log('code found')
            
            setAuthCode(code)
            fetchToken(code)

            if (window.location.search.includes('code')) {
                let url = new URL(window.location.toString());
                url.searchParams.delete('code');
                url.searchParams.delete('state');
                window.history.replaceState({}, document.title, url.toString());
            }

        } else { 
            setIsLoaded(true)
        }


    }, [])

    useEffect(() => {
        async function fetchUser (acc_token: string) {
            const user = await fetch('https://api.basic.tech/auth/userInfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${acc_token}`
                }
            })
            .then(response => response.json())
            .catch(error => console.error('Error:', error))

            if (user.error) {
                console.log('error fetching user', user.error)
                return
            } else { 
                console.log('user', user)
                document.cookie = `basic_token=${JSON.stringify(token)}; Secure; SameSite=Strict`;
                setUser(user)
                setIsSignedIn(true)
                setIsLoaded(true)
            }
        }

        if (token) { 
            fetchUser(token.access_token)
            setIsLoaded(true)
        }
    }, [token])



    return (
    <AuthContext.Provider value={{
        unicorn: "🦄",
        isLoaded,
        isSignedIn,
        user,
        signout,
        signin,
        getToken,
        getSignInLink, 
    }}>
    {children}
    </AuthContext.Provider>
    )
  }

export function useAuth() {
    return useContext(AuthContext);
  }
