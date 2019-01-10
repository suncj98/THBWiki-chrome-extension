$("#btn_openSite").click(function () {
    createTab("https://thwiki.cc");
});

checkLogin(doPopup);

function doPopup(username) {
    let text = username ? username.replace("+", " ") : "登录THBWiki";
    $("#btn_login").text(text).click(() => {
        newURL = username ? "https://thwiki.cc/用户:" + text.replace(" ", "_") : "https://thwiki.cc/特殊:用户登录";
        chrome.tabs.create({ url: newURL });
    });
    if (username) checkUnreadNotificationList();
}