import React from 'react'
import { Logo } from './brand.jsx'

export class WalletBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return <div className="app-loading" role="alert"><Logo dark /><h1>Wallet connection could not start.</h1><p>The website is still available. Unlock your wallet and reload to try again.</p><details><summary>Error details</summary><pre>{this.state.error?.message || 'Wallet initialization failed.'}</pre></details><div><button onClick={this.props.close}>Back to website</button><button onClick={() => window.location.reload()}>Reload</button></div></div>
  }
}
