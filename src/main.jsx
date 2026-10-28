import React, { useEffect, useState, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight, ArrowUpRight, ChevronDown, CircleHelp, Code2, Copy,
  EyeOff, FileCheck2, Fingerprint, KeyRound, Lock, LogOut, Menu, Network,
  Plus, Send, ShieldCheck, Sparkles, Wallet, X, Zap, Backpack, Ghost
} from 'lucide-react'
import './styles.css'
import { Logo, Star } from './brand.jsx'
import { WalletBoundary } from './startup-boundary.jsx'
const WalletApplication = lazy(() => import('./robinhood-preview.jsx'))
import { Roadmap, ContactSection, InformationPage } from './site-content.jsx'

const BASE = import.meta.env.BASE_URL

const CHAIN = { blockExplorerUrls: ['https://robinhoodchain.blockscout.com'] }

const TOKEN = { symbol: 'VORNUQ', mintAddress: '', buyUrl: '' }

const faqs = [
  ['What is VORNUQ?', 'VORNUQ is a non-custodial shielded account protocol being adapted for ETH on Robinhood Chain. It uses private note commitments and zero-knowledge proofs instead of a public account graph.'],
  ['Is VORNUQ a mixer?', 'No. VORNUQ is a persistent shielded account: users hold private notes and authorize transfers with zero-knowledge proofs rather than depositing into a fixed-denomination mixing round.'],
  ['Who controls my assets?', 'You do. One-time spending secrets are created on the user device. VORNUQ never asks for a wallet seed phrase.'],
  ['How is value protected?', 'Every deposit is bound to its ETH value in the note commitment. Every private transition proves ownership, Merkle membership, value conservation and unused nullifiers.'],
  ['Which network does VORNUQ use?', 'VORNUQ targets Robinhood Chain mainnet, mainnet, with ETH as the native settlement asset and gas token.'],
  ['Is there a VORNUQ token?', 'A Robinhood Chain contract address has not been published. Check this site for the verified address.'],
  ['Is privacy absolute?', 'No. VORNUQ hides the internal note graph, but timing, amounts, RPC metadata, public entry and public exit can still create correlations.'],
]
function SolArtwork({ variant = 'orbit' }) {
  return <div className={`sol-art sol-art-${variant}`} aria-hidden="true">
    <span className="sol-orbit sol-orbit-one" /><span className="sol-orbit sol-orbit-two" />
    <span className="sol-coin sol-coin-main"><img src={`${BASE}eth-mark.svg`} alt="" /></span>
    <span className="sol-coin sol-coin-small"><img src={`${BASE}eth-mark.svg`} alt="" /></span>
    <span className="sol-art-stamp"><ShieldCheck /></span>
    <Star className="sol-art-star" /><span className="sol-art-dot" />
    <span className="sol-art-label">ETH / PRIVATE BY DESIGN</span>
  </div>
}


function XBrand() {
  return <svg className="x-brand" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.724-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
}

function GithubBrand() {
  return <svg className="github-brand" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7C5.65.7.5 5.85.5 12.2c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.16c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.18A11 11 0 0 1 12 6.18c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56a11.51 11.51 0 0 0 7.84-10.91C23.5 5.85 18.35.7 12 .7Z"/></svg>
}
function Header({ openApp }) {
  const [menu, setMenu] = useState(false)
  return (
    <header className="site-header">
      <Logo />
      <a className="header-ca" href="#token" aria-label="Contract address to be announced"><span>CA</span><b>TBA</b><i /></a>
      <nav className={menu ? 'site-nav open' : 'site-nav'}>
        <a href="#product" onClick={() => setMenu(false)}>Product</a>
        <a href="#privacy" onClick={() => setMenu(false)}>Privacy</a>
        <a href="#security" onClick={() => setMenu(false)}>Security</a>
        <a href="#developers" onClick={() => setMenu(false)}>Developers</a>
        <a href={`${BASE}docs.html#architecture`}>Architecture</a>
        <a href="#roadmap" onClick={() => setMenu(false)}>Progress</a>
        <a href={`${BASE}docs.html`}>Docs</a>
      </nav>
      <div className="header-end">
        <a className="chain-pill" href={CHAIN.blockExplorerUrls[0]} target="_blank" rel="noreferrer"><i />Robinhood Chain</a>
        <a className="header-github" href={`${BASE}docs.html#repository`} aria-label="Browse protocol source"><GithubBrand /></a>
        <button className="primary-btn light" onClick={openApp}>Launch app <ArrowRight /></button>
        <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
      </div>
    </header>
  )
}

