function createTab(newURL) {
    chrome.tabs.create({url: newURL});
}

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            if(cookie === null) {
                callback(null);
            } else {
                callback(cookie.value);
            }
        }
    });
}

function dateFormat(timeStr) {
    return timeStr.substring(0, 4) + "-" + timeStr.substring(4, 6) + "-" + timeStr.substring(6, 8);
}

function clog(content) {
    console.log(content);
}