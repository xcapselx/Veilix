import { ApiPromise, WsProvider } from '@polkadot/api';
import { SubsocialApi } from '@subsocial/api';
import { web3Enable, web3Accounts, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';
import grill from '@subsocial/grill-widget';
import { create } from 'ipfs-http-client';
import io from 'socket.io-client';
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Chart } from 'chart.js';
import winston from 'winston';

// Initialize IPFS client
const ipfs = create('https://crustwebsites.net');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Initialize Subsocial API
async function initializeSubsocial() {
  try {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    const subsocialApi = await SubsocialApi.create({
      substrateApi: api,
      ipfsNodeUrl: 'https://crustwebsites.net'
    });

    const extensions = await web3Enable('Veilix');
    if (extensions.length === 0) {
      throw new Error('No extension found');
    }

    const accounts = await web3Accounts();
    console.log(accounts);

    const selectedAccount = accounts[0];
    const injector = await web3FromAddress(selectedAccount.address);

    document.getElementById('account').textContent = `Logged in as: ${selectedAccount.meta.name} (${selectedAccount.address})`;

    const grillConfig = {
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

    grill.init(grillConfig);
  } catch (error) {
    console.error(error);
  }
}

initializeSubsocial().catch(console.error);

// Create a post
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
    addNotification(`New post created: ${title}`);
  } catch (error) {
    console.error('Failed to create post:', error);
  }
}

document.getElementById('postForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  await createPost(title, content);
});

// File upload functionality
async function uploadFile(file) {
  try {
    const addedFile = await ipfs.add(file);
    console.log('File uploaded:', addedFile.path);
  } catch (error) {
    console.error('Failed to upload file:', error);
  }
}

document.getElementById('fileForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (file) {
    await uploadFile(file);
  }
});

async function displayUserProfile() {
  const accounts = await web3Accounts();
  const selectedAccount = accounts[0];
  document.getElementById('userName').textContent = `Name: ${selectedAccount.meta.name}`;
  document.getElementById('userAddress').textContent = `Address: ${selectedAccount.address}`;
}

document.getElementById('updateProfileButton').addEventListener('click', () => {
  document.getElementById('updateProfileForm').style.display = 'block';
});

document.getElementById('saveProfileButton').addEventListener('click', async () => {
  const newUserName = document.getElementById('newUserName').value;
  if (newUserName) {
    const accounts = await web3Accounts();
    const selectedAccount = accounts[0];
    document.getElementById('userName').textContent = `Name: ${newUserName}`;
    document.getElementById('updateProfileForm').style.display = 'none';
  }
});

displayUserProfile();

function addNotification(message) {
  const notificationsDiv = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.textContent = message;
  notificationsDiv.appendChild(notification);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
}

document.getElementById('toggleThemeButton').addEventListener('click', toggleDarkMode);

if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

async function initializePolkadotApi() {
  try {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    const lastHeader = await api.rpc.chain.getHeader();
    document.getElementById('blockNumber').textContent = `Current Block: ${lastHeader.number}`;

    const validators = await api.query.session.validators();
    const validatorAddresses = validators.map(validator => validator.toString());
    document.getElementById('validators').textContent = `Validators: ${validatorAddresses.join(', ')}`;

    // Render the chart
    renderChart(validatorAddresses);

  } catch (error) {
    console.error('Failed to initialize Polkadot API:', error);
  }
}

initializePolkadotApi().catch(console.error);

async function makeTransaction() {
  try {
    const { api, account } = await initializePolkadotAPI();
    const injector = await web3FromSource(account.meta.source);

    const transfer = api.tx.balances.transfer('<RECIPIENT_ADDRESS>', 1000000000000);
    const hash = await transfer.signAndSend(account.address, { signer: injector.signer });

    console.log('Transaction sent with hash:', hash.toHex());
  } catch (error) {
    console.error('Failed to make transaction:', error);
  }
}

makeTransaction().catch(console.error);

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

initializePolkadotAPI().then(() => {
  initializeWebSocket();
}).catch(console.error);

