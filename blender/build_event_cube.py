"""
Builds the Hanner Events cube as a PBR glTF (.glb) without needing Blender installed.
    pip install trimesh numpy
    python blender/make_event_cube_glb.py        ->  public/models/event-cube.glb
Open the .glb in Blender via File > Import > glTF 2.0, then File > Save As to get a .blend.
Faces (glTF, Y-up):  +Z concert   +X DJ party   -Z church   -X community.
Materials named "emit_*" glow; the site raises their emissive strength and blooms them.
Everything is merged per material, so the whole model is ~45 draw calls or fewer.
"""
import json, math, os, struct
import numpy as np
import trimesh as tm
from trimesh.transformations import rotation_matrix as R, translation_matrix as Tr
from trimesh.visual.material import PBRMaterial

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "models", "event-cube.glb"))

def lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c]

MATS, EXACT = {}, {}
def M(name, color, rough=0.55, metal=0.0, alpha=1.0):
    c = lin(color); EXACT[name] = (c, alpha)
    glow = name.startswith("emit_") or name.startswith("beam_")
    MATS[name] = PBRMaterial(name=name, baseColorFactor=[*c, alpha], metallicFactor=metal, roughnessFactor=rough,
                             emissiveFactor=c if glow else [0, 0, 0], alphaMode="BLEND" if alpha < 1 else "OPAQUE",
                             doubleSided=alpha < 1)

M("body", "#1b1a2e", 0.32, 0.6); M("trim", "#9a97b4", 0.28, 1.0); M("deck", "#2a2640", 0.5, 0.1)
M("black", "#121118", 0.7, 0.1); M("skin", "#e0b894", 0.6); M("cream", "#d8cdb8", 0.85); M("roof", "#8a4b3a", 0.7)
M("stone", "#cfc3ac", 0.9); M("wood", "#5b3a29", 0.6); M("wood2", "#7a5c3e", 0.6); M("pole", "#d9d4c7", 0.35, 0.7)
M("tent", "#f6e7c1", 0.9); M("tent_tip", "#ff7a59", 0.6); M("leaf", "#2f8f5b", 0.9); M("trunk", "#6b4a33", 0.9)
M("candle", "#f5efe0", 0.6); M("disco", "#dfe6ff", 0.05, 1.0); M("cloth", "#efe9dc", 0.95); M("steel", "#b8b6c8", 0.25, 1.0)
for i, c in enumerate(["#e76f51", "#2a9d8f", "#e9c46a", "#8ab17d", "#f4a261", "#6d6875", "#c77dff"]): M(f"shirt{i}", c, 0.85)
for i, c in enumerate(["#ff7a59", "#ffd166", "#5fd1a5", "#4cc9f0"]): M(f"flag{i}", c, 0.8)
for n, c in {"concert": "#231a52", "party": "#4a1240", "church": "#3a2e1c", "community": "#124038"}.items(): M(f"panel_{n}", c, 0.45, 0.2)
for n, c in {"screen": "#7c5cff", "pink": "#ff4fa3", "amber": "#ffb347", "gold": "#f2c46d", "red": "#ff6b6b", "warm": "#ffd166",
             "green": "#5fd1a5", "tile_a": "#ff4fa3", "tile_b": "#4cc9f0", "flame": "#ffb347"}.items(): M(f"emit_{n}", c, 0.4)
SPOT = ["#ff5d73", "#9d8cff", "#ffd166", "#4cc9f0"]
for i, c in enumerate(SPOT): M(f"emit_spot{i}", c, 0.3); M(f"beam_{i}", c, 1.0, 0.0, 0.16)

parts = {}  # material -> [(V, F, N)] in world space
scene = tm.Scene()

def put(mesh, mat, T, normals=None, flat=True):
    m = mesh.copy()
    if flat and normals is None: m.unmerge_vertices()
    N = normals if normals is not None else np.asarray(m.vertex_normals)
    V = np.c_[m.vertices, np.ones(len(m.vertices))] @ T.T
    parts.setdefault(mat, []).append((V[:, :3], m.faces, N @ T[:3, :3].T))

def rbox(size, r, step=0.07):
    m = tm.creation.box(extents=(1, 1, 1)).subdivide_to_size(max_edge=0.1)
    v = m.vertices * np.array(size); half = np.array(size) / 2 - r
    d = v - np.clip(v, -half, half); n = d / np.linalg.norm(d, axis=1, keepdims=True)
    return tm.Trimesh(np.clip(v, -half, half) + n * r, m.faces, process=False), n

