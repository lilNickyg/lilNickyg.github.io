const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
};

menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
});

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
}

const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
    });
}, { rootMargin: '-30% 0px -60%', threshold: 0 });

sections.forEach((section) => activeObserver.observe(section));

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

const heroGallery = document.querySelector('[data-hero-gallery]');

if (heroGallery) {
    const galleryButtons = [...heroGallery.querySelectorAll('[data-gallery-button]')];
    const gallerySlides = [...heroGallery.querySelectorAll('[data-gallery-slide]')];

    const selectGallerySlide = (nextIndex, moveFocus = false) => {
        galleryButtons.forEach((button, index) => {
            const isActive = index === nextIndex;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', String(isActive));
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        gallerySlides.forEach((slide, index) => {
            const isActive = index === nextIndex;
            slide.classList.toggle('active', isActive);
            slide.setAttribute('aria-hidden', String(!isActive));
            slide.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        if (moveFocus) galleryButtons[nextIndex]?.focus();
    };

    galleryButtons.forEach((button, index) => {
        button.addEventListener('click', () => selectGallerySlide(index));
        button.addEventListener('keydown', (event) => {
            let nextIndex;

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % galleryButtons.length;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + galleryButtons.length) % galleryButtons.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = galleryButtons.length - 1;
            if (nextIndex === undefined) return;

            event.preventDefault();
            selectGallerySlide(nextIndex, true);
        });
    });
}

const projectTimelines = document.querySelectorAll('[data-project-timeline]');

projectTimelines.forEach((projectTimeline) => {
    const timelineViewport = projectTimeline.querySelector('[data-timeline-viewport]');
    const previousButton = projectTimeline.querySelector('[data-timeline-previous]');
    const nextButton = projectTimeline.querySelector('[data-timeline-next]');
    const firstTimelineItem = projectTimeline.querySelector('.cosmic-timeline-item');
    let isPointerDragging = false;
    let pointerStartX = 0;
    let pointerStartScroll = 0;

    const updateTimelineButtons = () => {
        if (!timelineViewport) return;
        const maximumScroll = timelineViewport.scrollWidth - timelineViewport.clientWidth;
        previousButton.disabled = timelineViewport.scrollLeft <= 4;
        nextButton.disabled = timelineViewport.scrollLeft >= maximumScroll - 4;
    };

    const moveTimeline = (direction) => {
        if (!timelineViewport || !firstTimelineItem) return;
        timelineViewport.scrollBy({
            left: firstTimelineItem.getBoundingClientRect().width * direction,
            behavior: reduceMotion ? 'auto' : 'smooth',
        });
    };

    previousButton?.addEventListener('click', () => moveTimeline(-1));
    nextButton?.addEventListener('click', () => moveTimeline(1));
    timelineViewport?.addEventListener('scroll', updateTimelineButtons, { passive: true });
    window.addEventListener('resize', updateTimelineButtons);

    timelineViewport?.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        isPointerDragging = true;
        pointerStartX = event.clientX;
        pointerStartScroll = timelineViewport.scrollLeft;
        timelineViewport.setPointerCapture(event.pointerId);
        timelineViewport.classList.add('dragging');
    });

    timelineViewport?.addEventListener('pointermove', (event) => {
        if (!isPointerDragging) return;
        timelineViewport.scrollLeft = pointerStartScroll - (event.clientX - pointerStartX);
    });

    const stopTimelineDrag = (event) => {
        if (!isPointerDragging) return;
        isPointerDragging = false;
        timelineViewport.releasePointerCapture?.(event.pointerId);
        timelineViewport.classList.remove('dragging');
    };

    timelineViewport?.addEventListener('pointerup', stopTimelineDrag);
    timelineViewport?.addEventListener('pointercancel', stopTimelineDrag);
    updateTimelineButtons();
});

const odinInteractive = document.querySelector('[data-odin-interactive]');

if (odinInteractive) {
    const odinHotspots = [...odinInteractive.querySelectorAll('[data-odin-hotspot]')];

    const setActiveOdinHotspot = (activeHotspot) => {
        odinHotspots.forEach((hotspot) => {
            hotspot.setAttribute('aria-expanded', String(hotspot === activeHotspot));
        });
    };

    const findNearestOdinHotspot = (clientX, clientY) => odinHotspots.reduce((nearest, hotspot) => {
        const bounds = hotspot.getBoundingClientRect();
        const distance = Math.hypot(clientX - (bounds.left + bounds.width / 2), clientY - (bounds.top + bounds.height / 2));
        return !nearest || distance < nearest.distance ? { hotspot, distance } : nearest;
    }, null)?.hotspot;

    odinHotspots.forEach((hotspot) => {
        hotspot.addEventListener('click', (event) => {
            event.stopPropagation();
            const selectedHotspot = event.detail === 0
                ? hotspot
                : findNearestOdinHotspot(event.clientX, event.clientY);
            const willOpen = selectedHotspot?.getAttribute('aria-expanded') !== 'true';
            setActiveOdinHotspot(willOpen ? selectedHotspot : null);
        });
    });

    odinInteractive.addEventListener('click', () => setActiveOdinHotspot(null));
    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-odin-interactive]')) setActiveOdinHotspot(null);
    });
}
