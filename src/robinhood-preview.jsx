import React from 'react'
import { Logo } from './brand.jsx'
export default function RobinhoodPreview({ close }) {
  return <div className="app-loading" role="dialog" aria-modal="true" aria-labelledby="migration-title"><Logo dark/><h1 id="migration-title">VORNUQ on Robinhood Chain</h1><p>Wallet integration is in development.</p><p>Wallet connection, deposits, transfers and withdrawals are unavailable in this preview.</p><p>Network: Robinhood Chain · Gas: ETH · Contract: TBA</p><button onClick={close}>Back to website</button></div>
}
