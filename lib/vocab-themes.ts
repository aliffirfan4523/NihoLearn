export interface VocabTheme {
  id: string;
  name: string;
  emoji: string;
  iconName: string;
  description: string;
  keywords: string[];
}

export const VOCAB_THEMES: VocabTheme[] = [
  {
    id: "colors",
    name: "Colors",
    emoji: "🎨",
    iconName: "Palette",
    description: "Color names, shades, and visual appearance",
    keywords: ["color", "red", "blue", "yellow", "white", "black", "green", "purple", "brown", "orange", "pink", "grey", "gray", "赤", "青", "黄", "白", "黒", "緑", "紫", "色"],
  },
  {
    id: "food",
    name: "Food & Drink",
    emoji: "🍴",
    iconName: "Utensils",
    description: "Meals, ingredients, dishes, and drinks",
    keywords: ["food", "drink", "eat", "meal", "rice", "bread", "meat", "fish", "vegetable", "fruit", "water", "tea", "coffee", "beer", "wine", "restaurant", "breakfast", "lunch", "dinner", "cook", "taste", "delicious", "食", "飲", "飯", "肉", "魚", "茶", "水", "酒", "味"],
  },
  {
    id: "clothing",
    name: "Clothing & Accessories",
    emoji: "👕",
    iconName: "Shirt",
    description: "Apparel, footwear, accessories, and wear",
    keywords: ["wear", "cloth", "shirt", "pants", "shoe", "hat", "cap", "glass", "coat", "jacket", "dress", "suit", "skirt", "tie", "sock", "pocket", "bag", "ring", "watch", "着", "履", "服", "靴", "帽"],
  },
  {
    id: "objects",
    name: "Everyday Objects",
    emoji: "📦",
    iconName: "Package",
    description: "Household tools, furniture, and daily items",
    keywords: ["object", "item", "book", "desk", "chair", "bed", "door", "window", "key", "box", "paper", "pen", "pencil", "knife", "clock", "watch", "phone", "camera", "computer", "money", "wallet", "本", "机", "椅", "鍵", "箱", "紙", "筆", "金", "物"],
  },
  {
    id: "buildings",
    name: "Buildings & Rooms",
    emoji: "🏢",
    iconName: "Building2",
    description: "Rooms, facilities, stores, and structures",
    keywords: ["building", "house", "home", "room", "kitchen", "bath", "toilet", "hospital", "school", "bank", "station", "shop", "store", "library", "hotel", "airport", "hall", "factory", "家", "屋", "室", "校", "院", "駅", "店", "館"],
  },
  {
    id: "locations",
    name: "Places & Locations",
    emoji: "📍",
    iconName: "MapPin",
    description: "Directions, countries, towns, and geography",
    keywords: ["place", "location", "here", "there", "where", "north", "south", "east", "west", "left", "right", "inside", "outside", "country", "city", "town", "street", "road", "park", "sea", "mountain", "river", "地", "所", "国", "町", "道", "山", "川", "海"],
  },
  {
    id: "transport",
    name: "Transportation",
    emoji: "🚆",
    iconName: "Train",
    description: "Vehicles, transit, travel, and commuting",
    keywords: ["train", "car", "bus", "airplane", "plane", "bicycle", "bike", "taxi", "ship", "boat", "subway", "station", "ride", "drive", "travel", "trip", "ticket", "pass", "車", "電", "乗", "降", "飛", "旅"],
  },
  {
    id: "animals",
    name: "Animals",
    emoji: "🐾",
    iconName: "PawPrint",
    description: "Animals, pets, birds, and insects",
    keywords: ["animal", "dog", "cat", "bird", "fish", "insect", "bug", "horse", "cow", "pig", "monkey", "bear", "sheep", "snake", "rabbit", "lion", "tiger", "pet", "犬", "猫", "鳥", "魚", "虫", "馬", "牛", "豚", "獣"],
  },
  {
    id: "nature",
    name: "Plants & Nature",
    emoji: "🌿",
    iconName: "Leaf",
    description: "Flora, trees, flowers, and natural world",
    keywords: ["plant", "nature", "tree", "flower", "grass", "forest", "wood", "leaf", "blossom", "sakura", "garden", "field", "earth", "sky", "star", "sun", "moon", "花", "木", "森", "林", "草", "葉", "庭", "野", "自然"],
  },
  {
    id: "weather",
    name: "Weather & Climate",
    emoji: "⛅",
    iconName: "CloudSun",
    description: "Seasons, climate, temperature, and forecasts",
    keywords: ["weather", "rain", "snow", "wind", "cloud", "sun", "sunny", "storm", "typhoon", "hot", "cold", "warm", "cool", "season", "spring", "summer", "fall", "autumn", "winter", "天", "気", "雨", "雪", "風", "晴", "曇", "春", "夏", "秋", "冬"],
  },
  {
    id: "body",
    name: "Body Parts",
    emoji: "✋",
    iconName: "Hand",
    description: "Anatomy, health, sensations, and medical",
    keywords: ["body", "head", "eye", "ear", "mouth", "nose", "hand", "foot", "leg", "arm", "face", "hair", "finger", "tooth", "teeth", "heart", "stomach", "pain", "hurt", "sick", "ill", "medicine", "doctor", "体", "頭", "目", "耳", "口", "鼻", "手", "足", "顔", "病", "薬"],
  },
  {
    id: "people",
    name: "People & Family",
    emoji: "👥",
    iconName: "Users",
    description: "Family members, relationships, and people",
    keywords: ["person", "people", "man", "woman", "boy", "girl", "child", "children", "father", "mother", "brother", "sister", "parent", "friend", "teacher", "student", "baby", "human", "人", "男", "女", "子", "父", "母", "兄", "姉", "弟", "妹", "友", "先", "生"],
  },
  {
    id: "time",
    name: "Time & Calendar",
    emoji: "⏰",
    iconName: "Clock",
    description: "Hours, days, months, schedule, and dates",
    keywords: ["time", "hour", "minute", "second", "day", "week", "month", "year", "today", "tomorrow", "yesterday", "now", "morning", "afternoon", "evening", "night", "always", "sometimes", "never", "early", "late", "時", "分", "秒", "日", "週", "月", "年", "今", "朝", "昼", "夜"],
  },
  {
    id: "work",
    name: "Work & Study",
    emoji: "💼",
    iconName: "Briefcase",
    description: "Career, office, school, and study terms",
    keywords: ["work", "job", "office", "company", "business", "study", "learn", "exam", "test", "homework", "question", "answer", "lesson", "class", "practice", "teach", "仕", "事", "会", "社", "勉", "強", "習", "試", "験", "宿", "題"],
  },
  {
    id: "actions",
    name: "Actions & Movement",
    emoji: "🏃",
    iconName: "Activity",
    description: "Core verbs, physical movements, and daily actions",
    keywords: ["go", "come", "see", "look", "listen", "hear", "read", "write", "speak", "talk", "buy", "sell", "walk", "run", "stand", "sit", "wait", "meet", "sleep", "wake", "open", "close", "行", "来", "見", "聞", "読", "書", "話", "買", "歩", "走", "立", "座", "待", "会"],
  },
  {
    id: "feelings",
    name: "Feelings & Descriptors",
    emoji: "💡",
    iconName: "Smile",
    description: "Emotions, adjectives, and expressions",
    keywords: ["happy", "sad", "like", "love", "hate", "good", "bad", "big", "small", "new", "old", "fast", "slow", "fun", "enjoyable", "interesting", "difficult", "easy", "thank", "hello", "sorry", "好", "嫌", "楽", "嬉", "悲", "面", "白", "難", "易"],
  },
];

export function getThemeForWord(word: string, reading: string, meaning: string[] = []): VocabTheme {
  const combinedText = `${word} ${reading} ${meaning.join(" ")}`.toLowerCase();

  for (const theme of VOCAB_THEMES) {
    for (const kw of theme.keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        return theme;
      }
    }
  }

  // Default fallback to Actions or Everyday Objects
  if (combinedText.includes("verb") || meaning.some((m) => m.toLowerCase().startsWith("to "))) {
    return VOCAB_THEMES.find((t) => t.id === "actions") || VOCAB_THEMES[0];
  }

  return VOCAB_THEMES.find((t) => t.id === "objects") || VOCAB_THEMES[0];
}
