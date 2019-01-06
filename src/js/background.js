chrome.contextMenus.create({
    "title": "Search THBWiki for \"%s\"",
    "contexts": ["selection"],
    "onclick": function searchSelection(info) {
        let newURL = `https://thwiki.cc/index.php?search=${encodeURIComponent(info.selectionText)}&fulltext=1`;
        chrome.tabs.create({url: newURL});
    }
});

chrome.omnibox.onInputEntered.addListener(
    function (text) {
        let newURL = `https://thwiki.cc/index.php?search=${encodeURIComponent(text)}&fulltext=1`;
        chrome.tabs.create({url: newURL});
    }
);