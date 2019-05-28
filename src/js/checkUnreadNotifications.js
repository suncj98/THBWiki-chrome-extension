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
                            let count = res != "" ? res : 0;
                            if (count < ncount) {
                                let options = {
                                    body: "You have " + ncount + " unread messages.",
                                    icon: "../images/logo-128.png",
                                    tag: "THBWiki",
                                    renotify: true
                                };
                                new Notification("Messages from THBWiki", options);
                            }
                            chrome.browserAction.setBadgeText({ text: String(ncount) });
                        });
                    }
                }
            }
        });
    }
}

function checkUnreadNotificationList() {
    $("#unreadPro").show();
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
            $("#unreadPro").hide();
            if (result.query && result.query.notifications) {
                if (result.query.notifications.count === "0") {
                    chrome.browserAction.setBadgeText({ text: "" });
                    cleanNotification();
                } else {
                    chrome.browserAction.setBadgeText({ text: String(result.query.notifications.count) });
                    $("#notificationWidget_unreadList").empty();
                    $("#notificationWidget_unreadList").append($("<a href='#' id='notificationWidget_all_markRead' class='btn btn-info'>Mark all as read</a>"))
                    renderUnreadNotificationList(result.query.notifications.list);
                }
            }
            $("#notificationWidget_all_markRead").click(() => {
                let nfs = $("#notificationWidget_unreadList li .notificationWidget-item-markRead");
                let list = "";
                for (var i = 0; i < nfs.length; i++) {
                    let item = $(nfs[i]);
                    list += item.data("id");
                    if (i < nfs.length - 1) {
                        list += "|";
                    }
                };
                getWIKIActionToken(token => {
                    markNotification({ list: list, token: token }, result => {
                        if (!result.error && result.query.echomarkread.result) {
                            if (result.query.echomarkread.result == "success") {
                                // remove marked info
                                $("#notificationWidget_unreadList").fadeOut(() => {
                                    cleanNotification();
                                });
                            }
                        }
                        checkUnreadNotificationNum();
                    })
                });
            });
        }
    });
}

function checkRemindNotificationList() {
    $("#remindPro").show();
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
            $("#remindPro").hide();
            if (result.query && result.query.notifications) {
                if (result.query.notifications.list.length === "0") {
                    cleanNotification("noremind");
                } else {
                    $("#notificationWidget_remindList").empty();
                    renderRemindNotificationList(result.query.notifications.list);
                }
            }
        }
    });
}

function checkMsgNotificationList() {
    $("#msgPro").show();
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
            $("#msgPro").hide();
            if (result.query && result.query.notifications) {
                if (result.query.notifications.list.length === "0") {
                    cleanNotification("nomsg");
                } else {
                    $("#notificationWidget_msgList").empty();
                    renderMsgNotificationList(result.query.notifications.list);
                }
            }
        }
    });
}

function renderUnreadNotificationList(list) {
    var topic = ["user-rights", "social-rel"];
    var msg = ["article-linked", "achiev", "system","flowthread"];
    for (let i = list.length - 1; i >= 0; i--) {
        let notification = list[i];
        var type = "";
        var info = "";
        if ($.inArray(notification.category, topic) > -1) {
            type = "提醒";
            switch (notification.category) {
                case "user-rights":
                case "social-rel":
                    switch (notification.category) {
                        case "user-rights":
                            info += "<span>权限变更</span>";
                            break;
                        case "social-rel":
                            info += "<span>好友</span>";
                            break;
                    }
                    info += "<span>操作人：<font color='#66aaff'>" + notification.agent.name + "</font></span>";
                    break;
            }
        }
        else if ($.inArray(notification.category, msg) > -1) {
            switch (notification.category) {
                case "article-linked":
                    info += "<span>页面链接</span>";
                    break;
                case "achiev":
                    info += "<span>成就系统</span>";
                    break;
                case "system":
                    info += "<span>系统</span>";
                    break;
                case "flowthread":
                    info += "<span>评论</span>";
                    info += "<span>操作人：<font color='#66aaff'>" + notification.agent.name + "</font></span>";
                    break;
            }
            type = "一般通知";
        }
        else {
            type = "未知";
        }
        info = "<span style='color:#777;'>" + type + "</span>" + info;
        var navitem = $("<li class='notificationWidget-item list-group-item list-group-item-action'></li>")
            //icon
            .append($("<img class='notificationWidget-item-icon'/>")
                .attr("src", "../images/" + notification["*"].icon + ".png")
                .attr("alt", notification["*"].icon))
            //set read
            .append($("<a title='标记为已读' href='#' class='notificationWidget-item-markRead' data-id='" + notification.id + "'></a>")
                .append($("<img src='../images/baseline-check_circle_outline.png' alt='read'/>")))
            //content container
            .append($("<div class='notificationWidget-item-content'></div>")
                //link
                .append($("<a href='#'></a>")
                    .attr("id", "notification_item_" + i)
                    //header
                    .append($("<div class='notificationWidget-item-header'></div>")
                        .html(notification["*"].header))
                    //body
                    .append($("<div class='notificationWidget-item-body'></div>")
                        .html(notification["*"].body))
                    //info
                    .append($("<div class='notificationWidget-item-category'></div>")
                        .html(info))
                    //date
                    .append($("<div class='notificationWidget-item-date'></div>")
                        .text(dateFormat(notification.timestamp.mw)))))
        $("#notificationWidget_unreadList")
            //a notification item
            .append(navitem);
        $("#notification_item_" + i).click(function () {
            createTab(notification["*"].links.primary.url);
        });
    }
    $(".notificationWidget-item-markRead").click(function () {
        getWIKIActionToken(token => {
            let id = $(this).data("id");
            let item = $(this).parent();
            markNotification({ list: id, token: token }, result => {
                if (!result.error && result.query.echomarkread.result) {
                    if (result.query.echomarkread.result == "success") {
                        // remove marked info
                        item.fadeOut(() => {
                            item.remove();
                            if ($("#notificationWidget_unreadList li").length <= 0) {
                                cleanNotification();
                            }
                        });
                    }
                }
                checkUnreadNotificationNum();
            })
        });
    });
}

