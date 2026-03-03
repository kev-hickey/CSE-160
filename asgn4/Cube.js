class Cube {
    constructor() {
        this.type='cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.verts = [
            // front
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,

            // top
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,

            // bottom
            0,0,0, 1,0,1, 0,0,1,
            0,0,0, 1,0,0, 1,0,1,

            // left
            1,0,0, 1,1,1, 1,1,0,
            1,0,0, 1,0,1, 1,1,1,

            // right
            0,0,0, 0,1,1, 0,1,0,
            0,0,0, 0,0,1, 0,1,1,
            
            // back 
            0,0,1, 1,1,1, 0,1,1,
            0,0,1, 1,0,1, 1,1,1
        ];
        this.uvVerts  = [
            // front
            0,0, 1,1, 1,0,   0,0, 0,1, 1,1,
            // top
            0,0, 0,1, 1,1,   0,0, 1,1, 1,0,
            // bottom
            0,0, 1,1, 0,1,   0,0, 1,0, 1,1,
            // left
            0,0, 1,1, 1,0,   0,0, 0,1, 1,1,
            // right
            0,0, 1,1, 1,0,   0,0, 0,1, 1,1,
            // back
            0,0, 1,1, 0,1,   0,0, 1,0, 1,1
        ];
        this.normals = [
            // front
            0,0,-1,  0,0,-1,  0,0,-1,
            0,0,-1,  0,0,-1,  0,0,-1,

            // top
            0,1,0,  0,1,0,  0,1,0,
            0,1,0,  0,1,0,  0,1,0,

            // bottom
            0,-1,0,  0,-1,0,  0,-1,0,
            0,-1,0,  0,-1,0,  0,-1,0,

            // left
            1,0,0,  1,0,0,  1,0,0,
            1,0,0,  1,0,0,  1,0,0,

            // right
            -1,0,0,  -1,0,0,  -1,0,0,
            -1,0,0,  -1,0,0,  -1,0,0,

            // back
            0,0,1,  0,0,1,  0,0,1,
            0,0,1,  0,0,1,  0,0,1
        ];
    }

    render(){
        var rgba = this.color;                                           // set rgba to the ith point's color field
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of point to u_FragColor
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  
        // Pass the matrix to u_ModelMatrix attribute 
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // front
        drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);

        // top
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1]);

        // bottom
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0,0, 0,1, 1,1]);

        // left
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV([1,0,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1,0,0,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);

        // right
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV([0,0,0,  0,1,1,  0,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,  0,0,1,  0,1,1], [0,0, 0,1, 1,1]);

        // back
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3DUV([0,0,1,  1,1,1,  0,1,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);
    }

    renderfast(){
        var rgba = this.color;
        
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
        
        drawTriangle3DUVNormal(this.verts, this.uvVerts, this.normals);
    }
}