UP = R(-math.pi / 2, [1, 0, 0])  # +Z axis -> +Y axis
def cyl(r, h, n=28): m = tm.creation.cylinder(radius=r, height=h, sections=n); m.apply_transform(UP); return m
def cone(r, h, n=28, rot=0):
    m = tm.creation.cone(radius=r, height=h, sections=n); m.apply_transform(UP); m.apply_translation([0, -h / 2, 0])
    m.apply_transform(R(rot, [0, 1, 0])); return m
disc = lambda r, t, n=28: tm.creation.cylinder(radius=r, height=t, sections=n)  # axis +Z (faces outward)
BOX = lambda *s: tm.creation.box(extents=s)
BALL = lambda r, s=2: tm.creation.icosphere(subdivisions=s, radius=r)

class Face:
    def __init__(s, ang, name, accent):
        s.F, s.name = R(ang, [0, 1, 0]), name
        s.add(BOX(1.84, 1.84, 0.016), f"panel_{name}", (0, 0, 1.004))
        for u, v, w, h in ((0, 0.93, 1.84, 0.04), (0, -0.93, 1.84, 0.04)): s.add(BOX(w, h, 0.03), "trim", (u, v, 1.012))
        for u in (-0.93, 0.93): s.add(BOX(0.04, 1.9, 0.03), "trim", (u, 0, 1.012))
        s.add(BOX(1.9, 0.1, 0.75), "deck", (0, -0.73, 1.375))
        s.add(BOX(1.9, 0.014, 0.014), accent, (0, -0.71, 1.752))
    def T(s, p, rot=None): return s.F @ Tr(p) @ (rot if rot is not None else np.eye(4))
    def add(s, mesh, mat, p, rot=None, **k): put(mesh, mat, s.T(p, rot), **k)
    def person(s, u, v, w, shirt):
        c = tm.creation.capsule(height=0.08, radius=0.034); c.apply_transform(UP)
        s.add(c, shirt, (u, v + 0.09, w), flat=False); s.add(BALL(0.032), "skin", (u, v + 0.185, w), flat=False)
    def node(s, name, p):  # animated node (pivot at p), returns its name
        s.nodeT = s.T(p); scene.graph.update(frame_to=name, frame_from="world", matrix=s.nodeT); return name
    def on(s, node, mesh, mat, name, local=(0, 0, 0), rot=None, flat=True):
        m = mesh.copy()
        if flat: m.unmerge_vertices()
        m.apply_transform(Tr(local) @ (rot if rot is not None else np.eye(4)))
        m.visual = tm.visual.TextureVisuals(material=MATS[mat])
        scene.add_geometry(m, node_name=name, geom_name=name, parent_node_name=node)

TOP = -0.68
SHIRTS = [f"shirt{i}" for i in range(7)]

def concert():
    f = Face(0, "concert", "emit_screen")
    f.add(BOX(1.7, 0.92, 0.04), "black", (0, 0.1, 1.03)); f.add(BOX(1.56, 0.78, 0.01), "emit_screen", (0, 0.1, 1.055))
    f.add(BOX(1.6, 0.1, 0.5), "black", (0, TOP + 0.05, 1.28))                       # riser
    f.add(BOX(1.6, 0.012, 0.5), "emit_screen", (0, TOP + 0.102, 1.28), flat=True)
    for u in (-0.9, 0.9): f.add(BOX(0.05, 1.42, 0.05), "steel", (u, TOP + 0.71, 1.62))
    f.add(BOX(1.85, 0.05, 0.05), "steel", (0, 0.76, 1.62)); f.add(BOX(1.85, 0.04, 0.04), "steel", (0, 0.66, 1.62))
    for k in range(9): f.add(BOX(0.012, 0.1, 0.012), "steel", (-0.86 + k * 0.215, 0.71, 1.62))
    for u in (-0.75, 0.75):                                                           # speaker stacks
        f.add(BOX(0.28, 0.4, 0.26), "black", (u, TOP + 0.25, 1.3)); f.add(BOX(0.24, 0.3, 0.24), "black", (u, TOP + 0.6, 1.3))
        for dv in (0.2, 0.5): f.add(cyl(0.07, 0.01, 24), "steel", (u, TOP + dv + 0.05, 1.435), rot=R(math.pi / 2, [1, 0, 0]))
    for i, u in enumerate((-0.6, -0.2, 0.2, 0.6)):                                    # moving lights
        n = f.node(f"Spot_{i}", (u, 0.62, 1.55))
        f.on(n, cone(0.06, 0.12, 20, 0), "black", f"Spot_{i}_body", (0, -0.06, 0))
        f.on(n, cyl(0.04, 0.012, 20), "emit_spot%d" % i, f"Spot_{i}_lens", (0, -0.13, 0))
        beam = cone(0.2, 0.85, 32); beam.apply_transform(R(math.pi, [1, 0, 0]))        # apex at the lens, opens downward
        f.on(n, beam, f"beam_{i}", f"Spot_{i}_beam", (0, -0.14 - 0.425 + 0.425, 0.0), flat=False)
    mic = cyl(0.008, 0.2, 12); f.add(mic, "steel", (0, TOP + 0.2, 1.3)); f.person(0, TOP + 0.1, 1.24, "shirt0")
    for r in range(2):
        for k in range(8): f.person(-0.78 + k * 0.22 + (r % 2) * 0.1, TOP + 0.05, 1.58 + r * 0.13, SHIRTS[(r * 3 + k) % 7])

