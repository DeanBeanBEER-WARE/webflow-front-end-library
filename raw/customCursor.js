class CustomCursor {
    constructor({ 
        cursorClass = 'custom-cursor', 
        hoverArray = [], 
        downArray = [], 
        dragTimer = 50, 
        downTime = 300 
    } = {}) {
        this.config = { cursorClass, hoverArray, downArray, dragTimer, downTime };
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        this.cursor = document.createElement('div');
        this.cursor.classList.add(this.config.cursorClass);
        document.body.appendChild(this.cursor);
        document.body.style.cursor = 'none';

        Object.assign(this, {
            hoverArray: this.config.hoverArray,
            downArray: this.config.downArray,
            dragTimer: this.config.dragTimer,
            downTime: this.config.downTime,
            mouseX: 0,
            mouseY: 0,
            cursorX: 0,
            cursorY: 0,
            isHover: false,
            isDown: false,
            downTimeouts: new Map(),
        });

        this.mouseMoveHandler = this.onMouseMove.bind(this);
        this.mouseOutHandler = this.onMouseOut.bind(this);
        this.mouseOverHandler = this.onMouseOver.bind(this);

        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseout', this.mouseOutHandler);
        document.addEventListener('mouseover', this.mouseOverHandler);

        this.animate();
        this.setupEvents();
        this.setupMobileHandling();
    }

    onMouseMove = ({ clientX, clientY }) => {
        [this.mouseX, this.mouseY] = [clientX, clientY];
    }

    onMouseOut = ({ relatedTarget }) => {
        this.cursor.style.opacity = relatedTarget ? '1' : '0';
    }

    onMouseOver = ({ relatedTarget }) => {
        this.cursor.style.opacity = relatedTarget ? '1' : '0';
    }

    animate = () => {
        const deltaX = this.mouseX - this.cursorX;
        const deltaY = this.mouseY - this.cursorY;
        this.cursorX += deltaX * (this.dragTimer / 100);
        this.cursorY += deltaY * (this.dragTimer / 100);
        this.cursor.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px) translate(-50%, -50%)`;
        requestAnimationFrame(this.animate);
    }

    setupEvents() {
        const addEventListeners = (array, eventType, handler) => {
            array.forEach(({ trigger, hoverstyle }) => {
                document.querySelectorAll(`.${trigger}`).forEach(el => {
                    el.addEventListener(eventType, () => handler(el, hoverstyle));
                });
            });
        };

        addEventListeners(this.hoverArray, 'mouseenter', (el, hoverstyle) => {
            this.isHover = true;
            this.cursor.classList.add(hoverstyle);
        });
        addEventListeners(this.hoverArray, 'mouseleave', (el, hoverstyle) => {
            this.isHover = false;
            this.cursor.classList.remove(hoverstyle);
        });

        this.downArray.forEach(({ trigger, hoverstyle }) => {
            document.querySelectorAll(`.${trigger}`).forEach(el => {
                el.addEventListener('mousedown', () => this.handleMouseDown(el, hoverstyle));
            });
        });
    }

    handleMouseDown(el, hoverstyle) {
        this.isDown = true;
        this.cursor.classList.add(hoverstyle);
        const startTime = Date.now();

        const handleMouseUpOrLeave = () => {
            this.isDown = false;
            const elapsed = Date.now() - startTime;
            const delay = elapsed >= this.downTime ? 0 : this.downTime - elapsed;
            setTimeout(() => !this.isDown && this.cursor.classList.remove(hoverstyle), delay);
            el.removeEventListener('mouseup', handleMouseUpOrLeave);
            el.removeEventListener('mouseleave', handleMouseUpOrLeave);
        };

        el.addEventListener('mouseup', handleMouseUpOrLeave);
        el.addEventListener('mouseleave', handleMouseUpOrLeave);
    }

    setupMobileHandling() {
        if (!this.isTouchDevice()) return;

        const TAP_MAX_DISTANCE = 10;
        const TAP_MAX_DURATION = 500;
        let touchStart = {};

        const cursorSelector = `.${this.config.cursorClass}`;

        const initializeCursorElement = cursor => {
            if (!cursor.dataset.initialized) {
                cursor.style.opacity = '0';
                cursor.dataset.initialized = 'true';
            }
        };

        document.querySelectorAll(cursorSelector).forEach(initializeCursorElement);

        new MutationObserver(mutations => {
            mutations.forEach(({ addedNodes }) => {
                addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        [node, ...node.querySelectorAll(cursorSelector)].forEach(el => {
                            initializeCursorElement(el);
                        });
                    }
                });
            });
        }).observe(document.body, { childList: true, subtree: true });

        const handleTouchStart = ({ touches }) => {
            if (touches.length > 1) return;
            const touch = touches[0];
            touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        };

        const handleTouchEnd = ({ changedTouches }) => {
            if (changedTouches.length > 1) return;
            const touch = changedTouches[0];
            const { x: endX, y: endY, time: endTime } = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
            const { x: startX, y: startY, time: startTime } = touchStart;
            const deltaX = Math.abs(endX - startX);
            const deltaY = Math.abs(endY - startY);
            const deltaTime = endTime - startTime;

            (deltaX <= TAP_MAX_DISTANCE && deltaY <= TAP_MAX_DISTANCE && deltaTime <= TAP_MAX_DURATION) 
                ? this.triggerCursorEffect() 
                : null;
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    triggerCursorEffect() {
        const cursors = document.querySelectorAll(`.${this.config.cursorClass}`);
        cursors.forEach(cursor => cursor.style.opacity = '1');
        setTimeout(() => cursors.forEach(cursor => cursor.style.opacity = '0'), 500);
    }

    destroy() {
        this.cursor.remove();
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('mouseout', this.mouseOutHandler);
        document.removeEventListener('mouseover', this.mouseOverHandler);
    }
}