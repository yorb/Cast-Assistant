function main() {
	"use strict";

	function checkPage(tabId, changeInfo, tab) {
		if (tab.url.indexOf('https://soundcloud.com') === 0 || tab.url.indexOf('https://play.spotify.com') === 0) {
			chrome.pageAction.show(tabId);
		}
	}

	var isActive = false;

	function toggleExt(tab) {
		isActive = (isActive ? false : true);
		updateIcon(tab, isActive);
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {active: isActive});
		});
	}

	function updateIcon(tab, isActive) {
		var icon = {
			"tabId": tab.id,
			"path": {
				"19": (isActive ? "icon-19.png" : "icon-19-deactivated.png"),
				"38": (isActive ? "icon-38.png" : "icon-38-deactivated.png")
			}
		};

		chrome.pageAction.setIcon(icon);
	}

	chrome.tabs.onUpdated.addListener(checkPage);
	chrome.pageAction.onClicked.addListener(toggleExt);

	chrome.runtime.onMessage.addListener(function(request, sender) {
		updateIcon(sender.tab, request.active);
		isActive = false;
	});
}

main();