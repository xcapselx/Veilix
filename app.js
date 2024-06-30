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
import { ApiPromise, WsProvider } from '@polkadot/api';

// Function to initialize Polkadot API and fetch network data
async function initializePolkadotApi() {
    try {
        const wsProvider = new WsProvider('wss://rpc.polkadot.io');
        const api = await ApiPromise.create({ provider: wsProvider });

        // Fetch the current block number
        const lastHeader = await api.rpc.chain.getHeader();
        document.getElementById('blockNumber').textContent = `Current Block: ${lastHeader.number}`;

        // Fetch the list of validators
        const validators = await api.query.session.validators();
        const validatorAddresses = validators.map(validator => validator.toString());
        document.getElementById('validators').textContent = `Validators: ${validatorAddresses.join(', ')}`;

    } catch (error) {
        console.error('Failed to initialize Polkadot API:', error);
    }
}

// Call the function to initialize Polkadot API
initializePolkadotApi().catch(console.error);
import { SubsocialApi } from '@subsocial/api';
import { web3Enable, web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import grill from '@subsocial/grill-widget';

// Function to initialize Subsocial API and Polkadot API
async function initializeApis() {
    try {
        // Initialize the Subsocial API
        const subsocialApi = await SubsocialApi.create({
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

        // Display accounts in the UI
        const accountsList = document.getElementById('accountsList');
        accounts.forEach((account) => {
            const accountItem = document.createElement('li');
            accountItem.textContent = account.address;
            accountsList.appendChild(accountItem);
        });

        // Initialize Polkadot API
        const wsProvider = new WsProvider('wss://rpc.polkadot.io');
        const api = await ApiPromise.create({ provider: wsProvider });

        // Fetch the current block number
        const lastHeader = await api.rpc.chain.getHeader();
        document.getElementById('blockNumber').textContent = `Current Block: ${lastHeader.number}`;

        // Fetch the list of validators
        const validators = await api.query.session.validators();
        const validatorAddresses = validators.map(validator => validator.toString());
        document.getElementById('validators').textContent = `Validators: ${validatorAddresses.join(', ')}`;

    } catch (error) {
        console.error('Failed to initialize APIs:', error);
    }
}

// Call the function to initialize APIs
initializeApis().catch(console.error);

// Grill Widget Configuration
const config = {
    theme: 'dark',
    widgetElementId: 'grill',
    hub: {
        id: '30308'
    },
    channel: {
        type: 'channel',
        id: '185226',
        settings: {
            enableBackButton: false,
            enableLoginButton: true,
            enableInputAutofocus: true
        }
    }
};

// Initialize Grill Widget
grill.init(config);
// Add this function inside your app.js
async function makeTransaction() {
    try {
        // Ensure the APIs are initialized
        const api = await initializeApis();

        // Get the account to make the transaction from
        const accounts = await web3Accounts();
        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }
        const account = accounts[0];
        
        // Get the injector for the account
        const injector = await web3FromSource(account.meta.source);

        // Make the transaction
        const transfer = api.tx.balances.transfer('<RECIPIENT_ADDRESS>', 1000000000000);
        const hash = await transfer.signAndSend(account.address, { signer: injector.signer });

        console.log('Transaction sent with hash:', hash.toHex());

    } catch (error) {
        console.error('Failed to make transaction:', error);
    }
}

// Call the function to make a transaction
makeTransaction().catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

// Initialize the Polkadot API
async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  // Enable Polkadot.js extension
  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  // Get accounts from Polkadot.js extension
  const accounts = await web3Accounts();
  console.log(accounts);

  return api;
}

// Call the function to initialize
initializePolkadotAPI().catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// Initialize the Polkadot API and handle user authentication
async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  // Enable Polkadot.js extension
  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  // Get accounts from Polkadot.js extension
  const accounts = await web3Accounts();
  console.log(accounts);

  // Select the first account as the default account
  const account = accounts[0];

  // Get the signer for the account
  const injector = await web3FromAddress(account.address);

  // Set the signer for the API
  api.setSigner(injector.signer);

  return { api, account };
}

