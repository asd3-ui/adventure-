from pathlib import Path

from pythonforandroid.recipes.pygame import Pygame2Recipe
from pythonforandroid.toolchain import current_directory


class Pygame261Recipe(Pygame2Recipe):
    """Build a modern pygame release against the selected CPython headers."""

    version = "2.6.1"
    url = "https://github.com/pygame/pygame/archive/{version}.tar.gz"
    hostpython_prerequisites = ["setuptools", "cython>=3.1"]

    def prebuild_arch(self, arch):
        super().prebuild_arch(arch)
        with current_directory(self.get_build_dir(arch.arch)):
            # pygame 2.6.1's optional Cython sprite accelerator is not needed
            # by this game and currently fails with Cython 3.1.
            sprite_pyx = Path("src_c") / "_sprite.pyx"
            if sprite_pyx.exists():
                sprite_pyx.unlink()

            setup_file = Path("buildconfig") / "Setup.Android.SDL2.in"
            if setup_file.exists():
                lines = setup_file.read_text(encoding="utf-8").splitlines()
                lines = [line for line in lines if "_sprite" not in line]
                setup_file.write_text("\n".join(lines) + "\n", encoding="utf-8")


recipe = Pygame261Recipe()
