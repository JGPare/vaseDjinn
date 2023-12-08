import numpy as np
from stl import mesh, Mode, main
import os
import tempfile
import time

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
        "max" : 500,
        "step" : 5,
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
        "max" : 500,
        "step" : 5,
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

def r_value(
    height,
    width,
    height_grid,
    radial_grid,
    slope,
    radial_modifiers,
    vertical_modifiers):
    
    # normalize height as percent
    h = height_grid/height

    # max slope of 45 degrees
    max_slope = np.pi/4
    slope = max_slope*(slope/100 - 0.5)

    radius = width + np.sin(slope)*height_grid

    for modifier in radial_modifiers:
        radius += modifier["mag"]/100*np.sin(modifier["freq"]*radial_grid + modifier["twist"]*h + 2*np.pi*modifier["phase"]/100) 

    for modifier in vertical_modifiers:
        radius += modifier["mag"]/100*np.sin(modifier["freq"]*h + 2*np.pi*modifier["phase"]/100) 

    return radius

def gen(vase_data):
    generic = vase_data["generic0"] | vase_data["generic1"]
    radial_props = vase_data["radial"]
    vertical_props = vase_data["vertical"]
    
    height = generic["height"]
    width = generic["width"]
    thickness = generic["thickness"]
    vertical_steps = generic["vertical_steps"]
    radial_steps = generic["radial_steps"]
    slope = generic["slope"]

    rel_thickness = thickness/settings["thickness"]["max"]
    wall_thickness = rel_thickness*width
    btm_steps = max(int(rel_thickness*vertical_steps)-1,0)

    is_solid = False
    if generic["thickness"] == settings["thickness"]["max"]:
        is_solid = True

    vertical_vec = np.linspace(0,height,vertical_steps)
    vertical_vec.shape = (vertical_steps,1)
    radial_vec = np.linspace(0,2*np.pi,radial_steps)

    # generate grids of vertical height vec and radial vec
    height_grid = np.ones((vertical_steps,radial_steps))*vertical_vec
    radial_grid = np.ones((vertical_steps,radial_steps))*radial_vec

    r_outer = r_value(
        height,
        width,
        height_grid,
        radial_grid,
        slope,
        radial_props,
        vertical_props)
    r_inner = r_outer-wall_thickness

### OUTER FACES
    x_outer,y_outer = np.cos(radial_vec)*r_outer,np.sin(radial_vec)*r_outer 
    z_outer = vertical_vec*np.ones(radial_steps)

    outer_points = np.dstack((x_outer,y_outer,z_outer))

    # slice mech vector cordinates from points [h,radial_vec]
    x1_outer = outer_points[:-1,:-1]
    x2_outer = outer_points[:-1,1:]
    y1_outer = outer_points[1:,:-1]
    y2_outer = outer_points[1:,1:]
    
    # flatten to N x 3 array (list of points)
    d1,d2,d3 = x1_outer.shape
    x1_outer = x1_outer.reshape((d1*d2,d3))
    x2_outer = x2_outer.reshape((d1*d2,d3))
    y1_outer = y1_outer.reshape((d1*d2,d3))
    y2_outer = y2_outer.reshape((d1*d2,d3))

    # point ordering must be couterclockwise about normal
    s1_outer = np.asarray([x1_outer,x2_outer,y2_outer])
    s2_outer = np.asarray([x1_outer,y2_outer,y1_outer])

    s = np.append(s1_outer,s2_outer,1)

### INNER FACES
    x_inner,y_inner = np.cos(radial_vec)*r_inner,np.sin(radial_vec)*r_inner 
    z_inner = vertical_vec*np.ones(radial_steps)

    inner_points = np.dstack((x_inner,y_inner,z_inner))

    # slice mech vector cordinates from points [h,radial_vec]
    x1_inner = inner_points[btm_steps:-1,:-1]
    x2_inner = inner_points[btm_steps:-1,1:]
    y1_inner = inner_points[btm_steps+1:,:-1]
    y2_inner = inner_points[btm_steps+1:,1:]
    
    # flatten to N x 3 array (list of points)
    d1,d2,d3 = x1_inner.shape
    x1_inner = x1_inner.reshape((d1*d2,d3))
    x2_inner = x2_inner.reshape((d1*d2,d3))
    y1_inner = y1_inner.reshape((d1*d2,d3))
    y2_inner = y2_inner.reshape((d1*d2,d3))

    # point ordering must be cinnerclockwise about normal
    s1_inner = np.asarray([x1_inner,y2_inner,x2_inner])
    s2_inner = np.asarray([x1_inner,y1_inner,y2_inner])

    s = np.append(s,s1_inner,1)
    s = np.append(s,s2_inner,1)


