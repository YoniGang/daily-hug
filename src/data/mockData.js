const now = Date.now();
const DAY = 86400000;

export const defaultFeedPosts = [
  {
    id: "dm-1",
    type: "daily-message",
    content: "בוקר טוב יפה שלי, אני כל כך גאה בך.",
    emoji: "🌅",
    timestamp: now,
  },
  {
    id: "dm-2",
    type: "daily-message",
    content: "את לא חייבת להיות מושלמת היום. את פשוט צריכה להיות את — וזה יותר ממספיק.",
    emoji: "💛",
    timestamp: now - DAY,
  },
  {
    id: "dm-3",
    type: "daily-message",
    content: "התאהבתי בך בגלל מי שאת, ואני מתאהב מחדש כל יום שעובר.",
    emoji: "🌸",
    timestamp: now - DAY * 2,
  },
  {
    id: "dm-4",
    type: "daily-message",
    content: "גם בימים הכי קשים, את החלק הכי רך והכי יפה בעולם שלי.",
    emoji: "🫶",
    timestamp: now - DAY * 3,
  },
  {
    id: "dm-5",
    type: "daily-message",
    content: "קחי נשימה עמוקה. שרדת 100% מהימים הכי קשים שלך. אני מאמין בך.",
    emoji: "🌿",
    timestamp: now - DAY * 4,
  },
  {
    id: "dm-6",
    type: "daily-message",
    content: "אם אף אחד לא אמר לך היום — את אהובה, את ראויה, ואת עושה דברים מדהימים.",
    emoji: "✨",
    timestamp: now - DAY * 5,
  },
  {
    id: "dm-7",
    type: "daily-message",
    content: "את האדם האהוב עליי בכל היקום. בלי תחרות.",
    emoji: "🪐",
    timestamp: now - DAY * 6,
  },
  {
    id: "fp-1",
    type: "gratitude",
    content: "תודה שתמיד יודעת בדיוק מתי אני צריך חיבוק בלי שאני אומר מילה.",
    emoji: "🤗",
    timestamp: now - DAY * 0.5,
  },
  {
    id: "fp-2",
    type: "success",
    content: "זוכרת שנתת את המצגת בעבודה ופשוט רסקת את זה? זו היית את. רק את.",
    emoji: "🌟",
    timestamp: now - DAY * 1.5,
  },
  {
    id: "fp-3",
    type: "love",
    content: "אני אוהב את הדרך שבה העיניים שלך נדלקות כשאת מדברת על משהו שאת נלהבת ממנו. זה הדבר האהוב עליי לצפות בו.",
    emoji: "💕",
    timestamp: now - DAY * 2.5,
  },
  {
    id: "fp-4",
    type: "moment",
    content: "הפעם שעזרת לזר לשאת את הקניות — אפילו לא חשבת פעמיים. זו את בליבה.",
    emoji: "🌻",
    timestamp: now - DAY * 3.5,
  },
  {
    id: "fp-5",
    type: "gratitude",
    content: "תודה שאת סבלנית איתי כשאני לא במיטבי. החסד שלך גורם לי לרצות להיות טוב יותר.",
    emoji: "🙏",
    timestamp: now - DAY * 4.5,
  },
  {
    id: "fp-6",
    type: "success",
    content: "הכנת את הארוחה המדהימה מאפס בשבוע שעבר. גורדון רמזי לא היה מגיע לקרסוליים שלך.",
    emoji: "👩‍🍳",
    timestamp: now - DAY * 5.5,
  },
  {
    id: "fp-7",
    type: "love",
    content: "אני אוהב איך שאת שרה בשקט כשאת חושבת שאף אחד לא שומע. (אני תמיד שומע.)",
    emoji: "🎵",
    timestamp: now - DAY * 6.5,
  },
  {
    id: "fp-8",
    type: "moment",
    content: "כשנשארת ערה עד מאוחר כדי לעזור לחברה שלך לעבור רגע קשה — הלב שלך כל כך גדול שזה מדהים אותי.",
    emoji: "💜",
    timestamp: now - DAY * 7,
  },
  {
    id: "fp-9",
    type: "gratitude",
    content: "תודה שאת הופכת את הבית שלנו למקום הכי חם על פני כדור הארץ. זה לא הקירות, זו את.",
    emoji: "🏡",
    timestamp: now - DAY * 8,
  },
  {
    id: "fp-10",
    type: "love",
    content: "אני אוהב את הצחוק שלך. האמיתי, המבולגן, זה שבו את לא יכולה לנשום. הזה. עוד מזה, בבקשה.",
    emoji: "😂",
    timestamp: now - DAY * 14,
  },
];

