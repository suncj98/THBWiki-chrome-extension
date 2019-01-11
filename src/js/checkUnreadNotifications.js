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
            if (result.query && result.query.notifications) {
                if (result.query.notifications.count === "0") {
                    chrome.browserAction.setBadgeText({ text: "" });
                } else {
                    chrome.browserAction.setBadgeText({ text: String(result.query.notifications.count) });
                    $("#notificationWidget_list").append($("<a href='#' id='notificationWidget_all_markRead' class='btn btn-info'>Mark all as read</a>"))
                    renderNotificationList(result.query.notifications.list);
                }
            }
            $("#notificationWidget_all_markRead").click(() => {
                let nfs = $("#notificationWidget_list li .notificationWidget-item-markRead");
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
                                $("#notificationWidget_list").fadeOut(() => {
                                    $("#notificationWidget_list").empty();
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

function renderNotificationList(list) {
    for (let i = list.length - 1; i >= 0; i--) {
        let notification = list[i];
        $("#notificationWidget_list")
            //a notification item
            .append($("<li class='notificationWidget-item list-group-item list-group-item-action'></li>")
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
                        //date
                        .append($("<div class='notificationWidget-item-date'></div>")
                            .text(dateFormat(notification.timestamp.mw))))));
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
                        });
                    }
                }
                checkUnreadNotificationNum();
            })
        });
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
