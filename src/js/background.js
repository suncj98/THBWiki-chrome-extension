chrome.windows.onCreated.addListener(function () {
    checkLogin(checkUnreadNotificationNum);
});

chrome.cookies.onChanged.addListener(function (cookie) {
    if(cookie.cookie.domain === "thwiki.cc" && cookie.cookie.name === "thwikicc_wikiUserID") {
        checkLogin(checkUnreadNotificationNum);
    }
});