class Camera {
    constructor() {
        this.eye = new Vector3([16,3,16]);
        this.at = new Vector3([16,3,-15]);
        this.up = new Vector3([0,1,0]);
        this.speed = 0.1;
    }

    forward() {
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        let len = Math.hypot(...f);
        if (len > 0) f = f.map(x => x / len * this.speed);

        for (let i = 0; i < 3; i++) {
            this.eye.elements[i] += f[i];
            this.at.elements[i]  += f[i];
        }
    }

    backward() {
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        let len = Math.hypot(...f);
        if (len > 0) f = f.map(x => x / len * this.speed);

        for (let i = 0; i < 3; i++) {
            this.eye.elements[i] -= f[i];
            this.at.elements[i]  -= f[i];
        }
    }

    left() {
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        let len = Math.hypot(...f);
        if (len > 0) f = f.map(x => x / len);

        let s = [
            this.up.elements[1] * f[2] - this.up.elements[2] * f[1],
            this.up.elements[2] * f[0] - this.up.elements[0] * f[2],
            this.up.elements[0] * f[1] - this.up.elements[1] * f[0]
        ];
        let slen = Math.hypot(...s);
        if (slen > 0) s = s.map(x => x / slen * this.speed);

        for (let i = 0; i < 3; i++) {
            this.eye.elements[i] += s[i];
            this.at.elements[i]  += s[i];
        }
    }

    right() {
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        let len = Math.hypot(...f);
        if (len > 0) f = f.map(x => x / len);

        let s = [
            this.up.elements[1] * f[2] - this.up.elements[2] * f[1],
            this.up.elements[2] * f[0] - this.up.elements[0] * f[2],
            this.up.elements[0] * f[1] - this.up.elements[1] * f[0]
        ];
        let slen = Math.hypot(...s);
        if (slen > 0) s = s.map(x => x / slen * this.speed);

        for (let i = 0; i < 3; i++) {
            this.eye.elements[i] -= s[i];
            this.at.elements[i]  -= s[i];
        }
    }

    panLeft(degrees = 5) {
        this._pan(degrees);
    }

    panRight(degrees = 5) {
        this._pan(-degrees);
    }

    _pan(degrees) {
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];

        let rot = new Matrix4().setRotate(degrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_vec = new Vector3(f);
        let f_rot = rot.multiplyVector3(f_vec);

        for (let i = 0; i < 3; i++) {
            this.at.elements[i] = this.eye.elements[i] + f_rot.elements[i];
        }
    }

    upward() {
        this.eye.elements[1] += this.speed;
        this.at.elements[1]  += this.speed;
    }

    downward() {
        this.eye.elements[1] -= this.speed;
        this.at.elements[1]  -= this.speed;
    }

    tilt(degrees) {
    let f = [
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
    ];

    let right = [
        this.up.elements[1] * f[2] - this.up.elements[2] * f[1],
        this.up.elements[2] * f[0] - this.up.elements[0] * f[2],
        this.up.elements[0] * f[1] - this.up.elements[1] * f[0]
    ];

    let len = Math.hypot(...right);
    if (len > 0) right = right.map(x => x / len);

    let rot = new Matrix4().setRotate(-degrees, right[0], right[1], right[2]);
    let f_vec = new Vector3(f);
    let f_rot = rot.multiplyVector3(f_vec);

    for (let i = 0; i < 3; i++) {
        this.at.elements[i] = this.eye.elements[i] + f_rot.elements[i];
    }
}

}