// Call the function to initialize
initializePolkadotAPI().then(({ api, account }) => {
  console.log('API initialized:', api);
  console.log('Account:', account);
}).catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// Initialize the Polkadot API and handle user authentication
async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  // Enable Polkadot.js extension
  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  // Get accounts from Polkadot.js extension
  const accounts = await web3Accounts();
  console.log(accounts);

  // Select the first account as the default account
  const account = accounts[0];

  // Get the signer for the account
  const injector = await web3FromAddress(account.address);

  // Set the signer for the API
  api.setSigner(injector.signer);

  return { api, account };
}

// Display notification
function displayNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Call the function to initialize
initializePolkadotAPI().then(({ api, account }) => {
  console.log('API initialized:', api);
  console.log('Account:', account);

  displayNotification('Polkadot API initialized and account connected.');
}).catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// Initialize the Polkadot API and handle user authentication
async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  // Enable Polkadot.js extension
  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  // Get accounts from Polkadot.js extension
  const accounts = await web3Accounts();
  console.log(accounts);

  // Select the first account as the default account
  const account = accounts[0];

  // Get the signer for the account
  const injector = await web3FromAddress(account.address);

  // Set the signer for the API
  api.setSigner(injector.signer);

  return { api, account };
}

// Display notification
function displayNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Call the function to initialize
initializePolkadotAPI().then(({ api, account }) => {
  console.log('API initialized:', api);
  console.log('Account:', account);

  displayNotification('Polkadot API initialized and account connected.');
}).catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import io from 'socket.io-client';

// Initialize the Polkadot API and handle user authentication
async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  // Enable Polkadot.js extension
  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  // Get accounts from Polkadot.js extension
  const accounts = await web3Accounts();
  console.log(accounts);

  // Select the first account as the default account
  const account = accounts[0];

  // Get the signer for the account
  const injector = await web3FromAddress(account.address);

  // Set the signer for the API
  api.setSigner(injector.signer);

  return { api, account };
}

// Display notification
function displayNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Initialize WebSocket connection
function initializeWebSocket() {
  const socket = io('http://localhost:3000'); // Update with your WebSocket server URL

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('data', (data) => {
    console.log('Received data:', data);
    displayNotification('New data received from Polkadot network');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
}

// Call the function to initialize
initializePolkadotAPI().then(() => {
  initializeWebSocket();
}).catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import io from 'socket.io-client';

async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  const accounts = await web3Accounts();
  console.log(accounts);

  const account = accounts[0];
  const injector = await web3FromAddress(account.address);
  api.setSigner(injector.signer);

  return { api, account };
}

function displayNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

function initializeWebSocket() {
  const socket = io('http://localhost:3000');
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('data', (data) => {
    console.log('Received data:', data);
    displayNotification('New data received from Polkadot network');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
}

// User Authentication Functions
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered:', userCredential.user);
  } catch (error) {
    console.error('Error registering user:', error.message);
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user);
  } catch (error) {
    console.error('Error logging in user:', error.message);
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out user:', error.message);
  }
}

// Initialize the application
initializePolkadotAPI().then(() => {
  initializeWebSocket();
}).catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import io from 'socket.io-client';

async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  const accounts = await web3Accounts();
  console.log(accounts);

  const account = accounts[0];
  const injector = await web3FromAddress(account.address);
  api.setSigner(injector.signer);

  return { api, account };
}

function displayNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

function initializeWebSocket() {
  const socket = io('http://localhost:3000');
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('data', (data) => {
    console.log('Received data:', data);
    displayNotification('New data received from Polkadot network');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
}

// User Authentication Functions
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered:', userCredential.user);
    displayNotification('User registered successfully');
    toggleForms(false);
  } catch (error) {
    console.error('Error registering user:', error.message);
    displayNotification('Error registering user');
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user);
    displayNotification('User logged in successfully');
    toggleForms(false);
  } catch (error) {
    console.error('Error logging in user:', error.message);
    displayNotification('Error logging in user');
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    console.log('User logged out');
    displayNotification('User logged out successfully');
    toggleForms(true);
  } catch (error) {
    console.error('Error logging out user:', error.message);
    displayNotification('Error logging out user');
  }
}

