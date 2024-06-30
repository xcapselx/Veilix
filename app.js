import { SubsocialApi } from '@subsocial/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

async function initializeSubsocial() {
  try {
    // Initialize the Subsocial API
    const api = await SubsocialApi.create({
      substrateNodeUrl: 'wss://rpc.polkadot.io',
      ipfsNodeUrl: 'https://crustwebsites.net'
    });

    // Enable Polkadot.js extension
    const extensions = await web3Enable('Veilix');
    if (extensions.length === 0) {
      throw new Error('No extension found');
    }

    // Get accounts from Polkadot.js extension
    const accounts = await web3Accounts();
    console.log(accounts);
  } catch (error) {
    console.error('Error initializing Subsocial:', error);
  }
}

// Call the function to initialize
initializeSubsocial();
