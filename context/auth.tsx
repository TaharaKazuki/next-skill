import { onAuthStateChanged, Unsubscribe, User as FirebaseUser } from 'firebase/auth'
import { auth, db } from '../firebase/client'
import { createContext, ReactNode, FC, useEffect, useState, useContext } from 'react'
import { User } from 'types/user'
import { doc, onSnapshot } from 'firebase/firestore'

type ContextType = {
  fbUser: FirebaseUser | null | undefined
  isLoading: boolean
  user: User | undefined | null
}

type ProviderProps = {
  children: ReactNode
}

const AuthContext = createContext<ContextType>({
  fbUser: undefined,
  isLoading: true,
  user: undefined,
})

export const AuthProvider: FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>()
  const [isLoading, setIsLoading] = useState(true)
  const [fbUser, setFbUser] = useState<FirebaseUser | null>()

  useEffect(() => {
    let unsubscribe: Unsubscribe

    onAuthStateChanged(auth, (resultUser) => {
      unsubscribe?.()
      setFbUser(resultUser)
      if (resultUser) {
        setIsLoading(true)
        const ref = doc(db, `users/${resultUser.uid}`)
        unsubscribe = onSnapshot(ref, (snap) => {
          setUser(snap.data() as User)
          setIsLoading(false)
        })
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })
  }, [])

  return <AuthContext.Provider value={{ isLoading, fbUser, user }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
