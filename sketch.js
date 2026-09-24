let canvasSize =  500;

let numGridElems = 10;

 

let grid = {

    numElems: numGridElems,

    sizeElems: canvasSize/numGridElems, // size of grid elements in pixel

    data: [

        [],

        [],

        [],

        [1,1,1,1,0,0,0,0,0,0],

        [0,0,0,1,0,0,1,1,1,1],

        [0,0,0,1,0,0,1,0,0,0],

        [0,0,0,1,0,0,1,0,0,0],

        [0,0,0,1,1,1,1,0,0,0],

        [],

        []

    ],

}

 

function setup() {

    createCanvas(canvasSize, canvasSize);

}

 

function draw() {

    background(95, 135, 49);

    for (let i=0; i < grid.numElems; i++) {

        line(0,i*grid.sizeElems,width,i*grid.sizeElems)

    }

    for (let i=0; i < grid.numElems; i++) {

        line(i*grid.sizeElems,0,i*grid.sizeElems,canvasSize)

    }

    for(let i=0; i < grid.numElems; i++){

        if (grid.data[i].length > 0) {

            for(let j=0; j<grid.numElems; j++) {

                if (grid.data[i][j] === 1) {

                    fill(176, 136, 93)

                    rect(j*grid.sizeElems,i*grid.sizeElems,grid.sizeElems)

                }

 

            }

        }

    }

}