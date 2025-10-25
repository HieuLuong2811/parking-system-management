from enum import Enum

class RoleType(str, Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"