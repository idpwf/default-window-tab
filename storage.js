// export {getStorage, setStorage, removeStorage};

// async function getStorage(key) {
//     return chrome.storage.local.get(key.toString()).then((result) => {
//         if (result[key]) {
//             return result[key];
//         } else {
//             return null;
//         }
//     });
// }

// async function setStorage(key, value) {
//     var storeObj = {}
//     storeObj[key.toString()] = value

//     return chrome.storage.local.set(storeObj);
// }

// async function removeStorage(key) {
//     return chrome.storage.local.remove(key.toString());
// }