function renderRemindNotificationList(list) {
    for (let i = list.length - 1; i >= 0; i--) {
        let notification = list[i];
        var info = "";
        switch (notification.category) {
            case "user-rights":
            case "social-rel":
                switch (notification.category) {
                    case "user-rights":
                        info += "<span>权限变更</span>";
                        break;
                    case "social-rel":
                        info += "<span>好友</span>";
                        break;
                }
                info += "<span>操作人：<font color='#66aaff'>" + notification.agent.name + "</font></span>";
                break;
        }
        var navitem = $("<li class='notificationWidget-item list-group-item list-group-item-action'></li>")
            //icon
            .append($("<img class='notificationWidget-item-icon'/>")
                .attr("src", "../images/" + notification["*"].icon + ".png")
                .attr("alt", notification["*"].icon))
            //content container
            .append($("<div class='notificationWidget-item-content'></div>")
                //link
                .append($("<a href='#'></a>")
                    .attr("id", "notification_item_" + i)
                    //header
                    .append($("<div class='notificationWidget-item-header'></div>")
                        .html(notification["*"].header))
                    //body
                    .append($("<div class='notificationWidget-item-body'></div>")
                        .html(notification["*"].body))
                    //info
                    .append($("<div class='notificationWidget-item-category'></div>")
                        .html(info))
                    //date
                    .append($("<div class='notificationWidget-item-date'></div>")
                        .text(dateFormat(notification.timestamp.mw)))))
        $("#notificationWidget_remindList")
            //a notification item
            .append(navitem);
        $("#notification_item_" + i).click(function () {
            createTab(notification["*"].links.primary.url);
        });
    }
}

function renderMsgNotificationList(list) {
    for (let i = list.length - 1; i >= 0; i--) {
        let notification = list[i];
        var info = "";
        switch (notification.category) {
            case "article-linked":
            case "achiev":
                switch (notification.category) {
                    case "article-linked":
                        info += "<span>页面链接</span>";
                        break;
                    case "achiev":
                        info += "<span>成就系统</span>";
                        break;
                    case "system":
                        info += "<span>系统</span>";
                        break;
                    case "flowthread":
                        info += "<span>评论</span>";
                        info += "<span>操作人：<font color='#66aaff'>" + notification.agent.name + "</font></span>";
                        break;
                }
                break;
        }
        var navitem = $("<li class='notificationWidget-item list-group-item list-group-item-action'></li>")
            //icon
            .append($("<img class='notificationWidget-item-icon'/>")
                .attr("src", "../images/" + notification["*"].icon + ".png")
                .attr("alt", notification["*"].icon))
            //content container
            .append($("<div class='notificationWidget-item-content'></div>")
                //link
                .append($("<a href='#'></a>")
                    .attr("id", "notification_item_" + i)
                    //header
                    .append($("<div class='notificationWidget-item-header'></div>")
                        .html(notification["*"].header))
                    //body
                    .append($("<div class='notificationWidget-item-body'></div>")
                        .html(notification["*"].body))
                    //info
                    .append($("<div class='notificationWidget-item-category'></div>")
                        .html(info))
                    //date
                    .append($("<div class='notificationWidget-item-date'></div>")
                        .text(dateFormat(notification.timestamp.mw)))))
        $("#notificationWidget_msgList")
            //a notification item
            .append(navitem);
        $("#notification_item_" + i).click(function () {
            createTab(notification["*"].links.primary.url);
        });
    }
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

function cleanNotification(flag = "nounread") {
    switch (flag) {
        case "nounread":
            if (!$("#nounread").length > 0) {
                $("#notificationWidget_unreadList").empty();
                $("#notificationWidget_unreadList").append($("<li class='notificationWidget-item list-group-item list-group-item-action' id='nounread'>暂无未读通知</li>"));
            }
            break;
        case "noremind":
            if (!$("#notopic").length > 0) {
                $("#notificationWidget_remind").empty();
                $("#notificationWidget_remind").append($("<li class='notificationWidget-item list-group-item list-group-item-action' id='nounread'>暂无已读提醒</li>"));
            }
            break;
        case "nomsg":
            if (!$("#nomsg").length > 0) {
                $("#notificationWidget_msg").empty();
                $("#notificationWidget_msg").append($("<li class='notificationWidget-item list-group-item list-group-item-action' id='nounread'>暂无已读通知</li>"));
            }
            break;
    }
}
