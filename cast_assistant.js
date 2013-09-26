$(document).ready(function() {

	"use strict";

	var overlayHTML = '<div class="cast-assistant-overlay hidden"><div class="cast-assistant-overlay__info"><div class="cast-assistant-overlay__artist" /><div class="cast-assistant-overlay__title" /><div class="cast-assistant-overlay__progress"><div class="cast-assistant-overlay__progress-fill" /><span class="cast-assistant-overlay__progress-info cast-assistant-overlay__progress-start"/><span class="cast-assistant-overlay__progress-info cast-assistant-overlay__progress-end"/></div></div></div>';

	$('body').append(overlayHTML);
	var overlay = $('.cast-assistant-overlay');
	var pageTitleElement = document.getElementsByTagName('title')[0];

	var title = '';
	var artist = '';

	// where are we?
	var isSpotify = (window.location.href.indexOf('https://play.spotify.com/') === 0),
		isSoundCloud = (window.location.href.indexOf('https://soundcloud.com/') === 0),
		isPandora = (window.location.href.indexOf('http://www.pandora.com/') === 0);

	overlay.addClass(isSpotify ? 'spotify' : '');
	overlay.addClass(isSoundCloud ? 'soundcloud' : '');
	overlay.addClass(isPandora ? 'pandora' : '');

	pageTitleElement.addEventListener("DOMSubtreeModified", function() {
		if (document.title.indexOf('▶') === 0) {
			overlay.removeClass('not-playing');

			if (isSpotify) {
				// Spotify
				title = $('#app-player').contents().find('#track-name a').text();
				artist = $('#app-player').contents().find('#track-artist a').text();
			} else if (isSoundCloud) {
				// SoundCloud
				title = $('.playbackTitle').text();
				artist = document.title.substr(1 + title.length + 4);
			}
		} else {
			title = '';
			artist = '';

			overlay.addClass('not-playing');
		}

		updateOverlay(artist, title);
	});

	if (isPandora) {
		// Pandora

		var target = document.querySelector('.pauseButton');
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function() {
				if (target.style.display === 'block') {
					title = $('.playerBarSong').text();
					artist = $('.playerBarArtist').text();
					overlay.removeClass('not-playing');
				} else {
					title = '';
					artist = '';
					overlay.addClass('not-playing');
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
			updateOverlay(artist, title);
			overlay.removeClass('hidden');
		} else {
			overlay.addClass('hidden');
		}
	}

	var timer, endTimeSecs;
	function updateOverlay(artist, title) {
		$('.cast-assistant-overlay__artist').text(artist);
		$('.cast-assistant-overlay__title').text(title);

		if ((isSpotify || isPandora) && (artist + title).length > 0) {
			var endTime;

			if (isSpotify) {
				endTime = $('#app-player').contents().find('#track-length').text();
			} else if (isPandora) {
				endTime = secToHms(hmsToSecs($('.remainingTime').text()) + hmsToSecs($('.elapsedTime').text()));
			}
			endTimeSecs = hmsToSecs(endTime);
			$('.cast-assistant-overlay__progress-end').text(endTime);

			clearTimeout(timer);
			timer = startTimer();
		}
	}

	function startTimer() {
		var currentTime;
		if (isSpotify) {
			currentTime = $('#app-player').contents().find('#track-current').text();
		} else if (isPandora) {
			currentTime = $('.elapsedTime').text();
		}

		var progress = hmsToSecs(currentTime);
		var barPosition = progress/endTimeSecs;

		$('.cast-assistant-overlay__progress-start').text(currentTime);
		$('.cast-assistant-overlay__progress-fill').width(barPosition * 100 + "%");
		setTimeout(startTimer, 100);
	}

	function hmsToSecs(hms) {
		var split = hms.split(':');
		return Math.abs(split.pop()) * 1 + Math.abs(split.pop()) * 60 + (split.length ? Math.abs(split.pop()) * 60 * 60 : 0);
	}

	function secToHms(sec) {
		var hours   = Math.floor(sec / 3600);
		var minutes = Math.floor((sec - (hours * 3600)) / 60);
		var seconds = sec - (hours * 3600) - (minutes * 60);
		return (hours ? hours : '') + (hours ? ':' : '') + (hours ? zeroPad(minutes) : minutes) + ':' + zeroPad(seconds);
	}

	function zeroPad(num) {
		return (num >= 10 ? num : '0' + num);
	}

	overlay.click(function() {
		toggleOverlay();
		chrome.runtime.sendMessage({active: false});
	});

	chrome.runtime.onMessage.addListener(function(request) {
		toggleOverlay(request.active);
	});
});