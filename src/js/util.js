function createTab(newURL) {
    chrome.tabs.create({url: newURL});
}

function dateFormat(timeStr) {
    return timeStr.substring(0, 4) + "-" + timeStr.substring(4, 6) + "-" + timeStr.substring(6, 8);
}