import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import itemList from './itemList.json'
import itemNameList from './nameToSerial.json'
import login from './loginCred.json'

//Get All**********************************************************************************

async function getAll(){
    
    
    const url = "https://api.quartzy.com/inventory-items";
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Access-Token': login['accessToken'],
            'Content-Type': 'application/json',
        },
        
    });

    const text = await response.text();
    //response.json().then(json => {console.log(json)})
    console.log(text)
  }

  //Update List****************************************************

  async function updateAll(navigation){
    
    const url = "https://api.quartzy.com/inventory-items";
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Access-Token': login['accessToken'],
            'Content-Type': 'application/json',
        },
        
    });

    const array = await response.json();

    for(let i = 0; i < array.length; i++){
        if(!(itemList[login['labID']].hasOwnProperty(array[i]['technical_details']))){
            itemList[login['labID']][array[i]['technical_details']] = array[i]['id']
            itemNameList[login['labID']][array[i]['name']] = array[i]['technical_details']
        }

        navigation.navigate('Success Page')
    }

    //response.json().then(json => {console.log(json)})
    }


//check files*************************************************

const checkFiles = (serial) => {
    if(itemList.hasOwnProperty(login['labID'])){
        let temp = itemList[login['labID']]
        if(temp.hasOwnProperty(serial)){
          return temp[serial]
        }else{
          return ''
        }
      }else{
        return ''
      }
  }

//Check Batch**************************************************

  async function checkBatch(formValues, navigation){
    const nav = true;
    for (let i = 0; i < formValues.length; i++){
        console.log(formValues[i].itemToCheck)
        const itemID = checkFiles(formValues[i].itemToCheck)
        if(!(itemID.trim())){
            alert(`Item ${i} is not present in item list, please update item list`)
            nav = false
            break
        }

        const url = "https://api.quartzy.com/inventory-items/".concat(itemID);
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Access-Token': login['accessToken'],
            },
            
        });
  
        const quantResp = await response.json();
        
        if(response.status != '200'){
            alert(`Error in handling of item ${i + 1}.  Please notify your instructor`)
            nav = false
            break
        }
        
        const quant = quantResp['quantity']
        
        if(parseInt(formValues[i].numNeeded) <= quant){
            str = `You have enough of ${formValues[i].itemNameHolder} (Amount needed = ${formValues[i].numNeeded}, Amount owned = ${quant})`
        }else{
            str = `You do not have enough of ${formValues[i].itemNameHolder} (Amount needed = ${formValues[i].numNeeded}, Amount owned = ${quant})`
        }
        formValues[i].resp = str;
        console.log(formValues[i].resp)
    }

    //navigation.navigate('Results Page')
    if(nav){
        navigation.navigate('Results Page', {formValues})
    }
  }

//Get Quantity************************************************************************

  async function getQuantity(itemID){
    console.log("id in quantity:")
    console.log(itemID)
    const url = "https://api.quartzy.com/inventory-items/".concat(itemID);
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Access-Token': login['accessToken'],
        },
    });
  
    const resp = await response.json();
    //response.then(json => {console.log(json)})
    const status = response.status;
    console.log(resp);
    
    response.json().then(json => {console.log(json)})
    
    if(status == '200'){
        itemQuant = resp['quantity'];
        console.log(itemQuant);
        return parseInt(itemQuant);
    }else if(status == '401'){
        alert('Error 401: Request Unauthorized\nPlease reset your Access Token')
        console.log("logged unauthorized in quantity")
        throw error
    }else if(status == '404'){
        alert('Error 404: Item Not Found\nPlease return to the home page and add the item')
        console.log("logged not found in quantity")
        throw error
    }else{
        alert('Unknown Error')
        console.log("logged unknown error in quantity")
        throw error
        
    }
  }
  
//Change Stock**********************************************************************************

  async function incr(itemID, numIncr, incr, navigation){
    
    let curQuant = await getQuantity(itemID);
    if (curQuant != "NaN"){
        if(incr){
            newQuant = parseInt(curQuant) + numIncr;
        }else{
            newQuant = parseInt(curQuant) - numIncr;
        }
        console.log(newQuant)
        const data = '{"quantity": "'.concat(String(newQuant)).concat('"}')
    
        const url = "https://api.quartzy.com/inventory-items/".concat(itemID);
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Access-Token': login['accessToken'],
                'Content-Type': 'application/json',
            },
            body: data,
            
        });
    
        const text = await response.text();
        const status = response.status;
        response.json().then(json => {console.log(json)})
        console.log(text);
        if(status == '200'){
            //navigation.navigate('Success Page');
        }else if(status == '401'){
            alert('Error 401: Request Unauthorized\nPlease reset your Access Token')
            console.log("Logged unauthorized in incr")
            throw error
            
        }else if(status == '404'){
            alert('Error 404: Item Not Found\nPlease return to the home page and add the item')
            console.log("Logged item not found in incr")
            throw error
        }else{
            alert('Unknown Error')
            console.log("Logged unknown error in incr")
            throw error
        }
    }else{
        navigation.goBack();
    }
  
  }

  export {checkFiles, getAll, checkBatch, getQuantity, incr, updateAll};