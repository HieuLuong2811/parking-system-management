import { Box, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AccessTime, Call, LocationOn, Email } from "@mui/icons-material";

const branches = [
  {
    key: "main",
    phone: "+84 0321 371 3081 . 0221 3689 888",
  },
  {
    key: "myHao",
    phone: "+84 0321 374 2076 . 0221 3689 555",
  },
  {
    key: "haiPhong",
    phone: "+84 0320 389 4540 . 0221 3689 333",
  },
];

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box component="footer" className="footer">
      <Box className="footer-top">
        <Box className="footer-container ps-container">
          <Box className="footer-left">
            <img
              src="/Logo.svg"
              className="footer-logo"
              alt={t("footer.logoAlt")}
            />

            <Box className="footer-contact-row">
              <Call className="footer-icon" fontSize="small" />
              <Typography className="footer-contact" fontSize={14} lineHeight={0}>
                +84 (0321) 371 3081
              </Typography>
            </Box>

            <Box className="footer-contact-row">
              <Email className="footer-icon" fontSize="small" />
              <Typography className="footer-contact" fontSize={14} lineHeight={0}>
                dhspkt@utehy.edu.vn
              </Typography>
            </Box>
          </Box>

          <Box className="footer-right">
            {branches.map((branch) => (
              <Box key={branch.key} className="footer-col">
                <Typography
                  className="footer-col-title"
                  fontWeight={600}
                  mb={1}
                >
                  {t(`footer.branches.${branch.key}.title`)}
                </Typography>

                <Box className="footer-item-row">
                  <LocationOn className="footer-icon" fontSize="small" />
                  <Typography className="footer-item" fontSize={14}>
                    {t(`footer.branches.${branch.key}.address`)}
                  </Typography>
                </Box>

                <Box className="footer-item-row">
                  <Call className="footer-icon" fontSize="small" />
                  <Typography className="footer-item" fontSize={14}>
                    {branch.phone}
                  </Typography>
                </Box>

                <Box className="footer-item-row">
                  <AccessTime className="footer-icon" fontSize="small" />
                  <Typography className="footer-item" fontSize={14}>
                    {t("footer.workingHours")}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box className="footer-bottom ps-container">
        <Typography fontSize={14}>
          © {new Date().getFullYear()} {t("footer.description")}
        </Typography>

        <Box className="footer-links">
          <Link>{t("footer.links.privacy")}</Link>
          <Link>{t("footer.links.accessibility")}</Link>
          <Link>{t("footer.links.contact")}</Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
