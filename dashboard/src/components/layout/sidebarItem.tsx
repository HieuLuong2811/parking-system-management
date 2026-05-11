import React from "react";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import type { SidebarGroupConfig } from "./menu";
import { ActiveIndicator } from "../ActiveIndicator";
import { buildItems } from "../../ultis/format";

export interface SidebarItemProps {
  text: string;
  icon: React.ReactNode;
  path: string;
  onClick: () => void;
  collapsed: boolean;
  active: boolean;
  isDanger?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  text,
  icon,
  path,
  onClick,
  collapsed,
  active,
  isDanger = false,
}) => {
  const [hover, setHover] = React.useState(false);

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <Tooltip title={collapsed ? text : ""} placement="right">
        <ListItemButton
          component={path !== "#" ? RouterLink : "button"}
          to={path !== "#" ? path : undefined}
          onClick={onClick}
          onMouseEnter={() => isDanger && setHover(true)}
          onMouseLeave={() => isDanger && setHover(false)}
          sx={{
            position: "relative",
            px: collapsed ? 1.5 : 2,
            py: 1,
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 2,
            color: isDanger ? "#dc2626" : active ? "#1e1b4b" : "#475569",
            backgroundColor: active
              ? "rgba(107,79,208,0.08)"
              : isDanger && hover
                ? "rgba(220,38,38,0.08)"
                : "transparent",
            "&:hover": {
              backgroundColor: isDanger
                ? "rgba(220,38,38,0.08)"
                : active
                  ? "rgba(107,79,208,0.12)"
                  : "rgba(15,23,42,0.04)",
            },
          }}
        >
          <ActiveIndicator
            active={active || (isDanger && hover)}
            color={isDanger ? "#dc2626" : "#6b4fd0"}
          />

          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: "center",
              color: isDanger ? "#dc2626" : active ? "#6b4fd0" : "#64748b",
            }}
          >
            {icon}
          </ListItemIcon>

          {!collapsed && (
            <ListItemText
              primary={text}
              primaryTypographyProps={{
                noWrap: true,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

interface SidebarGroupProps {
  group: SidebarGroupConfig;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  isPathActive: (path: string) => boolean;
  isGroupActive: (group: SidebarGroupConfig) => boolean;
  t: (key: string) => string;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  group,
  collapsed,
  open,
  onToggle,
  onClose,
  isPathActive,
  isGroupActive,
  t,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const hasChildren = group.children && group.children.length > 0;

  const groupText = t(group.translationKey);
  const groupActive = isGroupActive(group);
  const popperOpen = collapsed && Boolean(anchorEl);
  const children = buildItems(group.children, t);

  return (
    <>
      <ListItem
        disablePadding
        sx={{ mb: 0.5 }}
        onMouseEnter={(e) =>
          collapsed ? setAnchorEl(e.currentTarget) : undefined
        }
        onMouseLeave={() => (collapsed ? setAnchorEl(null) : undefined)}
      >
        <Tooltip title={collapsed && !hasChildren ? groupText : ""} placement="right">
          <ListItemButton
            onClick={() => {
              if (!collapsed) {
                onToggle();
              }
            }}
            sx={{
              position: "relative",
              px: collapsed ? 1.5 : 2,
              py: 1,
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 2,
              color: groupActive ? "#1e1b4b" : "#475569",
              backgroundColor: groupActive
                ? "rgba(107,79,208,0.08)"
                : "transparent",
              "&:hover": {
                backgroundColor: groupActive
                  ? "rgba(107,79,208,0.12)"
                  : "rgba(15,23,42,0.04)",
              },
            }}
          >
            <ActiveIndicator active={groupActive} color="#6b4fd0" />

            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
                color: groupActive ? "#6b4fd0" : "#64748b",
              }}
            >
              {group.icon}
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary={groupText}
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: 14,
                  fontWeight: groupActive ? 600 : 500,
                }}
              />
            )}

            {!collapsed && (open ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
          </ListItemButton>
        </Tooltip>

        <Popper
          open={popperOpen}
          anchorEl={anchorEl}
          placement="right-start"
          sx={{ zIndex: theme.zIndex.drawer + 2 }}
        >
          <Paper
            elevation={6}
            sx={{ ml: 1, minWidth: 220, p: 1, borderRadius: 2 }}
            onMouseEnter={() => setAnchorEl(anchorEl)}
            onMouseLeave={() => setAnchorEl(null)}
          >
            <Typography sx={{ px: 1.5, py: 1, fontSize: 13, fontWeight: 600 }}>
              {groupText}
            </Typography>
            <Divider sx={{ mb: 0.5 }} />
            <List disablePadding>
              {children.map((item) => (
                <SidebarItem
                  key={item.id}
                  text={item.text}
                  icon={item.icon}
                  path={item.path}
                  onClick={() => {
                    setAnchorEl(null);
                    onClose();
                  }}
                  collapsed={false}
                  active={isPathActive(item.path)}
                />
              ))}
            </List>
          </Paper>
        </Popper>
      </ListItem>

      <Collapse in={!collapsed && open} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ pl: 2 }}>
          {children.map((item) => (
            <SidebarItem
              key={item.id}
              text={item.text}
              icon={item.icon}
              path={item.path}
              onClick={onClose}
              collapsed={false}
              active={isPathActive(item.path)}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};
