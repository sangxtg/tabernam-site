'use client';

import { motion } from 'motion/react';

const ROW_1_IMAGES = [
  '/carousel/photo-03.jpg',
  '/carousel/photo-07.jpg',
  '/carousel/photo-11.jpg',
  '/carousel/photo-15.jpg',
  '/carousel/photo-19.jpg',
  '/carousel/photo-23.jpg',
];

const ROW_2_IMAGES = [
  '/carousel/photo-05.jpg',
  '/carousel/photo-09.jpg',
  '/carousel/photo-13.jpg',
  '/carousel/photo-17.jpg',
  '/carousel/photo-21.jpg',
  '/carousel/photo-25.jpg',
];

const ROW_3_IMAGES = [
  '/carousel/photo-01.jpg',
  '/carousel/photo-04.jpg',
  '/carousel/photo-12.jpg',
  '/carousel/photo-16.jpg',
  '/carousel/photo-22.jpg',
  '/carousel/photo-28.jpg',
];

export default function HomeMarquee() {
  return (
    <motion.section
      className="home-marquee w-full flex flex-col gap-5 py-[60px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] }}
    >
      <div className="marquee">
        <div className="marquee-track marquee-track--right" aria-hidden="true">
          {[...ROW_1_IMAGES, ...ROW_1_IMAGES].map((src, i) => (
            <div key={`row1-${i}`} className="marquee-cell bg-gray-70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
      <div className="marquee">
        <div className="marquee-track marquee-track--left" aria-hidden="true">
          {[...ROW_2_IMAGES, ...ROW_2_IMAGES].map((src, i) => (
            <div key={`row2-${i}`} className="marquee-cell bg-gray-70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
      <div className="marquee">
        <div
          className="marquee-track marquee-track--right"
          style={{ animationDelay: '-20s' }}
          aria-hidden="true"
        >
          {[...ROW_3_IMAGES, ...ROW_3_IMAGES].map((src, i) => (
            <div key={`row3-${i}`} className="marquee-cell bg-gray-70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