function ProductCard({ openApp }) {

  return (
    <div className="hero-product">
      <SolArtwork variant="hero" />
      <div className="note-sticker">your shielded account</div>
      <div className="account-preview">
        <div className="preview-head">
          <span className="anon-avatar"><Lock /></span>
          <div><small>SHIELDED ACCOUNT</small><b>Robinhood Chain</b></div>
          <span className="preview-privacy" aria-label="Balance concealed"><EyeOff /></span>
        </div>
        <div className="preview-balance">
          <small>SHIELDED BALANCE</small>
          <strong>•••• ETH</strong>
          <span><i /> no public account balance</span>
        </div>
        <div className="preview-actions">
          <button onClick={openApp}><span><Plus /></span>Shield</button>
          <button onClick={openApp}><span><Send /></span>Transfer</button>
          <button onClick={openApp}><span><ArrowUpRight /></span>Exit</button>
        </div>
        <div className="preview-rule" />
        <div className="preview-row"><span className="asset-icon solana-chain"><img src={`${BASE}eth-mark.svg`} alt="" /></span><div><b>ETH on Robinhood Chain</b><small>ETH GAS · ROBINHOOD CHAIN</small></div></div>
        <div className="preview-row"><span className="asset-icon proof"><ShieldCheck /></span><div><b>Private transfers</b><small>ZERO-KNOWLEDGE AUTHORIZATION</small></div></div>
      </div>
      <div className="privacy-seal" aria-label="Spending keys stay on your device"><KeyRound /><b>Keys stay<br />local</b></div>
      <Star className="hero-star" />
    </div>
  )
}
function Hero({ openApp }) {
  return (
    <section className="hero" id="top">
      <Header openApp={openApp} />
      <img className="hero-art" src={`${BASE}eth-mark.svg`} alt="" />
      <div className="hero-copy">
        <span className="hand-label">✦ VORNUQ · privacy belongs to you</span>
        <h1>Your assets.<br /><em>Your private world.</em></h1>
        <p>A non-custodial shielded account protocol for Robinhood Chain. Shield, transfer and exit ETH without publishing your private note graph.</p>
        <div className="hero-ctas">
          <button className="primary-btn green" onClick={openApp}>Launch app <ArrowRight /></button>
          <a href={`${BASE}docs.html#architecture`} className="secondary-link"><span><Sparkles /></span>Explore docs &amp; code</a>
        </div>
      </div>
      <ProductCard openApp={openApp} />
      <div className="trust-strip">
        <span><Lock />Non-custodial</span><span><Network />Permissionless</span>
        <span><Code2 />Inspectable core</span><span><Zap />Robinhood Chain</span>
      </div>
    </section>
  )
}

