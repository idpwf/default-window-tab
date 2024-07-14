chrome.windows.onBoundsChanged.addListener((w) => {
        if (w.state == 'minimized') {
            chrome.tabs.query({'index': 0}, (result) => {
                chrome.tabs.update(result[0].id,  {'active': true});
            });
        }
    }
)
