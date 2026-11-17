"""
Builds the Fourfold event box in Blender and exports it as a GLB for the website.

Run (from the project root):
    blender --background --python blender/build_event_cube.py

Output: public/models/event-cube.glb
The site detects this file automatically and uses it instead of the built-in
procedural model. After glTF export (Y-up) the faces are:
    +Z concert   +X DJ party   -Z church   -X community
Blender is Z-up, so in Blender: concert = -Y, party = +X, church = +Y, community = -X.

Coordinates in the helpers below use "site" axes: x = right, y = up, z = outward from the face
(the same numbers as components/three/dioramas.tsx). Written for Blender 4.x.
"""
import math
import os

import bpy

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "models", "event-cube.glb"))

bpy.ops.wm.read_factory_settings(use_empty=True)
_mats = {}


def mat(color, emit=0.0):
    key = (color, emit)
    if key not in _mats:
        m = bpy.data.materials.new("m_%s_%s" % (color[1:], emit))
        m.use_nodes = True
        b = m.node_tree.nodes["Principled BSDF"]
        rgb = tuple(int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
        b.inputs["Base Color"].default_value = (*rgb, 1)
        b.inputs["Roughness"].default_value = 0.6
        if emit > 0:
            b.inputs["Emission Color"].default_value = (*rgb, 1)
            b.inputs["Emission Strength"].default_value = emit
        _mats[key] = m
    return _mats[key]


def L(x, y, z):
    """site (x right, y up, z outward) -> Blender local (outward = -Y, up = +Z)."""
    return (x, -z, y)


def _done(o, color, emit, parent, rot=(0, 0, 0)):
    o.rotation_euler = rot
    o.data.materials.append(mat(color, emit))
    o.parent = parent
    return o


def box(parent, size, pos, color, emit=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=L(*pos))
    o = bpy.context.active_object
    o.scale = (size[0], size[2], size[1])
    return _done(o, color, emit, parent, rot)


def cyl(parent, r, h, pos, color, emit=0.0):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=16, location=L(*pos))
    return _done(bpy.context.active_object, color, emit, parent)


def cone(parent, r, h, pos, color, emit=0.0, verts=4):
    bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=0, depth=h, vertices=verts, location=L(*pos))
    return _done(bpy.context.active_object, color, emit, parent, (0, 0, math.pi / 4))


def ball(parent, r, pos, color, emit=0.0):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=L(*pos))
    return _done(bpy.context.active_object, color, emit, parent)


def person(parent, x, y, z, color):
    cyl(parent, 0.04, 0.14, (x, y + 0.07, z), color)
    ball(parent, 0.04, (x, y + 0.18, z), "#e8c9a8")


def face(name, yaw_deg):
    bpy.ops.object.empty_add(location=(0, 0, 0))
    e = bpy.context.active_object
    e.name = name
    e.rotation_euler = (0, 0, math.radians(yaw_deg))
    box(e, (2.1, 0.1, 1.0), (0, -1, 1.45), "#2b2740")  # ledge
    return e


def concert():
    f = face("Face_Concert", 0)
    box(f, (1.7, 0.12, 0.6), (0, -0.89, 1.35), "#1d1a33")
    box(f, (1.7, 1.0, 0.05), (0, -0.33, 1.08), "#120f26")
    box(f, (1.5, 0.8, 0.02), (0, -0.33, 1.115), "#7c5cff", 3.0)
    box(f, (1.9, 0.05, 0.05), (0, 0.35, 1.55), "#8a869e")
    for x in (-0.92, 0.92):
        box(f, (0.05, 1.3, 0.05), (x, -0.3, 1.55), "#8a869e")
        box(f, (0.26, 0.5, 0.26), (x * 1.07, -0.7, 1.5), "#15131f")
        box(f, (0.22, 0.32, 0.22), (x * 1.07, -0.29, 1.5), "#15131f")
    for x, c in zip((-0.6, -0.2, 0.2, 0.6), ("#ff5d73", "#9d8cff", "#ffd166", "#4cc9f0")):
        box(f, (0.08, 0.06, 0.08), (x, 0.32, 1.55), "#222222")
        cone(f, 0.2, 0.75, (x, -0.055, 1.55), c, 4.0, 16)
    person(f, 0, -0.83, 1.3, "#ff5d73")
    shirts = ["#e76f51", "#2a9d8f", "#e9c46a", "#8ab17d", "#f4a261", "#6d6875", "#c77dff"]
    for r in range(3):
        for k in range(7):
            person(f, -0.7 + k * 0.23 + (r % 2) * 0.1, -0.95, 1.68 + r * 0.14, shirts[(r * 3 + k) % 7])


