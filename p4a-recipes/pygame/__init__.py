from pythonforandroid.recipes.pygame import Pygame2Recipe


class Pygame252Recipe(Pygame2Recipe):
    """Use Pygame 2.5.2, whose generated C sources support CPython 3.11."""

    version = "2.5.2"
    url = "https://github.com/pygame/pygame/archive/{version}.tar.gz"


recipe = Pygame252Recipe()
