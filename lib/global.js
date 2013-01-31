var global = module.exports = Object.create(null);

global.abs   = new Native(Math.abs);
global.acos  = new Native(Math.acos);
global.asin  = new Native(Math.asin);
global.atan  = new Native(Math.atan);
global.ceil  = new Native(Math.ceil);
global.cos   = new Native(Math.cos);
global.exp   = new Native(Math.exp);
global.floor = new Native(Math.floor);
global.log   = new Native(Math.log);
global.max   = new Native(Math.max);
global.min   = new Native(Math.min);
global.pow   = new Native(Math.pow);
global.round = new Native(Math.round);
global.sin   = new Native(Math.sin);
global.sqrt  = new Native(Math.sqrt);
global.tan   = new Native(Math.tan);

global.max.rest = { type: "number" };
global.min.rest = { type: "number" };

global.sizeof = {
    result: { type: "number" },
    type: "function",
    funct: sizeof,
    params: [{
        type: "array",
        dimensions: []
    }]
};

function Native(funct) {
    this.funct = funct;
    this.type = "function";
    var length = funct.length;
    var params = this.params = [];
    this.result = { type: "number" };
    while (length--) params.push({ type: "number" });
}

function sizeof(array) {
    return array.length;
}
