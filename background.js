const EXTENSION_ID = '15E660EF-2CB3-411F-BCB6-8F414FDFC28A'

defaultTabs = {}


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

function onContextMenuClickHandler(clickInfo, clickTabInfo) {
    console.debug('Executing onContextMenuClickHandler');

    if (!clickTabInfo.id || clickTabInfo.id == chrome.tabs.TAB_ID_NONE) {
        console.error('Tab id not found or invalid - aborting!');
        return;
    }

    console.debug('Current default tab for window %d is %d', clickTabInfo.windowId, defaultTabs[clickTabInfo.windowId]);

    console.info('Setting tab %d as default tab for window %d', clickTabInfo.id, clickTabInfo.windowId);

    defaultTabs[clickTabInfo.windowId] = clickTabInfo.id;
}


//Installing window onBoundsChanged handler
chrome.windows.onBoundsChanged.addListener(onBoundsChangedHandler);

function onBoundsChangedHandler(windowInfo) {
    console.debug('Executing onBoundsChangedHandler');

    console.debug('onBoundsChangedHandler received windowInfo %O', windowInfo);

    if (windowInfo.state == 'minimized' && defaultTabs[windowInfo.id]) {
        console.info('Window %d has been minimized - activating default tab %d', windowInfo.id, defaultTabs[windowInfo.id]); //TODO REMOVE DEBUG !!!
        chrome.tabs.update(defaultTabs[windowInfo.id], {'active': true});
    }
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
