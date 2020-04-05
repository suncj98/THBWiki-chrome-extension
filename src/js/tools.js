QueryString = {
    data: {},
    Initial: function () {
        var aPairs, aTmp;
        var queryString = new String(window.location.search);
        queryString = queryString.substr(1, queryString.length);
        aPairs = queryString.split("&");
        for (var i = 0; i < aPairs.length; i++) {
            aTmp = aPairs[i].split("=");
            this.data[aTmp[0]] = aTmp[1];
        }
    },
    GetValue: function (key) {
        return this.data[key];
    }
}
QueryString.Initial();

//Get Query
var action = QueryString.GetValue("action");
var title = decodeURI(QueryString.GetValue("title"));

//Get Status
var editstatus = (action == "edit") ? true : false;
var lyricstatus = (title.indexOf("歌词:") >= 0) ? true : false;

$().ready(() => {
    //Add Button Group
    var buttons = $("<div id='p-THBTools' role='navigation' class='vectorMenu' aria-labelledby='p-THBTools-label'><h3 id='p-THBTools-label' tabindex='0'><span>THB小工具</span><a href='#' tabindex='-1'></a></h3><div class='menu'><ul id='THBToolsBtns'></ul></div></div>");
    $("#p-cactions").before(buttons);

    if (editstatus) {
        if (lyricstatus) {
            var subtitle = title.substring("歌词:".length);
            var groupname = (subtitle.indexOf("（") > 0) ? subtitle.substring(subtitle.indexOf("（") + 1, subtitle.length - "）".length) : "";
            var songname = subtitle.replace("（" + groupname + "）", "");
            $(".mw-editform").before($("<pre><button type='button' id='btn-netlyric'>网易云歌词获取</button><ul id='songlist'></ul><div id='lyrictext' style='display:none;'><iframe allowTransparency='true' style='background-color:#66ccff;width:100%'></iframe><button id='lyricclose' type='button'>关闭</button></div></pre>"));
            $("#btn-netlyric").click(() => {
                $.get("https://www.alicem.top/KamiAPI/netname.php?limit=3&name=" + songname + "+" + groupname, (res) => {
                    res.result.songs.forEach((value) => {
                        $("#songlist").append($("<li>" + value.name + " <strong>" + value.album.name + "</strong>　<button data-id='" + value.id + "'>选择</button></li>"));
                    })
                    $("#songlist li button").click((e) => {
                        var id = $(e.currentTarget).data("id");
                        $("#lyrictext iframe").attr("src", "https://www.alicem.top/KamiAPI/netlyric.php?id=" + id);
                        $("#lyrictext").show();
                    });
                })
            });
            $("#lyricclose").click(() => {
                $("#lyrictext iframe").attr("src","");
                $("#lyrictext").hide();
            });
        }
    }
})