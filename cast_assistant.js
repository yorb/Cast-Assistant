$(document).ready(function() {

	"use strict";

	var overlayHTML = '<div class="cast-assistant-overlay hidden"><div class="cast-assistant-overlay__info"><div class="cast-assistant-overlay__artist" /><div class="cast-assistant-overlay__title" /></div></div>';

	$('body').append(overlayHTML);
	var overlay = $('.cast-assistant-overlay');
	var pageTitleElement = document.getElementsByTagName('title')[0];

	var title = '';
	var artist = '';

	pageTitleElement.addEventListener("DOMSubtreeModified", function() {
		if (document.title.indexOf('▶') === 0) {
			if (window.location.href.indexOf('https://play.spotify.com/') === 0) {
				// Spotify
				title = $('#app-player').contents().find('#track-name a').text();
				artist = $('#app-player').contents().find('#track-artist a').text();
			} else if (window.location.href.indexOf('https://soundcloud.com/') === 0) {
				// SoundCloud
				title = $('.playbackTitle').text();
				artist = document.title.substr(1 + title.length + 4);
			}
		} else {
			title = '';
			artist = '';
		}

		updateOverlay(artist, title);
	});

	if (window.location.href.indexOf('http://www.pandora.com/') === 0) {
		// Pandora

		var target = document.querySelector('.pauseButton');
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function() {
				if (target.style.display === 'block') {
					title = $('.playerBarSong').text();
					artist = $('.playerBarArtist').text();
				} else {
					title = '';
					artist = '';
				}
				updateOverlay(artist, title);
			});
		});
		observer.observe(target, { attributes: true });

		var trackTarget = document.querySelector('.playerBarSong');
		var trackObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function() {
				title = $('.playerBarSong').text();
				artist = $('.playerBarArtist').text();
				updateOverlay(artist, title);
			});
		});
		trackObserver.observe(trackTarget, { childList: true, subtree: true });
	}

	function toggleOverlay(isActive) {
		if (isActive) {
			overlay.removeClass('hidden');
		} else {
			overlay.addClass('hidden');
		}

		updateOverlay(artist, title);
	}

	function updateOverlay(artist, title) {
		$('.cast-assistant-overlay__artist').text(artist);
		$('.cast-assistant-overlay__title').text(title);		
	}

	overlay.click(function() {
		toggleOverlay();
		chrome.runtime.sendMessage({active: false});
	});

	chrome.runtime.onMessage.addListener(function(request) {
		toggleOverlay(request.active);
	});
});