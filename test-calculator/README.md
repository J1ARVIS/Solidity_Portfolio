# React App

This is a React application built using the code provided.

## Prerequisites

Before running the application, make sure you have the following installed on your machine:

- Node.js (version 12 or above)
- npm (Node Package Manager, comes bundled with Node.js)

## Getting Started

To get the app up and running, follow these steps:

1. Clone this repository to your local machine or download and extract the ZIP file.
2. Open a terminal and navigate to the project directory.

## Installation

1. Run the following command to install the required dependencies:

npm install

2. Once the installation is complete, you can start the development server by running the following command:

npm start

3. The app will be accessible at [http://localhost:3000](http://localhost:3000) in your web browser.

## Additional Information

- This application uses the [Metamask](https://metamask.io/) browser extension to interact with Ethereum networks. Make sure you have Metamask installed and set up before using the app.
- The app connects to a deployed smart contract using its address. The contract address is specified in the code: `0x1851ffBce02A134eFd9ddBC91920b0c6DCEfB6f5`. Make sure the contract is deployed at the correct address or update the `contractAddress` variable in the `Calculator` component if needed.
- The app requires a connection to a Sepolia network. Make sure you have a network configured in Metamask and are connected to it.

