function checkUnreadNotificationNum(username) {
    if (username !== null) {
        $.ajax({
            url: 'https://thwiki.cc/api.php',
            data: {
                action: 'query',
                format: 'json',
                formatversion: 2,
                meta: 'notifications',
                notformat: "model",
                notlimit: 25,
                notprop: 'count',
                uselang: "zh",
                notfilter: "!read"
            },
            dataType: 'json',
            success: (result) => {
                if (result.query && result.query.notifications) {
                    var ncount = result.query.notifications.count;
                    if (ncount === "0") {
                        chrome.browserAction.setBadgeText({ text: "" });
                    } else {
                        chrome.browserAction.getBadgeText({}, res => {
                            let count = res||0;
                            if (count < ncount) {
                                let options = {
                                    body: "你有" + ncount + "条未读信息",
                                    icon: "../images/logo-128.png",
                                    tag: "THBWiki",
                                    renotify: true
                                };
                                new Notification("来自THBWiki的信息", options);
                            }
                            chrome.browserAction.setBadgeText({ text: String(ncount) });
                        });
                    }
                }
            }
        });
    }
}

function checkUnreadNotification(cb)
{
    $.ajax({
        url: 'https://thwiki.cc/api.php',
        data: {
            action: "query",
            format: "json",
            formatversion: 2,
            meta: "notifications",
            notformat: "model",
            notlimit: 25,
            notprop: "list|count",
            uselang: "zh",
            notfilter: "!read"
        },
        dataType: 'json',
        success: (result) => {
            return cb(result);
        }
    });
}

function checkRemindNotification(cb) {
    $.ajax({
        url: 'https://thwiki.cc/api.php',
        data: {
            action: "query",
            format: "json",
            formatversion: 2,
            meta: "notifications",
            notsections:"alert",
            notformat: "model",
            notlimit: 25,
            notprop: "list|count",
            uselang: "zh",
            notfilter: "read"
        },
        dataType: 'json',
        success: (result) => {
            return cb(result);
        }
    });
}

function checkMsgNotification(cb) {
    $.ajax({
        url: 'https://thwiki.cc/api.php',
        data: {
            action: "query",
            format: "json",
            formatversion: 2,
            meta: "notifications",
            notsections: "message",
            notformat: "model",
            notlimit: 25,
            notprop: "list|count",
            uselang: "zh",
            notfilter: "read"
        },
        dataType: 'json',
        success: (result) => {
            return cb(result);
        }
    });
}

function getWIKIActionToken(cb) {
    $.ajax({
        url: 'https://thwiki.cc/api.php',
        data: {
            action: "query",
            format: "json",
            formatversion: 2,
            meta: "tokens",
        },
        dataType: 'json',
        success: (result) => {
            // return the wiki csrftoken
            let token = result.query.tokens.csrftoken;
            return cb(token);
        },
        fail: () => {
            return cb("");
        }
    });
}

function markNotification(data, cb) {
    $.ajax({
        url: 'https://thwiki.cc/api.php',
        type: "POST",
        data: {
            action: "echomarkread",
            token: data.token,
            list: data.list,
            format: "json",
            formatversion: 2,
        },
        dataType: "json",
        success: (result) => {
            return cb(result);
        }
    });
}