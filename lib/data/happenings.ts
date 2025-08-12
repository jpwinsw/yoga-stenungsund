export type HappeningEvent = {
  id: string;
  slug: string;
  type: 'retreat' | 'workshop' | 'course' | 'regular';
  featured?: boolean;
  image?: string;
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
};

export const happeningsEvents: HappeningEvent[] = [
  {
    id: 'winter-retreat-2026',
    slug: 'vinter-frid-yogaretreat',
    type: 'retreat',
    featured: true,
    title: {
      sv: 'Vinterfrid Retreat 2026',
      en: 'Winter Peace Retreat 2026'
    },
    shortDescription: {
      sv: 'En helg för reflektion och djupnärvaro i den vackra naturen på Sjusjöar',
      en: 'A weekend for reflection and deep presence in beautiful nature at Sjusjöar'
    },
    fullDescription: {
      sv: 'Välkommen till en helg för reflektion och djupnärvaro i naturen. Denna retreat är för dig som är medlem i YST och vill fördjupa din praktik.\n\nUnder helgen kommer vi att utforska:\n• Yin Yoga - djup stretching och avslappning\n• Yoga Nidra - yogisk sömn för total återhämtning\n• Kakaoceremoni - hjärtöppnande ritual\n• Meditation och mindfulness\n• Naturpromenader i vinterlandskap\n\nSandra Ferm har 20 års erfarenhet och är grundare av YST. Annika Valton är specialiserad på Hormon Yin Yoga och djup avslappning.',
      en: 'Welcome to a weekend for reflection and deep presence in nature. This retreat is for YST members who want to deepen their practice.\n\nDuring the weekend we will explore:\n• Yin Yoga - deep stretching and relaxation\n• Yoga Nidra - yogic sleep for total recovery\n• Cacao ceremony - heart-opening ritual\n• Meditation and mindfulness\n• Nature walks in winter landscape\n\nSandra Ferm has 20 years of experience and is the founder of YST. Annika Valton specializes in Hormone Yin Yoga and deep relaxation.'
    },
    dates: '30 januari - 1 februari 2025',
    location: 'Sjusjöar Konferens',
    price: '4444 kr per person (del i dubbelrum)',
    instructor: 'Sandra Ferm & Annika Valton',
    includes: [
      'Alla måltider (vegetariskt/veganskt)',
      'Alla yogaklasser och aktiviteter',
      'Tillgång till bastu',
      'Kakaoceremoni',
      'Yoga Nidra sessioner',
      'Guidade meditationer',
      'Naturupplevelser'
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
    image: '/restorative-yoga.jpg',
    title: {
      sv: 'Restorative Yoga',
      en: 'Restorative Yoga'
    },
    shortDescription: {
      sv: 'Djup avslappning och återhämtning för kropp, sinne och själ',
      en: 'Deep relaxation and recovery for body, mind and soul'
    },
    fullDescription: {
      sv: 'Restorative Yoga är en yogaform där vi på djupet får återhämtning och vila. Varje position hålls mellan 12-20 minuter med stöd av kuddar, bolster och filtar.\n\nDenna praktik hjälper dig att:\n• Minska stress och ångest\n• Balansera nervsystemet\n• Förbättra sömnkvalitet\n• Öka flexibilitet utan ansträngning\n• Frigöra spänningar på djupet\n\nIngen tidigare erfarenhet krävs. Alla rekvisita finns på plats.',
      en: 'Restorative Yoga is a form of yoga where we deeply recover and rest. Each position is held for 12-20 minutes with support from pillows, bolsters and blankets.\n\nThis practice helps you to:\n• Reduce stress and anxiety\n• Balance the nervous system\n• Improve sleep quality\n• Increase flexibility without effort\n• Release deep tensions\n\nNo previous experience required. All props are provided.'
    },
    dates: 'Fredagar: 7/2, 14/3, 4/4',
    time: '17:30-19:30',
    location: 'Yoga Stenungsund Studio',
    price: '350 kr per gång (ingår ej i klippkort)',
    instructor: 'Annika Valton (Infullbloom.se)',
    booking: {
      link: 'online',
      email: 'Yogastenungsund@gmail.com'
    }
  },
  {
    id: 'primary-ashtanga',
    slug: 'ledd-primary-ashtanga-vinyasa-yoga',
    type: 'workshop',
    image: '/ashtanga-primary.jpg',
    title: {
      sv: 'Ledd Primary Ashtanga Vinyasa Yoga',
      en: 'Led Primary Ashtanga Vinyasa Yoga'
    },
    shortDescription: {
      sv: 'Meditation i rörelse - en kraftfull och disciplinerad yogaform',
      en: 'Meditation in movement - a powerful and disciplined form of yoga'
    },
    fullDescription: {
      sv: 'Ashtanga Vinyasa Yoga är en dynamisk form av yoga som synkroniserar andning med rörelse. Primary Series (Yoga Chikitsa) är den första serien som renar och stärker kroppen.\n\nFördelar med praktiken:\n• Bygger styrka och flexibilitet\n• Förbättrar fokus och mental klarhet\n• Renar kroppen genom svettning\n• Utvecklar självdisciplin och medvetenhet\n\nKlassen leds i traditionell Mysore-stil där alla utövar samma serie tillsammans. Passar dig som har viss yogaerfarenhet.',
      en: 'Ashtanga Vinyasa Yoga is a dynamic form of yoga that synchronizes breath with movement. The Primary Series (Yoga Chikitsa) is the first series that purifies and strengthens the body.\n\nBenefits of the practice:\n• Builds strength and flexibility\n• Improves focus and mental clarity\n• Purifies the body through sweating\n• Develops self-discipline and awareness\n\nThe class is led in traditional Mysore style where everyone practices the same series together. Suitable for those with some yoga experience.'
    },
    dates: '27 september',
    time: '09:00-11:00',
    location: 'Yoga Stenungsund Studio',
    price: 'Ingår i klippkort',
    booking: {
      link: 'online'
    }
  },
  {
    id: 'shakti-sister-circle',
    slug: 'shakti-sister-cirkel',
    type: 'workshop',
    image: '/shakti-circle.jpg',
    title: {
      sv: 'Shakti Sister Cirkel - Fira Sommarsolståndet',
      en: 'Shakti Sister Circle - Celebrate Summer Solstice'
    },
    shortDescription: {
      sv: 'En helig systercirkel för att hedra sommarsolståndet och vår inre sol',
      en: 'A sacred sister circle to honor the summer solstice and our inner sun'
    },
    fullDescription: {
      sv: 'Välkommen till en magisk kväll där vi firar sommarsolståndet tillsammans! Vi samlas för att hedra Gayatri - solgudinnan och vår inre sols kraft.\n\nKvällen innehåller:\n• Öppningsceremoni och intentionssättning\n• Gayatri mantra chanting\n• Guidad meditation\n• Andningsövningar (Pranayama)\n• Ritualer för att välkomna ljuset\n• Delning i cirkeln\n\nTa med dig något personligt som representerar "ljus" för dig - det kan vara ett foto, ett smycke, en kristall eller något annat meningsfullt.',
      en: 'Welcome to a magical evening where we celebrate the summer solstice together! We gather to honor Gayatri - the sun goddess and our inner sun power.\n\nThe evening includes:\n• Opening ceremony and intention setting\n• Gayatri mantra chanting\n• Guided meditation\n• Breathing exercises (Pranayama)\n• Rituals to welcome the light\n• Sharing in the circle\n\nBring something personal that represents "light" to you - it could be a photo, jewelry, crystal or something else meaningful.'
    },
    dates: 'Söndag 23 juni',
    time: '18:00-21:00',
    location: 'Källsnäs, Jörlanda',
    price: '2 klipp från klippkort eller gratis med obegränsat sommerkort',
    instructor: 'Sandra Ferm',
    booking: {
      email: 'Yogastenungsund@gmail.com',
      link: 'online'
    }
  },
  {
    id: 'shakti-sister-retreat',
    slug: 'shakti-sister-natur-retreat',
    type: 'retreat',
    image: '/shakti-retreat.jpg',
    title: {
      sv: 'Shakti Sister Natur Retreat',
      en: 'Shakti Sister Nature Retreat'
    },
    shortDescription: {
      sv: 'En helg i naturens famn med yoga, meditation och systerskap',
      en: 'A weekend in nature\'s embrace with yoga, meditation and sisterhood'
    },
    fullDescription: {
      sv: 'Välkommen till en retreat där vi fördjupar vår praktik och firar systerskap i naturens sköna famn. Detta är en helg för dig som vill ta en paus från vardagen och återknyta kontakten med din inre kraft.\n\nUnder helgen kommer vi att:\n• Praktisera olika former av yoga\n• Delta i systercirklar och delningsrunder\n• Uppleva djup meditation och mindfulness\n• Njuta av naturens helande kraft\n• Skapa meningsfulla kopplingar med andra kvinnor',
      en: 'Welcome to a retreat where we deepen our practice and celebrate sisterhood in nature\'s beautiful embrace. This is a weekend for you who want to take a break from everyday life and reconnect with your inner power.\n\nDuring the weekend we will:\n• Practice different forms of yoga\n• Participate in sister circles and sharing rounds\n• Experience deep meditation and mindfulness\n• Enjoy nature\'s healing power\n• Create meaningful connections with other women'
    },
    instructor: 'Sandra Ferm',
    booking: {
      email: 'Yogastenungsund@gmail.com'
    }
  },
  {
    id: 'besafe-hathayoga',
    slug: 'fordjupningshelg-besafe-hathayoga',
    type: 'workshop',
    image: '/besafe-hathayoga.jpg',
    title: {
      sv: 'Fördjupningshelg BeSafe Hathayoga',
      en: 'BeSafe Hatha Yoga Immersion Weekend'
    },
    shortDescription: {
      sv: 'En fördjupande helg i Hatha Yoga med fokus på säker praktik',
      en: 'An immersive weekend in Hatha Yoga focusing on safe practice'
    },
    fullDescription: {
      sv: 'En inspirerande helg där vi fördjupar oss i Hatha Yogans kraftfulla praktiker. Vi fokuserar på inversioner (huvudståenden, handståenden, axelståenden) och bakåtböjningar med säker teknik och kroppskännedom.\n\nPassar dig som:\n• Har erfarenhet av yoga och vill utmana dig själv\n• Vill fördjupa din praktik\n• Är nyfiken på att utforska kroppens möjligheter\n• Vill praktisera i en stöttande miljö med erfarna lärare\n\nVi arbetar med teknik, mod och medvetenhet för att säkert utforska dessa kraftfulla positioner.',
      en: 'An inspiring weekend where we dive deep into the powerful practices of Hatha Yoga. We focus on inversions (headstands, handstands, shoulder stands) and backbends with safe technique and body awareness.\n\nSuitable for you who:\n• Have experience with yoga and want to challenge yourself\n• Want to deepen your practice\n• Are curious to explore your body\'s possibilities\n• Want to practice in a supportive environment with experienced teachers\n\nWe work with technique, courage and awareness to safely explore these powerful positions.'
    },
    dates: '13-14 september',
    time: '08:00-11:00',
    location: 'Yoga Stenungsund Studio',
    price: '777 kr',
    instructor: 'Sandra Ferm & Sara Bergström',
    booking: {
      email: 'Yogastenungsund@gmail.com'
    }
  },
  {
    id: 'sound-meditation',
    slug: 'gaeya-sound-meditation-journey',
    type: 'workshop',
    image: '/sound-meditation.jpg',
    title: {
      sv: 'Gaeya Sound Meditation Journey',
      en: 'Gaeya Sound Meditation Journey'
    },
    shortDescription: {
      sv: 'En meditativ ljudresa för djup avslappning och inre stillhet',
      en: 'A meditative sound journey for deep relaxation and inner stillness'
    },
    fullDescription: {
      sv: 'Med hjälp av trummor, klangskålar och Gaeya\'s kraftfulla röst skapar hon ett rum av ljudhealing där du guidas för att förstärka kopplingen till din egen inre kraft.\n\nUnder sessionen:\n• Sätter vi en intention i början\n• Upplever cirka 1 timme av ljudhealing\n• Ligger på golvet under en filt\n• Avslutar med örtte\n• Möjlighet att dela upplevelser (valfritt)\n\nTa med:\n• Yogamatta/liggunderlag\n• Filt\n• Kudde (valfritt)\n• Bekväma, mjuka kläder',
      en: 'Using drums, singing bowls and Gaeya\'s powerful voice, she creates a space of sound healing where you are guided to strengthen the connection to your own inner power.\n\nDuring the session:\n• We set an intention at the beginning\n• Experience about 1 hour of sound healing\n• Lie on the floor under a blanket\n• End with herbal tea\n• Opportunity to share experiences (optional)\n\nBring:\n• Yoga mat/floor mat\n• Blanket\n• Pillow (optional)\n• Comfortable, soft clothing'
    },
    dates: '5 januari 2024',
    time: '18:00-20:15',
    location: 'Yoga Stenungsund, Selinsväg 5, Stora Höga',
    instructor: 'Gaeya',
    booking: {
      link: 'online',
      email: 'Yogastenungsund@gmail.com'
    }
  },
  {
    id: 'family-yoga',
    slug: 'familjeyoga',
    type: 'regular',
    image: '/family-yoga.jpg',
    title: {
      sv: 'Familjeyoga',
      en: 'Family Yoga'
    },
    shortDescription: {
      sv: 'Yoga för hela familjen - en stund av rörelse och glädje tillsammans',
      en: 'Yoga for the whole family - a time of movement and joy together'
    },
    fullDescription: {
      sv: 'Följ med på en yogasaga där både aktivitet, fantasi och vila får ta plats! Familjeyoga är ett underbart sätt för hela familjen att röra sig tillsammans.\n\nVad vi gör:\n• Yogasagor med rörelser\n• Lekfulla yogapositioner\n• Andningsövningar anpassade för barn\n• Avslappning och vila\n\nFördelar:\n• Lär känna kroppens signaler\n• Utvecklar kroppsmedvetenhet\n• Lär sig hitta lugn\n• Stärker familjebanden\n\nIngen tidigare erfarenhet behövs. Kom i bekväma kläder. Kan göras barfota eller med strumpor.',
      en: 'Follow along on a yoga story where both activity, imagination and rest get to take place! Family yoga is a wonderful way for the whole family to move together.\n\nWhat we do:\n• Yoga stories with movements\n• Playful yoga positions\n• Breathing exercises adapted for children\n• Relaxation and rest\n\nBenefits:\n• Learn to recognize body signals\n• Develop body awareness\n• Learn to find calm\n• Strengthen family bonds\n\nNo prior experience needed. Come in comfortable clothes. Can be done barefoot or with socks.'
    },
    instructor: 'Johanna Alvin',
    booking: {
      email: 'Yogastenungsund@gmail.com'
    }
  }
];