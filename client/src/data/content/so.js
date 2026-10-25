// Somali help-center FAQs and policy pages (same structure as en.js).
export const faqGroups = [
  {
    id: 'orders',
    icon: '📦',
    title: 'Dalabaadka & Raadraaca',
    items: [
      {
        q: 'Sideen ula socon karaa dalabkayga?',
        a: 'Gal akoonkaaga kadibna fur Dalabaadkayga. Dalab kasta wuxuu muujinayaa heerka uu marayo (Sugaya → La xaqiijiyay → Waa la diyaarinayaa → Waa la diray → Waa la gaarsiiyay). Sidoo kale iimayl ayaad ka heli doontaa marka uu xaaladdu isbeddesho.',
      },
      {
        q: 'Ma beddeli karaa ama ma joojin karaa dalabkayga?',
        a: 'Waxaad joojin kartaa dalab kasta oo aan weli la dirin, adoo ka furaya bogga faahfaahinta dalabka — alaabta iyo koodhka dhimistaba si toos ah ayaa laguugu soo celinayaa. Haddii dalabka la diray, fadlan codso soo celin.',
      },
      {
        q: 'Waxaa ii yimid alaab khaldan ama dhaawacan. Maxaan sameeyaa?',
        a: 'Waan ka xunnahay! Nala soo xiriir 7 maalmood gudahood marka alaabtu kuu timaaddo, adoo soo diraya lambarka dalabka iyo sawirka alaabta. Waxaan kuu soo diri doonnaa mid kale ama lacagta oo dhan ayaan kuu celin doonnaa, adigoon bixin kharashka soo celinta.',
      },
    ],
  },
  {
    id: 'shipping',
    icon: '🚚',
    title: 'Gaarsiinta & Rarka',
    items: [
      {
        q: 'Immisa ayuu ku kacayaa gaarsiintu?',
        a: 'Gaarsiinta caadiga ah waa bilaash dalabaadka ${threshold} ama ka badan. Haddii ka yar, waxaa lagu dallacayaa ${fee}. Isticmaal koodhka FREESHIP marka aad lacagta bixinayso si aad u hesho gaarsiin bilaash ah inta dalabku socdo.',
      },
      {
        q: 'Intee in le\'eg ayay qaadanaysaa gaarsiintu?',
        a: 'Dalabaadka waxaa la diyaariyaa 1–2 maalmood oo shaqo gudahood. Gaarsiinta caadiga ah kadib waxay qaadataa 3–7 maalmood oo shaqo iyadoo ku xiran meesha aad joogto. Bogga alaab kasta waxaad ku arki doontaa taariikhda la filayo in ay kuu timaaddo.',
      },
      {
        q: 'Ma u dirtaan dalal kale?',
        a: 'Haa — waxaan u dirnaa in ka badan 100 waddan. Canshuuraha iyo kharashyada kastamka ee waddankaaga waxaa bixinaya qofka alaabta qaadanaya.',
      },
    ],
  },
  {
    id: 'returns',
    icon: '🔄',
    title: 'Soo Celinta & Lacag Celinta',
    items: [
      {
        q: 'Waa maxay xeerkiinna soo celinta?',
        a: 'Inta badan alaabta waa la soo celin karaa 30 maalmood gudahood marka ay kuu timaaddo, haddii aan la isticmaalin oo ay ku jirto baakadkii asalka ahaa. Alaabta quruxda waa in aan la furin sababo nadaafadeed awgood.',
      },
      {
        q: 'Sideen u bilaabaa soo celin?',
        a: 'La xiriir kooxda taageerada adoo soo diraya lambarka dalabka iyo alaabta aad rabto inaad soo celiso. Waxaan iimayl kuugu soo diri doonnaa calaamad soo celin oo lacagteeda la bixiyay iyo tilmaamaha meesha aad geyn lahayd.',
      },
      {
        q: 'Goorma ayaan helayaa lacagtayda?',
        a: 'Lacagta waxaa lagu celinayaa habkii aad ku bixisay 5–10 maalmood oo shaqo gudahood marka aan helno oo aan hubinno alaabta. Dalabaadka lacagta marka la keeno waxaa lagu celinayaa wareejin bangi ama dheeman dukaan.',
      },
    ],
  },
  {
    id: 'payments',
    icon: '💳',
    title: 'Lacag Bixinta & Koodhadhka Dhimista',
    items: [
      {
        q: 'Habab lacag bixin noocee ah ayaad aqbashaan?',
        a: 'Waxaad ku bixin kartaa kaarka deynta ama bangiga (Visa, Mastercard, American Express iyo kuwo kale) bogga ammaan ee Stripe, ama dooro lacag marka la keeno. Faahfaahinta kaarkaaga waxaa maamula Stripe, laguma kaydiyo kombiyuutarradayada.',
      },
      {
        q: 'Sideen u isticmaalaa koodhka dhimista?',
        a: 'Ku qor koodhkaaga sanduuqa "Koodhka dhimista" ee bogga lacag bixinta kadibna riix Codso. Dhimista isla markiiba ayay ka muuqanaysaa koobitaanka dalabkaaga. Dalab kasta hal koodh oo keliya ayaa lagu isticmaali karaa.',
      },
      {
        q: 'Maxay koodhkaygu u shaqayn waayay?',
        a: 'Koodhadhka qaarkood waxay leeyihiin qiime ugu yar oo dalab ah, taariikh ay dhacaan, ama waxay u gaar yihiin dalabkaaga ugu horreeya. Bogga lacag bixinta ayaa kuu sheegaya sababta saxda ah ee koodhka loo aqbali waayay.',
      },
    ],
  },
  {
    id: 'account',
    icon: '👤',
    title: 'Akoonka & Ammaanka',
    items: [
      {
        q: 'Ma u baahanahay akoon si aan wax u iibsado?',
        a: 'Waxaad dukaanka dhex mari kartaa, alaab kaydsan kartaa, oo dambiisha buuxin kartaa adigoon gelin. Marka aad lacag bixinayso ayaa lagaa codsan doonaa inaad gasho ama aad samaysato akoon bilaash ah — dambiishaada iyo liiskaaga rabitaanka way kula socdaan.',
      },
      {
        q: 'Sideen dib ugu dejiyaa furaha sirta ah?',
        a: 'Haddii aad gashay, ka beddel Akoonkayga → Beddel furaha sirta ah. Haddii aad ka xiran tahay, kooxda taageerada kala soo xiriir iimaylka akoonkaaga, waanu ku caawin doonnaa.',
      },
      {
        q: 'Xogtayda shakhsiga ah ma ammaan baa?',
        a: 'Haa. Furayaasha sirta ah waa la qariyaa, isku xirnaantuna waa sir, mana iibinno xogtaada. Akhri Xeerka Asturnaanta si aad faahfaahin u hesho.',
      },
    ],
  },
];

