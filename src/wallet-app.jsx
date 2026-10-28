import React, { useEffect, useState } from 'react'
import { address } from '@solana/kit'
import { ClientProvider, useClient } from '@solana/react'
import { useConnect, useConnectedWallet, useDisconnect, useWalletStatus, useWallets } from '@solana/kit-plugin-wallet/react'
import { ArrowRight, ArrowUpRight, CircleHelp, Copy, EyeOff, FileCheck2, KeyRound, Lock, LogOut, Network, Plus, Send, ShieldCheck, Sparkles, Wallet, X, Backpack, Ghost } from 'lucide-react'
import { Logo, Star } from './brand.jsx'
import { SUPPORTED_WALLETS, findWallet, walletError } from './wallet-options.js'
import { createPaymentAddress, downloadRecoveryRecord, exitPrivate, getProtocolConfig, scanReceivedNotes, shieldNative, transferPrivate } from './protocol.js'
import { solanaClient } from './solana-client.js'
const PROTOCOL = getProtocolConfig()
const BASE = import.meta.env.BASE_URL
const CHAIN = { blockExplorerUrls: ['https://explorer.solana.com'] }
function AppShell({ close }) {
  const client = useClient()
  const walletStatus = useWalletStatus(client)
  const wallets = useWallets(client)
  const connected = useConnectedWallet(client)
  const connectAction = useConnect(client)
  const disconnectAction = useDisconnect(client)
  const account = connected?.account.address || ''
  const connecting = walletStatus === 'connecting' || connectAction.isRunning
  const [balance, setBalance] = useState(null)
  const [balanceError, setBalanceError] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const walletWarmingUp = walletStatus === 'pending' || walletStatus === 'reconnecting'
  const protocolReady = PROTOCOL.configured && PROTOCOL.provingReady
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('account')
  const [action, setAction] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [shieldAmount, setShieldAmount] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [paymentAddress, setPaymentAddress] = useState('')
  const [exitAmount, setExitAmount] = useState('')
  const [exitRecipient, setExitRecipient] = useState('')
  const [recovery, setRecovery] = useState(null)
  const [receiverRecovery, setReceiverRecovery] = useState(null)
  const [receivedNotes, setReceivedNotes] = useState([])
  const [importError, setImportError] = useState('')

  const refreshBalance = async (walletAddress = account) => {
    if (!walletAddress) return
    const result = await client.rpc.getBalance(address(walletAddress), { commitment: 'confirmed' }).send()
    setBalance((Number(result.value) / 1e9).toLocaleString(undefined, { maximumFractionDigits: 5 }))
  }

  const importRecovery = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportError('')
    try {
      const record = JSON.parse(await file.text())
      if (record?.version !== 1 || record.cluster !== 'mainnet-beta') throw new Error('This is not a valid Solana mainnet VORNUQ record.')
      if (record.kind === 'vornuq-receiver' && record.address && record.ownerSecret && record.viewingPrivateKey) {
        setReceiverRecovery(record)
      } else if (record.kind === 'vornuq-note' && record.note && record.ownerSecret && record.pool) {
        setRecovery(record)
      } else {
        throw new Error('This VORNUQ record is incomplete or unsupported.')
      }
    } catch (e) {
      setImportError(e?.message || 'The recovery file could not be opened.')
    } finally { event.target.value = '' }
  }

  const connectWallet = async (selected) => {
    setError('')
    setSelectedWallet(selected.name)
    try {
      await connectAction.dispatchAsync(selected)
    } catch (e) { if (e?.name !== 'AbortError') setError(walletError(e)) }
    finally { setSelectedWallet('') }
  }

  const disconnectWallet = async () => {
    setError('')
    try { await disconnectAction.dispatchAsync(); setBalance(null); setBalanceError(''); setAction(''); setProgress('') }
    catch (e) { setError(walletError(e)) }
  }

  const handleShield = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setProgress('signing')
    try {
      const result = await shieldNative({ client, wallet: connected, amount: shieldAmount, onPrepared: record => { setRecovery(record); downloadRecoveryRecord(record) } })
      setRecovery({ ...result.record }); setAction('complete'); setProgress(''); await refreshBalance()
    } catch (e) { setError(e?.shortMessage || e?.message || 'Shield transaction failed.') }
    finally { setBusy(false) }
  }

  const handleTransfer = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      if (!recovery) throw new Error('Import a spendable note recovery record first.')
      const result = await transferPrivate({
        client, wallet: connected, recovery, amount: transferAmount, paymentAddress,
        onProof: setProgress,
        onPrepared: record => { if (record) downloadRecoveryRecord(record) },
      })
      setRecovery(result.changeRecord); setAction('complete'); setProgress('')
    } catch (e) { setError(e?.shortMessage || e?.message || 'Private transfer failed.') }
    finally { setBusy(false) }
  }

  const handleExit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      if (!recovery) throw new Error('Import a spendable note recovery record first.')
      const result = await exitPrivate({
        client, wallet: connected, recovery, amount: exitAmount, recipientAddress: exitRecipient,
        onProof: setProgress,
        onPrepared: record => { if (record) downloadRecoveryRecord(record) },
      })
      setRecovery(result.changeRecord); setAction('complete'); setProgress(''); await refreshBalance()
    } catch (e) { setError(e?.shortMessage || e?.message || 'Public exit failed.') }
    finally { setBusy(false) }
  }

  const createReceiver = async () => {
    setBusy(true); setImportError('')
    try {
      const created = await createPaymentAddress()
      setReceiverRecovery(created.recovery)
      downloadRecoveryRecord(created.recovery)
    } catch (e) { setImportError(e?.message || 'Could not create a private receiving address.') }
    finally { setBusy(false) }
  }

  const scanNotes = async () => {
    setBusy(true); setImportError('')
    try {
      if (!receiverRecovery) throw new Error('Create or import a receiver record first.')
      const found = await scanReceivedNotes({ client, wallet: connected, receiverRecovery })
      setReceivedNotes(found)
      const spendable = found.find(item => !item.spent)
      if (spendable) setRecovery(spendable.record)
    } catch (e) { setImportError(e?.message || 'Could not scan encrypted notes.') }
    finally { setBusy(false) }
  }

  useEffect(() => {
    let current = true
    setBalance(null); setBalanceError('')
    if (account) client.rpc.getBalance(address(account), { commitment: 'confirmed' }).send()
      .then(result => { if (current) setBalance((Number(result.value) / 1e9).toLocaleString(undefined, { maximumFractionDigits: 5 })) })
      .catch(() => { if (current) setBalanceError('Balance unavailable. The RPC endpoint may be busy; reconnect to retry.') })
    return () => { current = false }
  }, [account, client])

  const progressLabel = progress === 'proving' ? 'Generating proof…' : progress === 'signing' ? 'Awaiting signature…' : progress === 'confirming' ? 'Confirming…' : 'Submit transaction'

  return (
    <div className="app-shell">
      <header className="app-header"><Logo dark /><a href={CHAIN.blockExplorerUrls[0]} target="_blank" rel="noreferrer" className="app-network"><i />Solana</a><button onClick={close} aria-label="Close app"><X /></button></header>
      <aside className="app-side">
        <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}><Wallet />Account</button>
        <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}><Send />Activity</button>
        <button className={activeTab === 'recovery' ? 'active' : ''} onClick={() => setActiveTab('recovery')}><FileCheck2 />Recovery</button>
        <button className={activeTab === 'help' ? 'active' : ''} onClick={() => setActiveTab('help')}><CircleHelp />Help</button>
      </aside>
      <main className="app-content">
        {activeTab === 'account' && (!account ? (
          <div className="connect-state">
            <div className="connect-mark"><Logo markOnly /><Star /></div>
            <span className="eyebrow">WELCOME TO VORNUQ</span>
            <h1>Your private account<br />starts with your wallet.</h1>
            <p>Choose Backpack or Phantom to connect your Solana account. Connecting does not move funds or request a transaction signature.</p>
            <div className="wallet-choices" aria-label="Choose a Solana wallet">
              {SUPPORTED_WALLETS.map(option => {
                const detected = findWallet(wallets, option.name)
                const Icon = option.name === 'Backpack' ? Backpack : Ghost
                return <div className="wallet-choice-row" key={option.name}>
                  <button className="wallet-choice" onClick={() => detected ? connectWallet(detected) : setError(`${option.name} was not detected. Install or unlock its browser extension, or open this site in its mobile app browser.`)} disabled={connecting || walletWarmingUp} aria-label={`Connect ${option.name}`}>
                    <span className={`wallet-brand wallet-brand-${option.name.toLowerCase()}`}>{detected?.icon ? <img src={detected.icon} alt="" /> : <Icon />}</span>
                    <span><b>{option.name}</b><small>{selectedWallet === option.name ? 'Awaiting wallet approval…' : walletWarmingUp ? 'Detecting wallet…' : detected ? 'Detected · Solana' : 'Not detected'}</small></span><ArrowRight />
                  </button>
                  {!detected && <a className="wallet-install" href={option.url} target="_blank" rel="noreferrer">Install {option.name} <ArrowUpRight /></a>}
                </div>
              })}
              {wallets.filter(wallet => !SUPPORTED_WALLETS.some(option => findWallet([wallet], option.name))).map(wallet => <button key={wallet.name} className="wallet-choice" onClick={() => connectWallet(wallet)} disabled={connecting || walletWarmingUp}><span className="wallet-brand"><img src={wallet.icon} alt="" /></span><span><b>{wallet.name}</b><small>Detected · Solana</small></span><ArrowRight /></button>)}
            </div>
            <div className="connect-release-note"><ShieldCheck /><span>Development preview: wallet connection is available. Shield, private transfer and exit are not live yet.</span></div>
            {error && <div className="wallet-error" role="alert">{error}</div>}
            <small><Lock />Non-custodial connection</small>
          </div>
        ) : (
          <div className="connected-state">
            <div className="connected-head"><div><span className="eyebrow">CONNECTED · {connected?.wallet.name}</span><h1>Your VORNUQ account.</h1></div><div className="connected-controls"><button className="address-chip" onClick={() => navigator.clipboard?.writeText(account)}>{account.slice(0,6)}…{account.slice(-4)} <Copy /></button><button className="disconnect-wallet" onClick={disconnectWallet}><LogOut />Disconnect</button></div></div>
            <div className="account-grid">
              <section className="main-balance"><span>PUBLIC WALLET BALANCE</span><strong>{balance ?? '—'} SOL</strong><small><i />{balanceError || (balance === null ? 'Loading public balance…' : 'Solana mainnet')}</small><div><button disabled={!protocolReady} title={!protocolReady ? 'Available after a verified protocol release' : undefined} onClick={() => { setAction('shield'); setError('') }}><Plus />Shield SOL</button><button disabled={!protocolReady} title={!protocolReady ? 'Available after a verified protocol release' : undefined} onClick={() => { setAction('transfer'); setError('') }}><Send />Send privately</button><button disabled={!protocolReady} title={!protocolReady ? 'Available after a verified protocol release' : undefined} onClick={() => { setAction('exit'); setError('') }}><ArrowUpRight />Exit to wallet</button></div></section>
              <section className="shield-status"><ShieldCheck /><span>SHIELDED ACCOUNT</span><h2>{recovery ? 'Spendable note loaded' : 'Private state'}</h2><p>{recovery ? 'A local recovery record is ready to authorize a private transfer or public exit.' : 'Wallet connected. Shielded transactions will open after a verified protocol release.'}</p><b><Lock />Keys remain local</b></section>
            </div>
            {action === 'shield' && <form className="protocol-action" onSubmit={handleShield}><div><span>SHIELD SOL</span><h3>Move value into your private account.</h3><p>The deposit amount is public. The resulting spending secret is generated locally.</p></div><label><span>AMOUNT</span><div><input type="number" min="0" step="0.000001" placeholder="0.00" value={shieldAmount} onChange={event => setShieldAmount(event.target.value)} required /><b>SOL</b></div></label><button className="primary-btn green" disabled={busy}>{busy ? progressLabel : 'Shield assets'} <ArrowRight /></button><button type="button" className="action-close" onClick={() => setAction('')}><X /></button></form>}
            {action === 'transfer' && <form className="protocol-action two-fields" onSubmit={handleTransfer}><div><span>PRIVATE TRANSFER</span><h3>Send to a VORNUQ address.</h3><p>The recipient’s encrypted note is published with the proof. A change recovery file is downloaded before signing.</p></div><label><span>AMOUNT</span><div><input type="number" min="0" step="0.000001" placeholder="0.00" value={transferAmount} onChange={event => setTransferAmount(event.target.value)} required /><b>SOL</b></div></label><label><span>VORNUQ ADDRESS</span><div><input type="text" placeholder="vornuq:sol:1:…" value={paymentAddress} onChange={event => setPaymentAddress(event.target.value.trim())} required /></div></label><button className="primary-btn green" disabled={busy}>{busy ? progressLabel : 'Generate proof'} <ArrowRight /></button><button type="button" className="action-close" onClick={() => setAction('')}><X /></button></form>}
            {action === 'exit' && <form className="protocol-action two-fields" onSubmit={handleExit}><div><span>PUBLIC EXIT</span><h3>Exit SOL to a public wallet.</h3><p>The exit amount and recipient become public. Any private change remains protected by a new note.</p></div><label><span>AMOUNT</span><div><input type="number" min="0" step="0.000001" placeholder="0.00" value={exitAmount} onChange={event => setExitAmount(event.target.value)} required /><b>SOL</b></div></label><label><span>RECIPIENT</span><div><input type="text" placeholder="Solana address…" value={exitRecipient} onChange={event => setExitRecipient(event.target.value.trim())} required /></div></label><button className="primary-btn green" disabled={busy}>{busy ? progressLabel : 'Generate proof'} <ArrowRight /></button><button type="button" className="action-close" onClick={() => setAction('')}><X /></button></form>}
            {action === 'complete' && <div className="protocol-action complete"><ShieldCheck /><div><span>TRANSACTION CONFIRMED</span><h3>Your private state is updated.</h3><p>{recovery ? 'The new recovery file controls your remaining private change.' : 'The selected note was fully spent and has no private change.'}</p></div>{recovery && <button className="primary-btn outline" onClick={() => downloadRecoveryRecord(recovery)}>Download again</button>}</div>}
            {error && <div className="wallet-error action-error">{error}</div>}
            <div className={'deployment-notice ' + (PROTOCOL.configured && PROTOCOL.provingReady ? 'is-ready' : 'needs-address')}><Sparkles /><div><b>{PROTOCOL.configured && PROTOCOL.provingReady ? 'Verified protocol connection' : 'Development preview — private transactions unavailable'}</b><p>{PROTOCOL.configured && PROTOCOL.provingReady ? `Every action is routed to ${PROTOCOL.address.slice(0, 6)}…${PROTOCOL.address.slice(-4)} on Solana.` : 'Transactions remain locked until verified contracts and production proving artifacts are published in the deployment manifest.'}</p></div></div>
          </div>
        ))}

        {activeTab === 'activity' && <section className="app-panel"><div className="app-panel-head"><span className="eyebrow">ACTIVITY</span><h1>Public settlement.<br />Private context.</h1><p>Public wallet activity is visible on Solana. Encrypted private notes are discovered and decrypted locally.</p></div><div className="app-panel-grid"><article className="app-info-card"><Network /><span>PUBLIC ACCOUNT</span><h2>{account ? `${account.slice(0, 8)}…${account.slice(-6)}` : 'No wallet connected'}</h2><p>{account ? 'Inspect deposits, exits and gas payments in the public explorer.' : 'Connect your wallet to inspect public settlement history.'}</p>{account ? <a className="panel-link" href={`${CHAIN.blockExplorerUrls[0]}/address/${account}`} target="_blank" rel="noreferrer">Open explorer <ArrowUpRight /></a> : <button className="panel-link" onClick={() => setActiveTab('account')}>Connect wallet <ArrowRight /></button>}</article><article className="app-info-card dark"><EyeOff /><span>PRIVATE NOTES</span><h2>{receivedNotes.length ? `${receivedNotes.filter(item => !item.spent).length} spendable note(s)` : recovery ? '1 note loaded locally' : 'No notes loaded'}</h2><p>Private activity is reconstructed from recovery records and encrypted output events—not from a public account graph.</p><button className="panel-link" onClick={() => setActiveTab('recovery')}>Open recovery <ArrowRight /></button></article></div></section>}

        {activeTab === 'recovery' && <section className="app-panel"><div className="app-panel-head"><span className="eyebrow">RECOVERY & RECEIVE</span><h1>Your keys stay local.</h1><p>Create a one-time VORNUQ receiving address, scan encrypted output events, or restore an existing note. Receiver files and note files contain spending authority.</p></div><div className="receive-grid"><article className="receive-card"><KeyRound /><span>PRIVATE RECEIVING ADDRESS</span><h2>{receiverRecovery ? 'Address ready' : 'Create a one-time address'}</h2><p>Share the address, not the downloaded receiver file. The file is required to discover and spend incoming notes.</p>{receiverRecovery && <button className="address-output" onClick={() => navigator.clipboard?.writeText(receiverRecovery.address)}>{receiverRecovery.address.slice(0, 28)}… <Copy /></button>}<div><button onClick={createReceiver} disabled={busy}>{receiverRecovery ? 'Create another' : 'Create address'}</button>{receiverRecovery && <button onClick={scanNotes} disabled={busy}>{busy ? 'Scanning…' : 'Scan notes'}</button>}</div></article><article className="recovery-panel compact"><FileCheck2 /><div><span>IMPORT LOCAL RECORD</span><h2>{recovery ? 'Spendable note loaded' : receiverRecovery ? 'Receiver record loaded' : 'Choose a VORNUQ JSON file'}</h2><p>The file is parsed in this browser and is never uploaded.</p></div><input id="recovery-file" type="file" accept="application/json,.json" onChange={importRecovery} /><label htmlFor="recovery-file">Choose file <ArrowRight /></label></article></div>{importError && <div className="wallet-error action-error">{importError}</div>}{receivedNotes.length > 0 && <div className="note-list">{receivedNotes.map((item, index) => <article key={`${item.record.transactionHash}-${index}`} className={item.spent ? 'spent' : ''}><div><span>ENCRYPTED NOTE</span><b>{item.spent ? 'Spent' : 'Spendable'}</b></div><code>{item.record.transactionHash?.slice(0, 18)}…</code><button disabled={item.spent} onClick={() => { setRecovery(item.record); downloadRecoveryRecord(item.record) }}>{item.spent ? 'Already spent' : 'Use & download'}</button></article>)}</div>}{recovery && <div className="recovery-summary"><div><span>NETWORK</span><b>Solana · mainnet-beta</b></div><div><span>NOTE</span><b>{String(recovery.note).slice(0, 12)}…{String(recovery.note).slice(-8)}</b></div><div><span>SOURCE TX</span><b>{recovery.transactionHash ? `${recovery.transactionHash.slice(0, 12)}…${recovery.transactionHash.slice(-8)}` : 'Prepared locally'}</b></div><button onClick={() => downloadRecoveryRecord(recovery)}>Download a copy</button></div>}</section>}

        {activeTab === 'help' && <section className="app-panel"><div className="app-panel-head"><span className="eyebrow">HOW VORNUQ WORKS</span><h1>Three actions.<br />One private state.</h1><p>VORNUQ hides the internal note ownership graph. It does not hide RPC metadata, timing, or the public entry and exit transactions.</p></div><div className="help-steps"><article><b>01</b><div><h2>Shield</h2><p>Deposit SOL from a public wallet. Save the recovery file before signing.</p></div></article><article><b>02</b><div><h2>Transfer</h2><p>Send to a one-time VORNUQ address. The receiver discovers the encrypted note using their local receiver file.</p></div></article><article><b>03</b><div><h2>Exit</h2><p>Spend a note to a public address. The recipient and amount are visible onchain.</p></div></article></div><div className="panel-actions"><a className="primary-btn green" href={`${BASE}docs.html`}>Read documentation <ArrowRight /></a><a className="primary-btn outline" href="https://github.com/GHOSTXrun/fasfafasf/issues/new" target="_blank" rel="noreferrer">Send feedback <ArrowUpRight /></a></div></section>}
      </main>
    </div>
  )
}
export default function WalletApplication({ close }) {
  return <ClientProvider client={solanaClient}><AppShell close={close} /></ClientProvider>
}
