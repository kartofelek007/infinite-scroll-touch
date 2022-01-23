function Scroller(selector, options) {
    this.scroller = document.querySelector(selector);
    this.options = Object.assign({}, {
        scrollSpeed : 2,
        scrollBreaker : 0.6
    }, options);

    this.scrollSpeed = this.options.scrollSpeed
    this.scrollerInside = this.scroller.firstElementChild;

    const el = this.scrollerInside.firstElementChild;
    this.elWidth = this.getWidth(el);

    window.addEventListener("resize", function() {
        this.elWidth = this.getWidth(el)
    }.bind(this))

    this.scrollerInside.style.transform = "translate(0)";

    this.touchstartX = 0
    this.touchendX = 0
    this.timeStart = 0
    this.timeEnd = 0
    this.touchSpeed = 0

    this.bindTouch();
    this.scroll();
}

Scroller.prototype.getWidth = function(element) {
    let style = element.currentStyle || window.getComputedStyle(element),
    width = element.offsetWidth, // or use style.width
    margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
    padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
    border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const result = width + margin - padding;
    if (style.boxSizing === "content-box") result += border;
    return result;
}

Scroller.prototype.getTranslateX = function(element) {
    const style = window.getComputedStyle(element);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
}

Scroller.prototype.scroll = function() {
    this.touchSpeed -= this.options.scrollBreaker;
    this.touchSpeed = Math.max(0, this.touchSpeed);

    this.scrollSpeed = this.options.scrollSpeed + this.touchSpeed;

    const translate = this.getTranslateX(this.scrollerInside) - this.scrollSpeed;
    this.scrollerInside.style.transform = "translateX(" + translate + "px)";

    if (Math.abs(translate) > Math.abs(this.elWidth)) {
        this.scrollerInside.style.transform = "translate(0)";
        this.scrollerInside.append(this.scrollerInside.firstElementChild);
    }

    requestAnimationFrame(e => this.scroll());
}

Scroller.prototype.handleGesture = function() {
    if (this.touchSpeed > 0) this.scrollSpeed = this.options.scrollSpeed + this.touchSpeed;
}

Scroller.prototype.bindTouch = function() {
    this.scroller.addEventListener('touchstart', function(e) {
        this.touchstartX = e.changedTouches[0].screenX
        this.timeStart = e.timeStamp
    }.bind(this))

    this.scroller.addEventListener('touchend', function(e) {
        this.touchendX = e.changedTouches[0].screenX
        this.timeEnd = e.timeStamp
        this.touchSpeed = Math.abs((this.touchendX - this.touchstartX) / (this.timeEnd - this.timeStart)) * 6
        this.handleGesture()
    }.bind(this))
}

const scrollerA = new Scroller("#a", {scrollSpeed: 4});
const scrollerB = new Scroller("#b", {scrollBreaker : 0.3});