### BOTTOM FACES
    btm_outer_x1 = outer_points[0][:-1]
    btm_outer_x2 = outer_points[0][1:]
    btm_outer_origin = np.zeros((btm_outer_x1.shape))
    
    s3 = np.asarray([btm_outer_x1,btm_outer_origin,btm_outer_x2])
    s = np.append(s,s3,1)

    if not is_solid:
        btm_inner_x1 = inner_points[btm_steps][:-1]
        btm_inner_x2 = inner_points[btm_steps][1:]
        btm_inner_origin = np.ones((btm_inner_x1.shape))
        btm_inner_origin[:,:2] *= 0 # set X,Y to 0
        btm_inner_origin[:,2] *=  vertical_vec[btm_steps]  # set Z = H

        s4 = np.asarray([btm_inner_x1,btm_inner_x2,btm_inner_origin])
        s = np.append(s,s4,1)

### TOP FACES
    top_x1 = outer_points[-1][:-1]
    top_x2 = outer_points[-1][1:]

    if not is_solid:

        top_y1 = inner_points[-1][:-1]
        top_y2 = inner_points[-1][1:]

        s5 = np.asarray([top_x1,top_x2,top_y2])
        s6 = np.asarray([top_x1,top_y2,top_y1])
        s = np.append(s,s5,1)
        s = np.append(s,s6,1)

    else:
        top_origin = np.ones((top_x1.shape)) # set X, Y, Z to 1
        top_origin[:,:2] *= 0 # set X,Y to 0
        top_origin[:,2] *=  height  # set Z = H
        s5 = np.asarray([top_x1,top_x2,top_origin,])
        s = np.append(s,s5,1)

### axes swap to match mesh vector convention
    s_ = np.swapaxes(s,0,1)

    surf1 = mesh.Mesh(np.zeros(s_.shape[0], dtype=mesh.Mesh.dtype))
    surf1.vectors = s_

    path = f"/static/stl/v{int(time.time()*1000)}.stl"
    display_filename = "flaskr" + path
    surf1.save(display_filename)

    return path

    # surf1.save(display_filename,mode=Mode.ASCII)
    # file = open(display_filename,"r")
    # return file.readlines()


##### loop based surface vectorization 

# vecs = (vertical_steps-1)*(radial_steps-1)
    # surf = mesh.Mesh(np.zeros(vecs*2, dtype=mesh.Mesh.dtype))
    # k = 0 

    # for i in range(vertical_steps-1):
    #     for j in range(radial_steps-1):
    #         surf.vectors[k] = np.asarray(\
    #             [outer_points[i,j],outer_points[i,j+1],outer_points[i+1,j+1]]
    #             )

    #         surf.vectors[k+1] = np.asarray(\
    #             [outer_points[i,j],outer_points[i+1,j+1],outer_points[i+1,j]])
    #         k += 2

    # print("Surf vecs",surf.vectors[-1])
    # print("Surf1 vecs",surf1.vectors[-1])

    # print("Surf vecs shape",surf.vectors.shape)
    # print("Surf1 vecs shape",surf1.vectors.shape)


### unused, for path length distortions
def cumulative_path(r,radial_vec):
    path = np.abs(np.diff(r)*np.diff(radial_vec))
    net_path = np.sum(path)
    normalized_path = path/net_path
    cumulative_path = np.cumsum(normalized_path)
    cumulative_path = np.insert(cumulative_path,0,0)
    return cumulative_path

def path_delta(cumulative_path,mag,freq,phase):
    return mag*np.cos(freq*cumulative_path*2*np.pi + phase)

def radial_vec_offset(r_outer,radial_vec):
    radial_vec_offset = np.zeros(r_outer.shape)
    for i,r in enumerate(r_outer):
        cp = cumulative_path(r,radial_vec)
        mag = .1
        freq = 16
        phase = np.pi/4
        radial_vec_delta = path_delta(cp,mag,freq,phase)
        radial_vec_offset[i] = radial_vec + radial_vec_delta

#######################################