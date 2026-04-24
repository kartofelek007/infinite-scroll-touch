/**
 * klasa przesuwająca elementy z prawa na lewo
 * stosowana np. na belce partnerów na górze strony
 */
class Scroller {
    constructor(element, options = {}) {
        if (!element) return;
        this.scroller = element;
        this.scroller.classList.add("scroller-active");
        this.options = {
            ...{
                scrollSpeed : 2,
                touchSpeedBoost : 8,
                scrollBreaker : 0.6,
                resizeDebounceDelay : 250
            },
            ...options
        }

        this.scrollPos = 0;
        this.scrollSpeed = this.options.scrollSpeed;
        this.scrollTemp = this.scrollSpeed;
        this.scrollerInside = this.scroller.firstElementChild;
        this.resizeTimeout = null;
        this.lastFrameTime = performance.now();
        this.elementWidths = [];
        this.currentElementIndex = 0;

        //clone children using DocumentFragment for better performance
        const children = [...this.scrollerInside.children];
        const fragment = document.createDocumentFragment();

        for (let i=0; i<5; i++) {
            children.forEach(el => fragment.append(el.cloneNode(true)))
        }
        this.scrollerInside.append(fragment);

        // Precalculate all element widths once
        this.elementWidths = [...this.scrollerInside.children].map(el => this.getWidth(el));
        this.currentElementIndex = 0;
        this.elWidth = this.elementWidths[0];

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener("resize", this.handleResize);

        this.scrollerInside.style.transform = "translateX(0)";
        this.touchstartX = 0
        this.touchendX = 0
        this.timeStart = 0
        this.timeEnd = 0
        this.touchSpeed = 0

        this.bindTouch();
        this.bindMouse();
        this.scroll();
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Recalculate all element widths
            this.elementWidths = [...this.scrollerInside.children].map(el => this.getWidth(el));
            this.elWidth = this.elementWidths[this.currentElementIndex];
        }, this.options.resizeDebounceDelay);
    }

    getWidth(element) {
        if (!element) return 0;
        // Cache computed values to avoid layout thrashing
        if (element.__cachedWidth && element.__cacheTime && Date.now() - element.__cacheTime < 500) {
            return element.__cachedWidth;
        }
        let width = element.getBoundingClientRect().width;
        let style = window.getComputedStyle(element);
        let margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        const result = width + margin;
        element.__cachedWidth = result;
        element.__cacheTime = Date.now();
        return result;
    }

    scroll() {
        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 16.67; // normalize to 60fps
        this.lastFrameTime = now;

        this.touchSpeed -= this.options.scrollBreaker * deltaTime;
        this.touchSpeed = Math.max(0, this.touchSpeed);

        this.scrollSpeed = this.scrollTemp + this.touchSpeed;

        const translate = this.scrollPos - this.scrollSpeed * deltaTime;
        this.scrollPos = translate;
        this.scrollerInside.style.transform = `translateX(${translate}px)`;

        if (Math.abs(translate) > Math.abs(this.elWidth)) {
            this.scrollerInside.style.transform = "translateX(0)";
            this.scrollPos = 0;
            this.scrollerInside.append(this.scrollerInside.firstElementChild);
            // Shift to next element in width array (circular)
            this.currentElementIndex = (this.currentElementIndex + 1) % this.elementWidths.length;
            this.elWidth = this.elementWidths[this.currentElementIndex];
        }

        requestAnimationFrame(e => this.scroll());
    }

    handleGesture() {
        if (this.touchSpeed > 0) this.scrollSpeed = this.options.scrollSpeed + this.touchSpeed;
    }

    bindMouse() {
        this.handleMouseEnter = () => {
            this.scrollTemp = 0;
            this.scrollSpeed = 0;
        };

        this.handleMouseLeave = () => {
            this.scrollSpeed = this.options.scrollSpeed;
            this.scrollTemp = this.options.scrollSpeed;
        };

        this.scroller.addEventListener("mouseenter", this.handleMouseEnter);
        this.scroller.addEventListener("mouseleave", this.handleMouseLeave);
    }

    bindTouch() {
        this.handleTouchStart = e => {
            this.touchstartX = e.changedTouches[0].screenX;
            this.timeStart = e.timeStamp;
        };

        this.handleTouchEnd = e => {
            this.touchendX = e.changedTouches[0].screenX;
            this.timeEnd = e.timeStamp;
            const timeDelta = this.timeEnd - this.timeStart;
            if (timeDelta > 0) {
                this.touchSpeed = Math.abs((this.touchendX - this.touchstartX) / timeDelta) * this.options.touchSpeedBoost;
            }
            this.handleGesture();
        };

        this.scroller.addEventListener('touchstart', this.handleTouchStart);
        this.scroller.addEventListener('touchend', this.handleTouchEnd);
    }

    destroy() {
        clearTimeout(this.resizeTimeout);
        window.removeEventListener("resize", this.handleResize);
        this.scroller.removeEventListener("mouseenter", this.handleMouseEnter);
        this.scroller.removeEventListener("mouseleave", this.handleMouseLeave);
        this.scroller.removeEventListener('touchstart', this.handleTouchStart);
        this.scroller.removeEventListener('touchend', this.handleTouchEnd);
        this.scroller.classList.remove("scroller-active");
        this.scroller = null;
        this.scrollerInside = null;
    }
}

