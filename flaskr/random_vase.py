import numpy as np
from .settings import settings, default_vase

def random_vase_data():
  rng = np.random.default_rng()
  
  return {
    "generic0" : {
        "height" : int(rng.choice([rng.integers(settings["height"]["min"],settings["height"]["max"]),default_vase["generic0"]["height"]])),
        "width"  : int(rng.choice([int(rng.integers(settings["width"]["min"],settings["width"]["max"])),default_vase["generic0"]["width"]])),
        "thickness" : int(rng.integers(settings["thickness"]["min"],settings["thickness"]["max"])),
     },

     "generic1" : {
        "radial_steps" : int(rng.integers(settings["radial_steps"]["min"],settings["radial_steps"]["max"])),
        "vertical_steps" : int(rng.integers(settings["vertical_steps"]["min"],settings["vertical_steps"]["max"])),
        "slope"  : int(rng.integers(settings["slope"]["min"],settings["slope"]["max"])),
     },

    "radial" : [
        { "mag" : int(rng.choice([rng.integers(settings["radial_mag"]["min"],settings["radial_mag"]["max"]),0,0])),
        "freq"  : int(rng.integers(settings["radial_freq"]["min"],settings["radial_freq"]["max"])),
        "twist" : int(rng.integers(settings["radial_twist"]["min"],settings["radial_twist"]["max"])),
        "phase" : int(rng.integers(settings["radial_phase"]["min"],settings["radial_phase"]["max"])),
        },
        { "mag" : int(rng.choice([rng.integers(settings["radial_mag"]["min"],settings["radial_mag"]["max"]),0,0])),
        "freq"  : int(rng.integers(settings["radial_freq"]["min"],settings["radial_freq"]["max"])),
        "twist" : int(rng.integers(settings["radial_twist"]["min"],settings["radial_twist"]["max"])),
        "phase" : int(rng.integers(settings["radial_phase"]["min"],settings["radial_phase"]["max"])),
        }
        ],

    "vertical" : [
        { "mag" : int(rng.choice([rng.integers(settings["vertical_mag"]["min"],settings["vertical_mag"]["max"]),0,0])),
        "freq"  : int(rng.integers(settings["vertical_freq"]["min"],settings["vertical_freq"]["max"])),
        "phase" : int(rng.integers(settings["vertical_phase"]["min"],settings["vertical_phase"]["max"])),
        },
        { "mag" : int(rng.choice([rng.integers(settings["vertical_mag"]["min"],settings["vertical_mag"]["max"]),0,0])),
        "freq"  : int(rng.integers(settings["vertical_freq"]["min"],settings["vertical_freq"]["max"])),
        "phase" : int(rng.integers(settings["vertical_phase"]["min"],settings["vertical_phase"]["max"])),
        }
        ]
}