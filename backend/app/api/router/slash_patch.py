from __future__ import annotations

from typing import Any

from fastapi.routing import APIRouter

_original_add_api_route = APIRouter.add_api_route


def _alternate_path(path: str) -> str | None:
    if path == "":
        return "/"
    if path == "/":
        return ""
    if path.endswith("/"):
        return path[:-1]
    return f"{path}/"


def _add_api_route(self, path: str, *args: Any, **kwargs: Any):
    route = _original_add_api_route(self, path, *args, **kwargs)
    alt_path = _alternate_path(path)
    if alt_path is not None and alt_path != path and not any(route.path == alt_path for route in self.routes):
        kwargs_alt = dict(kwargs)
        kwargs_alt["include_in_schema"] = False
        _original_add_api_route(self, alt_path, *args, **kwargs_alt)
    return route


APIRouter.add_api_route = _add_api_route
