import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
const origin = process.env.TEST_URL || 'http://127.0.0.1:5173'
const errors = []
async function pageWithWallets(names = []) {
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on('pageerror', e => errors.push(e.message))
  await page.route('https://api.mainnet-beta.solana.com/**', async route => {
    const input = route.request().postDataJSON()
    await route.fulfill({json:{jsonrpc:'2.0',id:input.id,result:{context:{slot:1},value:2500000000}}})
  })
  await page.addInitScript(names => {
    window.walletTest = { calls: [], reject: false, signatures: 0 }
    const wallets = names.map(name => {
      let accounts = []
      const listeners = new Set()
      const account = {address:'11111111111111111111111111111111',publicKey:new Uint8Array(32),chains:['solana:mainnet'],features:['solana:signTransaction']}
      const wallet = {
        version:'1.0.0', name, icon:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=',chains:['solana:mainnet'],get accounts(){return accounts},
        features:{
          'standard:connect':{version:'1.0.0',connect:async()=>{window.walletTest.calls.push(name);if(window.walletTest.reject){const e=new Error('User rejected the request');e.code=4001;throw e}accounts=[account];listeners.forEach(cb=>cb({accounts}));return {accounts}}},
          'standard:disconnect':{version:'1.0.0',disconnect:async()=>{accounts=[];listeners.forEach(cb=>cb({accounts}))}},
          'standard:events':{version:'1.0.0',on:(event,cb)=>{listeners.add(cb);return()=>listeners.delete(cb)}},
          'solana:signTransaction':{version:'1.0.0',supportedTransactionVersions:['legacy',0],signTransaction:async()=>{window.walletTest.signatures++;throw new Error('Unexpected signature request')}},
        },
      }
      window.walletTest[name] = { revoke:()=>{accounts=[];listeners.forEach(cb=>cb({accounts}))} }
      return wallet
    })
    window.addEventListener('wallet-standard:app-ready',e=>e.detail.register(...wallets))
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet',{detail:api=>api.register(...wallets)}))
  }, names)
  await page.goto(`${origin}/?app=1`,{waitUntil:'networkidle'})
  return {page,context}
}
try {
  const {page:missing,context:missingContext} = await pageWithWallets()
  await missing.getByRole('button',{name:'Connect Backpack',exact:true}).click()
  assert.match(await missing.locator('.wallet-error').innerText(),/Backpack was not detected/)
  assert.equal(await missing.getByRole('link',{name:'Install Phantom'}).count(),1)
  await missing.setViewportSize({width:390,height:844})
  assert.equal(await missing.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  await missing.screenshot({path:'wallet-selector-mobile.png',fullPage:true})
  await missingContext.close()
  console.log('PASS missing wallets, install links and mobile layout')

  for(const name of ['Backpack','Phantom']) {
    const {page,context}=await pageWithWallets(['Backpack','Phantom'])
    await page.getByRole('button',{name:`Connect ${name}`,exact:true}).click()
    await page.locator('.connected-state').waitFor()
    assert.match(await page.locator('.connected-head .eyebrow').innerText(),new RegExp(name))
    await page.waitForFunction(()=>document.querySelector('.main-balance>strong')?.textContent==='2.5 SOL')
    assert.equal(await page.getByRole('button',{name:'Shield SOL',exact:true}).isDisabled(),true)
    assert.equal(await page.evaluate(()=>window.walletTest.signatures),0)
    await page.getByRole('button',{name:'Disconnect',exact:true}).click()
    await page.getByRole('button',{name:`Connect ${name}`,exact:true}).waitFor()
    await page.evaluate(()=>{window.walletTest.reject=true})
    await page.getByRole('button',{name:`Connect ${name}`,exact:true}).click()
    await page.waitForFunction(()=>document.querySelector('.wallet-error')?.textContent.includes('cancelled'))
    await page.evaluate(()=>{window.walletTest.reject=false})
    await page.getByRole('button',{name:`Connect ${name}`,exact:true}).click()
    await page.locator('.connected-state').waitFor()
    await page.evaluate(name=>window.walletTest[name].revoke(),name)
    await page.getByRole('button',{name:`Connect ${name}`,exact:true}).waitFor()
    assert.deepEqual(await page.evaluate(()=>window.walletTest.calls),[name,name,name])
    await context.close()
    console.log(`PASS ${name}: selection, connect, balance, disconnect, rejection, retry and revocation`)
  }
  const context=await browser.newContext()
  const page=await context.newPage()
  await page.goto(origin,{waitUntil:'networkidle'})
  assert.equal(await page.locator('#roadmap article').count(),4)
  await page.getByRole('link',{name:'Privacy',exact:true}).last().click()
  await page.getByRole('heading',{name:'Privacy information',exact:true}).waitFor()
  await page.goto(`${origin}/?info=terms`,{waitUntil:'networkidle'})
  await page.getByRole('heading',{name:'Pre-release terms & limitations',exact:true}).waitFor()
  assert.deepEqual(errors,[])
  console.log('PASS roadmap and information pages; no runtime errors')
  await context.close()
} finally { await browser.close() }
