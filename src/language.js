import {untrack} from "solid-js";
function binop(func){
    return {
        params:[0, 1, 2],
        effect:(params, env) => {
            env.setVal(
                params.length === 3 ? params[2] : params[0],
                func(env.readVal(params[0]), env.readVal(params[1]))
            );
        }
    };
}

function monop(func){
    return {
        params:[0, 1],
        effect: (params, env) => {
            env.setVal(params[1], func(env.readVal(params[0])));
        }
    };
}

function comp(fun){
    return {
        params:[0, 1, 2],
        effect:(params, env) => {
            env.setVal(params[2], fun(env.readVal(params[0]), env.readVal(params[1])) ? 1 : 0);
        }
    };
}

function hsla(color){
    return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${color[3]})`;
}
function lerp(a, b, t){
    return a + t * (b - a);
}

function map(a, b, c, d, t){
    return lerp(c, d, (t - a) / (b - a));
}

export const instructionsDefinitions = {
    registers:{
        "set": {
            params:[0, 1],
            effect:(params, env) => env.setVal(params[0], env.readVal(params[1]))
        },
        "print":{
            params:[0],
            effect:(params, env) => {
                untrack(() =>{
                    env.setStdOut([...env.stdOut(), `${env.instructionId}: ${params[0]}, ${env.readVal(params[0])}`]);
                });
            }
        }
    },
    ctrl:{
        "if":{params:[0], effect:() => {}},
        "endif":{params:[], effect:() => {}},
        "else":{params:[], effect:() => {}},
        "for":{params:[0, 1, 2], effect:() => {}},
        "endfor":{params:[], effect:() => {}},
        "break":{params:[], effect:() => {}},
        "continue":{params:[], effect:() => {}},
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
        "random":{
            params:[0, 1, 2],
            effect:(params, env) => {
                const [min, max] = params.slice(0, 2).map(env.readVal, env);
                env.setVal(params[2], lerp(min, max, Math.random()));
            }
        },
        "lerp":{
            params:[0, 1, 2, 3],
            effect:(params, env) => {
                const [a, b, t] = params.slice(0, 3).map(env.readVal, env);
                env.setVal(params[3], lerp(a, b, t));
            }
        },
        "map":{
            params:[0, 1, 2, 3, 4, 5],
            effect:(params, env) => {
                const [a, b, c, d, t] = params.slice(0, 3).map(env.readVal, env);
                env.setVal(params[4], map(a, b, c, d, t));
            }
        },
    },
    bool:{
        "==":comp((a, b) => a == b),
        ">=":comp((a, b) => a >= b),
        "<=":comp((a, b) => a <= b),
        ">":comp((a, b) => a > b),
        "<":comp((a, b) => a < b),
        "&&":binop((a, b) => (a * b) ? 1 : 0),
        "||":binop((a, b) => (a + b) ? 1 : 0),
        "!": monop(v => 1 - v),
    },
    gfx:{
        "clear":{
            params:[],
            effect: (_, env) => {
                const w = env.readVal("r:width");
                const h = env.readVal("r:height");
                env.ctx.save();
                env.ctx.fillStyle="white";
                env.ctx.fillRect(0, 0, w, h);
                env.ctx.restore();
            }
        },
        "beginPath":{
            params:[],
            effect:(_, env) => {
                env.ctx.beginPath();
            }
        },
        "moveTo":{
            params:[0, 1],
            effect:(params, env) => {
                env.ctx.moveTo(
                    env.readVal(params[0]),
                    env.readVal(params[1])
                );
            }
        },
        "lineTo":{
            params:[0, 1],
            effect:(params, env) => {
                env.ctx.lineTo(
                    env.readVal(params[0]),
                    env.readVal(params[1])
                );
            }
        },
        "curve2":{
            params:[0, 1, 2, 3],
            effect:(params, env) => {
                const [cx, cy, x, y] = params.map(env.readVal, env);
                env.ctx.curveTo(cx, cy, x, y);
            }
        },
        "curve3":{
            params:[0, 1, 2, 3 , 4, 5],
            effect:(params, env) => {
                const [c1x, c1y, c2x, c2y, x, y] = params.map(env.readVal, env);
                env.ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
            }
        },
        "rect":{
            params:[0, 1, 2, 3],
            effect:(params, env) =>{
                const [x, y, w, h] = params.map(env.readVal, env);
                env.ctx.moveTo(x, y);
                env.ctx.lineTo(x+w, y);
                env.ctx.lineTo(x+w, y+h);
                env.ctx.lineTo(x, y+h);
                env.ctx.lineTo(x, y);
            }
        },
        "circle":{
            params:[0, 1, 2],
            effect:(params, env) =>{
                const [x, y, r] = params.map(env.readVal, env);
                env.ctx.moveTo(x +r, y);
                env.ctx.arc(x, y, r, 0, 2 * Math.PI);
            }
        },
        "square":{
            params:[0, 1, 2],
            effect:(params, env) =>{
                const [x, y, c] = params.map(env.readVal, env);
                const hc = c / 2;
                env.ctx.moveTo(x - hc, y - hc);
                env.ctx.lineTo(x + hc, y - hc);
                env.ctx.lineTo(x + hc, y + hc);
                env.ctx.lineTo(x - hc, y + hc);
                env.ctx.lineTo(x - hc, y - hc);
            }
        },
        "arc":{
            params:[0, 1, 2, 3, 4, 5],
            effect:(params, env) =>{
                const [x, y, r, a1, a2, d] = params.map(env.readVal, env);
                env.ctx.moveTo(x +r, y);
                env.ctx.arc(x+r, y, r, a1, a2, d);
            }
        },
        "fillStyle":{
            params:[0],
            effect:(params, env) => {
                env.ctx.fillStyle=hsla(env.readVal(params[0]));
            }
        },
        "strokeStyle":{
            params:[0],
            effect:(params, env) => {
                env.ctx.strokeStyle=hsla(env.readVal(params[0]));
            }
        },
        "fill":{
            params:[],
            effect:(_, env) => {
                env.ctx.fill();
            }
        },
        "stroke":{
            params:[],
            effect:(_, env) => {
                env.ctx.stroke();
            }
        },
    }

};
