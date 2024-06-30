import { SubsocialApi } from './node_modules/@subsocial/api/bundled/subsocial.js';
import { web3Enable, web3Accounts } from './node_modules/@polkadot/extension-dapp/bundled/extension.js';

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

        // Initialize Grill widget
        const config = {
            "theme": "dark",
            "widgetElementId": "grill",
            "hub": {
                "id": "30308"
            },
            "channel": {
                "type": "channel",
                "id": "185226",
                "settings": {
                    "enableBackButton": false,
                    "enableLoginButton": true,
                    "enableInputAutofocus": true
                }
            }
        };

        window.GRILL.init(config);
    } catch (error) {
        console.error('Error initializing Subsocial:', error);
    }
}

// Call the function to initialize
initializeSubsocial().catch(console.error);
