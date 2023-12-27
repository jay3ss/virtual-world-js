function getNearestPoint(location, points, threshold = Number.MAX_SAFE_INTEGER) {
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;
    for (const point of points) {
        const dist = distance(point, location);
        if (dist < minDist && dist < threshold) {
            minDist = dist;
            nearest = point;
        }
    }

    return nearest;
}


function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}


function average(p1, p2) {
    return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}


function add(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
}


function subtract(p1, p2) {
    return new Point(p1.x - p2.x, p1.y - p2.y);
}


function scale(point, scaler) {
    return new Point(point.x * scaler, point.y * scaler);
}


function translate(location, angle, offset) {
    return new Point(
        location.x + Math.cos(angle) * offset,
        location.y + Math.sin(angle) * offset
    );
}


function angle(point) {
    return Math.atan2(point.y, point.x);
}


function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom !== 0) {
        const t = tTop / bottom;
        const u = uTop / bottom;
        if (t >= 0 && t <= 1 && u >=0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            }
        }
    }

    return null;
}


function lerp(a, b, t) {
    return a + (b - a) * t;
}


function getRandomColor() {
    const hue = 290 + Math.random() * 260;
    return `hsl(${hue}, 100%, 60%)`;
}