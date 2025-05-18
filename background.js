const EXTENSION_ID = '15E660EF-2CB3-411F-BCB6-8F414FDFC28A'

//TODO move to util
async function getStorage(key) {
    return chrome.storage.local.get(key.toString()).then((result) => {
        if (result[key]) {
            return result[key];
        } else {
            return null;
        }
    });
}

//TODO move to util
async function setStorage(key, value) {
    var storeObj = {}
    storeObj[key.toString()] = value

    return chrome.storage.local.set(storeObj);
}

async function removeStorage(key) {
    return chrome.storage.local.remove(key.toString());
}

//Installing context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Make default tab',
        contexts: ['all'],
        id: EXTENSION_ID
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

    console.info('Will set tab %d as default tab for window %d', clickTabInfo.id, clickTabInfo.windowId);
    await setStorage(clickTabInfo.windowId, clickTabInfo.id);
}


//Installing window onBoundsChanged handler
chrome.windows.onBoundsChanged.addListener(onBoundsChangedHandler);

async function onBoundsChangedHandler(windowInfo) {
    console.debug('Executing onBoundsChangedHandler');

    //TODO REWRITE PROPERLY ASYNC
    if (windowInfo.state == 'minimized') {
        defaultWindowTab = await getStorage(windowInfo.id);
        if (defaultWindowTab) {
            console.info('Activating default tab %d for window %d', defaultWindowTab, windowInfo.id);
            chrome.tabs.update(defaultWindowTab, {'active': true}); 
        }
    }
}


//Installing tab onRemoved (tab closed) handler
chrome.tabs.onRemoved.addListener(onRemovedHandler);

async function onRemovedHandler(tabId, removeInfo) {
    console.debug('Executing onRemovedHandler');

    //TODO REWRITE PROPERLY ASYNC
    defaultWindowTab = await getStorage(removeInfo.windowId);
    if (defaultWindowTab && defaultWindowTab == tabId) {
        console.info('Default tab %d for window %d is closing, will unset default tab', defaultWindowTab, removeInfo.windowId);
        await removeStorage(removeInfo.windowId);
    }
}


//Installing tab moved between browser windows handler
chrome.tabs.onDetached.addListener(onDetachedHandler);

async function onDetachedHandler(tabId, detachInfo) {
    console.debug('Executing onDetachedHandler');

    //TODO REWRITE PROPERLY ASYNC
    defaultWindowTab = await getStorage(detachInfo.oldWindowId);
    if (defaultWindowTab && defaultWindowTab == tabId) {
        console.info('Default tab %d has been detached from its window %d, will unset default tab', defaultWindowTab, detachInfo.oldWindowId)
        await removeStorage(detachInfo.oldWindowId);
    }
}
