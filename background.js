const EXTENSION_ID = '15E660EF-2CB3-411F-BCB6-8F414FDFC28A'

async function getStorage(key) {
    return chrome.storage.local.get(key.toString()).then((result) => {
        if (result[key]) {
            return result[key];
        } else {
            return null;
        }
    });
}

async function setStorage(key, value) {
    var storeObj = {}
    storeObj[key.toString()] = value

    return chrome.storage.local.set(storeObj);
}

async function removeStorage(key) {
    return chrome.storage.local.remove(key.toString());
}

async function indicateDefaultTab(isDefaultTab) {
    if (isDefaultTab) {
        chrome.contextMenus.update(EXTENSION_ID, {
            title: 'Unset default tab'
        });
    } else {
        chrome.contextMenus.update(EXTENSION_ID, {
            title: 'Make default tab'
        });
    }
}


//Installing context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Make default tab',
        enabled: true,
        contexts: ['all'],
        id: EXTENSION_ID
    });
});


//Installing context menu onClicked handler
chrome.contextMenus.onClicked.addListener(onContextMenuClickHandler);

async function onContextMenuClickHandler(clickInfo, clickTabInfo) {
    if (!clickTabInfo.id || clickTabInfo.id == chrome.tabs.TAB_ID_NONE) {
        console.error('Tab id not found or invalid - aborting!');
        return;
    }

    //TODO REWRITE PROPERLY ASYNC
    let defaultWindowTab = await getStorage(clickTabInfo.windowId);
    if (defaultWindowTab) {
        if (defaultWindowTab == clickTabInfo.id) {
            console.info('Will unset default tab for window %d', clickTabInfo.windowId);
            await removeStorage(clickTabInfo.windowId);
            indicateDefaultTab(false);
        } else {
            console.info('Will update default tab for window %d - tab id %d', clickTabInfo.windowId, clickTabInfo.id);
            await setStorage(clickTabInfo.windowId, clickTabInfo.id);
            indicateDefaultTab(true);
        }
    } else {
        console.info('Will set default tab for window %d - tab id %d', clickTabInfo.windowId, clickTabInfo.id);
        await setStorage(clickTabInfo.windowId, clickTabInfo.id);
        indicateDefaultTab(true);
    }
}


//Installing window onBoundsChanged handler
chrome.windows.onBoundsChanged.addListener(onBoundsChangedHandler);

async function onBoundsChangedHandler(windowInfo) {
    if (windowInfo.state == 'minimized') {
        //TODO REWRITE PROPERLY ASYNC
        let defaultWindowTab = await getStorage(windowInfo.id);
        if (defaultWindowTab) {
            console.info('Will activate default tab for window %d - tab id %d', windowInfo.id, defaultWindowTab);
            chrome.tabs.update(defaultWindowTab, {'active': true}); 
        }
    }
}


//Installing tab onRemoved (tab closed) handler
chrome.tabs.onRemoved.addListener(onRemovedHandler);

async function onRemovedHandler(tabId, removeInfo) {
    //TODO REWRITE PROPERLY ASYNC
    let defaultWindowTab = await getStorage(removeInfo.windowId);
    if (defaultWindowTab && defaultWindowTab == tabId) {
        console.info('Default tab for window %d is closing, will unset default tab', removeInfo.windowId);
        await removeStorage(removeInfo.windowId);
        indicateDefaultTab(false);
    }
}


//Installing tab moved between browser windows handler
chrome.tabs.onDetached.addListener(onDetachedHandler);

async function onDetachedHandler(tabId, detachInfo) {
    //TODO REWRITE PROPERLY ASYNC
    let defaultWindowTab = await getStorage(detachInfo.oldWindowId);
    if (defaultWindowTab && defaultWindowTab == tabId) {
        console.info('Default tab for window %d has been detached, will unset default tab', detachInfo.oldWindowId)
        await removeStorage(detachInfo.oldWindowId);
        indicateDefaultTab(false);
    }
}


//Installing tab activated handler
chrome.tabs.onActivated.addListener(onActivatedHandler);

async function onActivatedHandler(activeInfo) {
    //TODO REWRITE PROPERLY ASYNC
    let defaultWindowTab = await getStorage(activeInfo.windowId);
    if (defaultWindowTab) {
        indicateDefaultTab(defaultWindowTab == activeInfo.tabId);
    } else {
        indicateDefaultTab(false);
    }
}


//Installing window focus changed handler
chrome.windows.onFocusChanged.addListener(onFocusChangedHandler);

async function onFocusChangedHandler(windowId) {
    if (windowId != chrome.windows.WINDOW_ID_NONE) {
        //TODO REWRITE PROPERLY ASYNC
        let defaultWindowTab = await getStorage(windowId);
        let focusedWindowCurrentTab = await chrome.tabs.query({active: true, windowId: windowId});

        if (!focusedWindowCurrentTab || !focusedWindowCurrentTab[0] || !focusedWindowCurrentTab[0].id) {
            console.error('Could not find the active tab in window %d - aborting');
            return;
        }

        indicateDefaultTab(focusedWindowCurrentTab[0].id == defaultWindowTab);
    }
}
