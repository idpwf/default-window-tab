const EXTENSION_ID = "15E660EF-2CB3-411F-BCB6-8F414FDFC28A"

defaultTabs = {}

// TODO
chrome.contextMenus.create({
    title: 'Default tab for this window',
    contexts: ['all'],
    id: EXTENSION_ID
});

//install event handler
chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(clickInfo) {
    console.log("Received clickInfo: " + clickInfo);
}

//handle tab close
//handle tab move between windows


