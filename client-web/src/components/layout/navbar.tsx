import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import SubscriptionsRoundedIcon from "@mui/icons-material/SubscriptionsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import {
  Backdrop,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import useDropdown from "../../hooks/useDropdown";
import { languageOptions } from "../../ultis/languageOptions";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAppAuth } from "../../contexts/useAppAuth";
import { useUpdateUser } from "../../api/users";
import { useInfiniteNotifications } from "../../api/notifications";

const navLinks = [
  { key: "nav.home", to: "/", iconOnly: true },
  { key: "nav.plan", to: "/plan" },
  { key: "nav.sessions", to: "/sessions" },
];

const paymentMenuLinks = [
  {
    key: "nav.invoices",
    defaultValue: "Hóa đơn",
    to: "/invoices",
    icon: <ReceiptLongIcon fontSize="small" />,
  },
  {
    key: "nav.transactions",
    defaultValue: "Lịch sử giao dịch",
    to: "/transactions",
    icon: <RequestQuoteIcon fontSize="small" />,
  },
];

const accountMenuLinks = [
  {
    key: "nav.vehicles",
    defaultValue: "Phương tiện",
    to: "/profile/vehicles",
    icon: <DirectionsCarRoundedIcon fontSize="small" />,
  },
  {
    key: "nav.subscriptions",
    defaultValue: "Gói đã đăng ký",
    to: "/profile/subscriptions",
    icon: <SubscriptionsRoundedIcon fontSize="small" />,
  },
  {
    key: "nav.profile",
    defaultValue: "Hồ sơ cá nhân",
    to: "/profile",
    icon: <PersonIcon fontSize="small" />,
  },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const languageDropdown = useDropdown();
  const notificationDropdown = useDropdown();
  const profileDropdown = useDropdown();
  const location = useLocation();

  const isMobile = useMediaQuery("(max-width:900px)");

  const [isLanguageChanging, setLanguageChanging] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const currentLanguage = React.useMemo(
    () =>
      languageOptions.find((option) => option.code === i18n.language) ??
      languageOptions[0],
    [i18n.language],
  );

  const { user, logout, patchUser } = useAppAuth();
  const userName =
    user?.full_name ?? t("nav.userName", { defaultValue: "User" });
  const userRole =
    user?.user_code ?? t("nav.userRole", { defaultValue: "User" });
  const { mutateAsync: updateUserLanguage } = useUpdateUser();

  const handleLanguageToggle = () => {
    profileDropdown.close();
    notificationDropdown.close();
    setDrawerOpen(false);
    languageDropdown.toggle();
  };

  const handleNotificationToggle = () => {
    languageDropdown.close();
    profileDropdown.close();
    setDrawerOpen(false);
    notificationDropdown.toggle();
  };

  const handleProfileToggle = () => {
    languageDropdown.close();
    notificationDropdown.close();
    setDrawerOpen(false);
    profileDropdown.toggle();
  };

  const handleDrawerToggle = () => {
    languageDropdown.close();
    notificationDropdown.close();
    profileDropdown.close();
    setDrawerOpen((open) => !open);
  };

  const handleLanguageSelect = async (code: string) => {
    if (isLanguageChanging) return;
    if (code === i18n.language) {
      languageDropdown.close();
      return;
    }

    languageDropdown.close();
    setLanguageChanging(true);

    try {
      await i18n.changeLanguage(code);

      if (user) {
        await updateUserLanguage({
          userCode: user.user_code,
          payload: {
            language_use: code,
          },
          skipInvalidate: true,
        });

        patchUser({ language_use: code });
      }
    } catch (err) {
      console.error("Failed to persist language change", err);
    } finally {
      setLanguageChanging(false);
    }
  };

  const handleLogout = async () => {
    profileDropdown.close();
    setDrawerOpen(false);
    await logout();
  };

  const notificationsQuery = useInfiniteNotifications(10, Boolean(user));
  const notifications = React.useMemo(() => {
    const pages = notificationsQuery.data?.pages ?? [];
    return pages
      .flat()
      .filter((item) => !item.deleted_at)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [notificationsQuery.data]);
  const unreadCount = React.useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  const notificationScrollDebounceRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const handleNotificationScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (
      !notificationsQuery.hasNextPage ||
      notificationsQuery.isFetchingNextPage
    )
      return;

    const el = event.currentTarget;
    if (notificationScrollDebounceRef.current) {
      clearTimeout(notificationScrollDebounceRef.current);
    }

    notificationScrollDebounceRef.current = setTimeout(() => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
      if (
        nearBottom &&
        notificationsQuery.hasNextPage &&
        !notificationsQuery.isFetchingNextPage
      ) {
        notificationsQuery
          .fetchNextPage()
          .catch((err) =>
            console.error("Failed to load more notifications", err),
          );
      }
    }, 120);
  };

  return (
    <>
      <Backdrop
        open={isLanguageChanging}
        sx={{
          zIndex: 9999,
          color: "#fff",
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            background: "#ffffff",
            color: "#0f172a",
            px: 4,
            py: 3,
            borderRadius: 3,
            minWidth: 280,
            boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              border: "4px solid #dbeafe",
              borderTop: "4px solid #1846ff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t("common.changingLanguage", {
              defaultValue: "Đang thay đổi ngôn ngữ...",
            })}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#475569", textAlign: "center" }}
          >
            {t("common.pleaseWait", {
              defaultValue: "Vui lòng chờ trong giây lát.",
            })}
          </Typography>
        </Stack>
      </Backdrop>

      <Box className="top-navbar">
        <Box className="ps-container top-navbar-inner">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className="top-navbar-row"
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              className="top-navbar-left"
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                className="top-navbar-phone"
              >
                <PhoneInTalkRoundedIcon fontSize="small" />
                <Typography variant="body2" className="top-navbar-text">
                  +84 (0321) 371 3081
                </Typography>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                className="top-navbar-social"
              >
                <IconButton
                  className="top-navbar-icon"
                  size="small"
                  component="a"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FacebookRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  className="top-navbar-icon"
                  size="small"
                  component="a"
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <YouTubeIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            <Box
              ref={languageDropdown.containerRef}
              className="dropdown-container"
            >
              <Button
                className="language-select top"
                onClick={handleLanguageToggle}
                variant="text"
                disabled={isLanguageChanging}
                startIcon={
                  <Box
                    component="img"
                    src={currentLanguage.flag}
                    alt={currentLanguage.name}
                    className="language-flag"
                  />
                }
                endIcon={<KeyboardArrowDownIcon fontSize="small" />}
              >
                <Typography variant="body2" className="language-select-text">
                  {currentLanguage.name}
                </Typography>
              </Button>

              {languageDropdown.open && (
                <Box className="dropdown-panel dropdown-panel--language">
                  {languageOptions.map((option) => {
                    const isSelected = option.code === currentLanguage.code;
                    return (
                      <Button
                        key={option.code}
                        fullWidth
                        className={`dropdown-language-item ${isSelected ? "dropdown-language-item--selected" : ""}`}
                        onClick={() => handleLanguageSelect(option.code)}
                        disabled={isLanguageChanging}
                        sx={{
                          color: "#0f172a",
                          textTransform: "none",
                          justifyContent: "flex-start",
                          display: "flex",
                        }}
                      >
                        <Box
                          component="img"
                          src={option.flag}
                          alt={option.name}
                          className="language-flag"
                        />
                        <Typography variant="body2">{option.name}</Typography>
                      </Button>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box className="primary-navbar">
        <Box className="ps-container navbar-inner">
          <Stack
            className="navbar-content"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Link
              component={RouterLink}
              className="navbar-logo-block"
              to="/"
              underline="none"
            >
              <Box
                component="img"
                src={`${isMobile ? '/Logo.svg' : '/logo-wide.png'}`}
                alt="school logo"
                className="navbar-logo"
              />
            </Link>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              className="nav-actions"
            >
              <Box
                ref={notificationDropdown.containerRef}
                className="dropdown-container"
              >
                <IconButton
                  className="notification-button"
                  onClick={handleNotificationToggle}
                  disabled={isLanguageChanging}
                  aria-label={t("nav.notifications", {
                    defaultValue: "Thông báo",
                  })}
                >
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={unreadCount === 0}
                  >
                    <NotificationsRoundedIcon />
                  </Badge>
                </IconButton>

                {notificationDropdown.open && (
                  <Box className="dropdown-panel dropdown-panel--notifications">
                    <Box className="notification-header">
                      <Typography
                        variant="body2"
                        className="notification-title"
                      >
                        {t("nav.notifications", { defaultValue: "Thông báo" })}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="notification-subtitle"
                      >
                        {t("nav.unread", {
                          defaultValue: "{{count}} mới",
                          count: unreadCount,
                        })}
                      </Typography>
                    </Box>

                    <Box
                      className="notification-list"
                      onScroll={handleNotificationScroll}
                    >
                      {notificationsQuery.isLoading ? (
                        <Typography
                          variant="body2"
                          className="notification-empty"
                        >
                          {t("common.loading", { defaultValue: "Loading..." })}
                        </Typography>
                      ) : notifications.length === 0 ? (
                        <Typography
                          variant="body2"
                          className="notification-empty"
                        >
                          {t("nav.noNotifications", {
                            defaultValue: "Chưa có thông báo.",
                          })}
                        </Typography>
                      ) : (
                        notifications.map((item) => (
                          <Box
                            key={item.id}
                            className={`notification-item ${item.is_read ? "" : "is-unread"}`}
                          >
                            <Box className="notification-item-top">
                              <Typography
                                variant="body2"
                                className="notification-item-title"
                              >
                                {item.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="notification-item-time"
                              >
                                {new Date(item.created_at).toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              className="notification-item-desc"
                            >
                              {item.content}
                            </Typography>
                          </Box>
                        ))
                      )}

                      {notificationsQuery.isFetchingNextPage && (
                        <Typography
                          variant="caption"
                          className="notification-empty"
                        >
                          {t("common.loading", { defaultValue: "Loading..." })}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>

              {isMobile ? (
                <>
                  <IconButton
                    className="menu-button"
                    onClick={handleDrawerToggle}
                    disabled={isLanguageChanging}
                    aria-label={t("nav.menu", { defaultValue: "Menu" })}
                  >
                    <MenuIcon />
                  </IconButton>

                  <Drawer
                    anchor="right"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    PaperProps={{ className: "nav-drawer" }}
                  >
                    <Box className="nav-drawer-head">
                      <Typography variant="body2" className="nav-drawer-name">
                        {userName}
                      </Typography>
                      <Typography variant="caption" className="nav-drawer-role">
                        {userRole}
                      </Typography>
                    </Box>

                    <Divider />

                    <List className="nav-drawer-list">
                      {navLinks.map((link) => (
                        <ListItemButton
                          key={link.key}
                          component={RouterLink}
                          to={link.to}
                          onClick={() => setDrawerOpen(false)}
                          selected={location.pathname === link.to}
                          disabled={isLanguageChanging}
                        >
                          <ListItemText primary={t(link.key)} />
                        </ListItemButton>
                      ))}

                      {accountMenuLinks.map((link) => (
                        <ListItemButton
                          key={link.key}
                          component={RouterLink}
                          to={link.to}
                          onClick={() => setDrawerOpen(false)}
                          selected={location.pathname === link.to}
                          disabled={isLanguageChanging}
                        >
                          <ListItemText
                            primary={t(link.key, {
                              defaultValue: link.defaultValue,
                            })}
                          />
                        </ListItemButton>
                      ))}
                    </List>

                    <Divider />

                    <Box className="nav-drawer-footer">
                      <Button
                        className="nav-drawer-action nav-drawer-action--danger"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon fontSize="small" />}
                        fullWidth
                        disabled={isLanguageChanging}
                      >
                        {t("profile.logout")}
                      </Button>
                    </Box>
                  </Drawer>
                </>
              ) : (
                <Box
                  ref={profileDropdown.containerRef}
                  className="dropdown-container"
                >
                  <Button
                    className="user-select user-card"
                    onClick={handleProfileToggle}
                    variant="text"
                    endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                    disabled={isLanguageChanging}
                  >
                    <span className="user-select-content">
                      <span className="user-select-name">{userName}</span>
                      <span className="user-select-role">{userRole}</span>
                    </span>
                  </Button>

                  {profileDropdown.open && (
                    <Box className="dropdown-panel dropdown-panel--profile">
                      <Button
                        component={RouterLink}
                        to="/profile"
                        className="dropdown-profile-item"
                        startIcon={<PersonIcon fontSize="small" />}
                        sx={{
                          justifyContent: "flex-start",
                          color: "#0f172a",
                          textTransform: "none",
                        }}
                        fullWidth
                        disabled={isLanguageChanging}
                      >
                        {t("nav.profile")}
                      </Button>

                      <Button
                        className="dropdown-profile-item logout-button"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon fontSize="small" />}
                        sx={{
                          justifyContent: "flex-start",
                          color: "#0f172a",
                          textTransform: "none",
                          "&:hover": {
                            color: "red",
                          },
                        }}
                        fullWidth
                        disabled={isLanguageChanging}
                      >
                        {t("profile.logout")}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {!isMobile && (
        <Box className="service-navbar">
          <Box className="ps-container service-navbar-inner">
            <Box className="service-menu">
              {navLinks.map((link) => (
                <MuiLink
                  key={link.key}
                  component={RouterLink}
                  to={link.to}
                  underline="none"
                  className={`service-menu-link ${link.to === location.pathname ? "service-menu-link--active" : ""} ${
                    link.iconOnly ? "service-menu-home" : ""
                  }`}
                  sx={{ pointerEvents: isLanguageChanging ? "none" : "auto" }}
                  aria-label={t(link.key)}
                  color="#fff"
                >
                  {link.iconOnly ? (
                    <HomeRoundedIcon fontSize="small" />
                  ) : (
                    <Typography variant="body2" className="service-menu-text">
                      {t(link.key)}
                    </Typography>
                  )}
                </MuiLink>
              ))}

              <Box className="service-dropdown">
                <Button
                  className={`service-menu-button ${
                    paymentMenuLinks.some(
                      (link) => location.pathname === link.to,
                    )
                      ? "service-menu-button--active"
                      : ""
                  }`}
                  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                  disabled={isLanguageChanging}
                >
                  <PaymentsRoundedIcon fontSize="small" />
                  {t("nav.payments", {
                    defaultValue: "Hoá đơn & Lịch sử giao dịch",
                  })}
                </Button>

                <Box className="service-dropdown-panel">
                  {paymentMenuLinks.map((link) => (
                    <MuiLink
                      key={link.key}
                      component={RouterLink}
                      to={link.to}
                      underline="none"
                      className="service-dropdown-item"
                    >
                      {link.icon}
                      <Typography variant="body2">
                        {t(link.key, {
                          defaultValue: link.defaultValue,
                        })}
                      </Typography>
                    </MuiLink>
                  ))}
                </Box>
              </Box>

              <Box className="service-dropdown">
                <Button
                  className={`service-menu-button ${
                    accountMenuLinks.some(
                      (link) => location.pathname === link.to,
                    )
                      ? "service-menu-button--active"
                      : ""
                  }`}
                  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                  disabled={isLanguageChanging}
                >
                  <ManageAccountsRoundedIcon fontSize="small" />
                  {t("nav.management", { defaultValue: "Quản lý cá nhân" })}
                </Button>

                <Box className="service-dropdown-panel">
                  {accountMenuLinks.map((link) => (
                    <MuiLink
                      key={link.key}
                      component={RouterLink}
                      to={link.to}
                      underline="none"
                      className="service-dropdown-item"
                    >
                      {link.icon}
                      <Typography variant="body2">
                        {t(link.key, { defaultValue: link.defaultValue })}
                      </Typography>
                    </MuiLink>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
