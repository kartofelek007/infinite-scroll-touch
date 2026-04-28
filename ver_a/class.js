/**
 * @class Scroller
 * @description Klasa przesuwająca elementy z prawa na lewo w nieskończonej pętli.
 * Stosowana np. na belce partnerów na górze strony.
 */
class Scroller {
    /**
     * @constructor
     * @param {HTMLElement} element - Element kontenera scroller'a.
     * @param {Object} options - Opcje konfiguracyjne.
     * @param {number} [options.scrollSpeed=1000] - Prędkość przesuwania w pikselach na sekundę.
     * @param {number} [options.resizeDebounceDelay=100] - Opóźnienie debouncing dla resize w ms.
     */
    constructor(element, options = {}) {
        if (!element) return;
        this.scroller = element;
        this.scroller.classList.add("scroller-active");
        this.options = {
            ...{
                resizeDebounceDelay : 100,
                scrollSpeed : 1000
            },
            ...options
        }
        this.scrollerInside = this.scroller.firstElementChild;
        this.scroller.style.overflowX = "clip";
        this.scrollerInside.style.display = "flex";
        this.scrollerInside.style.width = "max-content";
        this.scrollSpeed = this.options.scrollSpeed;

        const children = [...this.scrollerInside.children];
        const fragment = document.createDocumentFragment();
        children.forEach(el => fragment.append(el.cloneNode(true)))

        this.scrollerInside.append(fragment);
        this.elementWidths = [...this.scrollerInside.children].map(el => this.getWidth(el));

        // Calculate total width of original elements
        const originalCount = children.length;
        this.totalWidth = this.elementWidths.slice(0, originalCount).reduce((sum, w) => sum + w, 0);

        this.startAnimation();

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener("resize", this.handleResize);

        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.scroller.addEventListener("mouseenter", this.handleMouseEnter);
        this.scroller.addEventListener("mouseleave", this.handleMouseLeave);
    }

    /**
     * @method handleMouseEnter
     * @description Zatrzymuje animację gdy kursor wejdzie na element.
     */
    handleMouseEnter() {
        this.animation.pause();
    }

    /**
     * @method handleMouseLeave
     * @description Wznawia animację gdy kursor opuści element.
     */
    handleMouseLeave() {
        this.animation.play();
    }

    /**
     * @method startAnimation
     * @description Uruchamia nieskończoną animację przesuwania elementów.
     */
    startAnimation() {
        const duration = (this.totalWidth / this.scrollSpeed) * 10; // ms
        console.log(duration);
        this.animation = this.scrollerInside.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-50%)' }
        ], {
            duration: duration,
            iterations: Infinity
        });
    }

    /**
     * @method getWidth
     * @description Oblicza rzeczywistą szerokość elementu wraz z marginesami.
     * @param {HTMLElement} element - Element do pomiaru.
     * @returns {number} Szerokość elementu w pikselach.
     */
    getWidth(element) {
        if (!element) return 0;
        let width = element.getBoundingClientRect().width;
        let style = window.getComputedStyle(element);
        let margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        return width + margin;
    }

    /**
     * @method handleResize
     * @description Obsługuje zmianę rozmiaru okna, przelicza szerokości i restartuje animację.
     */
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.elementWidths = [...this.scrollerInside.children].map(el => this.getWidth(el));
            const originalCount = Math.floor(this.elementWidths.length / 2);
            this.totalWidth = this.elementWidths.slice(0, originalCount).reduce((sum, w) => sum + w, 0);
            this.animation.cancel();
            this.startAnimation();
        }, this.options.resizeDebounceDelay);
    }

    /**
     * @method destroy
     * @description Czyści wszystkie event listeners i anuluje animację.
     */
    destroy() {
        clearTimeout(this.resizeTimeout);
        if (this.animation) this.animation.cancel();
        window.removeEventListener("resize", this.handleResize);
        this.scroller.removeEventListener("mouseenter", this.handleMouseEnter);
        this.scroller.removeEventListener("mouseleave", this.handleMouseLeave);
        this.scroller.classList.remove("scroller-active");
        this.scroller = null;
        this.scrollerInside = null;
    }
}

