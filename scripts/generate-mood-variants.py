from pathlib import Path

import numpy as np
from PIL import Image
from scipy.cluster.vq import kmeans2


ROOT = Path(__file__).resolve().parents[1]
MOOD_DIR = ROOT / "pwa" / "public" / "moods"
OUTPUT_DIR = MOOD_DIR / "variants"
MOODS = [
    "super-happy",
    "small-happy",
    "light",
    "shy",
    "calm",
    "speechless",
    "tired",
    "anxious",
    "sad",
    "angry",
]


def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    rgb = rgb / 255.0
    linear = np.where(
        rgb <= 0.04045,
        rgb / 12.92,
        ((rgb + 0.055) / 1.055) ** 2.4,
    )
    xyz = linear @ np.array(
        [
            [0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041],
        ]
    ).T
    xyz = xyz / np.array([0.95047, 1.0, 1.08883])
    delta = 6 / 29
    f = np.where(xyz > delta**3, xyz ** (1 / 3), xyz / (3 * delta**2) + 4 / 29)
    return np.stack(
        [116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])],
        axis=-1,
    )


def lab_to_rgb(lab: np.ndarray) -> np.ndarray:
    fy = (lab[..., 0] + 16) / 116
    fx = fy + lab[..., 1] / 500
    fz = fy - lab[..., 2] / 200
    delta = 6 / 29
    f = np.stack([fx, fy, fz], axis=-1)
    xyz = np.where(f > delta, f**3, 3 * delta**2 * (f - 4 / 29))
    xyz = xyz * np.array([0.95047, 1.0, 1.08883])
    linear = xyz @ np.array(
        [
            [3.2404542, -1.5371385, -0.4985314],
            [-0.9692660, 1.8760108, 0.0415560],
            [0.0556434, -0.2040259, 1.0572252],
        ]
    ).T
    rgb = np.where(
        linear <= 0.0031308,
        12.92 * linear,
        1.055 * np.maximum(linear, 0) ** (1 / 2.4) - 0.055,
    )
    return np.clip(rgb * 255, 0, 255)


def body_profile(image: Image.Image):
    rgba = np.array(image.convert("RGBA"))
    lab = rgb_to_lab(rgba[..., :3].astype(float))
    alpha = rgba[..., 3]
    candidates = (alpha > 30) & (lab[..., 0] > 25) & (lab[..., 0] < 98)
    points = lab[candidates]
    centers, labels = kmeans2(points, 4, minit="++", iter=30, seed=4)
    counts = np.bincount(labels, minlength=4)
    body_clusters = [index for index, center in enumerate(centers) if center[0] > 35]
    body_cluster = max(body_clusters, key=lambda index: counts[index])
    center = np.median(points[labels == body_cluster], axis=0)
    distance = np.linalg.norm(lab - center, axis=-1)
    core = (alpha > 5) & (distance < 24)
    values = lab[core]
    return rgba, lab, alpha, distance, np.median(values, axis=0), np.std(values, axis=0)


def recolor(source: Image.Image, target: Image.Image) -> Image.Image:
    rgba, source_lab, alpha, distance, source_median, source_std = body_profile(source)
    _, _, _, _, target_median, target_std = body_profile(target)
    source_std = np.maximum(source_std, [2.5, 2.5, 2.5])
    target_std = np.maximum(target_std, [2.5, 2.5, 2.5])
    mapped = (source_lab - source_median) * (target_std / source_std) + target_median
    weight = np.clip((38 - distance) / 14, 0, 1) * np.clip(alpha / 50, 0, 1)
    output_lab = source_lab * (1 - weight[..., None]) + mapped * weight[..., None]
    output = rgba.copy()
    output[..., :3] = lab_to_rgb(output_lab).round().astype(np.uint8)
    return Image.fromarray(output, "RGBA")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    images = {name: Image.open(MOOD_DIR / f"{name}.webp").convert("RGBA") for name in MOODS}
    for source_name, source in images.items():
        for target_name, target in images.items():
            if source_name == target_name:
                continue
            output = recolor(source, target)
            output.save(
                OUTPUT_DIR / f"{source_name}--{target_name}.webp",
                "WEBP",
                quality=92,
                method=6,
            )


if __name__ == "__main__":
    main()
