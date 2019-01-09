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
            success: function (result) {
                if (result.hasOwnProperty("query") &&
                    result.query.hasOwnProperty("notifications")) {
                    if (result.query.notifications.count === "0") {
                        chrome.browserAction.setBadgeText({ text: "" });
                    } else {
                        chrome.browserAction.setBadgeText({ text: String(result.query.notifications.count) });
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
        success: function (result) {
            if (result.hasOwnProperty("query") &&
                result.query.hasOwnProperty("notifications")) {
                if (result.query.notifications.count === "0") {
                    chrome.browserAction.setBadgeText({ text: "" });
                } else {
                    chrome.browserAction.setBadgeText({ text: String(result.query.notifications.count) });
                    renderNotificationList(result.query.notifications.list);
                }
            }
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
        getWIKIActionToken(e => {
            let id = $(this).data("id");
            let token = e;
            let item = $(this).parent();
            $.ajax({
                url: 'https://thwiki.cc/api.php',
                type: "POST",
                data: {
                    action: "echomarkread",
                    token: token,
                    list:id,
                    format: "json",
                    formatversion: 2,
                },
                dataType:"json",
                success: (result) => {
                    item.remove();
                    checkUnreadNotificationNum();
                }
            });
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
        success: (result)=>{
            // return the wiki csrftoken
            let token = result.query.tokens.csrftoken;
            return cb(token);
        }
    });
}
