import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../styles/HeroCarousel.css';

const slides = [
  {
    title: 'Master Web Development with CodeTapasya',
    subtitle: 'Your journey to becoming a full-stack developer starts here.',
  },
  {
    title: 'Programming Languages',
    subtitle: 'Learn Python, Java, C, and more!',
  },
  {
    title: 'Access Real-Time Projects',
    subtitle: 'Work on real-world projects as you learn.',
  },
  {
    title: 'Connect with CT AI',
    subtitle: 'Get instant guidance from CodeTapasya AI.',
  },
];

const HeroCarousel = () => (
  <Carousel
    autoPlay
    infiniteLoop
    showThumbs={false}
    showStatus={false}
    showArrows={false}
    showIndicators={true}
    interval={4000}
    swipeable
    emulateTouch
    transitionTime={600}
    className="hero-carousel"
  >{slides.map((slide, idx) => (
      <div key={idx} className="carousel-slide">
        <div className="carousel-text">
          <h1>{slide.title}</h1>
          <p>{slide.subtitle}</p>
        </div>
      </div>
    ))}
  </Carousel>
);

export default HeroCarousel;