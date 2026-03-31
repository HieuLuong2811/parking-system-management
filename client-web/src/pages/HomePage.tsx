import { Box, Button, Typography, Paper } from '@mui/material';
// import { useTranslation } from 'react-i18next';
import Carousel from 'react-material-ui-carousel';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  // const { t } = useTranslation();
  const navigate = useNavigate();

  const campusImages = ['/CS1.jpg', '/CS2.jpg', '/CS3.jpg'];

  const features = [
    {
      title: 'Đăng ký gói gửi xe',
      desc: 'Đăng ký gói gửi xe theo học kỳ hoặc cả năm',
      img: 'https://source.unsplash.com/600x400/?calendar,schedule',
    },
    {
      title: 'Quản lý phương tiện dễ dàng',
      desc: 'Thêm/xóa xe, cập nhật thông tin phương tiện.',
      img: 'https://source.unsplash.com/600x400/?car,registration',
    },
    {
      title: 'Thanh toán linh hoạt & an toàn',
      desc: 'Hỗ trợ chuyển khoản, ví điện tử, tự động gia hạn.',
      img: 'https://source.unsplash.com/600x400/?mobile-payment,smartphone',
    },
    {
      title: 'Check-in / Check-out thông minh',
      desc: 'Nhận diện biển số tự động hoặc quét mã QR điện tử.',
      img: '/QRcode.jpg',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 8, md: 10 },
      }}
    >

      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(23, 83, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            height: { md: 500 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: { xs: 4, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              gutterBottom
              sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.1 }}
            >
              Hệ thống bãi đỗ xe thông minh
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 480 }}
            >
              Quản lý chỗ đỗ tiện lợi, an toàn, tiết kiệm thời gian cho sinh viên, giảng viên và nhân viên.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{ p: 2, fontSize: '1.2rem' }}
                onClick={() => navigate('/profile')}
              >
                Đăng nhập ngay
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, position: 'relative', minHeight: { xs: 300 } }}>
            <Carousel
              indicators={false}
              autoPlay
              interval={5000}
              animation="slide"
              navButtonsAlwaysInvisible
            >
              {campusImages.map((img, i) => (
                <Box key={i} sx={{ height: '100%' }}>
                  <img
                    src={img}
                    alt={`Cơ sở ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Carousel>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Sử dụng hệ thống cực kỳ đơn giản
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'flex-start',
            my: 4,
          }}
        >
          {features.map((feature, index) => (
            <Paper
              key={index}
              sx={{
                p: 3,
                flex: '1 1 260px',
                maxWidth: 400,
                borderRadius: 4,
                boxShadow: 4,
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-12px)', boxShadow: 12 },
              }}
            >
              <Box
                component="img"
                src={feature.img}
                alt={feature.title}
                sx={{
                  width: '100%',
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 3,
                  mb: 2,
                }}
              />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
