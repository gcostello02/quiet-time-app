import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext.jsx'

const Signup = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState('')

  const {signUpNewUser } = UserAuth()
  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signUpNewUser(email, password)

      if (result.success) {
        navigate('/dashboard')
      }
    } catch (error) {
      setError("An error occured", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSignUp} className='max-w-md m-auto pt-24'>
        <h2 className='font-bold pb-2'>Sign up today!</h2>
        <p>
          Already have an account? <Link to="/signin">Sign in!</Link>
        </p>
        <div className='flex flex-col py-4'>
          <input 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" 
            className='p-3 mt-6' 
            type='email' 
          />
          <input 
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password' 
            className='p-3 mt-6' 
            type="password" 
          />
          <button type='submit' className='mt-6 w-full'>
            Sign up
          </button>
          {error && <p className='text-red-600 text-center pt-4'>{error}</p>}
        </div>
      </form>
    </div>
  )
}

export default Signup