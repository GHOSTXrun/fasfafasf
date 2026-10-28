import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'

const url = process.env.LIVE_SITE_URL || 'https://vornuq.fun/'
const executablePath = process.env.BROWSER_PATH || [
  '/usr/bin/google-chrome', '/opt/google/chrome/chrome', '/usr/bin/chromium',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
const browser = await chromium.launch({headless:true,...(executablePath?{executablePath}:{})})
const page = await browser.newPage({viewport:{width:1440,height:1000}})
const failures = []
page.on('pageerror', error => { console.log('PAGE_ERROR', error.stack || error.message); failures.push(error.message) })
page.on('console', message => { if(message.type()==='error') console.log('CONSOLE_ERROR',message.text()) })
page.on('requestfailed', request => console.log('REQUEST_FAILED',request.url(),request.failure()?.errorText))
page.on('response', response => {
  const request = response.request()
  if(request.resourceType()==='document'||['script','stylesheet'].includes(request.resourceType())) {
    console.log('RESOURCE',response.status(),response.headers()['content-type'],response.url())
    if(response.status()>=400) failures.push(`${response.status()} ${response.url()}`)
  }
})
try {
  const response = await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000})
  console.log('FINAL_URL',page.url(),'STATUS',response.status(),'TITLE',await page.title())
  console.log('ENTRY_SCRIPTS',await page.locator('script[src]').evaluateAll(nodes=>nodes.map(node=>node.src)))
  await page.locator('.hero h1').waitFor({state:'visible',timeout:20000})
  console.log('HOMEPAGE',await page.locator('.hero h1').innerText())
  await page.getByRole('button',{name:'Launch app',exact:true}).first().click()
  await page.getByRole('button',{name:'Connect Phantom',exact:true}).waitFor({state:'visible',timeout:15000})
  await page.getByRole('button',{name:'Connect Backpack',exact:true}).waitFor({state:'visible',timeout:15000})
  console.log('WALLET_CHOOSER_OK')
  if(failures.length)throw new Error(JSON.stringify(failures))
} catch(error) {
  console.log('LIVE_CHECK_FAILED',error.message)
  console.log('BODY_TEXT',(await page.locator('body').innerText()).slice(0,3500))
  console.log('DOM_SNIPPET',(await page.content()).slice(0,4000))
  process.exitCode=1
} finally {
  await page.screenshot({path:'live-site-check.png',fullPage:false}).catch(()=>{})
  await browser.close()
}
