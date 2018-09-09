const contract_address = "0xd9b5b27b1f4d1b70cb2f22e4553e3529b8f76d2c";
const abi = [{"constant":true,"inputs":[],"name":"getRanomSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"min_deposit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"secretMessage","type":"string"},{"name":"hash","type":"bytes32"},{"name":"hide","type":"bool"}],"name":"createNewSecret","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"},{"name":"answer","type":"bytes32"}],"name":"postNewAnswer","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"secretHashes","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"},{"name":"answer","type":"bytes32"},{"name":"randomString","type":"string"}],"name":"openSecret","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getSecretByHash","outputs":[{"name":"value","type":"uint256"},{"name":"owner","type":"address"},{"name":"content","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}]
var contract = web3.eth.contract(abi).at(contract_address);

function _Connect(callback){
    if(typeof web3 !== 'undefined') {
          web3 = new Web3(window.web3.currentProvider);
          web3.version.getNetwork((err, netId) => {
              switch (netId) {
                case "1":
                    callback('Switch Network', null);   
                  break
                case "2":
                  console.log('This is the deprecated Morden test network.');
                  callback('Switch Network', null);
                  break
                case "3":
                    console.log('Connected to the ropsten test network.');
                    web3.eth.defaultAccount = web3.eth.accounts[0];
                    if(!web3.eth.defaultAccount){
                        console.log('Log into metamask');
                        _Connect(callback);
                    }else{ 
                        // Success
                        console.log(`Web3 ETH Account: ${web3.eth.defaultAccount}`);
                        callback(false, web3.eth.defaultAccount);
                    }   
                  break
                default:
                  console.log('This is an unknown network.');
                  callback('Switch Network', null);
              }
            });
        } else {
          console.log(`Failed: Web3 instance required, try using MetaMask.`);
          callback('Install Metamask', null);
        }   
}

// Checking if Web3 has been injected by the browser (Mist/MetaMask)
if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
    _Connect(console.log);
} else {
    alert('Metamask is needed for this application to run.');
}

var randomStringSet = {};

function createNewSecret(secretContent, answer, hide) {
    my_account = getDefaultAccount();
    str = generateRandomString();
    console.log("randomString:" + str);
    hash = web3.sha3(answer+str);
    randomStringSet[hash] = str;
    contract.createNewSecret.sendTransaction(secretContent, hash, hide, {from: my_account, value: 2000000000000000}, (err, txhash) => {
        console.log(txhash);
    });
}

function getRanomSecret() {
    my_account = getDefaultAccount();
    contract.getRanomSecret.call({from: my_account}, (err, result) => {
        console.log("getRandomSecret:" + result);
        return result;
    });
}

function getSecretByHash(hash) {
    my_account = getDefaultAccount();
    contract.getSecretByHash.call(hash, {from: my_account}, (err, result) => {
        console.log("getSecretByHash:" + result);
        return result;
    });
}

function postNewAnswer(hash, answer) {
    my_account = getDefaultAccount();
    contract.postNewAnswer.sendTransaction(hash, answer, {from: my_account, value: 1000000000000000}, (err, txhash) => {
        console.log("postNewAnswer:" + txhash);
        return txhash;
    });
}

function openSecret(hash, answer) {
    randomString = randomStringSet[hash];
    my_account = getDefaultAccount();
    contract.openSecret.sendTransaction(hash, answer, randomString, {from: my_account}, (err, result) => {
        console.log("openSecret:" + result);
        return result;
    });
}

function generateRandomString(){
    var baseStr = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    len = 20;
    res = "";
    for(i = 0; i < len; i++){
        res += baseStr[Math.floor(Math.random() * baseStr.length)];
    }
    return res;
}

function getDefaultAccount() {
    return web3.eth.defaultAccount;
}


/**
 * Using for DECENT
 */

const testConnection = false;
const chainId = '0d86c697af6258dbbd6e07a78d1b14e38860b3c1c5062cf8da722a860875e220';
const dcoreNetworkAddresses = ['wss://shhack.decent.ch:8090'];
const account_id = "dw-soulmate"
const private_key = "5KWkd7HQHh36EEzsPPmzEMZoM21FPgN6AHwZTYZNGyigQKC1yZm"

/**
 * Commands that we need
 */


        
dcorejs.initialize(
    {
        chainId: chainId, 
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    }, 
    testConnection);

function getBalance() {
    dcorejs.account().listAccounts().then(function(result) {
        for(var id in result) {
            if(result[id][0] == 'dw-soulmate') {
                console.log(result[id]);
            }
        }
    });
}

// function setSubscription() {
//     dcorejs.subscription().setSubscription("1.2.20", {
//         allowSubscription: true,
//         subscriptionPeriod: 7, 
//         amount: 1,
//        asset: "DCT"}, private_key, true);
// }

var ws = null;
var client_address;

function getWs(id, content) {
    ws = new WebSocket("ws://127.0.0.1:8092");
    ws.onopen = function () {
        console.log("ws open");
        ws.send(content);
    }

    ws.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (id == 1) {
            console.log("set subscription success:" + event.data);
        }
        else if (id == 2) {
            console.log("subscribe to dw-soulmate success:" + event.data);
        }
        else if (id == 3) {
            var pubKey = data.result.pub_key;
            var cmd = "{ \"method\": \"register_account\", \"params\": [\"dw-" + client_address +"\", \"" + pubKey + "\", \""+ pubKey + "\", \"1.2.20\", true], \"id\": 5}";
            getWs(4, cmd);
        } else if (id == 4) {
            console.log("register account success:" + event.data);
        } else if (id == 5) {
            
        }
    }

    ws.onclose = function () {
        console.log("ws close");
    }

    ws.onerror = function () {
        console.error("ws error");
    }
}

function setSubscription(authorAddr) {
    var cmd = "{\"method\": \"set_subscription\", \"params\": [\"dw-" + authorAddr + "\", true, 7, \"1\", \"DCT\", false], \"id\": 10 }";
    getWs(1, cmd);
}

function subscribeAuthor(ethAddr, authorAddr) {
    var cmd = "{\"method\": \"subscribe_to_author\", \"params\": [\"dw-" + ethAddr + "\", \"dw-" + authorAddr + "\", \"1\", \"DCT\", false], \"id\": 5}";
    getWs(2, cmd);
}

function createNewDecentAccount(ethAddr) {
    var cmd = "{\"method\": \"suggest_brain_key\", \"params\": [], \"id\": 4 }";
    client_address = ethAddr;
    getWs(3, cmd);
}

function sendMessage() {

}


