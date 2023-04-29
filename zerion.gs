// 本脚本基于 @gm365 老师和@codyyang_eth的内容进行优化

// 🧙 本人： 本人： @ifinish86 ->  https://twitter.com/ifinish86
// 更新内容：
// - 支持 zkSync Lite 显示tx数量

// 使用方法请参考: https://twitter.com/gm365/status/1634124066268528640


// ---------------------------------------------------------------
// 原作者信息：
// 💡 功能: 在 Google Sheets 中，查询钱包的核心信息

// ⚠️ 前提条件：
// 必须填入最低一个或者多个 API Key，获取地址： https://developers.zerion.io/reference/intro/getting-started

// 🧙 作者： @gm365 ->  https://twitter.com/gm365
// 介绍： https://twitter.com/gm365/status/1634124066268528640
// ---------------------------------------------------------------

// ❗️❗️❗️ 输入一个或者多个Zerion API Key
// 如果要填多个个，就这样填 let APIKeyList = ["填入第1个api","填入第2个api","填入第3个api"];
let APIKeyList = ["zk_dev_0960a3bf09224a52a2f952e712070304"];

// get authorization from API Key string
function encodeRandomAPIKey(strList) {
  let randomIndex = Math.floor(Math.random() * strList.length);
  let randomStr = strList[randomIndex];
  let modifiedStr = randomStr + ":";
  let encodedStr = Utilities.base64EncodeWebSafe(modifiedStr);
  return 'Basic ' + encodedStr;
}

// 获取钱包 USD 余额
function getWalletBalance(walletAddress) {
  let APIKey = encodeRandomAPIKey(APIKeyList);
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: APIKey
    }
  };

  const apiUrl = `https://api.zerion.io/v1/wallets/${walletAddress}/portfolio`;

  const response = UrlFetchApp.fetch(apiUrl, options);
  const data = JSON.parse(response.getContentText());
  const walletBalance = data.data.attributes.positions_distribution_by_type.wallet;

  return walletBalance;
}



// 获取 最近一笔 tx 信息
function getLastTX(walletAddress, chainId) {
  let APIKey = encodeRandomAPIKey(APIKeyList);
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            authorization: APIKey
        }
    };
    const apiUrl = `https://api.zerion.io/v1/wallets/${walletAddress}/transactions/?currency=usd&page[size]=1&filter[chain_ids]=${chainId}`;

    // 获取API响应获取API响应
    const response = UrlFetchApp.fetch(apiUrl, options);
    if (response.getResponseCode() !== 200) {
        throw new Error(`Unable to retrieve API data.Response code: ${response.getResponseCode()}`);
    }

    // 解析API响应
    const data = JSON.parse(response.getContentText());

    // 获取交易数据
    const transaction = data.data[0];
    if (!transaction || !transaction.attributes) {
        // throw new Error('Unable to retrieve transaction data');
        return '\\'
    }

    // 计算时间差
    const minedAt = new Date(transaction.attributes.mined_at);
    const now = new Date();
    const diff = now - minedAt;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} 天前`;
    } else {
        return `${hours} 小時前`;
    }
}

// 获取 zkSync Era 的ETH余额
function getZkSyncBalance(address) {
  var rpcUrl = 'https://mainnet.era.zksync.io';
  var data = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_getBalance",
    "params": [address, "latest"]
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(data)
  };
  var response = UrlFetchApp.fetch(rpcUrl, options);
  var balance = JSON.parse(response.getContentText()).result;
  balance = parseInt(balance) / Math.pow(10, 18); // Convert from Wei to Ether
  return balance;
}

//// 获取 zkSync Lite 的ETH余额
function getZkSyncLiteBalance(address) {
  var rpcUrl = 'https://api.zksync.io/web3/';
  var data = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_getBalance",
    "params": [address, "latest"]
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(data)
  };
  var response = UrlFetchApp.fetch(rpcUrl, options);
  var balance = JSON.parse(response.getContentText()).result;
  balance = parseInt(balance) / Math.pow(10, 18); // Convert from Wei to Ether
  return balance;
}

// 获取 zkSync 1.0 tx 数量
function getZkSyncLiteTxCount(address) {
  const api_url = "https://api.zksync.io/api/v0.2/accounts/" + address;
  try {
    const result = JSON.parse(UrlFetchApp.fetch(api_url));
    const nonce = result["result"]["committed"]["nonce"];
    return nonce;
  } catch (e) {
    Logger.log(`Nonce 获取失败, ${e}`);
    return 0;
  }
}

// 获取 zkSync Era 的TX数量
function getZkSyncTxCount(address) {
  var rpcUrl = 'https://mainnet.era.zksync.io';
  var data = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_getTransactionCount",
    "params": [address, "latest"]
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(data)
  };
  var response = UrlFetchApp.fetch(rpcUrl, options);
  var count = JSON.parse(response.getContentText()).result;
  count = parseInt(count);
  return count;
}

// 获取 最近一笔 zkSync Era 的 tx 距今时间
function getZkSyncLastTX(address){
    var options = {
        'method': 'get',
        "contentType" : "application/json",
        'muteHttpExceptions': true
    }

    var url = "https://zksync2-mainnet.zkscan.io/address/" + address + "/transactions?type=JSON"

    var response = UrlFetchApp.fetch(url,options);
    var htmlStr = response.getContentText();
    const dateRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/
    const match = dateRegex.exec(htmlStr);
    if (match==null)
        return'\\'
    // 输出匹配到的日期
    const date = match[1];

    // 计算时间差
    const minedAt = new Date(date);
    minedAt.setHours(minedAt.getHours() + 8); // convert to UTC+8
    const now = new Date();
    const diff = now - minedAt;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} 天前`;
    } else {
        return `${hours} 小時前`;
    }
}


