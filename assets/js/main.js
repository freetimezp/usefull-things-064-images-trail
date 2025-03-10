
const body = document.body;
let mousePos = { x: 0, y: 0 };
let lastMousePos = { x: 0, y: 0 }; // Add this
let cacheMousePos = { x: 0, y: 0 };

const MathUtils = {
    lerp: (a, b, n) => (1 - n) * a + n * b,
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
};

const getMousePos = (ev) => ({
    x: ev.clientX || ev.pageX || 0,
    y: ev.clientY || ev.pageY || 0
});

window.addEventListener("mousemove", (ev) => {
    mousePos = getMousePos(ev);
});


const getMouseDistance = () => {
    return MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);
};

class Image {
    constructor(el) {
        this.DOM = { el: el };
        this.defaultStyles = {
            scale: 1,
            x: 0,
            y: 0,
            opacity: 0
        };
        this.getRect();
    };

    getRect() {
        this.rect = this.DOM.el.getBoundingClientRect();
    };
    isActive() {
        return gsap.getProperty(this.DOM.el, "opacity") > 0;
    };
}


class ImageTrail {
    constructor() {
        this.DOM = { content: document.querySelector(".content") };
        this.images = [];

        [...this.DOM.content.querySelectorAll("img")].forEach((img) => {
            this.images.push(new Image(img));
        });

        this.imagesTotal = this.images.length;
        this.imgPosition = 0;
        this.zIndexVal = 1;
        this.threshold = 100;

        requestAnimationFrame(() => this.render());
    };

    render() {
        let distance = getMouseDistance();

        cacheMousePos.x = MathUtils.lerp(
            cacheMousePos.x || mousePos.x,
            mousePos.x,
            0.1
        );
        cacheMousePos.y = MathUtils.lerp(
            cacheMousePos.y || mousePos.y,
            mousePos.y,
            0.1
        );

        if (distance > this.threshold) {
            this.showNextImage();

            ++this.zIndexVal;
            this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
            lastMousePos = mousePos;
        }

        let isIdle = true;

        for (let img of this.images) {
            if (img.isActive()) {
                isIdle = false;
                break;
            }
        }

        if (isIdle && this.zIndexVal !== 1) {
            this.zIndexVal = 1;
        }

        requestAnimationFrame(() => this.render());
    }

    showNextImage() {
        const img = this.images[this.imgPosition];
        gsap.killTweensOf(img.DOM.el);

        gsap.set(img.DOM.el, {
            opacity: 1,
            scale: 1,
            zIndex: this.zIndexVal,
            x: cacheMousePos.x - img.rect.width / 2,
            y: cacheMousePos.y - img.rect.height / 2,
        });

        gsap.to(img.DOM.el, {
            duration: 0.9,
            ease: "expo.out",
            x: mousePos.x - img.rect.width / 2,
            y: mousePos.y - img.rect.height / 2
        });

        gsap.to(img.DOM.el, {
            duration: 1,
            ease: "power1.out",
            opacity: 0,
            delay: 0.4
        });

        gsap.to(img.DOM.el, {
            duration: 1,
            ease: "quint.out",
            scale: 0.2,
            delay: 0.4
        });
    }
}

const preloadImages = () => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(".content__img"), resolve);
    });
};

preloadImages().then(() => {
    new ImageTrail();
});





























