import React from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState('')

  return (
    <div>
      <form className='max-w-md m-auto pt-24'>
        <h2 className='font-bold pb-2'>Sign up today!</h2>
        <p>
          Already have an account? <Link to="/signin">Sign in!</Link>
        </p>
        <div className='flex flex-col py-4'>
          <input placeholder="Email" className='p-3 mt-6' type='email' />
          <input placeholder='Password' className='p-3 mt-6' type="password" />
          <button type='submit' className='mt-6 w-full'>
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}

export default Signup