initializeSubsocialAPI().catch(console.error);

toggleForms(true);

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
    document.getElementById('blockNumber').textContent = `Current Block: ${data.blockNumber}`;
    document.getElementById('validators').textContent = `Validators: ${data.validators.join(', ')}`;
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
}

async function initializePolkadotAPI() {
  try {
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
  } catch (error) {
    logger.error('Failed to initialize Polkadot API:', error);
    displayNotification('Failed to initialize Polkadot API');
    throw error;
  }
}

function updateChart(blockNumber, validatorsCount) {
  const chart = Chart.getChart('networkChart');
  chart.data.labels.push(blockNumber);
  chart.data.datasets[0].data.push(validatorsCount);
  chart.update();
}

function initializeChart() {
  const ctx = document.getElementById('networkChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Validators Count',
        data: [],
        borderColor: 'hotpink',
        backgroundColor: 'rgba(255, 105, 180, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Block Number'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Validators Count'
          }
        }
      }
    }
  });
}

initializePolkadotAPI().then(() => {
  initializeWebSocket();
  initializeChart();
}).catch(console.error);
ddresses) {
    const ctx = document.getElementById('networkChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Validators Count',
          data: [validatorAddresses.length],
          borderColor: 'hotpink',
          backgroundColor: 'rgba(255, 105, 180, 0.2)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Block Number'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Validators Count'
            }
          }
        }
      }
    });
  }
  
  // Update the chart with new data
  function updateChart(blockNumber, validatorsCount) {
    const chart = Chart.getChart('networkChart');
    chart.data.labels.push(blockNumber);
    chart.data.datasets[0].data.push(validatorsCount);
    chart.update();
  }
  
  // Initialize the chart
  function initializeChart() {
    const ctx = document.getElementById('networkChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Validators Count',
          data: [],
          borderColor: 'hotpink',
          backgroundColor: 'rgba(255, 105, 180, 0.2)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Block Number'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Validators Count'
            }
          }
        }
      }
    });
  }
  
  initializePolkadotAPI().then(() => {
    initializeWebSocket();
    initializeChart();
  }).catch(console.error);
  
  // Initialize the application
  initializePolkadotAPI().then(() => {
    initializeWebSocket();
    initializeChart();
  }).catch(console.error);
  initializeSubsocialAPI().catch(console.error);
  
  toggleForms(true);
  import { auth, db } from './firebase-config';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { Chart } from 'chart.js';
import io from 'socket.io-client';

const wsProvider = new WsProvider('wss://rpc.polkadot.io');

async function initializePolkadotAPI() {
  const api = await ApiPromise.create({ provider: wsProvider });

  const extensions = await web3Enable('Veilix');
  if (extensions.length === 0) {
    throw new Error('No extension found');
  }

  const accounts = await web3Accounts();
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

function initializeWebSocket(api) {
  const socket = io('http://localhost:3000'); // Update with your WebSocket server URL

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('data', async (data) => {
    console.log('Received data:', data);
    displayNotification('New data received from Polkadot network');
    document.getElementById('blockNumber').textContent = `Current Block: ${data.blockNumber}`;
    document.getElementById('validators').textContent = `Validators: ${data.validators.join(', ')}`;

    updateChart(data.blockNumber, data.validators.length);

    // Fetch the latest data from the Polkadot API
    const lastHeader = await api.rpc.chain.getHeader();
    const validators = await api.query.session.validators();
    const validatorAddresses = validators.map(validator => validator.toString());

    document.getElementById('blockNumber').textContent = `Current Block: ${lastHeader.number}`;
    document.getElementById('validators').textContent = `Validators: ${validatorAddresses.join(', ')}`;
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
}

function updateChart(blockNumber, validatorsCount) {
  const chart = Chart.getChart('networkChart');
  chart.data.labels.push(blockNumber);
  chart.data.datasets[0].data.push(validatorsCount);
  chart.update();
}

function initializeChart() {
  const ctx = document.getElementById('networkChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Validators Count',
        data: [],
        borderColor: 'hotpink',
        backgroundColor: 'rgba(255, 105, 180, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Block Number'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Validators Count'
          }
        }
      }
    }
  });
}

