'use client';

import { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import type { PageTexts, Feature } from '@/lib/directus';

interface Props {
  texts?: PageTexts;
  features?: Feature[];
}

const QUOTE_EN = 'Trade is not a transaction. It is a relationship — built across decades, sustained through trust, and measured by what endures long after the contract is signed.';
const QUOTE_ZH = '贸易不是一笔交易。它是一种关系——跨越数十年建立，通过信任维持，并以合同签署后仍然持续的事物来衡量。';

function RevealChar({
  progress,
  start,
  end,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  children: React.ReactNode;
}) {
  const color = useTransform(
    progress,
    [start, end],
    ['var(--color-surface)', 'var(--brand)']
  );
  return <motion.span style={{ color }}>{children}</motion.span>;
}

export default function QuoteSection(_props: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const enChars = useMemo(() => [...QUOTE_EN], []);
  const zhChars = useMemo(() => [...QUOTE_ZH], []);

  const enLen = enChars.length;
  const zhLen = zhChars.length;
  const overlap = 6;
  const totalSlots = enLen + zhLen + overlap;

  return (
    <section ref={sectionRef} className="quote relative w-full" style={{ height: '250vh' }}>
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-[var(--side-padding)]">
        <div className="flex flex-col gap-[30px] w-[70vw] max-w-[900px] mx-auto text-center max-[1100px]:w-full max-[1100px]:max-w-none">
          <p className="text-[36px] font-medium leading-snug max-[1100px]:text-[28px]">
            {enChars.map((ch, i) => (
              <RevealChar
                key={`en-${i}`}
                progress={scrollYProgress}
                start={i / totalSlots}
                end={(i + overlap) / totalSlots}
              >
                {ch}
              </RevealChar>
            ))}
          </p>
          <p
            className="text-[24px] font-light leading-relaxed max-[1100px]:text-[20px]"
            style={{ fontFamily: 'var(--font-dm-sans), var(--font-noto-sc), sans-serif' }}
          >
            {zhChars.map((ch, i) => (
              <RevealChar
                key={`zh-${i}`}
                progress={scrollYProgress}
                start={(enLen + i) / totalSlots}
                end={(enLen + i + overlap) / totalSlots}
              >
                {ch}
              </RevealChar>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
