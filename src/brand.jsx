import React from 'react'
const BASE = import.meta.env.BASE_URL
export function Logo({ dark = false, markOnly = false }) {
  return (
    <a className={'logo ' + (dark ? 'logo-dark' : '')} href="#top" aria-label="VORNUQ home">
      <span className="logo-mark"><img src={`${BASE}project-logo.png`} alt="" /></span>
      {!markOnly && <span className="logo-word">VORNUQ</span>}
    </a>
  )
}

export function Star({ className = '' }) {
  return <svg className={'star ' + className} viewBox="0 0 100 100"><path d="M50 4C53 32 66 46 96 50C66 54 53 68 50 96C47 68 34 54 4 50C34 46 47 32 50 4Z" /></svg>
}

