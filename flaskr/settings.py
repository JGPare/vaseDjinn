
default_vase = {
    "generic0" : {
        "height" : 60,
        "width" : 20,
        "thickness" : 10,
     },

     "generic1" : {
        "radial_steps" : 50,
        "vertical_steps" : 50,
        "slope"  : 50,
     },

    "radial" : [
        { "mag" : 0,
        "freq" : 10,
        "twist" : 0,
        "phase" : 0,
        },
        { "mag" : 0,
        "freq" : 10,
        "twist" : 0,
        "phase" : 0,
        }
        ],

    "vertical" : [
        { "mag" : 0,
        "freq" : 10,
        "phase" : 0,
        },
        { "mag" : 0,
        "freq" :  0,
        "phase" : 0,
        }
        ]
}

settings = {
    "width" : {
        "min" : 5,
        "max" : 65,
        "step" : 1,
        },
    "height" : {
        "min" : 5,
        "max" : 100,
        "step" : 1,
        },
    "thickness" : {
        "min" : 1,
        "max" : 100,
        "step" : 1,
        },
    "slope" : {
        "min" : 0,
        "max" : 100,
        "step" : 1,
        },
    "vertical_steps" : {
        "min" : 3,
        "max" : 150,
        "step" : 1,
        },
    "radial_steps" : {
        "min" : 4,
        "max" : 150,
        "step" : 1,
        },
    "radial_mag" : {
        "min" : 0,
        "max" : 100,
        "step" : 1,
        },
    "radial_freq" : {
        "min" : 0,
        "max" : 30,
        "step" : 1,
        },
    "radial_twist" : {
        "min" : 0,
        "max" : 40,
        "step" : 1,
        },
    "radial_phase" : {
        "min" : 0,
        "max" : 100,
        "step" : 1,
        },
    "vertical_mag" : {
        "min" : 0,
        "max" : 100,
        "step" : 1,
        },
    "vertical_freq" : {
        "min" : 0,
        "max" : 100,
        "step" : 1,
        },
    "vertical_phase" : {
        "min" : 0,
        "max" : 100,
        "step" : 1,
        },
}