initializePolkadotAPI().then(({ api }) => {
  initializeWebSocket(api);
  initializeChart();
}).catch(console.error);

initializeSubsocialAPI().catch(console.error);
import { ApiPromise, WsProvider } from '@polkadot/api';
import { SubsocialApi } from '@subsocial/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { create } from 'ipfs-http-client';
import io from 'socket.io-client';
import { auth, db } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Chart } from 'chart.js';
import { ApillonSDK } from '@apillon/sdk';

// Initialize IPFS client
const ipfs = create('https://crustwebsites.net');

// Initialize Apillon SDK
const apillon = new ApillonSDK({
  apiKey: 'YOUR_APILLON_API_KEY'
});

async function initializeSubsocial() {
    try {
        const wsProvider = new WsProvider('wss://rpc.polkadot.io');
        const api = await ApiPromise.create({ provider: wsProvider });

        const subsocialApi = await SubsocialApi.create({
            substrateApi: api,
            ipfsNodeUrl: 'https://crustwebsites.net'
        });

        const extensions = await web3Enable('Veilix');
        if (extensions.length === 0) {
            throw new Error('No extension found');
        }

        const accounts = await web3Accounts();
        console.log(accounts);

        const selectedAccount = accounts[0];
        const injector = await web3FromAddress(selectedAccount.address);

        document.getElementById('account').textContent = `Logged in as: ${selectedAccount.meta.name} (${selectedAccount.address})`;

        const grillConfig = {
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

        grill.init(grillConfig);
    } catch (error) {
        console.error(error);
    }
}

initializeSubsocial().catch(console.error);

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
        addNotification(`New post created: ${title}`);
    } catch (error) {
        console.error('Failed to create post:', error);
    }
}

document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    await createPost(title, content);
});

async function uploadFile(file) {
    try {
        const addedFile = await ipfs.add(file);
        console.log('File uploaded:', addedFile.path);
    } catch (error) {
        console.error('Failed to upload file:', error);
    }
}

document.getElementById('fileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        await uploadFile(file);
    }
});

async function displayUserProfile() {
    const accounts = await web3Accounts();
    const selectedAccount = accounts[0];
    const userProfile = await getUserProfile(selectedAccount.address);
    
    if (userProfile) {
        document.getElementById('userName').textContent = `Name: ${userProfile.userName}`;
        document.getElementById('userAddress').textContent = `Address: ${userProfile.userAddress}`;
    } else {
        document.getElementById('userName').textContent = `Name: ${selectedAccount.meta.name}`;
        document.getElementById('userAddress').textContent = `Address: ${selectedAccount.address}`;
    }
}

document.getElementById('updateProfileButton').addEventListener('click', () => {
    document.getElementById('updateProfileForm').style.display = 'block';
});

document.getElementById('saveProfileButton').addEventListener('click', async () => {
    const newUserName = document.getElementById('newUserName').value;
    if (newUserName) {
        const accounts = await web3Accounts();
        const selectedAccount = accounts[0];
        await saveUserProfile(selectedAccount.address, newUserName, selectedAccount.address);
        document.getElementById('userName').textContent = `Name: ${newUserName}`;
        document.getElementById('updateProfileForm').style.display = 'none';
    }
});

displayUserProfile();

