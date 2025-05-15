const EXTENSION_ID = "15E660EF-2CB3-411F-BCB6-8F414FDFC28A"

defaultTabs = {}

//Installing context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Make default tab',
        contexts: ['all'],
        id: EXTENSION_ID
    });    
});

//Installing event handler
chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(clickInfo, clickTabInfo) {
    console.log('Executing onClickHandler');
    if (!clickTabInfo.id || clickTabInfo.id == chrome.tabs.TAB_ID_NONE) {
        console.error('Tab id not found or invalid - aborting!');
        return;
    }

    if (defaultTabs[clickTabInfo.windowId]) {
        console.log('Current default tab for window %d is %d', 
            clickTabInfo.windowId,
            defaultTabs[clickTabInfo.windowId]
        ); //TODO REMOVE DEBUG !!!
    } else {
        console.log('Current default tab for window %d has not been set', 
            clickTabInfo.windowId
        );
    }

    defaultTabs[clickTabInfo.windowId] = clickTabInfo.id;
}


//handle tab close


//handle tab move between windows


