import os
import subprocess
import sys
from os.path import exists, join

from pythonforandroid.logger import info
from pythonforandroid.recipes.pygame import Pygame2Recipe
from pythonforandroid.util import BuildInterruptingException

# Cython release used by pygame 2.5.2's own CI. Newer releases (3.1+) fail on
# pygame's .pyx files, and 0.29.x has never been exercised with 2.5.2.
CYTHON_PIN = "3.0.0"
CYTHON_SERIES = "3.0."

# C files that pygame 2.5.2 generates from .pyx sources. They are NOT part of
# the GitHub source archive, so they must exist before `setup.py build_ext`.
GENERATED_SOURCES = (
    join("src_c", "_sdl2", "audio.c"),
    join("src_c", "_sdl2", "controller.c"),
    join("src_c", "_sdl2", "mixer.c"),
    join("src_c", "_sdl2", "sdl2.c"),
    join("src_c", "_sdl2", "video.c"),
    join("src_c", "_sprite.c"),
    join("src_c", "pypm.c"),
)


class Pygame252Recipe(Pygame2Recipe):
    """Use Pygame 2.5.2, whose generated C sources support CPython 3.11.

    pygame 2.5.2 needs Cython to generate part of its C sources, but the
    isolated hostpython that python-for-android builds (and that runs
    ``setup.py build_ext``) has no Cython, and the pinned python-for-android
    release has no ``hostpython_prerequisites`` support. So the C files are
    generated up front with the interpreter that runs Buildozer/p4a, which
    does have Cython (it is installed by the build workflow).
    """

    version = "2.5.2"
    url = "https://github.com/pygame/pygame/archive/{version}.tar.gz"

    def prebuild_arch(self, arch):
        super().prebuild_arch(arch)
        self._generate_cython_sources(self.get_build_dir(arch.arch))

    # ------------------------------------------------------------------
    def _generate_cython_sources(self, build_dir):
        if all(exists(join(build_dir, path)) for path in GENERATED_SOURCES):
            info("pygame: Cython-generated C sources already present")
            return

        env = self._host_env_with_cython(build_dir)
        info("pygame: generating C sources from .pyx with host Cython")
        try:
            subprocess.run(
                [sys.executable, "setup.py", "cython_only"],
                cwd=build_dir,
                env=env,
                check=True,
            )
        except subprocess.CalledProcessError as exc:
            raise BuildInterruptingException(
                "pygame: generating Cython sources failed (exit code "
                f"{exc.returncode}). See the log above."
            ) from exc

        missing = [p for p in GENERATED_SOURCES if not exists(join(build_dir, p))]
        if missing:
            raise BuildInterruptingException(
                "pygame: Cython did not produce: " + ", ".join(missing)
            )

    def _host_env_with_cython(self, build_dir):
        """Environment for the host interpreter, guaranteeing a usable Cython."""
        env = os.environ.copy()
        # Never leak the cross-compilation environment into the host Python.
        for key in ("PYTHONPATH", "PYTHONHOME", "PYTHONNOUSERSITE"):
            env.pop(key, None)

        version = self._host_cython_version(env)
        if version and version.startswith(CYTHON_SERIES):
            return env

        info(
            f"pygame: host Cython is {version or 'missing'}; "
            f"installing Cython=={CYTHON_PIN} for the pygame build"
        )
        target = join(build_dir, ".host-cython")
        try:
            subprocess.run(
                [
                    sys.executable, "-m", "pip", "install", "-q",
                    "--disable-pip-version-check",
                    "--target", target, f"Cython=={CYTHON_PIN}",
                ],
                env=env,
                check=True,
            )
        except subprocess.CalledProcessError as exc:
            raise BuildInterruptingException(
                f"pygame: could not install Cython=={CYTHON_PIN} "
                "(install it in the build environment with "
                f"`pip install cython=={CYTHON_PIN}`)."
            ) from exc
        env["PYTHONPATH"] = target
        return env

    @staticmethod
    def _host_cython_version(env):
        result = subprocess.run(
            [sys.executable, "-c", "import Cython; print(Cython.__version__)"],
            env=env,
            capture_output=True,
            text=True,
        )
        return result.stdout.strip() if result.returncode == 0 else None


recipe = Pygame252Recipe()
