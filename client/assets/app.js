const dexAddress = "0x3AD57d16319447f55509A8e42fC7bF881Ae53296";
const daiAddress = "0x8B84348d63BD222E6717Ae1F035fDa40D0AAf7bE";
const compAddress = "0x3CA9c1456A9efB40d1A606EB046134865C1C07dc";
const linkAddress = "0x1c3CC86160317AB66377052ca5EB584eaF596041";
var loggedIn = false;
var token = undefined;
let buyMode = true;
let web3, user, dexInst, daiInst, compInst, linkInst;
let finalInput, finalOutput;

$(document).on('click', ".dropdown-menu li a", function () {
  let element = $(this);
  let img = element[0].firstElementChild.outerHTML;
  let text = $(this).text();
  token = text.replace(/\s/g, '');
  $(".input-group .btn").html(img + text);
  $(".input-group .btn").css("color", "#fff");
  $(".input-group .btn").css("font-size", "large");
});

$("#swap-box").submit((e)=>{
  e.preventDefault();
})

$(document).ready(() => {
  //Initialize web3 library
  if (window.ethereum) {
    //check if user has wallet
    web3 = new Web3(Web3.givenProvider);
  }
  //check logged in
  web3.eth.getAccounts((err, accounts) => {
    if (accounts.length != 0) afterLogin(accounts);
  });
  $("#output").val("");
});

window.ethereum.on("accountsChanged", (accounts) => {
  loggedIn = false;
  afterLogin(accounts);
});

setInterval(() => {
  web3.eth.getAccounts((err, accounts) => {
    if (accounts.length == 0) {
      loggedIn = false;
      $(".btn.login").html("Connect Wallet");
      $(".btn.swap").html("Connect Wallet");
      $("#username").html("");
    } else {
      afterLogin(accounts);
    }
  });
}, 5000);

$(".btn.login").click(async () => {
  if (!loggedIn) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      afterLogin(accounts);
    } catch (error) {
      console.error("User denied account access");
    }
  }
});

function afterLogin(accounts) {
  if(!loggedIn){
    loggedIn = true;
    user = accounts[0];
    dexInst = new web3.eth.Contract(abi.dex, dexAddress, { from: user });
    daiInst = new web3.eth.Contract(abi.token, daiAddress, { from: user });
    compInst = new web3.eth.Contract(abi.token, compAddress, { from: user });
    linkInst = new web3.eth.Contract(abi.token, linkAddress, { from: user });
    $(".btn.login").html("Connected");
    $(".btn.swap").html("Enter an amount");
    $(".btn.swap").addClass("disabled");
    $("#username").html(user);
    $("#input").val("");
    $("#output").val("");
    $(".rate.value").css('display', 'none');
  }
}

$("#arrow-box h2").click(()=>{
  if(buyMode){
    buyMode = false;
    sellTokenDisplay();
  }else{
    buyMode = true;
    buyTokenDisplay();
  }
  token = undefined;
  $("#input").val("");
  $("#output").val("");
  $(".rate.value").css('display', 'none');
  $(".btn.swap").addClass("disabled");
  if(loggedIn){
    $(".btn.swap").html("Enter an amount");
  }else{
    $(".btn.swap").html("Connect Wallet");
  }
});

$("#input").on("input", function() {
  if(token === undefined){
    return false;
  }
  let input = parseFloat($(this).val());
  updateOutput(input);
});

