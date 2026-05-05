import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';

export default function Identity() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: String(name).trim().toLowerCase(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <h2 className="mb-4">Admin Login for nerdious page</h2>
      <form className="form-control w-50" onSubmit={handleSubmit}>
        
        <div className="mb-3">
          <label htmlFor='name'>Name</label>
          <input 
            type='text' 
            className='form-control' 
            id='name' 
            placeholder='Enter your name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor='password'>Password</label>
          <input 
            type='password' 
            className='form-control' 
            id='password' 
            placeholder='Enter your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className='text-danger'>{error}</p>}

        <button 
          type='submit' 
          disabled={isSubmitting}
          className='btn btn-primary w-100'
        >
          {isSubmitting ? 'Checking...' : 'Submit'}
        </button>

      </form>
    </div>
  );
}
