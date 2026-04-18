import { Box, Link, Typography } from '@mui/material';
import { AccessTime, Call, LocationOn } from '@mui/icons-material';

const branches = [
  {
    title: 'Trụ sở chính',
    address: 'Xã Việt Tiến, Tỉnh Hưng Yên',
    phone: '+84 0321 371 3081 . 0221 3689 888',
  },
  {
    title: 'Cơ sở Mỹ Hào',
    address: 'Thị xã Mỹ Hào, tỉnh Hưng Yên',
    phone: '+84 0321 374 2076 . 0221 3689 555',
  },
  {
    title: 'Cơ sở Hải Phòng',
    address: 'Phường Lê Thanh Nghĩa, TP Hải Phòng',
    phone: '+84 0320 389 4540 . 0221 3689 333',
  },
];

const Footer = () => {
  return (
    <Box component="footer" className="footer">
      <Box className="footer-top">
        <Box className="footer-container">

          {/* LEFT */}
          <Box className="footer-left">
            <img src="/Logo.svg" className="footer-logo" alt="UTEHY logo" />
            <Typography className="footer-desc">
              Hệ thống quản lý gửi xe cho sinh viên
            </Typography>

            <Typography className="footer-contact">
              +84 (0321) 371 3081
            </Typography>
            <Typography className="footer-contact">
              dhspkt@utehy.edu.vn
            </Typography>
          </Box>

          {/* RIGHT */}
          <Box className="footer-right">
            {branches.map((b) => (
              <Box key={b.title} className="footer-col">
                <Typography className="footer-col-title">
                  {b.title}
                </Typography>

               <Box className="footer-item-row">
                  <LocationOn className="footer-icon" />
                  <Typography className="footer-item">
                    {b.address}
                  </Typography>
                </Box>

                <Box className="footer-item-row">
                  <Call className="footer-icon" />
                  <Typography className="footer-item">
                    {b.phone}
                  </Typography>
                </Box>

                <Box className="footer-item-row">
                  <AccessTime className="footer-icon" />
                  <Typography className="footer-item">
                    Thứ 2 – Thứ 7 · 07:30 – 17:30
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* BOTTOM */}
      <Box className="footer-bottom">
        <Typography>
          © {new Date().getFullYear()} UTEHY
        </Typography>

        <Box className="footer-links">
          <Link>Privacy</Link>
          <Link>Accessibility</Link>
          <Link>Contact</Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
