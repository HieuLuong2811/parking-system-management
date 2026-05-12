import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';

export default function HomePage() {
  const heroImages = ['/CS1.jpg', '/CS2.jpg', '/CS3.jpg'];
  const heroCarouselHeight = 'clamp(280px, 34vw, 520px)';

  const publicAsset = (fileName: string) => `${process.env.PUBLIC_URL}/${fileName}`.replace(/\/{2,}/g, '/');

  const introCards = [
    {
      title: 'Đăng ký nhanh',
      desc: 'Chọn gói gửi xe theo học kỳ hoặc năm học chỉ với vài bước.',
      icon: <DirectionsCarFilledRoundedIcon />,
    },
    {
      title: 'Thanh toán linh hoạt',
      desc: 'Hỗ trợ nhiều phương thức thanh toán an toàn và thuận tiện.',
      icon: <PaymentsRoundedIcon />,
    },
    {
      title: 'Kiểm soát thông minh',
      desc: 'Nhận diện biển số, quét QR và theo dõi lượt vào ra theo thời gian thực.',
      icon: <QrCode2RoundedIcon />,
    },
  ];

  type FeatureSection = {
    id: string;
    title: string;
    description: string;
    bullets?: string[];
    imageSrc: string;
    imageAlt: string;
    imageSide: 'left' | 'right';
    mobileCards?: { imageSrc: string; imageAlt: string; body: string }[];
  };

  const featureSections: FeatureSection[] = [
    {
      id: 'payment',
      title: 'Thanh toán',
      description: 'Thanh toán nhanh, an toàn và linh hoạt với nhiều lựa chọn.',
      bullets: ['Hỗ trợ Stripe (thẻ quốc tế)', 'Hỗ trợ MoMo', 'Lịch sử giao dịch minh bạch'],
      imageSrc: publicAsset('Stripe.jpg'),
      imageAlt: 'Thanh toán Stripe và MoMo',
      imageSide: 'right',
    },
    {
      id: 'checkin',
      title: 'Check-in / Check-out',
      description: 'Vào/ra bãi xe nhanh chóng bằng mã QR hoặc nhận diện biển số.',
      bullets: ['Quét mã QR tại cổng', 'Nhận diện biển số tự động', 'Theo dõi lượt vào/ra theo thời gian thực'],
      imageSrc: publicAsset('Checkin.jpg'),
      imageAlt: 'Check-in/out bằng camera',
      imageSide: 'left',
    },
    {
      id: 'web',
      title: 'Quản lý phương tiện trên website',
      description: 'Đăng ký gói gửi xe, quản lý phương tiện và theo dõi phiên gửi xe ngay trên web.',
      bullets: ['Quản lý danh sách phương tiện', 'Theo dõi phiên gửi xe', 'Tra cứu thông tin nhanh'],
      imageSrc: heroImages[0],
      imageAlt: 'Quản lý phương tiện trên website',
      imageSide: 'right',
    },
    {
      id: 'mobile',
      title: 'Quản lý trên mobile',
      description: 'Tổng quan rõ ràng, thao tác nhanh — tối ưu cho màn hình điện thoại.',
      imageSrc: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Quản lý trên mobile',
      imageSide: 'left',
      mobileCards: [
        {
          imageSrc: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'Lịch sử check-in / check-out',
          body: 'Quản lý lịch sử check-in / check-out',
        },
        {
          imageSrc: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'Quản lý phương tiện và thanh toán',
          body: 'Quản lý phương tiện và thanh toán',
        },
        {
          imageSrc: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'Quản lý hóa đơn',
          body: 'Quản lý hóa đơn',
        },
      ],
    },
  ];

  return (
    <Box className="home-page">
      <Paper elevation={0} className="home-hero-section">
        <Box className="home-hero-grid">
          <Box className="home-hero-content">
            <Typography className="home-chip">Hệ thống quản lý bãi đỗ xe thông minh</Typography>
            <Typography variant="h2" component="h1" className="home-hero-title">
              Parking UTEHY
            </Typography>
            <Typography variant="body1" className="home-hero-description">
              Giải pháp quản lý bãi đỗ xe hiện đại dành cho sinh viên, giảng viên và khách đến trường. Hỗ trợ đăng ký gói
              gửi xe, thanh toán, nhận diện phương tiện và kiểm soát ra vào hiệu quả.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="home-hero-actions">
              <Button variant="contained" size="large" className="home-primary-btn" href='/plan'>
                Đăng ký gửi xe
              </Button>
              <Button variant="outlined" size="large" className="home-secondary-btn" href='#features'>
                Tìm hiểu thêm
              </Button>
            </Stack>
          </Box>

          <Box className="home-hero-media">
            <Box className="home-hero-media-frame">
              <Carousel
                indicators={false}
                autoPlay
                interval={6000}
                animation="slide"
                navButtonsAlwaysInvisible
                height={heroCarouselHeight}
              >
                {heroImages.map((img, i) => (
                  <Box key={i} className="home-hero-slide">
                    <img src={img} alt={`Campus ${i + 1}`} className="home-hero-image" />
                  </Box>
                ))}
              </Carousel>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box className="home-section home-intro-section">
        <Box className="home-section-head two-col">
          <Box>
            <Typography variant="h4" fontWeight={600} className="section-title">
              Giới thiệu bãi đỗ xe
            </Typography>
          </Box>
          <Typography className="section-description">
            Bãi đỗ xe được xây dựng theo hướng số hóa quy trình quản lý, giúp giảm thời gian chờ, tăng độ chính xác khi kiểm
            soát phương tiện và nâng cao trải nghiệm cho người sử dụng.
          </Typography>
        </Box>

        <Box className="intro-card-grid">
          {introCards.map((item, index) => (
            <Paper key={index} elevation={0} className="intro-card">
              <Box className="intro-card-icon">{item.icon}</Box>
              <Typography variant="h6" className="intro-card-title">
                {item.title}
              </Typography>
              <Typography className="intro-card-desc">{item.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <Box className="home-section home-item-section" id="features">
        <Box className="home-section-title">
          <Typography variant="h3" className="section-title" fontWeight={600} textAlign="center">
            Tính năng nổi bật
          </Typography>
          <Typography className="section-description item-description" textAlign="center">
            Tách theo từng nhóm tính năng để dễ hiểu hơn (ảnh minh họa hiện là placeholder, bạn có thể thay sau).
          </Typography>
        </Box>

        <Stack spacing={2.5} className="home-feature-stack">
          {featureSections.map((section) => (
            <Paper key={section.id} elevation={0} className="home-feature-card">
              {section.id === 'mobile' ? (
                <Box className="home-mobile-feature">
                  <Box className="home-mobile-feature-head">
                    <Typography variant="h5" className="home-feature-title">
                      {section.title}
                    </Typography>
                    <Typography className="home-feature-desc">{section.description}</Typography>
                  </Box>

                  <Box className="home-mobile-shot-list">
                    {(section.mobileCards ?? []).map((card, index) => (
                      <Paper key={index} elevation={0} className="home-mobile-shot-card">
                        <Box className="home-mobile-shot-image">
                          <img src={card.imageSrc} alt={card.imageAlt} loading="lazy" />
                        </Box>
                        <Box className="home-mobile-shot-body">
                          <Typography className="home-mobile-shot-text">{card.body}</Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box
                  className={`home-feature-grid ${section.imageSide === 'left' ? 'is-image-left' : 'is-image-right'}`}
                >
                  <Box className="home-feature-text">
                    <Typography variant="h5" className="home-feature-title">
                      {section.title}
                    </Typography>
                    <Typography className="home-feature-desc">{section.description}</Typography>

                    {!!section.bullets?.length && (
                      <List className="home-feature-list">
                        {section.bullets.map((item, index) => (
                          <ListItem key={index} disableGutters className="home-feature-list-item">
                            <ListItemIcon className="home-feature-list-icon">
                              <CheckCircleRoundedIcon sx={{ color: 'rgb(58, 167, 109)' }}/>
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>

                  <Box className="home-feature-image">
                    <img src={section.imageSrc} alt={section.imageAlt} loading="lazy" />
                  </Box>
                </Box>
              )}
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
