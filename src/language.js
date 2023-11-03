function binop(func){
    return (params, env) => {
        env.setVal(
            params.length === 3 ? params[2] : params[0],
            func(env.readVal(params[0]), env.readVal(params[1]))
        );
    };
}

function monop(func){
    return (params, env) => {
        env.setVal(params[1], func(env.readVal(params[0])));
    };
}

function comp(fun){
    return (params, env) => {
        env.setVal(params[2], fun(env.readVal(params[0]), env.readVal(params[1])) ? 0 : 1);
    };
}

function hsla(color){
    return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${color[3]})`;
}
function lerp(a, b, t){
    return a + t * (b - a);
}

export const instructionsDefinitions = {
    registers:{
        "set": (params, env) => env.setVal(params[0], env.readVal(params[1])),
    },
    maths:{
        "+": binop((a, b) => a + b),
        "-": binop((a, b) => a - b),
        "*": binop((a, b) => a * b),
        "/": binop((a, b) => a / b),
        "%": binop((a, b) => a % b),
        "**": binop((a, b) => Math.pow(a, b)),
        "min": binop((a, b) => Math.min(a, b)),
        "max": binop((a, b) => Math.max(a, b)),
        "sqrt": monop(Math.sqrt),
        "sin": monop(Math.sin),
        "cos": monop(Math.cos),
        "tan": monop(Math.tan),
        "asin": monop(Math.asin),
        "acos": monop(Math.acos),
        "atan": monop(Math.atan),
        "exp": monop(Math.exp),
        "log": monop(Math.log),
        "round": monop(Math.round),
        "ceil": monop(Math.ceil),
        "floor": monop(Math.floor),
        "random":(params, env) => {
            const [min, max] = params.slice(0, 2).map(v => env.readVal(v));
            env.setVal(params[3], lerp(min, max, Math.random()));
        },
        "lerp":(params, env) => {
            const [a, b, t] = params.slice(0, 3).map(v => env.readVal(v));
            env.setVal(params[3], lerp(a, b, t));
        },
    },
    bool:{
        "==":comp((a, b) => a == b),
        ">=":comp((a, b) => a >= b),
        "<=":comp((a, b) => a <= b),
        ">":comp((a, b) => a > b),
        "<":comp((a, b) => a < b),
        "!": monop(v => 1 - v),
    },
    color:{
        "fill":(params, env) => {
            env.ctx.fillStyle=hsla(env.readVal(params[0]));
        }
    },
    gfx:{
        "clear":(_, env) => {
            const w = env.readVal("r:width");
            const h = env.readVal("r:height");
            env.ctx.clearRect(0, 0, w, h);
        },
        "rect":(params, env) =>{
            const [x, y, w, h] = params.map(v => env.readVal(v));
            env.ctx.beginPath();
            env.ctx.moveTo(x, y);
            env.ctx.lineTo(x+w, y);
            env.ctx.lineTo(x+w, y+h);
            env.ctx.lineTo(x, y+h);
            env.ctx.lineTo(x, y);
            env.ctx.fill();
        }
    }

};
