document.addEventListener('DOMContentLoaded', function() {
	const header = document.getElementById('siteHeader');
	const scrollTopBtn = document.getElementById('scrollTopBtn');
	const headerDownload = document.getElementById('headerDownloadCV');
	const downloadButtons = document.querySelectorAll('[data-role="download-cv"]');
	const SCROLL_SHOW_THRESHOLD = 24;

	function updateHeaderHeight() {
		const h = header ? header.offsetHeight : 64;
		document.documentElement.style.setProperty('--header-height', h + 'px');
	}
	updateHeaderHeight();
	window.addEventListener('resize', updateHeaderHeight);

	let scrollTimeout = null;
	function onScroll() {
		if (scrollTimeout) return;
		scrollTimeout = setTimeout(function() {
			const y = window.scrollY || window.pageYOffset;
			const show = y > SCROLL_SHOW_THRESHOLD;
			if (headerDownload) headerDownload.classList.toggle('hidden', !show);
			if (scrollTopBtn) scrollTopBtn.classList.toggle('hidden', !show);
			scrollTimeout = null;
		}, 80);
	}
	document.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	function smoothScrollToHash(hash) {
		if (!hash || hash === '#') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		const target = document.querySelector(hash);
		if (!target) return;
		const headerH = header ? header.offsetHeight : 0;
		const y = target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
		window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
		setTimeout(function() {
			try {
				const mobilePanel = document.querySelector('.sm:hidden [x-show]');
				if (mobilePanel && getComputedStyle(mobilePanel).display !== 'none') {
					const menuBtn = document.querySelector('.sm:hidden button[aria-label="menu"]');
					if (menuBtn) menuBtn.click();
				}
			} catch (e) {
			}
		}, 260);
	}

	document.querySelectorAll('a[data-scroll]').forEach(function(a) {
		a.addEventListener('click', function(e) {
			e.preventDefault();
			const href = a.getAttribute('href');
			smoothScrollToHash(href);
		});
	});

	function triggerBrowserDownload(blob, filename) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename || 'CV.pdf';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	async function tryDownload(url) {
		try {
			const res = await fetch(url, { cache: 'no-store' });
			if (!res.ok) throw new Error('Kon CV niet laden (status ' + res.status + ')');
			const blob = await res.blob();
			const parts = url.split('/');
			const filename = parts[parts.length - 1] || 'CV.pdf';
			triggerBrowserDownload(blob, filename);
		} catch (err) {
			console.warn('Download fallback:', err);
			window.location.href = url;
		}
	}

	downloadButtons.forEach(function(btn) {
		btn.addEventListener('click', function(e) {
			const url = btn.getAttribute('href');
			if (!url) return;
			e.preventDefault();
			tryDownload(url);
		});
	});

	if (scrollTopBtn) {
		scrollTopBtn.addEventListener('click', function(e) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}
});
