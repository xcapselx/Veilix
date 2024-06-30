import { ApiPromise, WsProvider } from '@polkadot/api';
import { SubsocialApi } from '@subsocial/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

async function initializeSubsocial() {
    try {
        // Connect to Polkadot network
        const wsProvider = new WsProvider('wss://rpc.polkadot.io');
        const api = await ApiPromise.create({ provider: wsProvider });

        // Initialize the Subsocial API
        const subsocialApi = await SubsocialApi.create({
            substrateApi: api,
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
            theme: "dark",
            widgetElementId: "grill",
            hub: {
                id: "30308"
            },
            channel: {
                type: "channel",
                id: "185226",
                settings: {
                    enableBackButton: false,
                    enableLoginButton: true,
                    enableInputAutofocus: true
                }
            }
        };
        
        window.GRILL.init(config);
    } catch (error) {
        console.error(error);
    }
}

// Call the function to initialize
initializeSubsocial().catch(console.error);
