export const SUPPORTED_WALLETS = [
  { name: 'Backpack', url: 'https://wallet.backpack.exchange/' },
  { name: 'Phantom', url: 'https://phantom.com/download' },
]

export function findWallet(wallets, name) {
  return wallets.find(wallet => wallet.name.toLowerCase() === name.toLowerCase())
}

export function walletError(error) {
  if (error?.code === 4001 || /reject|declin|cancel/i.test(error?.message || '')) {
    return 'Connection cancelled. You can choose a wallet and try again.'
  }
  return error?.message || 'Could not connect. Unlock your wallet and try again.'
}
