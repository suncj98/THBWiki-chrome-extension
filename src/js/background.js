chrome.windows.onCreated.addListener(function () {
    checkLogin(checkUnreadNotificationNum);
});

chrome.cookies.onChanged.addListener(function () {
    checkLogin(checkUnreadNotificationNum);
});