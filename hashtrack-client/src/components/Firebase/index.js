import React, { useState } from 'react'

export const FirebaseContext = React.createContext();
export default function Firebase() {
  // TODO: Update to user JWT to fetch user
  const [user, setUser] = useState(null);
  return (
    <FirebaseContext.Provider value={{
      user,
      setUser
    }}>
      {this.props.children}
    </FirebaseContext.Provider>
  )
}
