import { ApiPromise, WsProvider } from '@polkadot/api';
import { SubsocialApi } from '@subsocial/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import grill from '@subsocial/grill-widget';

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

        // Select the first account (or allow user to choose)
        const selectedAccount = accounts[0];
        const injector = await web3FromAddress(selectedAccount.address);

        // Show the selected account in the UI
        document.getElementById('account').textContent = `Logged in as: ${selectedAccount.meta.name} (${selectedAccount.address})`;

        // Initialize Grill widget
        const config = {
            theme: "dark",
            widgetElementId: "grill",
            hub: {
                id: "30308"
            },
            channel: {
                type: "channel",
                id: "185226", // use your specific channel id if available
                settings: {
                    enableBackButton: false,
                    enableLoginButton: true,
                    enableInputAutofocus: true
                }
            }
        };

        grill.init(config);

        // Add additional functionality or event listeners here
    } catch (error) {
        console.error(error);
    }
}

// Call the function to initialize
initializeSubsocial().catch(console.error);
// Existing imports and initialization code...

async function createPost(title, content) {
    try {
        const accounts = await web3Accounts();
        const selectedAccount = accounts[0];
        const injector = await web3FromAddress(selectedAccount.address);

        const { postId } = await subsocialApi.posts.createPost({
            title,
            content
        }, selectedAccount.address, injector.signer);

        console.log('Post created with ID:', postId);
    } catch (error) {
        console.error('Failed to create post:', error);
    }
}

// Add event listener for the post form submission
document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    await createPost(title, content);
});
import { ApiPromise, WsProvider } from '@polkadot/api';
import { SubsocialApi } from '@subsocial/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import grill from '@subsocial/grill-widget';
import { create } from 'ipfs-http-client';

const ipfs = create('https://crustwebsites.net');

async function initializeSubsocial() {
    try {
        // Existing initialization code...

        // Add file upload event listener
        document.getElementById('fileForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            if (file) {
                const addedFile = await ipfs.add(file);
                console.log('File uploaded:', addedFile.path);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// Existing code...
// Function to display user profile
async function displayUserProfile() {
    const accounts = await web3Accounts();
    const selectedAccount = accounts[0];
    document.getElementById('userName').textContent = `Name: ${selectedAccount.meta.name}`;
    document.getElementById('userAddress').textContent = `Address: ${selectedAccount.address}`;
}

// Event listener for updating profile
document.getElementById('updateProfileButton').addEventListener('click', () => {
    document.getElementById('updateProfileForm').style.display = 'block';
});

// Event listener for saving profile
document.getElementById('saveProfileButton').addEventListener('click', async () => {
    const newUserName = document.getElementById('newUserName').value;
    if (newUserName) {
        const accounts = await web3Accounts();
        const selectedAccount = accounts[0];
        // Here you would implement the logic to update the user name in the Subsocial network or Polkadot extension
        // For demonstration, we'll just update the displayed name
        document.getElementById('userName').textContent = `Name: ${newUserName}`;
        document.getElementById('updateProfileForm').style.display = 'none';
    }
});

// Call the function to display user profile
displayUserProfile();
<!-- Existing HTML content... -->

<!-- Notifications -->
<h2>Notifications</h2>
<div id="notifications"></div>

<!-- Existing scripts... -->
import { SubsocialApi } from './node_modules/@subsocial/api/bundled/subsocial.js';
import { web3Enable, web3Accounts, web3FromAddress } from './node_modules/@polkadot/extension-dapp/bundled/extension.js';

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

        // Display user profile
        displayUserProfile();

    } catch (error) {
        console.error('Failed to initialize Subsocial:', error);
    }
}

// Function to display user profile
async function displayUserProfile() {
    const accounts = await web3Accounts();
    const selectedAccount = accounts[0];
    document.getElementById('userName').textContent = `Name: ${selectedAccount.meta.name}`;
    document.getElementById('userAddress').textContent = `Address: ${selectedAccount.address}`;
}

// Event listener for updating profile
document.getElementById('updateProfileButton').addEventListener('click', () => {
    document.getElementById('updateProfileForm').style.display = 'block';
});

// Event listener for saving profile
document.getElementById('saveProfileButton').addEventListener('click', async () => {
    const newUserName = document.getElementById('newUserName').value;
    if (newUserName) {
        const accounts = await web3Accounts();
        const selectedAccount = accounts[0];
        // Here you would implement the logic to update the user name in the Subsocial network or Polkadot extension
        // For demonstration, we'll just update the displayed name
        document.getElementById('userName').textContent = `Name: ${newUserName}`;
        document.getElementById('updateProfileForm').style.display = 'none';
    }
});

// Function to add a notification
function addNotification(message) {
    const notificationsDiv = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.textContent = message;
    notificationsDiv.appendChild(notification);
}

// Example of adding a notification when a new post is created
async function createPost(title, content) {
    try {
        const accounts = await web3Accounts();
        const selectedAccount = accounts[0];
        const injector = await web3FromAddress(selectedAccount.address);

        const { postId } = await api.posts.createPost({
            title,
            content
        }, selectedAccount.address, injector.signer);

        console.log('Post created with ID:', postId);
        addNotification(`New post created: ${title}`);
    } catch (error) {
        console.error('Failed to create post:', error);
    }
}

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Event listener for toggling dark mode
document.getElementById('toggleThemeButton').addEventListener('click', toggleDarkMode);

// Initial dark mode setup
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

// Call the function to initialize
initializeSubsocial().catch(console.error);
