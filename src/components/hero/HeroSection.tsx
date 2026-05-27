'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts } from '@/lib/directus';

interface Props {
  texts?: PageTexts;
}

const SLIDES = [
  '/carousel/photo-08.jpg',
  '/carousel/photo-20.jpg',
  '/carousel/photo-22.jpg',
];

const SLIDE_INTERVAL = 3000;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function HeroSection(_props: Props) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="hero max-sm:!px-0"
      style={{
        height: '100vh',
        paddingTop: 'calc(var(--header-height) + 20px)',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '20px',
      }}
    >
      <div className="hero-inner relative w-full h-full flex flex-col items-center justify-center text-center gap-10 px-10 max-sm:gap-8 max-sm:py-16 overflow-hidden rounded-2xl">
        <AnimatePresence initial={false}>
          <motion.div
            key={SLIDES[activeIndex]}
            initial={{ x: '100%', scale: 0.85, opacity: 0 }}
            animate={{ x: '0%', scale: 1, opacity: 1 }}
            exit={{ x: '-100%', scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(10,15,25,0.5), rgba(10,15,25,0.5)), url('${SLIDES[activeIndex]}')`,
            }}
          />
        </AnimatePresence>

        <div className="hero-headline relative z-10 flex flex-col gap-[30px] max-w-[65vw] w-full mx-auto max-[1100px]:max-w-[80vw] max-[1100px]:gap-5 max-sm:max-w-none max-sm:gap-4">
          <motion.h1
            className="text-[64px] font-bold tracking-[-0.04em] leading-[72px] text-white max-[1100px]:text-[40px] max-md:text-[32px] max-sm:text-[30px]"
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Four decades of foreign trade. A trusted bridge between{' '}
            <span className="text-white">Slovakia and China.</span>
          </motion.h1>
          <motion.p
            className="text-xl font-medium leading-snug text-white max-w-[50vw] w-full mx-auto max-[1100px]:text-lg max-[1100px]:max-w-[70vw] max-md:text-base max-sm:text-base max-sm:max-w-none"
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Helping Slovakia leaders enter, scale and reposition in China and beyond, guided by the kind of judgement that only comes from doing the work, year after year.
          </motion.p>
        </div>
        <motion.button
          type="button"
          className="btn relative z-10 inline-flex items-center justify-center bg-brand text-white text-base font-medium px-6 py-3 rounded-lg border-0 w-max cursor-pointer font-[inherit] transition-[background,transform] duration-200 hover:brightness-110 hover:-translate-y-px"
          custom={0.35}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {t('btn.exploreNow')}
        </motion.button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-1 rounded-full bg-white transition-all duration-300 ${
                idx === activeIndex ? 'w-10 opacity-100' : 'w-5 opacity-60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