def party():
    f = Face(math.pi / 2, "party", "emit_pink")
    f.add(BOX(0.95, 0.34, 0.36), "black", (0, TOP + 0.22, 1.2)); f.add(BOX(0.9, 0.2, 0.01), "emit_pink", (0, TOP + 0.2, 1.385))
    f.add(BOX(0.98, 0.03, 0.4), "steel", (0, TOP + 0.4, 1.2))
    for u in (-0.22, 0.22): f.add(cyl(0.1, 0.012, 32), "steel", (u, TOP + 0.42, 1.2))
    f.add(BOX(0.25, 0.015, 0.17), "black", (0.45, TOP + 0.43, 1.2)); f.person(0, TOP + 0.43, 1.05, "shirt6")
    for u in (-0.8, 0.8):
        f.add(BOX(0.3, 0.7, 0.3), "black", (u, TOP + 0.35, 1.25))
        for dv in (0.22, 0.5): f.add(cyl(0.085, 0.01, 24), "steel", (u, TOP + dv, 1.405), rot=R(math.pi / 2, [1, 0, 0]))
    f.add(cyl(0.006, 0.7, 8), "steel", (0, 0.9, 1.45))
    n = f.node("DiscoBall", (0, 0.55, 1.45)); f.on(n, BALL(0.2, 2), "disco", "DiscoBall_mesh")
    for i in range(12):                                                                # LED floor tiles
        c, r = i % 4, i // 4
        f.add(BOX(0.36, 0.012, 0.15), "emit_tile_a" if (c + r) % 2 == 0 else "emit_tile_b", (-0.6 + c * 0.4, TOP + 0.007, 1.52 + r * 0.0 + (r - 1) * 0.17))
    for k in range(9):
        u = -0.9 + k * 0.225; f.add(BALL(0.028, 1), "emit_warm", (u, 0.85 - 0.16 * (1 - (u / 0.95) ** 2), 1.7), flat=False)
    f.add(BOX(1.85, 0.01, 0.01), "black", (0, 0.88, 1.7))

def church():
    f = Face(math.pi, "church", "emit_gold")
    f.add(BOX(1.4, 0.04, 0.4), "stone", (0.0, TOP + 0.025, 1.55))                       # path
    f.add(BOX(0.9, 0.7, 0.6), "cream", (-0.2, TOP + 0.37, 1.35))
    for s_ in (-1, 1): f.add(BOX(0.66, 0.035, 0.66), "roof", (-0.2 + s_ * 0.225, TOP + 0.84, 1.35), rot=R(-s_ * 0.84, [0, 0, 1]))
    f.add(BOX(0.3, 1.1, 0.3), "stone", (0.5, TOP + 0.57, 1.4)); f.add(cone(0.24, 0.5, 4, math.pi / 4), "roof", (0.5, TOP + 1.37, 1.4))
    f.add(BOX(0.03, 0.2, 0.03), "emit_gold", (0.5, TOP + 1.72, 1.4)); f.add(BOX(0.12, 0.03, 0.03), "emit_gold", (0.5, TOP + 1.76, 1.4))
    f.add(disc(0.12, 0.012, 32), "emit_gold", (-0.2, TOP + 0.55, 1.655))
    f.add(disc(0.06, 0.014, 24), "emit_red", (-0.2, TOP + 0.55, 1.658))
    f.add(BOX(0.2, 0.32, 0.02), "wood", (-0.2, TOP + 0.19, 1.652)); f.add(disc(0.1, 0.02, 24), "wood", (-0.2, TOP + 0.35, 1.652))
    for u in (-0.85, -0.7, 0.2, 0.32):
        f.add(cyl(0.02, 0.12, 16), "candle", (u, TOP + 0.11, 1.7)); f.add(BALL(0.024, 1), "emit_flame", (u, TOP + 0.19, 1.7), flat=False)
    f.add(cyl(0.04, 0.12, 12), "trunk", (-0.8, TOP + 0.11, 1.42)); f.add(BALL(0.17, 2), "leaf", (-0.8, TOP + 0.32, 1.42), flat=False)
    f.person(0.75, TOP + 0.05, 1.7, "shirt5"); f.person(0.86, TOP + 0.05, 1.62, "shirt3")