export const defaultHappyJarItems = [
  {
    id: "hj-1",
    type: "memory",
    title: "הריקוד הראשון שלנו במטבח",
    description: "זוכרת כשרקדנו לשיר המטופש ההוא תוך כדי הכנת פסטה? הצחוק שלך באותו ערב הוא הצליל האהוב עליי.",
    color: "peach",
  },
  {
    id: "hj-2",
    type: "quote",
    title: "תזכורת קטנה",
    description: "\"היא לא חיפשה אביר, היא חיפשה חרב.\" — את האדם הכי חזק שאני מכיר.",
    color: "lavender",
  },
  {
    id: "hj-3",
    type: "memory",
    title: "השקיעה בחוף",
    description: "הערב ההוא שישבנו בשקט וצפינו בשקיעה. הסתכלתי עלייך וחשבתי — ככה מרגיש שלווה.",
    color: "sage",
  },
  {
    id: "hj-4",
    type: "photo",
    title: "החיוך שלך באותו בוקר",
    description: "בוקר שבת עצלן ההוא שהתעוררת צוחקת מחלום. הלוואי שיכולתי לשמור את הרגע הזה בבקבוק.",
    color: "blush",
  },
  {
    id: "hj-5",
    type: "quote",
    title: "משהו בשבילך",
    description: "\"בים של אנשים, העיניים שלי תמיד יחפשו אותך.\" — כי זה נכון. תמיד.",
    color: "peach",
  },
  {
    id: "hj-6",
    type: "memory",
    title: "השירה בטיול הכביש",
    description: "זוכרת שצרחנו שירים בנסיעה של 3 שעות? הלחיים שלי כאבו מצחוק. הנווטת הכי טובה.",
    color: "lavender",
  },
  {
    id: "hj-7",
    type: "memory",
    title: "מבצר השמיכות",
    description: "כשבנינו את מבצר השמיכות המגוחך וראינו סרטים כל הלילה. הייתי גר במבצר הזה לנצח איתך.",
    color: "sage",
  },
  {
    id: "hj-8",
    type: "quote",
    title: "מהלב שלי",
    description: "\"את ההיום שלי וכל המחרים שלי.\" — ואני מתכוון לכל מילה.",
    color: "blush",
  },
];

export const defaultGratitudeArchive = [
  {
    id: "g-seed-1",
    items: [
      "על הקפה שהיה מושלם הבוקר",
      "על השיחה עם אמא",
      "על הרגע השקט בערב",
    ],
    timestamp: now - DAY,
  },
  {
    id: "g-seed-2",
    items: [
      "על החיוך של הילדה ברחוב",
      "שהצלחתי לסיים את המשימה בעבודה",
      "על השמש שיצאה אחרי הגשם",
    ],
    timestamp: now - DAY * 3,
  },
  {
    id: "g-seed-3",
    items: [
      "על הארוחה המשפחתית",
      "על החיבוק שקיבלתי",
      "שהיה לי רגע של שקט",
    ],
    timestamp: now - DAY * 5,
  },
];

export const defaultGeneralNotes = [
  {
    id: "n-seed-1",
    text: "\"היי את. כן, את. את עושה עבודה מדהימה.\"",
    color: "lavender",
    timestamp: now - DAY * 0.5,
  },
  {
    id: "n-seed-2",
    text: "לזכור לנשום. לא הכל דחוף כמו שזה מרגיש.",
    color: "sage",
    timestamp: now - DAY * 2,
  },
  {
    id: "n-seed-3",
    text: "רעיון למתנה ליום הולדת של אבא 🎁",
    color: "peach",
    timestamp: now - DAY * 4,
  },
  {
    id: "n-seed-4",
    text: "המשפט היפה מהפודקאסט: ״אושר הוא לא יעד, הוא דרך.״",
    color: "blush",
    timestamp: now - DAY * 6,
  },
];
