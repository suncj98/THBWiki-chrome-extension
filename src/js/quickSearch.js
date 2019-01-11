chrome.contextMenus.create({
    "title": "Search THBWiki for \"%s\"",
    "contexts": ["selection"],
    "onclick": function searchSelection(info) {
        createTab(`https://thwiki.cc/index.php?search=${encodeURIComponent(info.selectionText)}&fulltext=1`);

    }
});

chrome.contextMenus.create({
    "title": "Go to THBWiki for \"%s\"",
    "contexts": ["selection"],
    "onclick": function searchSelection(info) {
        createTab(`https://thwiki.cc/${encodeURIComponent(info.selectionText)}`);

    }
});

chrome.omnibox.onInputEntered.addListener(
    function (text) {
        createTab(`https://thwiki.cc/index.php?search=${encodeURIComponent(text)}&fulltext=1`);
    }
);