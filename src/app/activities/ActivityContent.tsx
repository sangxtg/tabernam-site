'use client';

import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { getCityBySlug } from '@/lib/cities';
import type { PageTexts } from '@/lib/data';

interface Props {
  texts: PageTexts;
}

export default function ActivityContent({ texts: _texts }: Props) {
  const { t: _t } = useI18n();
  const params = useSearchParams();
  const id = params?.get('id') ?? '';
  const city = getCityBySlug(id);

  // Unknown / missing city — show a small fallback rather than Lorem Ipsum.
  if (!city) {
    return (
      <main className="w-[706px] max-w-[calc(100%-80px)] mx-auto pt-[109px] pb-[120px] flex flex-col gap-10">
        <h1 className="text-5xl font-medium text-text">City not found</h1>
        <p className="text-base leading-normal text-text">
          We couldn&apos;t find a city for <code>?id={id || '(empty)'}</code>. Try selecting one from the globe.
        </p>
      </main>
    );
  }

  const photos = city.photos ?? [];
  const secondary = photos[0];
  const gallery = photos.slice(1); // any remaining photos rendered as a strip below

  return (
    <main className="pt-[109px] pb-[120px] flex flex-col gap-10">
      {secondary && (
        <div className="w-full max-w-[1200px] mx-auto px-[var(--side-padding)]">
          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" src={secondary} alt={city.name} />
          </div>
        </div>
      )}

      <article className="w-[706px] max-w-[calc(100%-80px)] mx-auto flex flex-col gap-4">
        <h1 className="text-5xl font-medium text-text">{city.name}</h1>
        <p className="text-base leading-normal text-text">{city.desc}</p>

        {gallery.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {gallery.map((src) => (
              <div key={src} className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" src={src} alt={city.name} />
              </div>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
