function checkLogin(cbUsername) {
    const url = "https://thwiki.cc";
    getCookies(url, "thwikicc_wikiUserID", function (id) {
        if(id !== null) {
            chrome.browserAction.setIcon({path: "../images/logo-32.png"});
            getCookies(url, "thwikicc_wikiUserName", cbUsername);
        } else {
            chrome.browserAction.setIcon({path: "../images/logo-32-bw.png"});
            chrome.browserAction.setBadgeText({text: ""});
            cbUsername(null);
        }
    });
}