$("#btn_openSite").click(function () {
    createTab("https://thwiki.cc");
});

let username = checkLogin();

if(username !== null) {
    checkUnreadNotificationList();
    $("#btn_login").text(function () {
        return username;
    }).click(function () {
        newURL = "https://thwiki.cc/用户:" + username;
        chrome.tabs.create({url: newURL});
    });
} else {
    $("#btn_login").text("登录THBWiki")
        .click(function () {
        newURL = "https://thwiki.cc/index.php?title=%E7%89%B9%E6%AE%8A:%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95";
        chrome.tabs.create({url: newURL});
    });
}