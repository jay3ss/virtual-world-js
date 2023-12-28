class World {
    constructor(
        graph,
        roadWidth = 100,
        roadRoundness = 10,
        buildingWidth = 150,
        buildingMinLength = 150,
        spacing = 50,
        treeSize = 160,
    ) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];

        this.generate();
    }

    generate() {
        this.envelopes.length = 0;
        for (const segment of this.graph.segments) {
            this.envelopes.push(
                new Envelope(segment, this.roadWidth, this.roadRoundness)
            );
        }

        this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly));
        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();
    }

    #generateTrees() {
        const points = [
            ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.base.points).flat()
        ];
        const left = Math.min(...points.map((p) => p.x));
        const right = Math.max(...points.map((p) => p.x));
        const top = Math.min(...points.map((p) => p.y));
        const bottom = Math.max(...points.map((p) => p.y));

        const illegalPolys = [
            ...this.buildings.map((b) => b.base),
            ...this.envelopes.map((e) => e.poly)
        ];

        const trees = [];
        let tryCount = 0;
        while (tryCount < 100) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            )

            // check if tree is inside or near building / road
            let keep = true;
            for (const poly of illegalPolys) {
                if (poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize / 2) {
                    keep = false;
                    break;
                }
            }

            // prevent intersecting trees
            if (keep) {
                for (const tree of trees) {
                    if (distance(tree.center, p) < this.treeSize) {
                        keep = false;
                        break;
                    }
                }
            }

            // avoiding trees in middle of nowhere
            if (keep) {
                let closeToSomething = false;
                for (const poly of illegalPolys) {
                    if (poly.distanceToPoint(p) < this.treeSize * 2) {
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething;
            }

            if (keep) {
                trees.push(new Tree(p, this.treeSize));
                tryCount = 0;
            }
            tryCount++;
        }

        return trees;
    }

    #generateBuildings() {
        const tmpEnvelopes = this.graph.segments.map((segment) => new Envelope(
            segment,
            this.roadWidth + this.buildingWidth + this.spacing * 2,
            this.roadRoundness
        ));
        const guides = Polygon.union(tmpEnvelopes.map((e) => e.poly));

        for (let i = 0; i < guides.length; i++) {
            const segment = guides[i];
            if (segment.length() < this.buildingMinLength) {
                guides.splice(i, 1);
                i--; // decrement so that we don't skip next segment
            }
        }

        const supports = [];
        for (let segment of guides) {
            const length = segment.length() + this.spacing;
            const buildingCount = Math.floor(
                length / (this.buildingMinLength + this.spacing)
            );
            const buildingLength = length / buildingCount - this.spacing;

            const direction = segment.directionVector();

            let q1 = segment.p1;
            let q2 = add(q1, scale(direction, buildingLength));
            supports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(direction, this.spacing));
                q2 = add(q1, scale(direction, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases = supports.map((segment) => {
            return new Envelope(segment, this.buildingWidth).poly
        });

        const epsilon = 0.001;
        for (let i = 0; i < bases.length - 1; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if (bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPoly(bases[j]) < this.spacing - epsilon) {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases.map((b) => new Building(b));
    }

    draw(ctx, viewPoint) {
        for (const enevelope of this.envelopes) {
            enevelope.draw(ctx, { fill: "#bbb", stroke: "#bbb", lineWidth: 15 });
        }

        for (const segment of this.graph.segments) {
            segment.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
        }

        for (const segment of this.roadBorders) {
            segment.draw(ctx, { color: "white", width: 4 });
        }

        const items = [...this.buildings, ...this.trees];
        items.sort(
            (a, b) =>
                b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint)
        );
        for (const item of items) {
            item.draw(ctx, viewPoint);
        }
    }
}