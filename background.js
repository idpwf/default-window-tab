chrome.windows.onBoundsChanged.addListener((w) => {
        chrome.windows.getAll().then((all_windows) => {
            if (w.state == 'minimized' && w.id == all_windows[0].id) {
                chrome.tabs.query({'index': 0}, (result) => {
                    chrome.tabs.update(result[0].id,  {'active': true});
                });
            }
        })
    }
)
