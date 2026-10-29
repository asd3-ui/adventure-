from pathlib import Path

from pythonforandroid.recipes.pygame import Pygame2Recipe
from pythonforandroid.toolchain import current_directory


class Pygame211Recipe(Pygame2Recipe):
    """Use the P4A-tested Pygame release with a Python 3.11 header fix."""

    version = "2.1.0"
    url = "https://github.com/pygame/pygame/archive/{version}.tar.gz"

    def prebuild_arch(self, arch):
        super().prebuild_arch(arch)
        with current_directory(self.get_build_dir(arch.arch)):
            # Python 3.11 moved this CPython internal header into Include/cpython.
            # The generated Pygame 2.1.0 SDL2 source still uses the old include.
            source = Path("src_c") / "_sdl2" / "sdl2.c"
            if source.exists():
                content = source.read_text(encoding="utf-8")
                content = content.replace(
                    '#include "longintrepr.h"',
                    '#include "cpython/longintrepr.h"',
                )
                source.write_text(content, encoding="utf-8")


recipe = Pygame211Recipe()
