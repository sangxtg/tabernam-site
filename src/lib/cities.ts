// Single source of truth for city data used by both the globe section
// (src/components/activity/GlobeActivitySection.tsx) and the per-city detail
// page (src/app/activities/ActivityContent.tsx).

export interface City {
  /** City name shown as the card title and the pin label. */
  name: string;
  /** Latitude — where the pin and camera-focus point sit. */
  lat: number;
  /** Longitude. */
  lng: number;
  /** Short narrative paragraph that opens the card body and the detail page. */
  desc: string;
  /** Camera altitude when this city is focused on the globe. Smaller = closer/zoomed in. */
  altitude: number;
  /** Optional curated carousel photos. When omitted on the globe, 5 random
   *  photos are picked from /carousel/photo-XX.jpg. */
  photos?: string[];
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const CITIES: City[] = [
  { name: 'Shanghai',   lat: 31.2304, lng: 121.4737, altitude: 0.5, desc: 'The skyline that announced modern China to the world. Pudong has been the setting for some of the most consequential negotiations of my career — fast, formal, and unforgiving of unprepared visitors.', photos: ['/cities/shanghai/1.jpeg', '/cities/shanghai/2.jpeg', '/cities/shanghai/3.jpeg', '/cities/shanghai/4.jpeg', '/cities/shanghai/5.jpeg'] },
  { name: 'Beijing',    lat: 39.9042, lng: 116.4074, altitude: 0.5, desc: "Where every meaningful negotiation eventually leads. Beijing's rhythm is patient, hierarchical, and rewards relationships built over decades — not deals built overnight.", photos: ['/cities/beijing/1.jpeg', '/cities/beijing/2.jpeg', '/cities/beijing/3.jpeg', '/cities/beijing/4.jpeg'] },
  { name: 'Guangzhou',  lat: 23.1291, lng: 113.2644, altitude: 0.5, desc: "Centuries of merchant trading heritage compressed into one city. Deals here move quickly, but only after the people across the table have decided you're worth their time." },
  { name: 'Chengdu',    lat: 30.5728, lng: 104.0668, altitude: 1.0, desc: 'Patient relationship-building in western China. Business in Chengdu unfolds over tea, meals and long walks — never slide decks.' },
  { name: 'Chongqing',  lat: 29.5630, lng: 106.5516, altitude: 1.0, desc: 'A mountain-and-river crossroads where industrial scale meets old-world bargaining instincts. Few visitors leave without changing their view of inland China.' },
  { name: 'Shenzhen',   lat: 22.5429, lng: 114.0596, altitude: 0.5, desc: 'Innovation acceleration engine of the south. Shenzhen demands sustained engagement — partners here remember who showed up early and who stayed.' },
  { name: 'Tianjin',    lat: 39.3434, lng: 117.3616, altitude: 0.5, desc: "Beijing's port and rehearsal stage. Many strategic conversations begin in Tianjin before they ever reach the capital." },
  { name: "Xi'an",      lat: 34.3416, lng: 108.9398, altitude: 1.0, desc: "Silk Road heritage anchors every conversation here. Xi'an reminds you that trade between Europe and Asia is older than most national borders." },
  { name: 'Hangzhou',   lat: 30.2741, lng: 120.1551, altitude: 0.5, desc: "Incubator of national-scale private enterprise. The lake city quietly produced China's most consequential consumer-tech founders." },
  { name: 'Foshan',     lat: 23.0218, lng: 113.1219, altitude: 0.5, desc: 'Workshop city of the Pearl River Delta. Foshan rewards buyers who care about craftsmanship as much as price.' },
  { name: 'Hong Kong',  lat: 22.3193, lng: 114.1694, altitude: 0.5, desc: 'International financial gateway with deep colonial trading roots. Hong Kong moves between Western boardrooms and mainland realities with practiced ease — and remembers everyone who treated it as merely a stepping stone.', photos: ['/cities/hongkong/1.jpeg', '/cities/hongkong/2.jpeg', '/cities/hongkong/3.jpeg', '/cities/hongkong/4.jpeg'] },
  { name: 'Nanjing',    lat: 32.0603, lng: 118.7969, altitude: 0.5, desc: 'Old capital, deep institutions. Nanjing teaches you the difference between ceremony and substance.' },
  { name: 'Jinan',      lat: 36.6512, lng: 117.1201, altitude: 1.0, desc: 'Spring city and provincial seat of Shandong. Jinan keeps a long memory — careers are made by people who return.', photos: ['/cities/jinan/1.jpeg', '/cities/jinan/2.jpeg', '/cities/jinan/3.jpeg', '/cities/jinan/4.jpeg', '/cities/jinan/5.jpeg', '/cities/jinan/6.jpeg', '/cities/jinan/7.jpeg', '/cities/jinan/8.jpeg'] },
  { name: 'Qingdao',    lat: 36.0671, lng: 120.3826, altitude: 1.0, desc: "European industrial DNA, Asian execution. Qingdao's port and brewing history quietly shaped global manufacturing standards.", photos: ['/cities/qingdao/1.jpeg', '/cities/qingdao/2.jpeg', '/cities/qingdao/3.jpeg', '/cities/qingdao/4.jpeg', '/cities/qingdao/5.jpeg', '/cities/qingdao/6.jpeg'] },
  { name: 'Changsha',   lat: 28.2282, lng: 112.9388, altitude: 1.0, desc: 'Confident, media-savvy capital of Hunan. Changsha negotiates with appetite and the assumption that anything can be built.' },
  { name: 'Xiamen',     lat: 24.4798, lng: 118.0894, altitude: 0.5, desc: 'Quiet southern port with deep ties to Taiwan and Southeast Asia. Subtle, careful, and lucrative for those who learn its rhythms.' },
  { name: 'Ningbo',     lat: 29.8683, lng: 121.5440, altitude: 0.5, desc: "One of the world's busiest container ports. Ningbo handles volume the way other cities handle conversation — quietly and without fuss." },
  { name: 'Suzhou',     lat: 31.2989, lng: 120.5853, altitude: 0.5, desc: 'Classical gardens and one of the most successful industrial parks in Asia. Suzhou pairs aesthetic restraint with relentless execution.' },
  { name: 'Hefei',      lat: 31.8206, lng: 117.2272, altitude: 0.5, desc: 'Quietly emergent science-and-industry capital. Hefei has become the city you must visit before assuming you understand modern Chinese manufacturing.' },
  { name: 'Songpan',    lat: 32.6347, lng: 103.6018, altitude: 0.5, desc: 'Ancient walled town on the edge of the Tibetan Plateau. Conversations here move at altitude — slow, deliberate, and unforgettable.' },
  { name: 'Jiuzhaigou', lat: 33.2614, lng: 103.9197, altitude: 0.5, desc: 'Turquoise lakes and protected valleys. Jiuzhaigou is the rare partner site where the meeting room is the landscape itself.' },
  { name: 'Qiang City', lat: 31.6788, lng: 103.8519, altitude: 0.5, desc: 'Stone watchtowers and one of the oldest continuously inhabited cultures in western Sichuan. Trust here is generational, not contractual.' },
  { name: 'Maoxian',    lat: 31.6815, lng: 103.8533, altitude: 0.5, desc: 'Mountain seat of the Qiang people. Maoxian rewards visitors who treat hospitality as the first stage of every negotiation.' },
  { name: 'Cangzhou',   lat: 38.3037, lng: 116.8388, altitude: 0.5, desc: 'Industrial Hebei at its most direct. Cangzhou expects facts on the table within the first ten minutes — and respects you for arriving with them.' },
  { name: 'Taipei',     lat: 25.0330, lng: 121.5654, altitude: 0.5, desc: 'Where supply chains, semiconductors and old family businesses still talk to each other. Taipei negotiates softly and remembers everything.' },
  { name: 'Hohhot',     lat: 40.8414, lng: 111.7522, altitude: 1.0, desc: 'Grasslands capital with deep dairy, energy and cross-border interests. Hohhot conducts business with steppe-wide horizons.' },
  { name: 'Yiwu',       lat: 29.3088, lng: 120.0762, altitude: 1.0, desc: "The world's small-commodities trading floor. A single afternoon in Yiwu can redraw what you thought a global supply chain looks like." },
];

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => slugify(c.name) === slug);
}
