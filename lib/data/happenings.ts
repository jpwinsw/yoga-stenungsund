export type HappeningEvent = {
  id: string;
  slug: string;
  type: 'retreat' | 'workshop' | 'course' | 'regular';
  featured?: boolean;
  title: {
    sv: string;
    en: string;
  };
  shortDescription: {
    sv: string;
    en: string;
  };
  fullDescription?: {
    sv: string;
    en: string;
  };
  dates?: string;
  time?: string;
  location?: string;
  price?: string;
  instructor?: string;
  booking?: {
    email?: string;
    phone?: string;
    link?: string;
  };
  includes?: string[];
  image?: string;
};

export const happeningsEvents: HappeningEvent[] = [
  {
    id: 'winter-retreat-2026',
    slug: 'vinter-frid-yogaretreat',
    type: 'retreat',
    featured: true,
    title: {
      sv: 'Vinterfrid Yoga Retreat 2026',
      en: 'Winter Peace Yoga Retreat 2026'
    },
    shortDescription: {
      sv: 'En helg för yoga, reflektion och djup närvaro i den vackra naturen',
      en: 'A weekend for yoga, reflection and deep presence in beautiful nature'
    },
    fullDescription: {
      sv: 'Välkommen till en helg för reflektion och djupnärvaro i naturen. Denna retreat är för dig som är medlem i YST och vill fördjupa din praktik med Yin Yoga, Yoga Nidra, kakaoceremoni, meditation och naturpromenader.',
      en: 'Welcome to a weekend for reflection and deep presence in nature. This retreat is for YST members who want to deepen their practice with Yin Yoga, Yoga Nidra, cacao ceremony, meditation and nature walks.'
    },
    dates: '30 januari - 1 februari 2026',
    location: 'Sjusjöar Konferens',
    price: '4444 kr per person (del i dubbelrum)',
    instructor: 'Annika Valton & Sandra Ferm',
    includes: [
      'Alla måltider',
      'Yogaklasser',
      'Bastu',
      'Härlig energi'
    ],
    booking: {
      email: 'Yogastenungsund@gmail.com',
      phone: '073-9123976'
    }
  },
  {
    id: 'restorative-yoga',
    slug: 'restorativeyoga',
    type: 'regular',
    title: {
      sv: 'Restorative Yoga',
      en: 'Restorative Yoga'
    },
    shortDescription: {
      sv: 'En yogaform där vi på djupet får återhämtning och vila, både mentalt, själsligt och kroppsligt',
      en: 'A yoga form where we deeply recover and rest, mentally, spiritually and physically'
    },
    dates: '7/2, 14/3, 4/4',
    time: '17:30-19:30',
    price: '350 kr (ingår ej i kort)',
    instructor: 'Annika Valton (Infullbloom.se)',
    booking: {
      link: 'online'
    }
  },
  {
    id: 'primary-ashtanga',
    slug: 'ledd-primary-ashtanga-vinyasa-yoga',
    type: 'workshop',
    title: {
      sv: 'Ledd Primary Ashtanga Vinyasa Yoga',
      en: 'Led Primary Ashtanga Vinyasa Yoga'
    },
    shortDescription: {
      sv: 'En kraftfull och disciplinerad yogaform med fasta serier av positioner',
      en: 'A powerful and disciplined form of yoga with fixed series of postures'
    }
  },
  {
    id: 'shakti-sister-circle',
    slug: 'shakti-sister-cirkel',
    type: 'workshop',
    title: {
      sv: 'Shakti Sister Cirkel',
      en: 'Shakti Sister Circle'
    },
    shortDescription: {
      sv: 'En helig systercirkel för kvinnor att mötas i autentisk gemenskap',
      en: 'A sacred sister circle for women to meet in authentic community'
    }
  },
  {
    id: 'shakti-sister-retreat',
    slug: 'shakti-sister-natur-retreat',
    type: 'retreat',
    title: {
      sv: 'Shakti Sister Natur Retreat',
      en: 'Shakti Sister Nature Retreat'
    },
    shortDescription: {
      sv: 'En helg i naturens famn med yoga, meditation och systerskap',
      en: 'A weekend in nature\'s embrace with yoga, meditation and sisterhood'
    }
  },
  {
    id: 'besafe-hathayoga',
    slug: 'fordjupningshelg-besafe-hathayoga',
    type: 'workshop',
    title: {
      sv: 'Fördjupningshelg BeSafe Hathayoga',
      en: 'BeSafe Hatha Yoga Immersion Weekend'
    },
    shortDescription: {
      sv: 'En fördjupande helg i Hatha Yoga med fokus på säker praktik',
      en: 'An immersive weekend in Hatha Yoga focusing on safe practice'
    }
  },
  {
    id: 'sound-meditation',
    slug: 'gaeya-sound-meditation-journey',
    type: 'workshop',
    title: {
      sv: 'Gaeya Sound Meditation Journey',
      en: 'Gaeya Sound Meditation Journey'
    },
    shortDescription: {
      sv: 'En meditativ ljudresa för djup avslappning och inre stillhet',
      en: 'A meditative sound journey for deep relaxation and inner stillness'
    }
  },
  {
    id: 'family-yoga',
    slug: 'familjeyoga',
    type: 'regular',
    title: {
      sv: 'Familjeyoga',
      en: 'Family Yoga'
    },
    shortDescription: {
      sv: 'Yoga för hela familjen - en stund av rörelse och glädje tillsammans',
      en: 'Yoga for the whole family - a time of movement and joy together'
    }
  }
];