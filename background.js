const EXTENSION_ID = '15E660EF-2CB3-411F-BCB6-8F414FDFC28A'

async function getStorage(key) {
    return chrome.storage.local.get(key.toString()).then(result => {
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
            title: 'Set default tab'
        });
    }
}

async function toggleDefaultTab(windowId, tabId) {
    return getStorage(windowId).then(defaultWindowTab => {
        if (defaultWindowTab && defaultWindowTab == tabId) {
            console.info('Will unset default tab for window %d', windowId);
            return removeStorage(windowId).then(() => false);
        } else {
            console.info('Will set default tab for window %d - tab id %d', windowId, tabId);
            return setStorage(windowId, tabId).then(() => true);
        }
    }).then((result) => indicateDefaultTab(result));
}


//Installing context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Set default tab',
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

    return toggleDefaultTab(clickTabInfo.windowId, clickTabInfo.id);
}


//Installing window onBoundsChanged handler
chrome.windows.onBoundsChanged.addListener(onBoundsChangedHandler);

async function onBoundsChangedHandler(windowInfo) {
    if (windowInfo.state == 'minimized') {
        getStorage(windowInfo.id).then(defaultWindowTab => {
            if (defaultWindowTab) {
                console.info('Will activate default tab for window %d - tab id %d', windowInfo.id, defaultWindowTab);
                return chrome.tabs.update(defaultWindowTab, {'active': true}); 
            }
        })
    }
}


//Installing tab onRemoved (tab closed) handler
chrome.tabs.onRemoved.addListener(onRemovedHandler);

async function onRemovedHandler(tabId, removeInfo) {
    return getStorage(removeInfo.windowId).then(defaultWindowTab => {
        if (defaultWindowTab && defaultWindowTab == tabId) {
            console.info('Default tab for window %d is closing, will unset default tab', removeInfo.windowId);
            return removeStorage(removeInfo.windowId);
        }
    }).then(() => indicateDefaultTab(false));
}


//Installing tab moved between browser windows handler
chrome.tabs.onDetached.addListener(onDetachedHandler);

async function onDetachedHandler(tabId, detachInfo) {
    return getStorage(detachInfo.oldWindowId).then(defaultWindowTab => {
        if (defaultWindowTab && defaultWindowTab == tabId) {
            console.info('Default tab for window %d has been detached, will unset default tab', detachInfo.oldWindowId)
            return removeStorage(detachInfo.oldWindowId);
        }
    }).then(() => indicateDefaultTab(false));
}


//Installing tab activated handler
chrome.tabs.onActivated.addListener(onActivatedHandler);

async function onActivatedHandler(activeInfo) {
    return getStorage(activeInfo.windowId).then(defaultWindowTab => {
        //The simplified expression is `indicateDefaultTab(defaultWindowTab && defaultWindowTab == activeInfo.tabId)`
        //But clear readability is more important than saving 2 LOCs
        if (defaultWindowTab) {
            return indicateDefaultTab(defaultWindowTab == activeInfo.tabId);
        } else {
            return indicateDefaultTab(false);
        }
    });
}


//Installing window focus changed handler
chrome.windows.onFocusChanged.addListener(onFocusChangedHandler);

async function onFocusChangedHandler(windowId) {
    if (windowId != chrome.windows.WINDOW_ID_NONE) {
        return Promise.all([getStorage(windowId), chrome.tabs.query({active: true, windowId: windowId})]).then(values => {
            let defaultWindowTab = values[0];
            let focusedWindowCurrentTab = values[1];

            if (!focusedWindowCurrentTab || !focusedWindowCurrentTab[0] || !focusedWindowCurrentTab[0].id) {
                console.error('Could not find the active tab in window %d - aborting', windowId);
                return;
            }

            return indicateDefaultTab(focusedWindowCurrentTab[0].id == defaultWindowTab);
        });
    }
}


//Installing command (i.e. keyboard shortcut) handler
chrome.commands.onCommand.addListener(onCommandHandler);

async function onCommandHandler(command) {
    switch (command) {
        case 'make-default-tab':
            return chrome.windows.getCurrent().then(currentWindow => {
                if (currentWindow) {
                    chrome.tabs.query({active: true, windowId: currentWindow.id}).then(currentTab => {
                        if (currentTab && currentTab[0]) {
                            return toggleDefaultTab(currentWindow.id, currentTab[0].id);
                        }
                    });
                }
            });

        case 'go-to-opener-tab':
            return chrome.windows.getCurrent().then(currentWindow => {
                chrome.tabs.query({active: true, windowId: currentWindow.id}).then(currentTab => {
                    if (currentTab && currentTab[0] && currentTab[0].openerTabId) {
                        console.info('Current tab is %d; will activate its opener tab %d', currentTab[0].id, currentTab[0].openerTabId);
                        return chrome.tabs.update(currentTab[0].openerTabId, {active: true});
                    }
                });
            });

        default:
            console.warn('Unknown command %s received', command);
            return true;
    }
}
