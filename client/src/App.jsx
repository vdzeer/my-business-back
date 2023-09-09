import { useEffect } from 'react'
import './App.css'

function App(props) {
  const search = window.location.search
  const params = new URLSearchParams(search)

  const token = params.get('token')
  const email = params.get('email')

  useEffect(() => {
    if (token && email)
      location.assign('mybusinesslink://token/' + token + '/' + email)
  }, [token, email])

  return (
    <>
      <h1>Reconnecting...</h1>
    </>
  )
}

export default App
