import React, { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  ButtonBase,
  Chip,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useNotifications } from "../../api/notifications";
import { languageOptions } from "../../ultis/flags";
import {
  COLLAPSED_SIDEBAR_WIDTH,
  EXPANDED_SIDEBAR_WIDTH,
} from "../../constant/config";
import { useAuth } from "../../contexts/useAuth";
import { buildBreadcrumbs } from "../../routes/RouterBreadcrumbs";

export const Navbar: React.FC<{
  onMenuClick?: () => void;
  collapsed: boolean;
}> = ({ onMenuClick, collapsed }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const drawerWidth = collapsed
    ? COLLAPSED_SIDEBAR_WIDTH
    : EXPANDED_SIDEBAR_WIDTH;
  const { user, logout } = useAuth();
  const crumbs = buildBreadcrumbs(location.pathname, t);

  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const notificationsQuery = useNotifications();

  const notifications = useMemo(() => {
    const raw = notificationsQuery.data ?? [];

    return raw
      .filter((item) => !item.deleted_at)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [notificationsQuery.data]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  const currentLanguage = useMemo(
    () =>
      languageOptions.find((option) => option.code === i18n.language) ??
      languageOptions[0],
    [i18n.language],
  );

  const userInitial =
    user?.full_name?.trim()?.charAt(0)?.toUpperCase() ??
    user?.user_code?.trim()?.charAt(0)?.toUpperCase() ??
    "A";

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleLanguageOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const closeNotificationMenu = () => {
    setNotificationAnchor(null);
  };

  const closeLanguageMenu = () => {
    setLanguageAnchor(null);
  };

  const closeProfileMenu = () => {
    setProfileAnchor(null);
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    closeLanguageMenu();
  };

  const navbarActionSx = {
    height: 40,
    borderRadius: 999,
    px: 1.25,
    color: "text.primary",
    border: "1px solid transparent",
    transition: "all 0.18s ease",
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      borderColor: alpha(theme.palette.primary.main, 0.18),
      color: "primary.main",
    },
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 68,
          px: { xs: 1.5, md: 3 },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          {!isDesktop && onMenuClick && (
            <Tooltip title={t("common.menu", { defaultValue: "Menu" })}>
              <IconButton
                edge="start"
                onClick={onMenuClick}
                sx={{
                  ...navbarActionSx,
                  width: 40,
                  px: 0,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0.35,
            }}
          >
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                fontSize: 13,
                color: "text.secondary",
                overflow: "hidden",
                "& .MuiBreadcrumbs-ol": {
                  flexWrap: "nowrap",
                },
                "& .MuiBreadcrumbs-li": {
                  minWidth: 0,
                },
                "& .MuiBreadcrumbs-separator": {
                  mx: 0.75,
                  color: "text.disabled",
                },
              }}
            >
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                const isClickable = Boolean(crumb.clickable) && !isLast;

                const content =
                  crumb.icon === "home" ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ color: isLast ? "primary.main" : "text.secondary" }}
                    >
                      <HomeRoundedIcon fontSize="small" />
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ fontWeight: 700 }}
                      >
                        {t("common.home", { defaultValue: "Trang chủ quản trị" })}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography
                      component="span"
                      variant="body2"
                      noWrap
                      sx={{
                        maxWidth: { xs: 120, sm: 240, md: 360 },
                        fontWeight: isLast ? 800 : 600,
                        color: isLast ? "text.primary" : "text.secondary",
                      }}
                    >
                      {crumb.label}
                    </Typography>
                  );

                if (!isClickable) {
                  return (
                    <Box
                      key={`${crumb.label}-${index}`}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      {content}
                    </Box>
                  );
                }

                return (
                  <Link
                    key={`${crumb.label}-${index}`}
                    component={RouterLink}
                    to={crumb.path}
                    underline="none"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      minWidth: 0,
                      borderRadius: 999,
                      px: 0.75,
                      py: 0.35,
                      color: "text.secondary",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: "primary.main",
                      },
                    }}
                  >
                    {content}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip
            title={t("notifications.title", { defaultValue: "Thông báo" })}
          >
            <IconButton
              size="large"
              onClick={handleNotificationOpen}
              aria-label="notifications"
              sx={{
                ...navbarActionSx,
                width: 42,
                px: 0,
              }}
            >
              <Badge
                color="error"
                badgeContent={unreadCount > 9 ? "9+" : unreadCount}
                invisible={unreadCount <= 0}
                overlap="circular"
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: 800,
                    minWidth: 18,
                    height: 18,
                    fontSize: 11,
                  },
                }}
              >
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={closeNotificationMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1,
                width: 360,
                maxWidth: "calc(100vw - 24px)",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t("notifications.title", { defaultValue: "Thông báo" })}
                </Typography>
                {unreadCount > 0 && (
                  <Chip
                    size="small"
                    color="error"
                    label={`${unreadCount} ${t("notifications.unread", {
                      defaultValue: "mới",
                    })}`}
                    sx={{ fontWeight: 800 }}
                  />
                )}
              </Stack>
            </Box>
            <Divider />

            {notificationsQuery.isLoading ? (
              <MenuItem onClick={closeNotificationMenu} sx={{ py: 1.5 }}>
                <Typography variant="body2">
                  {t("common.loading", { defaultValue: "Đang tải..." })}
                </Typography>
              </MenuItem>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((item) => (
                <MenuItem
                  key={item.id}
                  onClick={closeNotificationMenu}
                  href={item.link ?? "#"}
                  sx={{
                    alignItems: "flex-start",
                    py: 1.25,
                    px: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: item.is_read
                      ? "background.paper"
                      : alpha(theme.palette.primary.main, 0.04),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Stack spacing={0.4} sx={{ width: "100%" }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {!item.is_read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            bgcolor: "primary.main",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: item.is_read ? 600 : 600,
                          lineHeight: 1.35,
                        }}
                      >
                        {t(`notifications.titleType.${String(item.title)}`, {
                          defaultValue: "Không có tiêu đề",
                        })}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flexWrap: "wrap",
                      }}
                    >
                      {item.content}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ alignSelf: "flex-end" }}
                    >
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))
            ) : (
              <MenuItem onClick={closeNotificationMenu} sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t("notifications.empty")}
                </Typography>
              </MenuItem>
            )}
            <MenuItem
              component={RouterLink}
              to="/notifications"
              onClick={closeNotificationMenu}
              sx={{
                py: 1.25,
                justifyContent: "center",
                color: "primary.main",
                fontWeight: 800,
                textDecoration: "none",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {t("notifications.viewAll", { defaultValue: "Xem tất cả" })}
              </Typography>
            </MenuItem>
          </Menu>

          <ButtonBase
            onClick={handleLanguageOpen}
            aria-label="language selector"
            sx={{
              ...navbarActionSx,
              display: { xs: "none", sm: "inline-flex" },
              gap: 1,
              minWidth: 120,
            }}
          >
            <Box
              component="img"
              src={currentLanguage.flag}
              alt={currentLanguage.name}
              sx={{
                width: 26,
                height: 18,
                borderRadius: 0.75,
                objectFit: "cover",
              }}
            />

            <Box sx={{ textAlign: "left", minWidth: 0 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 600, lineHeight: 1.25 }}
              >
                {currentLanguage.name}
              </Typography>
            </Box>

            <KeyboardArrowDownRoundedIcon fontSize="small" />
          </ButtonBase>

          <Tooltip title={currentLanguage.name}>
            <IconButton
              onClick={handleLanguageOpen}
              aria-label="language selector"
              sx={{
                ...navbarActionSx,
                width: 42,
                px: 0,
                display: { xs: "inline-flex", sm: "none" },
              }}
            >
              <Box
                component="img"
                src={currentLanguage.flag}
                alt={currentLanguage.name}
                sx={{
                  width: 26,
                  height: 18,
                  borderRadius: 0.75,
                  objectFit: "cover",
                }}
              />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={closeLanguageMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1,
                width: 250,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TranslateRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {t("common.changeLanguage", { defaultValue: "Đổi ngôn ngữ" })}
                </Typography>
              </Stack>
            </Box>
            <Divider />

            {languageOptions.map((option) => {
              const selected = option.code === currentLanguage.code;

              return (
                <MenuItem
                  key={option.code}
                  selected={selected}
                  onClick={() => changeLanguage(option.code)}
                  sx={{
                    py: 1.25,
                    gap: 1.25,
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.14),
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={option.flag}
                    alt={option.name}
                    sx={{
                      width: 28,
                      height: 20,
                      borderRadius: 0.75,
                      objectFit: "cover",
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.name}
                    </Typography>
                  </Box>

                  {selected && (
                    <Chip
                      size="small"
                      color="primary"
                      label={t("common.selected", {
                        defaultValue: "Đang dùng",
                      })}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </MenuItem>
              );
            })}
          </Menu>

          <ButtonBase
            onClick={handleProfileOpen}
            sx={{
              ...navbarActionSx,
              gap: 1,
              pl: 0.6,
              pr: 1.25,
              minWidth: { xs: 44, sm: 150 },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "primary.main",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {userInitial}
            </Avatar>

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                textAlign: "left",
                minWidth: 0,
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
              >
                {user?.full_name ?? user?.user_code ?? "Admin"}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.2 }}
              >
                {user?.user_code}
              </Typography>
            </Box>

            <KeyboardArrowDownRoundedIcon
              fontSize="small"
              sx={{ display: { xs: "none", sm: "block" } }}
            />
          </ButtonBase>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={closeProfileMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1,
                width: 280,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.75 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: "primary.main",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  {userInitial}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 600 }}
                  >
                    {user?.full_name ?? user?.user_code ?? "Admin"}
                  </Typography>
                  <Typography variant="body2" noWrap color="text.secondary">
                    {user?.user_code ?? "ADMIN"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <MenuItem
              sx={{
                py: 1.25,
                gap: 1.25,
              }}
            >
              <PersonRoundedIcon fontSize="small" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t("profile.role", { defaultValue: "Hồ sơ cá nhân" })}
                </Typography>
              </Box>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={() => {
                logout();
                closeProfileMenu();
              }}
              sx={{
                py: 1.25,
                gap: 1.25,
                color: "error.main",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
              {t("button.logout")}
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
