function checkLogin() {
    let username = null;
    $.ajax({
        url: 'https://thwiki.cc/api.php',
        data: {
            action: "query",
            format: "json",
            formatversion: 2,
            meta: "userinfo"
        },
        async: false,
        dataType: 'json',
        success: function (result) {
            if (result.hasOwnProperty("query") &&
                result.query.hasOwnProperty("userinfo") &&
                result.query.userinfo.id !== 0) {
                chrome.browserAction.setIcon({path: "../images/logo-32.png"});
                username = result.query.userinfo.name;
            } else {
                chrome.browserAction.setIcon({path: "../images/logo-32-bw.png"});
                chrome.browserAction.setBadgeText({text: ""});
                username = null;
            }
        }
    });
    return username;
}