import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Breadcrumbs,
  Link,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  ListItemIcon,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { countries } from '../../ultis/flags';

const settings = ["Profile", "Account", "Dashboard", "Logout"];

const drawerWidth = 240;

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorElNotification, setAnchorElNotification] = React.useState<null | HTMLElement>(null);
  const [anchorElLanguage, setAnchorElLanguage] = React.useState<null | HTMLElement>(null);

  const handleOpenLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElLanguage(event.currentTarget);
  };

  const handleCloseLanguageMenu = () => {
    setAnchorElLanguage(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotification(event.currentTarget);
  };

  const handleCloseNotificationMenu = () => {
    setAnchorElNotification(null);
  };

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    handleCloseLanguageMenu();
  };

  let pageTitle;
  let breadcrumb;

  switch (location.pathname) {
    case "/":
      pageTitle = t("pageTitle.home");
      breadcrumb = [{ label: t("breadcrumb.home"), path: "/" }];
      break;
    case "/dashboard":
      pageTitle = t("pageTitle.dashboard");
      breadcrumb = [
        { label: t("breadcrumb.home"), path: "/" },
        { label: t("breadcrumb.dashboard"), path: "/dashboard" },
      ];
      break;
    case "/user":
      pageTitle = t("pageTitle.user");
      breadcrumb = [
        { label: t("breadcrumb.home"), path: "/" },
        { label: t("breadcrumb.user"), path: "/user" },
      ];
      break;
    case "/settings":
      pageTitle = t("pageTitle.settings");
      breadcrumb = [
        { label: t("breadcrumb.home"), path: "/" },
        { label: t("breadcrumb.settings"), path: "/settings" },
      ];
      break;
    default:
      pageTitle = t("pageTitle.home");
      breadcrumb = [{ label: t("breadcrumb.home"), path: "/" }];
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: `calc(100% - ${drawerWidth}px)`,
        backgroundColor: "#fefefe",
        boxShadow: "0",
        borderBottom: "1px solid #f0eeee",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" noWrap component="div" color="#000">
            {pageTitle}
          </Typography>
          <Breadcrumbs sx={{ display: "flex" }}>
            {breadcrumb.map((crumb, index) =>
              index === breadcrumb.length - 1 ? (
                <Typography key={crumb.label} sx={{ fontSize: "0.875rem" }}>
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.label}
                  color="inherit"
                  sx={{ color: "#67adf3", fontSize: "0.875rem" }}
                  href={crumb.path}
                >
                  {crumb.label}
                </Link>
              )
            )}
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            size="large"
            aria-label="choose language"
            onClick={handleOpenLanguageMenu}
            sx={{ p: 0 }}
          >
            <Avatar
              alt="Language"
              sx={{ width: 35, height: 35, border: '1px solid #f0f0f0' }}
              src={countries.find((country) => country.code === i18n.language)?.flag}
            />
          </IconButton>
          <Menu
            sx={{ mt: "45px" }}
            id="language-menu"
            anchorEl={anchorElLanguage}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElLanguage)}
            onClose={handleCloseLanguageMenu}
          >
            {countries.map((country) => (
              <MenuItem key={country.code} onClick={() => handleChangeLanguage(country.code)}>
                <ListItemIcon>
                  <img src={country.flag} alt={country.name} style={{ width: 25, height: 17, border: '1px solid #f0f0f0', resize: 'vertical' }} />
                </ListItemIcon>
                <Typography sx={{ marginLeft: 1 }}>
                  {country.name}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            onClick={handleOpenNotificationMenu}
          >
            <Badge badgeContent={17} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            sx={{ mt: "45px" }}
            id="notification-menu"
            anchorEl={anchorElNotification}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElNotification)}
            onClose={handleCloseNotificationMenu}
          >
            <Box sx={{ width: 300, padding: 2 }}>
              <Typography variant="h6" sx={{ marginBottom: 1 }}>
                Notifications
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />
              <Box>
                <Typography variant="subtitle1">New Admin Alert</Typography>
                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                  System update required. Please check your settings.
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption">Admin</Typography>
                  <Typography variant="caption">13/01/2026</Typography>
                </Box>
              </Box>
              <Divider sx={{ marginBottom: 2 }} />
            </Box>
          </Menu>

          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" sx={{ width: 35, height: 35 }} src="/static/images/avatar/2.jpg" />
            </IconButton>
          </Tooltip>

          <Menu
            sx={{ mt: "45px" }}
            id="user-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={handleCloseUserMenu}>
                <Typography sx={{ textAlign: "center" }}>{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