const pillars = [
  { icon: Fingerprint, n: '01', title: 'Value-bound notes', text: 'Every public ETH deposit is cryptographically bound to one private commitment.', meta: ['BINDS', 'ASSET · VALUE · OWNER'] },
  { icon: Send, n: '02', title: 'Private transfers', text: 'Move value between private notes using a zero-knowledge proof instead of publishing the ownership graph.', meta: ['HIDES', 'AMOUNTS · OWNERSHIP LINKS'] },
  { icon: ShieldCheck, n: '03', title: 'Verified settlement', text: 'The chain verifies membership, authorization, nullifiers and value conservation before state changes.', meta: ['CHECKS', 'ROOTS · NULLIFIERS · VALUE'] },
]
function ProductSection() {
  return (
    <section className="product-section" id="product">
      <div className="section-intro">
        <div><span className="eyebrow">THE PRODUCT</span><h2>Financial privacy,<br />without disappearing.</h2></div>
        <p>VORNUQ keeps the note graph private with a planned Robinhood Chain integration that verifies that every state transition follows the protocol rules.</p>
      </div>
      <div className="pillar-grid">
        {pillars.map(({ icon: Icon, n, title, text, meta }) => (
          <article className="pillar" key={n}>
            <div className="pillar-top"><span>{n}</span><Icon /></div>
            <h3>{title}</h3><p>{text}</p>
            <div className="pillar-meta"><span>{meta[0]}</span><b>{meta[1]}</b></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function FlowSection() {
  const steps = [
    ['Connect', 'Robinhood Chain wallet integration is planned for public settlement.'],
    ['Shield', 'Bind public ETH to a private note commitment.'],
    ['Transfer', 'Move value between private notes with a zero-knowledge proof.'],
    ['Exit', 'Prove a valid spend and return ETH to a public recipient.'],
  ]
  return (
    <section className="flow-section" id="privacy">
      <div className="flow-title"><span className="eyebrow green-text">HOW IT WORKS</span><h2>Public in.<br />Private inside.<br /><em>Verified out.</em></h2><SolArtwork /></div>
      <div className="flow-list">
        {steps.map(([title, text], i) => <article key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div>{i < 3 && <ArrowRight />}</article>)}
      </div>
    </section>
  )
}

function PrivacyMap() {
  return (
    <section className="map-section">
      <div className="map-title"><span className="eyebrow">CLEAR BY DESIGN</span><h2>Private does not mean vague.</h2><p>VORNUQ separates what the public chain needs to verify from what belongs to the user.</p></div>
      <div className="map-grid">
        <div className="map-card private-card">
          <span><EyeOff />NOT EXPOSED ONCHAIN</span>
          <ul><li>Shielded balance</li><li>Internal transfer amounts</li><li>Internal sender / recipient link</li><li>Note ownership graph</li></ul>
        </div>
        <div className="map-center"><div className="keyhole-shape"><i /><b /></div><small>ZERO-KNOWLEDGE<br />PROOF</small></div>
        <div className="map-card public-card">
          <span><ShieldCheck />VERIFIABLE ONCHAIN</span>
          <ul><li>State transition is valid</li><li>Public entry and exit values</li><li>No note is spent twice</li><li>Assets are conserved</li></ul>
        </div>
      </div>
    </section>
  )
}

function SecuritySection() {
  const items = [
    ['Keys stay local', 'One-time spending secrets are generated on the user device and never sent to the pool contract.'],
    ['Value bound at entry', 'The contract derives each deposit commitment from the exact ETH value supplied in the transaction.'],
    ['Proof before state', 'Private transfers must prove membership, ownership, amount ranges and value conservation before execution.'],
    ['Limits stay explicit', 'Public entry, public exit, timing and network metadata remain part of the documented threat model.'],
  ]
  return (
    <section className="security-section" id="security">
      <div className="security-head"><span className="eyebrow green-text">SECURITY MODEL</span><h2>Know what protects you.</h2><p>Privacy claims are only useful when their assumptions are explicit.</p><SolArtwork variant="shield" /></div>
      <div className="security-list">{items.map(([t, p], i) => <article key={t}><span>0{i + 1}</span><div><h3>{t}</h3><p>{p}</p></div></article>)}</div>
    </section>
  )
}


function TokenSection() {
  return <section className="token-section" id="token">
    <div className="token-copy"><span className="eyebrow">VORNUQ / NEW CHAPTER</span><h2>Privacy first.<br /><em>Built in the open.</em></h2><p>VORNUQ is developing a non-custodial shielded account experience for Robinhood Chain. Follow the source and release notes as the protocol takes shape.</p></div>
    <div className="token-console"><div className="token-ca"><span>ROBINHOOD CHAIN / CA</span><strong>TBA</strong><small>The Robinhood Chain contract address has not been published.</small></div><div className="token-links"><a href="https://docs.robinhood.com/chain/" target="_blank" rel="noreferrer"><span>ROBINHOOD CHAIN</span><b>Explore the network</b><ArrowUpRight /></a><a href={CHAIN.blockExplorerUrls[0]} target="_blank" rel="noreferrer"><span>EXPLORER</span><b>View Robinhood Chain</b><ArrowUpRight /></a></div><p><ShieldCheck />Robinhood Chain integration is in development. Wallet connection and transactions are unavailable.</p></div>
  </section>
}
function DeveloperSection() {
  return (
    <section className="developer-section" id="developers">
      <img src={`${BASE}eth-mark.svg`} alt="" />
      <div className="dev-content">
        <span className="eyebrow green-text">BUILDING IN PUBLIC</span>
        <h2>Privacy needs<br /><em>more builders.</em></h2>
        <p>Building in the open across zero-knowledge circuits, wallets and protocol security.</p>
        <div className="dev-stack"><span>Circom</span><span>Solidity / EVM</span><span>Groth16</span><span>JavaScript SDK</span></div>
        <div className="dev-actions"><a className="primary-btn green" href={`${BASE}docs.html`}><Code2 />Read the docs</a><a className="primary-btn outline" href="https://github.com/GHOSTXrun/fasfafasf" target="_blank" rel="noreferrer">View VORNUQ on GitHub <ArrowUpRight /></a></div>
      </div>
      <div className="dev-note">hard problem?<br /><b>good.</b></div>
    </section>
  )
}

function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq-section" id="faq">
      <div className="faq-head"><span className="eyebrow">QUESTIONS, ANSWERED</span><h2>Read this before<br />you enter the shield.</h2><SolArtwork variant="notes" /></div>
      <div className="faq-list">{faqs.map(([q, a], i) => <article className={open === i ? 'open' : ''} key={q}><button onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><i>{open === i ? '−' : '+'}</i></button><div><p>{a}</p></div></article>)}</div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-main"><Logo /><p>Your money is none of<br />the internet’s business.</p><div><a href="#product">Product</a><a href="#security">Security</a><a href="#roadmap">Progress</a><a href={`${BASE}?info=privacy`}>Privacy</a><a href={`${BASE}?info=terms`}>Terms</a><a href="https://github.com/GHOSTXrun/fasfafasf" target="_blank" rel="noreferrer">GitHub ↗</a></div></div>
      <div className="footer-bottom"><span>© 2026 VORNUQ</span><span>Non-custodial privacy infrastructure for Robinhood Chain.</span><a href={CHAIN.blockExplorerUrls[0]} target="_blank" rel="noreferrer">Mainnet explorer <ArrowUpRight /></a></div>
    </footer>
  )
}


function App() {
  const informationKind = new URLSearchParams(window.location.search).get('info')
  const [appOpen, setAppOpen] = useState(new URLSearchParams(window.location.search).get('app') === '1')
  useEffect(() => { if (window.location.hash) requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView()) }, [])
  useEffect(() => { document.body.style.overflow = appOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [appOpen])
  if (informationKind === 'privacy' || informationKind === 'terms') return <InformationPage kind={informationKind} />
  return <>
    <div className="page"><Hero openApp={() => setAppOpen(true)} /><ProductSection /><FlowSection /><PrivacyMap /><SecuritySection /><Roadmap /><TokenSection /><DeveloperSection /><FAQ /><ContactSection /><Footer /></div>
    {appOpen && <WalletBoundary close={() => setAppOpen(false)}><Suspense fallback={<div className="app-loading" role="status"><Logo dark /><p>Opening wallet connection…</p><button onClick={() => setAppOpen(false)}>Back to website</button></div>}><WalletApplication close={() => setAppOpen(false)} /></Suspense></WalletBoundary>}
  </>
}

createRoot(document.getElementById('root')).render(<App />)
