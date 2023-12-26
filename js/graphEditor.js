class GraphEditor {
    constructor(canvas, graph) {
        this.canvas = canvas;
        this.graph = graph

        this.ctx = canvas.getContext("2d");

        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mouse = null;

        this.#addEventListeners();
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
        this.canvas.addEventListener("mouseup", () => this.dragging = false);
    }

    #handleMouseMove(event) {
        this.mouse = new Point(event.offsetX, event.offsetY);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10);
        if (this.dragging) {
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }

    #handleMouseDown(event) {
        if (event.button === 2) { // right click
            if (this.hovered) {
                if (this.selected) {
                    this.selected = null;
                } else if (this.hovered) {
                    this.#removePoint(this.hovered);
                }
            } else {
                this.selected = null;
            }
        }

        if (event.button === 0) { // left click
            if (this.hovered) {
                this.#select(this.hovered);
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mouse);
            this.#select(this.mouse);
            this.hovered = this.mouse;
        }
    }

    #select(point) {
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    #removePoint(point) {
        this.graph.removePoint(point);
        this.hovered = null;
        if (this.selected == point) {
            this.selected = null;
        }
    }

    display() {
        this.graph.draw(this.ctx);
        if (this.hovered) {
            this.hovered.draw(this.ctx, { fill: true });
        }

        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(this.ctx, { dash: [3, 3] });
            this.selected.draw(this.ctx, { outline: true });
        }
    }
}