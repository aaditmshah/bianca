var global = module.exports = Object.create(null);
var number = { type: "number" };

global.abs   = new Native(Math.abs);
global.acos  = new Native(Math.acos);
global.asin  = new Native(Math.asin);
global.atan  = new Native(Math.atan);
global.atan2 = new Native(Math.atan2);
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

global.max.rest = number;
global.min.rest = number;

global.sizeof = {
    type: "function",
    result: number,
    params: [{
        type: "array",
        dimensions: []
    }]
};

function Native(funct) {
    this.type = "function";
    this.result = number;
    var length = funct.length;
    var params = this.params = [];
    while (length--) params.push(number);
}
