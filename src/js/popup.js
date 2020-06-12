var app = new Vue({
    el: "#app",
    data() {
        return {
            Version: '1.0',
            Search: '',
            Tab: 0,
            UserName: "",
            loadding: false,
            UnreadNotificationList: [],
            RemindNotificationList: [],
            MsgNotificationList: []
        };
    },
    created() {
        $.get(chrome.extension.getURL('manifest.json'), (info) => {
            this.Version = info.version;
        }, 'json');
        checkLogin((res) => {
            if (res) {
                this.UserName = decodeURIComponent(res).replace('+',' ');
                this.getUnreadNotification();
            }
        });
    },
    methods: {
        enterTHB(User) {
            if (User) {
                createTab(this.UserName ? `https://thwiki.cc/用户:${this.UserName}` : "https://thwiki.cc/特殊:用户登录");
            }
            else {
                createTab("https://thwiki.cc");
            }
        },
        changeTab(TabIndex) {
            this.Tab = TabIndex;
            switch (TabIndex) {
                case 0:
                    this.getUnreadNotification();
                    break;
                case 1:
                    this.getRemindNotification();
                    break;
                case 2:
                    this.getMsgNotification();
                    break;
            }
        },
        getUnreadNotification() {
            this.loadding = true;
            checkUnreadNotification((res) => {
                this.loadding = false;
                if (res && res.query && res.query.notifications) {
                    let notifications = res.query.notifications;
                    let count = parseInt(notifications.count);
                    if (count == 0) {
                        chrome.browserAction.setBadgeText({ text: "" });
                        this.UnreadNotificationList = [];
                    }
                    else {
                        chrome.browserAction.setBadgeText({ text: String(count) });
                        this.UnreadNotificationList = this.formatNotification(notifications.list);
                    }
                }
            })
        },
        getRemindNotification() {
            this.loadding = true;
            checkRemindNotification((res) => {
                this.loadding = false;
                if (res && res.query && res.query.notifications) {
                    let notifications = res.query.notifications;
                    var count = parseInt(notifications.count);
                    if (notifications.list.length <= 0) {
                        this.RemindNotificationList = [];
                    }
                    else {
                        this.RemindNotificationList = this.formatNotification(notifications.list);
                    }
                }
            })
        },
        getMsgNotification() {
            this.loadding = true;
            checkMsgNotification((res) => {
                this.loadding = false;
                if (res && res.query && res.query.notifications) {
                    let notifications = res.query.notifications;
                    if (notifications.list.length <= 0) {
                        this.MsgNotificationList = [];
                    }
                    else {
                        this.MsgNotificationList = this.formatNotification(notifications.list);
                    }
                }
            });
        },
        markRead(url) {
            createTab(url);
        },
        markAllRead() {
            getWIKIActionToken(token => {
                var list = this.UnreadNotificationList.map(v => v = v.id).join("|");
                markNotification({ list: list, token: token }, result => {
                    if (!result.error && result.query.echomarkread.result) {
                        if (result.query.echomarkread.result == "success") {
                            this.UnreadNotificationList = [];
                        }
                    }
                    checkUnreadNotificationNum();
                    this.getUnreadNotification();
                })
            });
        },
        formatNotification(obj) {
            var topic = {
                "user-rights": "权限变更",
                "social-rel": "好友"
            };
            var msg = {
                "article-linked": "页面链接",
                "achiev": "成就系统",
                "system": "系统",
                "flowthread": "评论",
                "flow-discussion": "讨论"
            };
            return obj.map((v => {
                return {
                    id: v.id,
                    category: v.category,
                    type: topic[v.category] ? "提醒" : (msg[v.category] ? "一般通知" : "未知"),
                    categoryname: topic[v.category] || msg[v.category] || "未知",
                    agentname: v.agent.name,
                    icon: v["*"].icon,
                    header: v["*"].header,
                    body: v["*"].body,
                    date: dateFormat(v.timestamp.mw),
                    url: v["*"].links.primary.url
                }
            }));
        },
        searchTHB() {
            createTab(`https://thwiki.cc/index.php?search=${encodeURIComponent(this.Search)}&fulltext=1`);
        }
    }
});