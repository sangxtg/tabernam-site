'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';

interface Props {
  texts: PageTexts;
}

export default function AboutContent(_props: Props) {
  const { t } = useI18n();

  return (
    <main className="about-page px-[var(--side-padding)] pt-[calc(var(--header-height)+60px)] pb-24 max-w-[var(--max-width)] mx-auto">
      <FadeIn className="flex justify-center" delay={0.05}>
        <h1 className="text-[48px] leading-tight font-bold tracking-wider uppercase text-text py-[30px]">
          {t('heading.aboutMe')}
        </h1>
      </FadeIn>

      <div className="max-w-[620px] mx-auto mt-14 flex flex-col gap-10 text-center">
        <FadeIn delay={0.1}>
          <p className="text-base leading-relaxed text-text">
            I am glad that after my return from the diplomatic mission in China, where I worked as a diplomat for innovation, I can continue to work again in foreign trade with Asia, especially with China. After 30 years of experience in this area, I provide consulting for large companies and implement the investment interests of Chinese companies in Slovakia and also mutually in the opposite direction.
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-base leading-relaxed text-text">
            Based on experience in the corporate production environment and also my experience at the Ministry of Economy, many success stories were realized, if for example{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">this one</a>{' '}
            and many others. In international trade and investments, my team and I provide a comprehensive service for the entry of foreign entities into Slovakia.
          </p>
        </FadeIn>
      </div>

      <FadeIn className="mt-20" delay={0.2}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about/banner.jpeg"
          alt=""
          className="w-full aspect-[16/7] object-cover rounded-md"
        />
      </FadeIn>

      <div className="mt-20 grid grid-cols-[1fr_620px] gap-12 items-start max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <FadeIn delay={0.2} className="self-stretch max-[900px]:self-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about/charity.jpeg"
            alt=""
            className="w-full h-full aspect-square object-cover rounded-md max-[900px]:h-auto"
          />
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="text-base leading-relaxed text-text">
            I happily apply many benefits from international trade in charity. I am a member of the{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">International Order of the Knights of Malta</a>{' '}
            and the{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">International Lions Club</a>{' '}
            as well as{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">the German Club</a>.
          </p>
        </FadeIn>
      </div>

      <div className="mt-20 grid grid-cols-[620px_1fr] gap-12 items-start max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <FadeIn delay={0.2}>
          <p className="text-base leading-relaxed text-text">
            Large charity projects that I implement, such as The construction of a{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">hospital in Kenya</a>{' '}
            attracts many entrepreneurs and joins the good work. As a{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">member</a>{' '}
            of the GMT (Global Membership Team) responsible for all the countries of Central and Eastern Europe, I personally participated in the creation of an international activity for the development of world charity under the{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">auspices of LCIF</a>{' '}
            during 2008 at the American headquarters of LCI in the city of Oak Brook, ILLINOIS.
          </p>
        </FadeIn>
        <FadeIn delay={0.25} className="self-stretch max-[900px]:self-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about/projects.jpeg"
            alt=""
            className="w-full h-full aspect-[3/4] object-cover rounded-md max-[900px]:h-auto"
          />
        </FadeIn>
      </div>

      <div className="max-w-[620px] mx-auto mt-20 text-center">
        <FadeIn delay={0.2}>
          <p className="text-base leading-relaxed text-text">
            Great support as a subsequent charitable act of investors can also be seen in helping the sick, such as The trip to Lourdes, which I carried out over two years with my team in{' '}
            <a href="#" className="underline underline-offset-2 hover:text-brand">2015–16</a>. Yes, charity work is part of my activities for those who are in great need. Those who have more have a moral obligation to help those in need.
          </p>
        </FadeIn>
      </div>

      <div className="mt-28 -mx-[calc(50vw-50%)] -mb-[176px] bg-dark px-6 py-[120px] max-md:py-16">
        <FadeIn className="max-w-[620px] mx-auto text-center flex flex-col items-center gap-6" delay={0.2}>
          <h2 className="text-[36px] leading-tight font-bold tracking-tight !text-white max-md:text-[28px]">
            Let&apos;s build the next chapter together.
          </h2>
          <p className="text-base leading-relaxed !text-white/80">
            Whether you&apos;re entering China, scaling there, or bringing a Chinese partner into Slovakia — start the conversation.
          </p>
          <Link
            href="/contact"
            className="btn inline-flex items-center justify-center bg-brand !text-white text-base font-medium px-6 py-3 rounded-lg border-0 w-max cursor-pointer font-[inherit] transition-[background,transform] duration-200 hover:brightness-110 hover:-translate-y-px"
          >
            Get in touch
          </Link>
        </FadeIn>
      </div>
    </main>
  );
}