function addNotification(message) {
    const notificationsDiv = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.textContent = message;
    notificationsDiv.appendChild(notification);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

document.getElementById('toggleThemeButton').addEventListener('click', toggleDarkMode);

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

async function initializePolkadotApi() {
    try {
        const wsProvider = new WsProvider('wss://rpc.polkadot.io');
        const api = await ApiPromise.create({ provider: wsProvider });

        const lastHeader = await api.rpc.chain.getHeader();
        document.getElementById('blockNumber').textContent = `Current Block: ${lastHeader.number}`;

        const validators = await api.query.session.validators();
        const validatorAddresses = validators.map(validator => validator.toString());
        document.getElementById('validators').textContent = `Validators: ${validatorAddresses.join(', ')}`;
    } catch (error) {
        console.error('Failed to initialize Polkadot API:', error);
    }
}

initializePolkadotApi().catch(console.error);

async function makeTransaction() {
    try {
        const { api, account } = await initializePolkadotAPI();
        const injector = await web3FromSource(account.meta.source);

        const transfer = api.tx.balances.transfer('<RECIPIENT_ADDRESS>', 1000000000000);
        const hash = await transfer.signAndSend(account.address, { signer: injector.signer });

        console.log('Transaction sent with hash:', hash.toHex());
    } catch (error) {
        console.error('Failed to make transaction:', error);
    }
}

makeTransaction().catch(console.error);

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

initializePolkadotAPI().then(() => {
    initializeWebSocket();
}).catch(console.error);

initializeSubsocialAPI().catch(console.error);

toggleForms(true);

function displayNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

function initializeWebSocket(api) {
    const socket = io('http://localhost:3000'); // Update with your WebSocket server URL

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
    });

    socket.on('data', (data) => {
        console.log('Received data:', data);
        displayNotification('New data received from Polkadot network');
        // Update UI with the received data
        document.getElementById('blockNumber').textContent = `Current Block: ${data.blockNumber}`;
        document.getElementById('validators').textContent = `Validators: ${data.validators.join(', ')}`;
        updateChart(data.blockNumber, data.validators.length);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });
}

function updateChart(blockNumber, validatorsCount) {
    const chart = Chart.getChart('networkChart');
    chart.data.labels.push(blockNumber);
    chart.data.datasets[0].data.push(validatorsCount);
    chart.update();
}

function initializeChart() {
    const ctx = document.getElementById('networkChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Validators Count',
                data: [],
                borderColor: 'hotpink',
                backgroundColor: 'rgba(255, 105, 180, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Block Number'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Validators Count'
                    }
                }
            }
        }
    });
}

async function saveUserProfile(userId, userName, userAddress) {
    try {
        await setDoc(doc(db, 'users', userId), {
            userName,
            userAddress
        });
        console.log('User profile saved');
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
}

async function getUserProfile(userId) {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log('No such document!');
            return null;
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
    }
}

initializePolkadotAPI().then(({ api }) => {
    initializeWebSocket(api);
    initializeChart();
    displayUserProfile();
}).catch(console.error);

initializeSubsocialAPI().catch(console.error);
// Add this at the end of your app.js

// Function to log user activities
function logUserActivity(activity) {
    const logContainer = document.getElementById('activityLog');
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toLocaleString()}: ${activity}`;
    logContainer.appendChild(logEntry);
}

// Update existing functions to log activities

async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered:', userCredential.user);
        displayNotification('User registered successfully');
        logUserActivity('User registered');
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
        logUserActivity('User logged in');
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
        logUserActivity('User logged out');
        toggleForms(true);
    } catch (error) {
        console.error('Error logging out user:', error.message);
        displayNotification('Error logging out user');
    }
}

async function makeTransaction() {
    try {
        const { api, account } = await initializePolkadotAPI();
        const injector = await web3FromSource(account.meta.source);

        const transfer = api.tx.balances.transfer('<RECIPIENT_ADDRESS>', 1000000000000);
        const hash = await transfer.signAndSend(account.address, { signer: injector.signer });

        console.log('Transaction sent with hash:', hash.toHex());
        logUserActivity(`Transaction sent: ${hash.toHex()}`);
    } catch (error) {
        console.error('Failed to make transaction:', error);
    }
}
// Function to handle real-time notifications
function handleRealTimeNotifications(api) {
    api.rpc.chain.subscribeNewHeads((lastHeader) => {
        displayNotification(`New block: ${lastHeader.number}`);
        logUserActivity(`New block: ${lastHeader.number}`);
    });
}

// Call this function after initializing Polkadot API
initializePolkadotAPI().then(({ api }) => {
    initializeWebSocket(api);
    initializeChart();
    displayUserProfile();
    handleRealTimeNotifications(api); // Add this line
}).catch(console.error);
// Function to initialize the activity log chart
function initializeActivityLogChart() {
    const ctx = document.getElementById('activityLogChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'User Activities',
                data: [],
                backgroundColor: 'rgba(255, 105, 180, 0.2)',
                borderColor: 'hotpink',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Activity'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    });
}

// Update the logUserActivity function to update the chart
function logUserActivity(activity) {
    const logContainer = document.getElementById('activityLog');
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toLocaleString()}: ${activity}`;
    logContainer.appendChild(logEntry);

    const chart = Chart.getChart('activityLogChart');
    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(activity);
    chart.update();
}