def community():
    f = Face(-math.pi / 2, "community", "emit_green")
    for u in (-0.75, -0.15):
        for w in (1.2, 1.6): f.add(cyl(0.015, 0.5, 12), "pole", (u, TOP + 0.28, w))
    f.add(cone(0.5, 0.3, 4, math.pi / 4), "tent", (-0.45, TOP + 0.66, 1.4)); f.add(cone(0.1, 0.12, 12), "tent_tip", (-0.45, TOP + 0.87, 1.4))
    f.add(BOX(0.5, 0.03, 0.22), "wood2", (-0.45, TOP + 0.13, 1.4)); f.add(BOX(0.5, 0.1, 0.22), "cloth", (-0.45, TOP + 0.06, 1.4))
    f.add(BOX(0.5, 0.04, 0.22), "wood2", (0.4, TOP + 0.17, 1.55)); f.add(BOX(0.5, 0.12, 0.2), "cloth", (0.4, TOP + 0.09, 1.55))
    for u, w, s_ in ((0.25, 1.7, "shirt0"), (0.55, 1.7, "shirt1"), (-0.45, 1.64, "shirt2"), (0.4, 1.3, "shirt6")): f.person(u, TOP + 0.05, w, s_)
    f.add(cyl(0.03, 0.25, 12), "trunk", (0.88, TOP + 0.17, 1.45)); f.add(BALL(0.17, 2), "leaf", (0.88, TOP + 0.4, 1.45), flat=False)
    for u in (-0.92, 0.92): f.add(cyl(0.012, 1.1, 10), "pole", (u, TOP + 0.55, 1.7))
    for k in range(10):
        u = -0.88 + k * 0.196; f.add(BOX(0.08, 0.08, 0.008), f"flag{k % 4}", (u, TOP + 1.02 - 0.12 * (1 - (u / 0.95) ** 2), 1.7), rot=R(0.785, [0, 0, 1]))

# body, then faces
b, n = rbox((2, 2, 2), 0.07); put(b, "body", np.eye(4), n)
for build in (concert, party, church, community): build()
for mat, items in parts.items():
    V = np.vstack([i[0] for i in items]); N = np.vstack([i[2] for i in items])
    off = np.cumsum([0] + [len(i[0]) for i in items[:-1]]); F = np.vstack([i[1] + o for i, o in zip(items, off)])
    m = tm.Trimesh(V, F, vertex_normals=N / np.linalg.norm(N, axis=1, keepdims=True).clip(1e-9), process=False)
    m.visual = tm.visual.TextureVisuals(material=MATS[mat]); scene.add_geometry(m, node_name=mat, geom_name=mat)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
raw = scene.export(file_type="glb", include_normals=True)
# trimesh rounds colours to 8-bit in linear space (crushes dark tones), so restore the exact factors.
jl = struct.unpack("<I", raw[12:16])[0]; doc = json.loads(raw[20:20 + jl]); bin_chunk = raw[20 + jl:]
for gm in doc["materials"]:
    gm["pbrMetallicRoughness"]["baseColorFactor"] = [*EXACT[gm["name"]][0], EXACT[gm["name"]][1]]
    gm["emissiveFactor"] = EXACT[gm["name"]][0] if gm["name"].startswith(("emit_", "beam_")) else [0, 0, 0]
js = json.dumps(doc, separators=(",", ":")).encode(); js += b" " * (-len(js) % 4)
glb = b"glTF" + struct.pack("<II", 2, 12 + 8 + len(js) + len(bin_chunk)) + struct.pack("<I", len(js)) + b"JSON" + js + bin_chunk
open(OUT, "wb").write(glb)
print("wrote", OUT, os.path.getsize(OUT) // 1024, "KB", "| bounds", np.round(scene.bounds, 2).tolist())
