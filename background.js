//TODO move to util
async function getFromStorage(windowId) {
    console.warn('get storage :: Before promise2 created ; windowId is ' + windowId);

    var promise2 = chrome.storage.local.get(windowId.toString());

    console.warn('get storage :: After promise2 created');

    promise2.then((result) => {
        console.warn('get storage :: promise2 then2: ' + result); 
        new Promise(function(resolve) {
            console.warn('will resolve the inner promise with result ' + result)
            resolve(result);
        });
    });

    return await promise2;
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

    console.warn('Before promise1')

    var promise1 = chrome.storage.local.set({'x': 42});

    console.warn('After promise1 created');

    promise1.then(() => { console.warn('after promise1 is fulfilled'); 
        new Promise(function(resolve) {
            resolve();
        });
    });
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

    x = await getFromStorage('x');

    console.log('type of x is %s and the value of x is %O', typeof(x), x);

    var w = clickTabInfo.windowId.toString();
    var t = clickTabInfo.id;

    // chrome.storage.local.set({w: t}).then(() => {
    //     console.info('Done setting tab %d as default tab for window %d', clickTabInfo.id, clickTabInfo.windowId);
    // });

    console.info('Will set tab %d as default tab for window %d', clickTabInfo.id, clickTabInfo.windowId);
    // defaultTabs[clickTabInfo.windowId] = clickTabInfo.id;
}


//Installing window onBoundsChanged handler
chrome.windows.onBoundsChanged.addListener(onBoundsChangedHandler);

function onBoundsChangedHandler(windowInfo) {
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

function onRemovedHandler(tabId, removeInfo) {
    console.debug('Executing onRemovedHandler');

    console.debug('onRemovedHandler received tab closed event for tab %d : %O', tabId, removeInfo);

    if (defaultTabs[removeInfo.windowId] && defaultTabs[removeInfo.windowId] == tabId) {
        console.info('Default tab for window %d has been closed - will unset default tab');
        delete defaultTabs[removeInfo.windowId];
    }
}


//Installing tab moved between browser windows handler
chrome.tabs.onDetached.addListener(onDetachedHandler);

function onDetachedHandler(tabId, detachInfo) {
    console.debug('Executing onDetachedHandler');

    console.debug('onDetachedHandler received tab detached event for tab %d : %O', tabId, detachInfo);

    if (defaultTabs[detachInfo.oldWindowId] && defaultTabs[detachInfo.oldWindowId] == tabId) {
        console.info('Default tab %d has been detached from its window %d - will unset default tab', tabId, detachInfo.oldWindowId)
        delete defaultTabs[detachInfo.oldWindowId];
    }
}