export const policyPages = {
  about: {
    title: 'Ku Saabsan ABDULL',
    eyebrow: 'Sheekadayada',
    intro:
      'ABDULL waa suuq caalami ah oo online ah oo lagu iibiyo dharka, alaabta quruxda iyo tignoolajiyada. Waxaan hal meel isugu keennaa moodooyinka cusub iyo qalabka ugu casrisan, qiimo macquul ah.',
    sections: [
      {
        heading: 'Waxa aan qabanno',
        body: [
          'Waxaan si toos ah ula shaqaynaa summadaha iyo alaab-qeybiyeyaal la hubiyay si alaab kasta oo ABDULL ku jirta ay u noqoto mid asal ah. Kooxdayada iibka ayaa toddobaad kasta ku daraysa alaab cusub, laga bilaabo dharka maalinlaha ah ilaa taleefannada ugu casrisan.',
        ],
      },
      {
        heading: 'Ballanqaadkayaga',
        list: [
          'Alaab 100% asal ah oo ka timid summado iyo alaab-qeybiyeyaal la hubiyay',
          'Gaarsiin caadi ah oo bilaash ah dalabaadka ${threshold} ama ka badan',
          'Soo celin fudud 30 maalmood gudahood inta badan alaabta',
          'Dad dhab ah oo taageero ah, 7 maalmood toddobaadkii',
        ],
      },
      {
        heading: 'Nala soo xiriir',
        body: ['Su\'aalo, ra\'yi ama fikrado iskaashi? Booqo bogga Nala Soo Xiriir — waxaan ku jawaabnaa 24 saacadood gudahood.'],
      },
    ],
  },
  shipping: {
    title: 'Xeerka Gaarsiinta',
    eyebrow: 'Daryeelka Macaamiisha',
    updated: 'Oktoobar 2026',
    intro: 'Wax kasta oo aad u baahan tahay inaad ka ogaato sida iyo goorta dalabkaagu kuu imaanayo.',
    sections: [
      {
        heading: 'Qiimaha gaarsiinta',
        list: [
          'Gaarsiin caadi ah oo bilaash ah dalabaadka ${threshold} ama ka badan (dhimista kadib)',
          '${fee} qiime go\'an oo gaarsiin ah dalabaadka ka yar ${threshold}',
          'Gaarsiin bilaash ah dalab kasta adoo isticmaalaya koodhka FREESHIP inta dalabku socdo',
        ],
      },
      {
        heading: 'Waqtiga diyaarinta & gaarsiinta',
        body: [
          'Dalabaadka waxaa la diyaariyaa 1–2 maalmood oo shaqo gudahood. Dalabaadka la sameeyo maalmaha fasaxa waxaa la diyaariyaa maalinta shaqo ee xigta.',
          'Gaarsiinta caadiga ah waxay qaadataa 3–7 maalmood oo shaqo marka la diro kadib. Meelaha fogfog waxay qaadan karaan dhowr maalmood oo dheeraad ah.',
        ],
      },
      {
        heading: 'Dalabaadka caalamiga ah',
        body: [
          'Waxaan u dirnaa in ka badan 100 waddan. Canshuuraha soo dejinta iyo kharashyada kastamka kuma jiraan wadarta dalabka, waxaana bixinaya qofka alaabta qaadanaya.',
        ],
      },
      {
        heading: 'Raadraaca',
        body: ['La soco dalab kasta waqtiga dhabta ah adoo ka furaya Dalabaadkayga. Isbeddel kasta oo xaaladda ah isla markiiba wuu ka muuqanayaa.'],
      },
    ],
  },
  returns: {
    title: 'Soo Celinta & Lacag Celinta',
    eyebrow: 'Daryeelka Macaamiisha',
    updated: 'Oktoobar 2026',
    intro: 'Ma ku habboonayn? Soo celi 30 maalmood gudahood.',
    sections: [
      {
        heading: 'Shuruudaha',
        list: [
          'Alaabta waa in la soo celiyaa 30 maalmood gudahood marka ay kuu timaaddo',
          'Alaabta waa in aan la isticmaalin, aan la dhaqin, oo ay ku jirto baakadkii asalka ahaa iyo calaamadihii',
          'Alaabta quruxda iyo daryeelka shakhsiga waa in aan la furin',
          'Alaabta iibka ugu dambeeya iyo kaararka hadiyadda lama soo celin karo',
        ],
      },
      {
        heading: 'Sida loo soo celiyo',
        list: [
          'La xiriir taageerada adoo soo diraya lambarka dalabka iyo alaabta aad soo celinayso',
          'Waxaan iimayl kuugu soo diraynaa calaamad soo celin oo lacagteeda la bixiyay hal maalin shaqo gudaheed',
          'Si fiican u xir alaabta oo geey goobta shirkadda rarka ee ku qoran calaamadda',
        ],
      },
      {
        heading: 'Lacag celinta',
        body: [
          'Marka aan helno oo aan hubinno alaabta la soo celiyay, qiimaha alaabta waxaan ku celinaynaa habkii aad ku bixisay 5–10 maalmood oo shaqo gudahood. Joojinta dalab kaar lagu bixiyay ka hor intaan la dirin si toos ah ayay lacagta kaarka ugu celinaysaa. Kharashka gaarsiinta asalka ah waxaa la celinayaa oo keliya alaabta dhaawacan, cillad leh ama khaldan.',
        ],
      },
      {
        heading: 'Isweydaarsi',
        body: ['Ma u baahan tahay cabbir ama midab kale? Soo celi alaabtii hore oo samee dalab cusub — taasi waa habka ugu dhaqsaha badan.'],
      },
    ],
  },
  privacy: {
    title: 'Xeerka Asturnaanta',
    eyebrow: 'Sharci',
    updated: 'Oktoobar 2026',
    intro: 'Xeerkan wuxuu sharxayaa xogta shakhsiga ah ee aan ururinno, sababta, iyo doorashooyinka aad leedahay.',
    sections: [
      {
        heading: 'Xogta aan ururinno',
        list: [
          'Faahfaahinta akoonka: magaca, iimaylka, lambarka taleefanka iyo cinwaanka gaarsiinta',
          'Faahfaahinta dalabka: alaabta la iibsaday, wadarta iyo xaaladda gaarsiinta',
          'Xog farsamo: macluumaadka qalabka iyo daalacaha oo loo isticmaalo ammaanka bogga',
        ],
      },
      {
        heading: 'Sida aan u isticmaalno',
        list: [
          'Si aan u diyaarino, u gaarsiino oo u taageerno dalabaadkaaga',
          'Si aan akoonkaaga u ilaalino oo aan khiyaanada uga hortagno',
          'Si aan kuugu soo dirno iimaylada xayeysiiska — keliya haddii aad isdiiwaangeliso, waadna ka bixi kartaa goor kasta',
        ],
      },
      {
        heading: 'La wadaagidda',
        body: [
          'Xogta waxaan la wadaagnaa oo keliya bixiyeyaasha adeegga ee naga caawiya socodsiinta dukaanka (tusaale ahaan shirkadaha gaarsiinta), intii ay u baahan yihiin oo keliya. Weligeen ma iibinno xogtaada shakhsiga ah.',
        ],
      },
      {
        heading: 'Xuquuqdaada',
        body: [
          'Goor kasta waxaad ka eegi kartaa oo ka cusboonaysiin kartaa faahfaahintaada Akoonkayga. Si aad u codsato nuqul ama tirtirka xogtaada, la xiriir kooxda taageerada.',
        ],
      },
    ],
  },
  terms: {
    title: 'Shuruudaha Adeegga',
    eyebrow: 'Sharci',
    updated: 'Oktoobar 2026',
    intro: 'Adoo isticmaalaya ABDULL waxaad aqbashay shuruudahan. Fadlan si taxaddar leh u akhri.',
    sections: [
      {
        heading: 'Akoonnada',
        body: ['Adiga ayaa mas\'uul ka ah ilaalinta furahaaga sirta ah iyo dhammaan waxqabadka akoonkaaga. Isla markiiba noo sheeg haddii aad ka shakido isticmaal aan la oggolayn.'],
      },
      {
        heading: 'Dalabaadka & qiimaha',
        body: [
          'Dhammaan qiimayaasha waxaa lagu muujiyaa doollarka Maraykanka. Waxaan xaq u leenahay inaan joojinno dalabaadka ay saameeyeen khaladaad qiimo ama alaab la\'aan; haddii ay taasi dhacdo lacagta oo dhan ayaa laguu celinayaa.',
          'Koodhadhka dhimista laguma beddeli karo lacag caddaan ah, dalab kasta hal koodh ayaa lagu isticmaali karaa, waxayna yeelan karaan shuruudo ka muuqda bogga lacag bixinta.',
        ],
      },
      {
        heading: 'Macluumaadka alaabta',
        body: ['Waxaan ku dadaalnaa inaan si sax ah u sharaxno oo u sawirno alaabta, laakiin midabada wax yar ayay ku kala duwanaan karaan shaashadaha.'],
      },
      {
        heading: 'Xaddidaadda mas\'uuliyadda',
        body: ['Ilaa xadka sharcigu oggol yahay, ABDULL mas\'uul kama aha khasaarooyinka aan tooska ahayn ee ka dhasha isticmaalka bogga.'],
      },
    ],
  },
};
