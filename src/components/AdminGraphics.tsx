'use client'
import React, { useEffect } from 'react'

export const Logo = () => {
  useEffect(() => {
    let checkCount = 0
    const interval = setInterval(() => {
      checkCount++
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
      if (passwordInput && !passwordInput.dataset.hasToggle) {
        passwordInput.dataset.hasToggle = 'true'
        
        // Create wrapper
        const wrapper = document.createElement('div')
        wrapper.className = 'password-input-wrapper'
        wrapper.style.position = 'relative'
        wrapper.style.width = '100%'
        
        // Wrap input
        if (passwordInput.parentNode) {
          passwordInput.parentNode.insertBefore(wrapper, passwordInput)
          wrapper.appendChild(passwordInput)
          
          // Create toggle button
          const toggleBtn = document.createElement('button')
          toggleBtn.type = 'button'
          toggleBtn.className = 'password-toggle-btn'
          toggleBtn.setAttribute('aria-label', 'Toggle password visibility')
          toggleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          `
          
          // Add click listener
          toggleBtn.addEventListener('click', (e) => {
            e.preventDefault()
            if (passwordInput.type === 'password') {
              passwordInput.type = 'text'
              toggleBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              `
            } else {
              passwordInput.type = 'password'
              toggleBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              `
            }
          })
          
          wrapper.appendChild(toggleBtn)
          clearInterval(interval)
        }
      }
      if (checkCount > 50) { // Limit attempts (approx 5 seconds)
        clearInterval(interval)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="custom-logo" style={{ maxWidth: '150px' }}>
      <img
        src="/valneeLogo.svg"
        alt="Valnee Logo"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}

export const Icon = () => (
  <div className="custom-icon" style={{ maxWidth: '40px' }}>
    <img
      src="/valneeLogo.svg"
      alt="Valnee Icon"
      style={{ width: '100%', height: 'auto' }}
    />
  </div>
)
