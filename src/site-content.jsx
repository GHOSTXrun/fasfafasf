import React from 'react'
import { ArrowRight, ArrowUpRight, Check, Code2, ShieldCheck, Wallet } from 'lucide-react'
const BASE = import.meta.env.BASE_URL
export const REPO = 'https://github.com/GHOSTXrun/fasfafasf'

export function Roadmap() {
  const milestones = [
    ['01', 'Foundation', 'Available now', 'Brand website, architecture documentation, Robinhood Chain design preview and migration roadmap.', true],
    ['02', 'Testnet integration', 'Next', 'Implement the Robinhood Chain program, client instructions and an end-to-end deposit, transfer and exit flow on devnet.'],
    ['03', 'Verification', 'Planned', 'Publish proving artifacts, test recovery and failure cases, and arrange independent security review.'],
    ['04', 'Mainnet readiness', 'Gated', 'Publish reviewed program and artifact hashes, deployment records and an explicit release decision.'],
  ]
  return <section className="roadmap-section" id="roadmap"><div className="section-intro"><div><span className="eyebrow">PROJECT PROGRESS</span><h2>Built in stages.<br />Verified before release.</h2></div><p>VORNUQ is in active development. Robinhood Chain wallet integration is in development; shielded deposits, private transfers and exits are not live.</p></div><div className="roadmap-grid">{milestones.map(([n,title,status,copy,done])=><article key={n}><div><span>{n}</span><b className={done?'available':''}>{done&&<Check/>}{status}</b></div><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="release-summary"><ShieldCheck/><p><b>Current release: Robinhood Chain preview.</b> Wallet connection and transaction signing are disabled during migration.</p><a href={`${REPO}/commits/main`} target="_blank" rel="noreferrer">Release history <ArrowUpRight/></a></div></section>
}

export function ContactSection() {
  return <section className="contact-section" id="contact"><div><span className="eyebrow">FOLLOW THE BUILD</span><h2>Questions? Start here.</h2><p>The source repository is the currently published project channel. Additional social channels and a contact email have not been announced.</p></div><div><a href={REPO} target="_blank" rel="noreferrer"><Code2/><span><b>Source & development</b><small>Inspect changes and follow progress</small></span><ArrowUpRight/></a><a href={`${REPO}/issues/new`} target="_blank" rel="noreferrer"><Wallet/><span><b>Feedback & connection issues</b><small>Never post recovery files or wallet secrets</small></span><ArrowUpRight/></a><a href={`${BASE}docs.html#threats`}><ShieldCheck/><span><b>Security & privacy model</b><small>Read boundaries and release requirements</small></span><ArrowRight/></a></div></section>
}

const information = {
  privacy: { title: 'Privacy information', intro: 'How this pre-release VORNUQ interface handles information.', sections: [
    ['Wallet connection', 'Wallet connection is unavailable during the Robinhood Chain migration. This preview does not request wallet access or seed phrases.'],
    ['Network requests', 'This preview does not request wallet balances or connect to an RPC endpoint. The static website host can receive your IP address and request metadata. Opening external links subjects you to those services’ policies.'],
    ['Local data', 'The wallet integration may store the last selected wallet and account in this browser to reconnect. Recovery records are generated or imported locally and can grant spending authority. Keep downloaded records private. Disconnecting does not delete files you downloaded.'],
    ['Analytics and support', 'This version does not include an advertising or analytics SDK. Information you submit to GitHub is handled by GitHub and may be public. A private security contact has not yet been published; do not disclose exploitable vulnerabilities or private records in a public issue.'],
    ['Project status', 'This notice describes the current interface. Operator details, a dedicated privacy contact and jurisdiction-specific notices remain to be published before a production service launch.'],
  ]},
  terms: { title: 'Pre-release terms & limitations', intro: 'Please understand the current release before using the interface.', sections: [
    ['Development preview', 'VORNUQ is a software development project. The current release offers a website, documentation, a Robinhood Chain integration preview. Shielded deposits, private transfers, exits and private-note scanning are not available.'],
    ['Wallet permissions', 'A wallet connection shares a public account and does not itself move assets. Read every request in your wallet. This release should not ask you to approve a ETH deposit or a private transaction.'],
    ['Recovery responsibility', 'Local recovery records contain sensitive material. Losing a record can prevent future recovery; sharing it may grant another person spending authority. Do not upload these files to support channels.'],
    ['Token address', 'The Robinhood Chain contract address has not been announced. No financial return or token utility is promised.'],
    ['Release requirements', 'Production use depends on a completed Robinhood Chain program, verified proving artifacts, end-to-end testing, independent review and published deployment records. Formal service terms and operator information will be required before production launch.'],
  ]},
}
export function InformationPage({ kind }) {
  const content=information[kind]
  return <main className="information-page"><a className="info-back" href={BASE}>← VORNUQ</a><span className="eyebrow">PRE-RELEASE / PROJECT INFORMATION</span><h1>{content.title}</h1><p className="info-intro">{content.intro}</p>{content.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}<a className="panel-link" href={REPO} target="_blank" rel="noreferrer">View project source <ArrowUpRight/></a></main>
}