async function getPrice(){
  let daiData = await (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=Dai&vs_currencies=eth")).json();
  let compData = await (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=compound-governance-token&vs_currencies=eth")).json();
  let linkData = await (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=chainlink&vs_currencies=eth")).json();
  return {
    daiEth: daiData.dai.eth,
    linkEth: linkData.chainlink.eth,
    compEth: compData["compound-governance-token"].eth
  }
}

async function updateOutput(input){
  if(token === undefined){
    return false;
  }
  let currentPrice = await getPrice();
  let output;
  switch(token){
    case "COMP":
      buyMode ? output = input / currentPrice.compEth : output = input * currentPrice.compEth;
      break;
    case "LINK":
      buyMode ? output = input / currentPrice.linkEth : output = input * currentPrice.linkEth;
      break;
    case "DAI":
      buyMode ? output = input / currentPrice.daiEth : output = input * currentPrice.daiEth;
      break;
  }
  let exchangeRate = output / input;
  if(output == 0 || isNaN(output)){
    $("#output").val("");
    $(".rate.value").css('display', 'none');
    $(".btn.swap").html("Enter an amount");
    $(".btn.swap").addClass("disabled");
  }else{
    $("#output").val(output.toFixed(7));
    $(".rate.value").css('display', 'block');
    if(buyMode){
      $("#top-text").html("ETH");
      $("#bottom-text").html(" " + token);
      $("#rate-value").html(exchangeRate.toFixed(5));
    }else{
      $("#top-text").html(token);
      $("#bottom-text").html(" ETH");
      $("#rate-value").html(exchangeRate.toFixed(5));
    }
    if(loggedIn){
      checkBalance(input);
    } 
    finalInput = web3.utils.toWei(input.toString(), 'ether');
    finalOutput = web3.utils.toWei(output.toString(), 'ether');
  }
}

async function checkBalance(input){
  let balance;
  if(buyMode){
    balance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(user), 'ether'));
  }else{
    switch(token){
      case "COMP":
        balance = parseFloat(web3.utils.fromWei(await compInst.methods.balanceOf(user).call(), 'ether'));
        break;
      case "LINK":
        balance = parseFloat(web3.utils.fromWei(await linkInst.methods.balanceOf(user).call(), 'ether'));
        break;
      case "DAI":
        balance = parseFloat(web3.utils.fromWei(await daiInst.methods.balanceOf(user).call(), 'ether'));
        break;
    }
  }

  if(balance >= input){
    $(".btn.swap").removeClass("disabled");
    $(".btn.swap").html("Swap");
    return true;
  }else{
    $(".btn.swap").addClass("disabled");
    $(".btn.swap").html(`Insufficient ${buyMode ? "ETH" : token} balance`);
    return false;
  }
}

$(".btn.swap").click(async ()=>{
  if(!loggedIn){
    return false;
  }
  await swapToken();
});

async function swapToken(){
  let tokenAddr, tokenInst;
  switch(token){
    case "COMP":
      tokenAddr = compAddress;
      tokenInst = compInst;
      break;
    case "LINK":
      tokenAddr = linkAddress;
      tokenInst = linkInst;
      break;
    case "DAI":
      tokenAddr = daiAddress;
      tokenInst = daiInst;
      break;
  }
  if(buyMode){
    dexInst.methods.buyToken(tokenAddr, finalInput, finalOutput).send({value: finalInput}, (err) => {
      if(err){
        alert("Transaction failed!\n" + err.message);
        return false;
      }else{
        dexInst.once("buy", (err, event) => {
          if(err){
            alert("Transaction failed!\n" + err.message);
            return false;
          }else{
            let amountDisplay = parseFloat(web3.utils.fromWei(event.returnValues.amount, 'ether'));
            let priceDisplay = parseFloat(web3.utils.fromWei(event.returnValues.cost, 'ether'));
            alert(`
              Swap successful!\n
              Token Address: ${event.returnValues.tokenAddr} \n
              Amount: ${amountDisplay.toFixed(7)} ${token}\n
              Price: ${priceDisplay.toFixed(7)} ETH
            `);
          }
        });
      }
    });
  }else{
    let allowance = await tokenInst.methods.allowance(user, dexAddress).call();
    if(parseInt(finalInput) > parseInt(allowance)){
      try{
        await tokenInst.methods.approve(dexAddress, finalInput).send();
      }catch(err){
        alert("Transaction failed!\n" + err.message);
        return false;
      }
    }
    dexInst.methods.sellToken(tokenAddr, finalInput, finalOutput).send((err) => {
      if(err){
        alert("Transaction failed!\n" + err.message);
        return false;
      }else{
        dexInst.once("sell", (err, event) => {
          if(err){
            alert("Transaction failed!\n" + err.message);
            return false;
          }else{
            let amountDisplay = parseFloat(web3.utils.fromWei(event.returnValues.amount, 'ether'));
            let priceDisplay = parseFloat(web3.utils.fromWei(event.returnValues.cost, 'ether'));
            alert(`
              Swap successful!\n
              Token Address: ${event.returnValues.tokenAddr} \n
              Amount: ${amountDisplay.toFixed(7)} ETH\n
              Price: ${priceDisplay.toFixed(7)} ${token}
            `);
          }
        });
      }
    });    
  }
}