def party():
    f = face("Face_Party", 90)
    box(f, (0.9, 0.32, 0.34), (0, -0.79, 1.22), "#1b0f26")
    box(f, (0.9, 0.02, 0.34), (0, -0.62, 1.22), "#ff4fa3", 3.0)
    for x in (-0.22, 0.22):
        cyl(f, 0.11, 0.02, (x, -0.6, 1.22), "#222222")
    person(f, 0, -0.62, 1.05, "#c77dff")
    for x in (-0.85, 0.85):
        box(f, (0.3, 0.7, 0.3), (x, -0.6, 1.3), "#15101c")
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.22, subdivisions=2, location=L(0, 0.5, 1.5))
    _done(bpy.context.active_object, "#dfe6ff", 0.0, f)
    cyl(f, 0.01, 0.7, (0, 0.95, 1.5), "#aaaaaa")
    cols = ["#ff4fa3", "#4cc9f0", "#ffd166", "#9d8cff"]
    for i in range(12):
        c, r = i % 4, i // 4
        box(f, (0.36, 0.02, 0.26), (-0.6 + c * 0.4, -0.945, 1.55 + r * 0.28), cols[(c + r) % 4], 2.0)
    for k in range(9):
        x = -0.95 + k * 0.2375
        ball(f, 0.03, (x, 0.8 - 0.18 * (1 - (x / 0.95) ** 2), 1.88), "#ffd166", 5.0)


def church():
    f = face("Face_Church", 180)
    cx = -0.2
    box(f, (0.9, 0.75, 0.6), (cx, -0.575, 1.4), "#d8cdb8")
    box(f, (0.67, 0.04, 0.66), (cx - 0.225, 0.05, 1.4), "#8a4b3a", rot=(0, -0.84, 0))
    box(f, (0.67, 0.04, 0.66), (cx + 0.225, 0.05, 1.4), "#8a4b3a", rot=(0, 0.84, 0))
    box(f, (0.28, 1.1, 0.28), (0.5, -0.4, 1.45), "#cfc3ac")
    cone(f, 0.22, 0.45, (0.5, 0.375, 1.45), "#6b4033")
    box(f, (0.03, 0.22, 0.03), (0.5, 0.71, 1.45), "#f2c46d", 3.0)
    box(f, (0.12, 0.03, 0.03), (0.5, 0.76, 1.45), "#f2c46d", 3.0)
    box(f, (0.26, 0.26, 0.02), (cx, -0.4, 1.702), "#f2c46d", 3.0)  # stained glass
    box(f, (0.14, 0.14, 0.02), (cx, -0.4, 1.708), "#ff6b6b", 3.0)
    box(f, (0.2, 0.32, 0.02), (cx, -0.79, 1.705), "#5b3a29")
    for x in (-0.85, -0.7, 0.2, 0.35):
        cyl(f, 0.02, 0.12, (x, -0.89, 1.85), "#f5efe0")
        ball(f, 0.025, (x, -0.8, 1.85), "#ffb347", 6.0)
    person(f, 0.7, -0.95, 1.8, "#6d6875")
    person(f, 0.82, -0.95, 1.72, "#8d99ae")


def community():
    f = face("Face_Community", 270)
    for x in (-0.7, -0.2):
        for z in (1.3, 1.7):
            cyl(f, 0.015, 0.5, (x, -0.7, z), "#d9d4c7")
    cone(f, 0.42, 0.3, (-0.45, -0.3, 1.5), "#f6e7c1")
    cone(f, 0.2, 0.12, (-0.45, -0.09, 1.5), "#ff7a59")
    box(f, (0.45, 0.03, 0.18), (-0.45, -0.78, 1.5), "#7a5c3e")
    box(f, (0.5, 0.03, 0.2), (0.4, -0.8, 1.55), "#7a5c3e")
    box(f, (0.5, 0.03, 0.1), (0.4, -0.88, 1.74), "#5a432d")
    for x, z, c in ((0.25, 1.85, "#e76f51"), (0.55, 1.85, "#2a9d8f"), (-0.45, 1.75, "#e9c46a"), (0.4, 1.38, "#c77dff")):
        person(f, x, -0.95, z, c)
    cyl(f, 0.03, 0.25, (0.88, -0.825, 1.5), "#6b4a33")
    ball(f, 0.17, (0.88, -0.57, 1.5), "#2f8f5b")
    for x in (-0.95, 0.95):
        cyl(f, 0.012, 1.2, (x, -0.35, 1.88), "#d9d4c7")
    flags = ["#ff7a59", "#ffd166", "#5fd1a5", "#4cc9f0"]
    for k in range(10):
        x = -0.9 + k * 0.2
        box(f, (0.08, 0.08, 0.01), (x, 0.05 - 0.15 * (1 - (x / 0.95) ** 2), 1.88), flags[k % 4], rot=(0, 0.785, 0))


# the cube itself
bpy.ops.object.empty_add(location=(0, 0, 0))
root = bpy.context.active_object
root.name = "EventCube"
box(root, (2, 2, 2), (0, 0, 0), "#1a1830")
for build in (concert, party, church, community):
    build()
for o in bpy.context.scene.objects:  # parent every face to the root
    if o.type == "EMPTY" and o.name.startswith("Face_"):
        o.parent = root

bpy.ops.object.select_all(action="SELECT")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True)
print("Exported", OUT)
