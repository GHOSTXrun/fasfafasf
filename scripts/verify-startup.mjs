import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'
const executablePath=process.env.BROWSER_PATH||['/usr/bin/google-chrome','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})})
const origin=process.env.TEST_URL||'http://127.0.0.1:5188'
try {
  const page=await browser.newPage()
  const requested=[]
  page.on('request',r=>requested.push(r.url()))
  await page.goto(origin,{waitUntil:'networkidle'})
  await page.locator('.hero h1').waitFor()
  assert.equal(requested.some(url=>/assets\/wallet-app-/.test(url)),false)
  await page.route('**/assets/wallet-app-*.js',route=>route.abort('failed'))
  await page.getByRole('button',{name:'Launch app',exact:true}).first().click()
  await page.getByRole('heading',{name:'Wallet connection could not start.'}).waitFor()
  await page.getByRole('button',{name:'Back to website',exact:true}).click()
  assert.equal(await page.locator('.hero h1').isVisible(),true)
  console.log('PASS homepage starts independently; failed wallet chunk has a recoverable error')
  await page.close()
  const blocked=await browser.newPage()
  await blocked.route('**/assets/main-*.js',route=>route.abort('failed'))
  await blocked.goto(origin,{waitUntil:'networkidle'})
  await blocked.waitForFunction(()=>document.querySelector('#startup-error')?.textContent.includes('Script failed to load:'))
  assert.equal(await blocked.locator('#startup-message').isVisible(),true)
  console.log('PASS failed entry script shows visible loading diagnostics instead of a white page')
  await blocked.close()
} finally { await browser.close() }
