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
     * @param {number} [options.scrollSpeed] - Prędkość przesuwania.
     * @param {number} [options.resizeDebounceDelay=250] - Opóźnienie debouncing dla resize w ms.
     */
    constructor(element, options = {}) {
        if (!element) return;
        this.scroller = element;
        this.scroller.classList.add("scroller-active");
        this.options = {
            ...{
                resizeDebounceDelay : 250
            },
            ...options
        }

        this.scrollPos = 0;
        this.scrollSpeed = this.options.scrollSpeed;
        this.scrollerInside = this.scroller.firstElementChild;
        this.resizeTimeout = null;
        this.elementWidths = [];
        this.currentElementIndex = 0;
        this.scroller.style.overflowX = "clip";
        this.scrollerInside.style.display = "flex";
        this.scrollerInside.style.width = "max-content";

        //clone children using DocumentFragment for better performance
        const children = [...this.scrollerInside.children];

        const fragment = document.createDocumentFragment();
        children.forEach(el => fragment.append(el.cloneNode(true)))

        this.scrollerInside.append(fragment);

        // Precalculate all element widths once
        this.elementWidths = [...this.scrollerInside.children].map(el => this.getWidth(el));
        this.currentElementIndex = 0;
        this.elWidth = this.elementWidths[0];

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener("resize", this.handleResize);

        this.scrollerInside.style.transform = "translateX(0)";

        this.bindMouse();
        this.scroll();
    }

    /**
     * @method handleResize
     * @description Obsługuje zmianę rozmiaru okna, przelicza szerokości elementów.
     */
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Recalculate all element widths
            this.elementWidths = [...this.scrollerInside.children].map(el => this.getWidth(el));
            this.elWidth = this.elementWidths[this.currentElementIndex];
        }, this.options.resizeDebounceDelay);
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
        const result = width + margin;
        return result;
    }

    /**
     * @method scroll
     * @description Główna pętla animacji przesuwająca elementy.
     */
    scroll() {
        this.scrollPos -= this.scrollSpeed;
        this.scrollerInside.style.transform = `translateX(${this.scrollPos}px)`;

        if (Math.abs(this.scrollPos) >= Math.abs(this.elWidth)) {
            const overshoot = Math.abs(this.scrollPos) - Math.abs(this.elWidth);
            this.scrollPos = -overshoot;
            this.scrollerInside.style.transform = `translateX(${this.scrollPos}px)`;
            this.scrollerInside.insertAdjacentElement('beforeend', this.scrollerInside.firstElementChild);
            this.currentElementIndex = (this.currentElementIndex + 1) % this.elementWidths.length;
            this.elWidth = this.elementWidths[this.currentElementIndex];
        }

        requestAnimationFrame(e => this.scroll());
    }

    /**
     * @method bindMouse
     * @description Dodaje event listeners dla mouseenter i mouseleave.
     */
    bindMouse() {
        this.handleMouseEnter = () => {
            this.scrollSpeed = 0;
        };

        this.handleMouseLeave = () => {
            this.scrollSpeed = this.options.scrollSpeed;
        };

        this.scroller.addEventListener("mouseenter", this.handleMouseEnter);
        this.scroller.addEventListener("mouseleave", this.handleMouseLeave);
    }

    /**
     * @method destroy
     * @description Czyści wszystkie event listeners.
     */
    destroy() {
        clearTimeout(this.resizeTimeout);
        window.removeEventListener("resize", this.handleResize);
        this.scroller.removeEventListener("mouseenter", this.handleMouseEnter);
        this.scroller.removeEventListener("mouseleave", this.handleMouseLeave);
        this.scroller.classList.remove("scroller-active");
        this.scroller = null;
        this.scrollerInside = null;
    }
}

