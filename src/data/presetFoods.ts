export type FoodCategory =
  | 'Fleisch' | 'Fisch' | 'Milchprodukte' | 'Getreide'
  | 'Gemüse' | 'Obst' | 'Nüsse' | 'Fertiggerichte'
  | 'Fastfood' | 'Getränke' | 'Süßigkeiten' | 'Sonstiges'

export interface PresetFood {
  id: string
  name: string
  category: FoodCategory
  calories: number  // per 100g
  protein: number   // per 100g
  carbs: number     // per 100g
  fat: number       // per 100g
  portion: number   // default serving in grams/ml
  portionLabel: string
}

export const FOOD_CATEGORIES: FoodCategory[] = [
  'Fleisch', 'Fisch', 'Milchprodukte', 'Getreide',
  'Gemüse', 'Obst', 'Nüsse', 'Fertiggerichte',
  'Fastfood', 'Getränke', 'Süßigkeiten', 'Sonstiges',
]

// Values per 100g matching FDDB.info reference data
export const PRESET_FOODS: PresetFood[] = [
  // Fleisch
  { id: 'f1',  name: 'Hähnchenbrust (gekocht)',   category: 'Fleisch', calories: 110, protein: 23,  carbs: 0,    fat: 1.2, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'f2',  name: 'Hähnchenbrust (gebraten)',  category: 'Fleisch', calories: 165, protein: 31,  carbs: 0,    fat: 3.6, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'f3',  name: 'Rinderhack (20% Fett)',     category: 'Fleisch', calories: 235, protein: 17,  carbs: 0,    fat: 18,  portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'f4',  name: 'Schweineschnitzel',         category: 'Fleisch', calories: 139, protein: 21,  carbs: 0,    fat: 6,   portion: 150, portionLabel: '1 Stück (150g)' },
  { id: 'f5',  name: 'Putenbrust',               category: 'Fleisch', calories: 107, protein: 24,  carbs: 0,    fat: 0.8, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'f6',  name: 'Rindfleisch (mager)',       category: 'Fleisch', calories: 121, protein: 21,  carbs: 0,    fat: 3.7, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'f7',  name: 'Salami',                   category: 'Fleisch', calories: 425, protein: 19,  carbs: 1,    fat: 38,  portion: 30,  portionLabel: '3 Scheiben (30g)' },
  { id: 'f8',  name: 'Hähnchenschenkel',         category: 'Fleisch', calories: 192, protein: 19,  carbs: 0,    fat: 13,  portion: 200, portionLabel: '1 Stück (200g)' },
  { id: 'f9',  name: 'Lachsschinken',            category: 'Fleisch', calories: 121, protein: 20,  carbs: 0.5,  fat: 4.2, portion: 40,  portionLabel: '2 Scheiben (40g)' },

  // Fisch
  { id: 'fi1', name: 'Lachs (roh)',               category: 'Fisch',   calories: 208, protein: 20,  carbs: 0,    fat: 13,  portion: 150, portionLabel: '1 Filet (150g)' },
  { id: 'fi2', name: 'Thunfisch (Dose, in Wasser)', category: 'Fisch', calories: 116, protein: 26,  carbs: 0,    fat: 1,   portion: 140, portionLabel: '1 Dose (140g)' },
  { id: 'fi3', name: 'Kabeljau',                 category: 'Fisch',   calories: 82,  protein: 18,  carbs: 0,    fat: 0.7, portion: 150, portionLabel: '1 Filet (150g)' },
  { id: 'fi4', name: 'Forelle',                  category: 'Fisch',   calories: 119, protein: 19,  carbs: 0,    fat: 4.3, portion: 150, portionLabel: '1 Filet (150g)' },
  { id: 'fi5', name: 'Makrele',                  category: 'Fisch',   calories: 239, protein: 19,  carbs: 0,    fat: 17,  portion: 150, portionLabel: '1 Filet (150g)' },
  { id: 'fi6', name: 'Garnelen',                 category: 'Fisch',   calories: 71,  protein: 15,  carbs: 0.3,  fat: 0.8, portion: 100, portionLabel: '1 Portion (100g)' },
  { id: 'fi7', name: 'Sardinen (Dose, in Öl)',   category: 'Fisch',   calories: 208, protein: 24,  carbs: 0,    fat: 12,  portion: 100, portionLabel: '1 Dose (100g)' },

  // Milchprodukte
  { id: 'm1',  name: 'Magerquark',               category: 'Milchprodukte', calories: 67,  protein: 12,  carbs: 4,    fat: 0.2, portion: 250, portionLabel: '1 Becher (250g)' },
  { id: 'm2',  name: 'Griechischer Joghurt (10%)', category: 'Milchprodukte', calories: 133, protein: 7,   carbs: 4,    fat: 10,  portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'm3',  name: 'Hüttenkäse',              category: 'Milchprodukte', calories: 72,  protein: 11,  carbs: 2.7,  fat: 1.4, portion: 200, portionLabel: '1 Becher (200g)' },
  { id: 'm4',  name: 'Vollmilch (3.5%)',         category: 'Milchprodukte', calories: 64,  protein: 3.4, carbs: 4.7,  fat: 3.6, portion: 200, portionLabel: '1 Glas (200ml)' },
  { id: 'm5',  name: 'Skyr',                     category: 'Milchprodukte', calories: 63,  protein: 11,  carbs: 4,    fat: 0.2, portion: 200, portionLabel: '1 Becher (200g)' },
  { id: 'm6',  name: 'Gouda',                    category: 'Milchprodukte', calories: 356, protein: 25,  carbs: 0.5,  fat: 28,  portion: 30,  portionLabel: '2 Scheiben (30g)' },
  { id: 'm7',  name: 'Ei (Vollei)',               category: 'Milchprodukte', calories: 155, protein: 13,  carbs: 1.1,  fat: 11,  portion: 60,  portionLabel: '1 Ei (60g)' },
  { id: 'm8',  name: 'Naturjoghurt (3.5%)',       category: 'Milchprodukte', calories: 62,  protein: 3.5, carbs: 4.7,  fat: 3.5, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'm9',  name: 'Magerfrischkäse',          category: 'Milchprodukte', calories: 66,  protein: 8,   carbs: 4.5,  fat: 0.3, portion: 100, portionLabel: '1 Portion (100g)' },
  { id: 'm10', name: 'Feta',                     category: 'Milchprodukte', calories: 264, protein: 14,  carbs: 0.8,  fat: 22,  portion: 50,  portionLabel: '1 Portion (50g)' },

  // Getreide
  { id: 'g1',  name: 'Haferflocken',             category: 'Getreide', calories: 368, protein: 13,  carbs: 59,   fat: 7,   portion: 80,  portionLabel: '1 Portion (80g)' },
  { id: 'g2',  name: 'Vollkornbrot',             category: 'Getreide', calories: 220, protein: 7,   carbs: 39,   fat: 2.5, portion: 50,  portionLabel: '1 Scheibe (50g)' },
  { id: 'g3',  name: 'Reis (gekocht)',            category: 'Getreide', calories: 130, protein: 2.7, carbs: 28,   fat: 0.3, portion: 200, portionLabel: '1 Portion (200g)' },
  { id: 'g4',  name: 'Pasta (gekocht)',           category: 'Getreide', calories: 131, protein: 5,   carbs: 25,   fat: 1.1, portion: 200, portionLabel: '1 Portion (200g)' },
  { id: 'g5',  name: 'Quinoa (gekocht)',          category: 'Getreide', calories: 120, protein: 4.4, carbs: 22,   fat: 1.9, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'g6',  name: 'Weißbrot',                 category: 'Getreide', calories: 265, protein: 8,   carbs: 50,   fat: 3.2, portion: 50,  portionLabel: '1 Scheibe (50g)' },
  { id: 'g7',  name: 'Kartoffeln (gekocht)',      category: 'Getreide', calories: 74,  protein: 1.9, carbs: 16,   fat: 0.1, portion: 200, portionLabel: '1 Portion (200g)' },
  { id: 'g8',  name: 'Süßkartoffel',             category: 'Getreide', calories: 86,  protein: 1.6, carbs: 20,   fat: 0.1, portion: 200, portionLabel: '1 mittelgroße (200g)' },

  // Gemüse
  { id: 'gm1', name: 'Brokkoli',                 category: 'Gemüse',  calories: 34,  protein: 2.8, carbs: 6.6,  fat: 0.4, portion: 200, portionLabel: '1 Portion (200g)' },
  { id: 'gm2', name: 'Spinat',                   category: 'Gemüse',  calories: 23,  protein: 2.9, carbs: 3.6,  fat: 0.4, portion: 200, portionLabel: '1 Portion (200g)' },
  { id: 'gm3', name: 'Paprika (rot)',             category: 'Gemüse',  calories: 31,  protein: 1,   carbs: 6,    fat: 0.3, portion: 150, portionLabel: '1 Stück (150g)' },
  { id: 'gm4', name: 'Gurke',                    category: 'Gemüse',  calories: 13,  protein: 0.7, carbs: 2.2,  fat: 0.1, portion: 100, portionLabel: '1 Portion (100g)' },
  { id: 'gm5', name: 'Tomaten',                  category: 'Gemüse',  calories: 18,  protein: 0.9, carbs: 3.5,  fat: 0.2, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'gm6', name: 'Zucchini',                 category: 'Gemüse',  calories: 17,  protein: 1.2, carbs: 3.4,  fat: 0.3, portion: 200, portionLabel: '1 Portion (200g)' },
  { id: 'gm7', name: 'Avocado',                  category: 'Gemüse',  calories: 160, protein: 2,   carbs: 9,    fat: 15,  portion: 100, portionLabel: '½ Frucht (100g)' },
  { id: 'gm8', name: 'Erbsen (TK)',              category: 'Gemüse',  calories: 81,  protein: 5.4, carbs: 14,   fat: 0.4, portion: 150, portionLabel: '1 Portion (150g)' },

  // Obst
  { id: 'o1',  name: 'Banane',                   category: 'Obst',    calories: 89,  protein: 1.1, carbs: 23,   fat: 0.3, portion: 120, portionLabel: '1 mittelgroße (120g)' },
  { id: 'o2',  name: 'Apfel',                    category: 'Obst',    calories: 52,  protein: 0.3, carbs: 14,   fat: 0.2, portion: 150, portionLabel: '1 mittelgroßer (150g)' },
  { id: 'o3',  name: 'Erdbeeren',                category: 'Obst',    calories: 32,  protein: 0.7, carbs: 7.7,  fat: 0.3, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'o4',  name: 'Orangen',                  category: 'Obst',    calories: 47,  protein: 0.9, carbs: 12,   fat: 0.1, portion: 150, portionLabel: '1 mittelgroße (150g)' },
  { id: 'o5',  name: 'Mango',                    category: 'Obst',    calories: 65,  protein: 0.5, carbs: 17,   fat: 0.3, portion: 200, portionLabel: '1 Portion (200g)' },
  { id: 'o6',  name: 'Beerenmix (gefroren)',      category: 'Obst',    calories: 40,  protein: 0.7, carbs: 9,    fat: 0.3, portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'o7',  name: 'Trauben',                  category: 'Obst',    calories: 69,  protein: 0.7, carbs: 18,   fat: 0.2, portion: 150, portionLabel: '1 Portion (150g)' },

  // Nüsse
  { id: 'n1',  name: 'Mandeln',                  category: 'Nüsse',   calories: 579, protein: 21,  carbs: 22,   fat: 50,  portion: 30,  portionLabel: '1 Handvoll (30g)' },
  { id: 'n2',  name: 'Walnüsse',                 category: 'Nüsse',   calories: 654, protein: 15,  carbs: 14,   fat: 65,  portion: 30,  portionLabel: '1 Handvoll (30g)' },
  { id: 'n3',  name: 'Erdnussbutter',            category: 'Nüsse',   calories: 598, protein: 25,  carbs: 20,   fat: 50,  portion: 30,  portionLabel: '2 EL (30g)' },
  { id: 'n4',  name: 'Chiasamen',                category: 'Nüsse',   calories: 486, protein: 17,  carbs: 42,   fat: 31,  portion: 20,  portionLabel: '2 EL (20g)' },
  { id: 'n5',  name: 'Cashewkerne',              category: 'Nüsse',   calories: 553, protein: 18,  carbs: 30,   fat: 44,  portion: 30,  portionLabel: '1 Handvoll (30g)' },
  { id: 'n6',  name: 'Haselnüsse',               category: 'Nüsse',   calories: 628, protein: 15,  carbs: 17,   fat: 61,  portion: 30,  portionLabel: '1 Handvoll (30g)' },

  // Fertiggerichte
  { id: 'fd1', name: 'Pizza Margherita (TK)',     category: 'Fertiggerichte', calories: 235, protein: 9,   carbs: 30,   fat: 9,   portion: 360, portionLabel: '½ Pizza (360g)' },
  { id: 'fd2', name: 'Kichererbsen (Dose)',       category: 'Fertiggerichte', calories: 164, protein: 8.9, carbs: 27,   fat: 2.6, portion: 240, portionLabel: '1 Dose (240g)' },
  { id: 'fd3', name: 'Weiße Bohnen (Dose)',       category: 'Fertiggerichte', calories: 90,  protein: 6,   carbs: 16,   fat: 0.3, portion: 240, portionLabel: '1 Dose (240g)' },
  { id: 'fd4', name: 'Linsen (Dose)',             category: 'Fertiggerichte', calories: 105, protein: 8,   carbs: 18,   fat: 0.4, portion: 240, portionLabel: '1 Dose (240g)' },
  { id: 'fd5', name: 'Rote Linsensuppe',          category: 'Fertiggerichte', calories: 65,  protein: 4.5, carbs: 10,   fat: 0.8, portion: 300, portionLabel: '1 Teller (300ml)' },

  // Fastfood
  { id: 'ff1', name: 'Döner Kebap',              category: 'Fastfood', calories: 280, protein: 16,  carbs: 27,   fat: 11,  portion: 350, portionLabel: '1 Portion (350g)' },
  { id: 'ff2', name: 'Pommes Frites',            category: 'Fastfood', calories: 312, protein: 3.4, carbs: 41,   fat: 15,  portion: 150, portionLabel: '1 Portion (150g)' },
  { id: 'ff3', name: 'Cheeseburger',             category: 'Fastfood', calories: 300, protein: 15,  carbs: 32,   fat: 12,  portion: 120, portionLabel: '1 Stück (120g)' },
  { id: 'ff4', name: 'Chicken Nuggets (6 Stk)',  category: 'Fastfood', calories: 221, protein: 14,  carbs: 15,   fat: 12,  portion: 100, portionLabel: '6 Stück (100g)' },
  { id: 'ff5', name: 'Hot Dog',                  category: 'Fastfood', calories: 290, protein: 11,  carbs: 24,   fat: 17,  portion: 150, portionLabel: '1 Stück (150g)' },

  // Getränke
  { id: 'gt1', name: 'Whey Proteinshake (zubereitet)', category: 'Getränke', calories: 40,  protein: 4,   carbs: 5,    fat: 0.5, portion: 300, portionLabel: '1 Shake (300ml)' },
  { id: 'gt2', name: 'Orangensaft (frisch)',      category: 'Getränke', calories: 45,  protein: 0.7, carbs: 10,   fat: 0.2, portion: 200, portionLabel: '1 Glas (200ml)' },
  { id: 'gt3', name: 'Hafermilch',               category: 'Getränke', calories: 46,  protein: 0.9, carbs: 8,    fat: 1.5, portion: 200, portionLabel: '1 Glas (200ml)' },
  { id: 'gt4', name: 'Apfelsaft',                category: 'Getränke', calories: 47,  protein: 0.1, carbs: 12,   fat: 0.1, portion: 200, portionLabel: '1 Glas (200ml)' },
  { id: 'gt5', name: 'Mandelmilch (ungesüßt)',    category: 'Getränke', calories: 13,  protein: 0.4, carbs: 0.3,  fat: 1.1, portion: 200, portionLabel: '1 Glas (200ml)' },

  // Süßigkeiten
  { id: 's1',  name: 'Milchschokolade',          category: 'Süßigkeiten', calories: 535, protein: 8,   carbs: 57,   fat: 30,  portion: 50,  portionLabel: '½ Tafel (50g)' },
  { id: 's2',  name: 'Dunkle Schokolade (70%)',  category: 'Süßigkeiten', calories: 599, protein: 8,   carbs: 46,   fat: 43,  portion: 30,  portionLabel: '3 Stücke (30g)' },
  { id: 's3',  name: 'Gummibärchen',             category: 'Süßigkeiten', calories: 343, protein: 6,   carbs: 78,   fat: 0,   portion: 100, portionLabel: '1 Portion (100g)' },
  { id: 's4',  name: 'Vanilleeis',               category: 'Süßigkeiten', calories: 207, protein: 3.5, carbs: 25,   fat: 11,  portion: 100, portionLabel: '2 Kugeln (100g)' },
  { id: 's5',  name: 'Müsliriegel',              category: 'Süßigkeiten', calories: 420, protein: 6,   carbs: 65,   fat: 14,  portion: 50,  portionLabel: '1 Riegel (50g)' },

  // Sonstiges
  { id: 'so1', name: 'Whey Protein (Pulver)',    category: 'Sonstiges', calories: 370, protein: 75,  carbs: 8,    fat: 4,   portion: 30,  portionLabel: '1 Scoop (30g)' },
  { id: 'so2', name: 'Olivenöl',                category: 'Sonstiges', calories: 884, protein: 0,   carbs: 0,    fat: 100, portion: 10,  portionLabel: '1 EL (10ml)' },
  { id: 'so3', name: 'Hummus',                  category: 'Sonstiges', calories: 166, protein: 8,   carbs: 14,   fat: 10,  portion: 80,  portionLabel: '1 Portion (80g)' },
]
