class Tree {
    constructor(center, size, heightCoef = 0.3) {
        this.center = center;
        this.size = size; // size of the base
        this.heightCoef = heightCoef;
        this.base = this.#generateLevel(center, size);
    }

    #generateLevel(point, size) {
        const points = [];
        const radius = size / 2;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
            const kindOfRandom = Math.cos(((angle + this.center.x) * size) % 17) ** 2;
            const noisyRadius = radius * lerp(0.5, 1.0, kindOfRandom);
            points.push(translate(point, angle, noisyRadius));
        }

        return new Polygon(points);
    }

    draw(ctx, viewPoint) {
        const difference = subtract(this.center, viewPoint);
        const top = add(this.center, scale(difference, this.heightCoef));

        const levelCount = 7;
        for (let level = 0; level < levelCount; level++) {
            const t = level / (levelCount - 1);
            const point = lerp2D(this.center, top, t);
            const color = `rgb(30,${lerp(50, 200, t)},70)`;
            const size = lerp(this.size, 40, t);
            const poly = this.#generateLevel(point, size);
            poly.draw(ctx, { fill: color, stroke: "rgba(0,0,0,0)" });
        }
    }
}