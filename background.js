//TODO move to util
async function getStorage(key) {
    console.warn('get storage :: Before promise2 created ; key is ' + key);

    return chrome.storage.local.get(key.toString());
}

async function setStorage(kv) {
    // k = key.toString();
    // console.log('key is %s ; k is %s ; are they equal? : ', key, k, key == k);
    // console.log('value is %s ', value);
    // kv = {k : value};
    // console.log('kv is %O', kv);

    return chrome.storage.local.set(kv);
    // console.log('p1 is %O', p1);
    
    // var promise2 = chrome.storage.local.set({k: value});

    // console.warn('set storage :: After promise2 created ; setting %s to %s' , key, value);

    // promise2.then((result) => {
    //     console.warn('set storage :: promise2 then2 ; result is %s', result); 
    //     new Promise(function(resolve) {
    //         console.warn('set storage ::  will resolve the inner promise  ');
    //         resolve();
    //     });
    // });

    // result2 = await promise2;

    // console.warn('awaited and received result %s', result2);

    // return await result2;
}

const EXTENSION_ID = '15E660EF-2CB3-411F-BCB6-8F414FDFC28A'

defaultTabs = {}

//Installing context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Make default tab',
        contexts: ['all'],
        id: EXTENSION_ID
    });

    console.warn('before setting x, y')

    chrome.storage.local.set({'x': 7});
    setStorage({'y': 8});
    setStorage({11: 12});

    console.warn('After setting x, y');

    // promise1.then(() => { console.warn('after promise1 is fulfilled'); 
    //     new Promise(function(resolve) {
    //         resolve();
    //     });
    // });
});


//Installing context menu onClicked handler
chrome.contextMenus.onClicked.addListener(onContextMenuClickHandler);

async function onContextMenuClickHandler(clickInfo, clickTabInfo) {
    console.debug('Executing onContextMenuClickHandler');

    if (!clickTabInfo.id || clickTabInfo.id == chrome.tabs.TAB_ID_NONE) {
        console.error('Tab id not found or invalid - aborting!');
        return;
    }


    console.log('will get x from storage');
    x = await getStorage('x');
    console.log('the value of x is %s', x['x']);

    console.log('will get y from storage');
    y = await getStorage('y');
    console.log('the value of y is %s', y['y']);

    console.log('will get z from storage');
    z = await getStorage('z');
    console.log('the value of z is %s', z['z']);

    console.log('will get 11 from storage');
    eleven = await getStorage(11);
    console.log('the value of 11 is %s', eleven[11]);

    var w = clickTabInfo.windowId.toString();
    var t = clickTabInfo.id;


    // chrome.storage.local.set({w: t}).then(() => {
    //     console.info('Done setting tab %d as default tab for window %d', clickTabInfo.id, clickTabInfo.windowId);
    // });

    // console.info('Will set tab %d as default tab for window %d', clickTabInfo.id, clickTabInfo.windowId);
    // defaultTabs[clickTabInfo.windowId] = clickTabInfo.id;
}


//Installing window onBoundsChanged handler
chrome.windows.onBoundsChanged.addListener(onBoundsChangedHandler);

async function onBoundsChangedHandler(windowInfo) {
    console.debug('Executing onBoundsChangedHandler');

    if (windowInfo.state == 'minimized') {
        w = windowInfo.id.toString();
        chrome.storage.local.get([w], function (result) {
            console.info('Found window ', result);
        });

        console.info('Will check local storage for window %s', w)
    }

    // if (windowInfo.state == 'minimized' && defaultTabs[windowInfo.id]) {
    //     console.info('Window %d has been minimized - activating default tab %d', windowInfo.id, defaultTabs[windowInfo.id]); //TODO REMOVE DEBUG !!!
    //     chrome.tabs.update(defaultTabs[windowInfo.id], {'active': true});
    // }
}


//Installing tab onRemoved (tab closed) handler
chrome.tabs.onRemoved.addListener(onRemovedHandler);

async function onRemovedHandler(tabId, removeInfo) {
    console.debug('Executing onRemovedHandler');

    console.debug('onRemovedHandler received tab closed event for tab %d : %O', tabId, removeInfo);

    // if (defaultTabs[removeInfo.windowId] && defaultTabs[removeInfo.windowId] == tabId) {
    //     console.info('Default tab for window %d has been closed - will unset default tab');
    //     delete defaultTabs[removeInfo.windowId];
    // }
}


//Installing tab moved between browser windows handler
chrome.tabs.onDetached.addListener(onDetachedHandler);

async function onDetachedHandler(tabId, detachInfo) {
    console.debug('Executing onDetachedHandler');

    console.debug('onDetachedHandler received tab detached event for tab %d : %O', tabId, detachInfo);

    // if (defaultTabs[detachInfo.oldWindowId] && defaultTabs[detachInfo.oldWindowId] == tabId) {
    //     console.info('Default tab %d has been detached from its window %d - will unset default tab', tabId, detachInfo.oldWindowId)
    //     delete defaultTabs[detachInfo.oldWindowId];
    // }
}
