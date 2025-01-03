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
                scrollBreaker : 0.6
            },
            ...options
        }

        this.scrollPos = 0;
        this.scrollSpeed = this.options.scrollSpeed;
        this.scrollTemp = this.scrollSpeed;
        this.scrollerInside = this.scroller.firstElementChild;

        //clone children
        const children = [...this.scrollerInside.children];

        for (let i=0; i<5; i++) {
            children.forEach(el => this.scrollerInside.append(el.cloneNode(true)))
        }

        const el = this.scrollerInside.firstElementChild;
        this.elWidth = this.getWidth(el);

        window.addEventListener("resize", e => this.elWidth = this.getWidth(el))

        this.scrollerInside.style.transform = "translate(0)";
        this.touchstartX = 0
        this.touchendX = 0
        this.timeStart = 0
        this.timeEnd = 0
        this.touchSpeed = 0

        this.bindTouch();
        this.bindMouse();
        this.scroll();
    }

    getWidth(element) {
        let width = element.getBoundingClientRect().width;
        let style = window.getComputedStyle(element);
        let margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        return width + margin;
    }

    scroll() {
        this.touchSpeed -= this.options.scrollBreaker;
        this.touchSpeed = Math.max(0, this.touchSpeed);

        this.scrollSpeed = this.scrollTemp + this.touchSpeed;

        const translate = this.scrollPos - this.scrollSpeed;
        this.scrollPos = translate;
        this.scrollerInside.style.transform = "translateX(" + translate + "px)";

        if (Math.abs(translate) > Math.abs(this.elWidth)) {
            this.scrollerInside.style.transform = "translate(0)";
            this.scrollPos = 0;
            this.scrollerInside.append(this.scrollerInside.firstElementChild);
            this.elWidth = this.getWidth(this.scrollerInside.firstElementChild);
        }

        requestAnimationFrame(e => this.scroll());
    }

    handleGesture() {
        if (this.touchSpeed > 0) this.scrollSpeed = this.options.scrollSpeed + this.touchSpeed;
    }

    bindMouse() {
        this.scroller.addEventListener("mouseenter", () => {
            this.scrollTemp = 0;
            this.scrollSpeed = 0;
        })

        this.scroller.addEventListener("mouseleave", () => {
            this.scrollSpeed = this.options.scrollSpeed;
            this.scrollTemp = this.options.scrollSpeed;
        })
    }

    bindTouch() {
        this.scroller.addEventListener('touchstart', e => {
            this.touchstartX = e.changedTouches[0].screenX
            this.timeStart = e.timeStamp
        })

        this.scroller.addEventListener('touchend', e => {
            this.touchendX = e.changedTouches[0].screenX
            this.timeEnd = e.timeStamp
            this.touchSpeed = Math.abs((this.touchendX - this.touchstartX) / (this.timeEnd - this.timeStart)) * this.options.touchSpeedBoost
            this.handleGesture()
        })
    }
}