// Initialize the chart after document is loaded
document.addEventListener('DOMContentLoaded', (event) => {
    initializeActivityLogChart();
});
// Add this at the end of your app.js

// Function to add a comment to a post
async function addComment(postId, comment) {
    try {
        const accounts = await web3Accounts();
        const selectedAccount = accounts[0];
        const injector = await web3FromAddress(selectedAccount.address);

        const { commentId } = await subsocialApi.comments.createComment({
            postId,
            body: comment
        }, selectedAccount.address, injector.signer);

        console.log('Comment added with ID:', commentId);
        addNotification(`Comment added: ${comment}`);
    } catch (error) {
        console.error('Failed to add comment:', error);
    }
}

// Event listener for adding a comment
document.getElementById('commentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const postId = document.getElementById('commentPostId').value;
    const comment = document.getElementById('commentText').value;
    await addComment(postId, comment);
});

// Function to like a post
async function likePost(postId) {
    try {
        const accounts = await web3Accounts();
        const selectedAccount = accounts[0];
        const injector = await web3FromAddress(selectedAccount.address);

        const { likeId } = await subsocialApi.likes.addLike(postId, selectedAccount.address, injector.signer);

        console.log('Post liked with ID:', likeId);
        addNotification(`Post liked: ${postId}`);
    } catch (error) {
        console.error('Failed to like post:', error);
    }
}

// Event listener for liking a post
document.getElementById('likeButton').addEventListener('click', async () => {
    const postId = document.getElementById('likePostId').value;
    await likePost(postId);
});
// Function to search posts
async function searchPosts(query) {
    try {
        const posts = await subsocialApi.posts.getPosts({ search: query });
        console.log('Search results:', posts);
        displaySearchResults(posts);
    } catch (error) {
        console.error('Failed to search posts:', error);
    }
}

// Function to display search results
function displaySearchResults(posts) {
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.textContent = `Title: ${post.title}, Content: ${post.body}`;
        searchResultsDiv.appendChild(postDiv);
    });
}

// Event listener for search form submission
document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = document.getElementById('searchQuery').value;
    await searchPosts(query);
});
// Function to update user email
async function updateUserEmail(newEmail) {
    try {
        const user = auth.currentUser;
        await user.updateEmail(newEmail);
        console.log('User email updated');
        displayNotification('User email updated successfully');
    } catch (error) {
        console.error('Error updating email:', error.message);
        displayNotification('Error updating email');
    }
}

// Function to update user password
async function updateUserPassword(newPassword) {
    try {
        const user = auth.currentUser;
        await user.updatePassword(newPassword);
        console.log('User password updated');
        displayNotification('User password updated successfully');
    } catch (error) {
        console.error('Error updating password:', error.message);
        displayNotification('Error updating password');
    }
}

// Event listeners for updating email and password
document.getElementById('updateEmailButton').addEventListener('click', async () => {
    const newEmail = document.getElementById('newEmail').value;
    await updateUserEmail(newEmail);
});

document.getElementById('updatePasswordButton').addEventListener('click', async () => {
    const newPassword = document.getElementById('newPassword').value;
    await updateUserPassword(newPassword);
});