function toggleForms(showLogin) {
  document.getElementById('login-form').classList.toggle('hidden', !showLogin);
  document.getElementById('register-form').classList.toggle('hidden', showLogin);
  document.getElementById('logout-button').classList.toggle('hidden', showLogin);
}

// Initialize the application
initializePolkadotAPI().then(() => {
  initializeWebSocket();
}).catch(console.error);

// Initially show the login form
toggleForms(true);
// app.js
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { SubsocialApi } from '@subsocial/api';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import io from 'socket.io-client';

async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  const accounts = await web3Accounts();
  console.log(accounts);

  const account = accounts[0];
  const injector = await web3FromAddress(account.address);
  api.setSigner(injector.signer);

  // Fetch account balance
  const { data: balance } = await api.query.system.account(account.address);
  console.log(`Balance of ${account.address}: ${balance.free.toHuman()}`);

  return { api, account };
}

async function initializeSubsocialAPI() {
  const subsocialApi = await SubsocialApi.create({
    substrateNodeUrl: 'wss://rpc.polkadot.io',
    ipfsNodeUrl: 'https://crustwebsites.net'
  });

  console.log('Subsocial API initialized');
  return subsocialApi;
}

function displayNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

function initializeWebSocket() {
  const socket = io('http://localhost:3000');
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('data', (data) => {
    console.log('Received data:', data);
    displayNotification('New data received from Polkadot network');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
}

// User Authentication Functions
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered:', userCredential.user);
    displayNotification('User registered successfully');
    toggleForms(false);
  } catch (error) {
    console.error('Error registering user:', error.message);
    displayNotification('Error registering user');
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user);
    displayNotification('User logged in successfully');
    toggleForms(false);
  } catch (error) {
    console.error('Error logging in user:', error.message);
    displayNotification('Error logging in user');
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    console.log('User logged out');
    displayNotification('User logged out successfully');
    toggleForms(true);
  } catch (error) {
    console.error('Error logging out user:', error.message);
    displayNotification('Error logging out user');
  }
}

function toggleForms(showLogin) {
  document.getElementById('login-form').classList.toggle('hidden', !showLogin);
  document.getElementById('register-form').classList.toggle('hidden', showLogin);
  document.getElementById('logout-button').classList.toggle('hidden', showLogin);
}

// Initialize the application
initializePolkadotAPI().then(() => {
  initializeWebSocket();
}).catch(console.error);

initializeSubsocialAPI().catch(console.error);

// Initially show the login form
toggleForms(true);
// app.js
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { SubsocialApi } from '@subsocial/api';
import io from 'socket.io-client';

async function initializePolkadotAPI() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  const accounts = await web3Accounts();
  console.log(accounts);

  const account = accounts[0];
  const injector = await web3FromAddress(account.address);
  api.setSigner(injector.signer);

  // Fetch account balance
  const { data: balance } = await api.query.system.account(account.address);
  console.log(`Balance of ${account.address}: ${balance.free.toHuman()}`);

  return { api, account };
}

async function initializeSubsocialAPI() {
  const subsocialApi = await SubsocialApi.create({
    substrateNodeUrl: 'wss://rpc.polkadot.io',
    ipfsNodeUrl: 'https://crustwebsites.net'
  });

  console.log('Subsocial API initialized');
  return subsocialApi;
}

function displayNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

function initializeWebSocket() {
  const socket = io('http://localhost:3000');
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('data', (data) => {
    console.log('Received data:', data);
    displayNotification('New data received from Polkadot network');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
}

// Grill widget configuration
const grillConfig = {
  theme: "dark",
  widgetElementId: "grill",
  hub: {
    id: "30308"  // Your actual hub ID
  },
  channel: {
    type: "channel",
    id: "185226",  // Your actual channel ID
    settings: {
      enableBackButton: false,
      enableLoginButton: true,
      enableInputAutofocus: true
    }
  }
};

window.GRILL.init(grillConfig);

// Initialize the application
initializePolkadotAPI().then(() => {
  initializeWebSocket();
}).catch(console.error);

initializeSubsocialAPI().catch(console.error);
