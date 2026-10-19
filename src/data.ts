import { ScheduleBlock } from "./types";

export const vitaminSchedule: ScheduleBlock[] = [
  {
    id: "waking",
    title: "UPON WAKING",
    timeOfDay: "Morning",
    iconName: "Sunrise",
    mealTime: "07:00",
    prepTimeMinutes: 5,
    instructions: "Empty Stomach",
    fastingNote: "Ideal time for fasting. Stick to water, black coffee, or plain tea.",
    items: [
      { id: "waking-water", name: "Filtered Water with Trace Minerals & Sea Salt", dosage: "16 oz", benefits: "Rehydrates the body after sleep, replenishes electrolytes, and kickstarts metabolism.", pairings: "Pair with a few drops of lemon juice for vitamin C and digestive stimulation.", foodSources: "Cucumber, watermelon, or celery for natural hydration." },
      { id: "waking-creatine", name: "Creatine Monohydrate", dosage: "3–5 g", benefits: "Increases ATP production, enhancing brain function and physical strength.", pairings: "Pair with a pinch of sea salt to improve cellular uptake.", foodSources: "Red meat (beef) and wild-caught salmon." },
      { id: "waking-amino", name: "Perfect Amino", dosage: "As directed on packaging", benefits: "Provides essential building blocks for muscle repair without breaking a fast.", pairings: "Best taken alone or with water to ensure 99% utilization.", foodSources: "Pasture-raised eggs and grass-fed whey (if not fasting)." },
    ],
  },
  {
    id: "breakfast",
    title: "BREAKFAST",
    timeOfDay: "Morning",
    iconName: "Sun",
    mealTime: "08:30",
    prepTimeMinutes: 15,
    instructions: "Take with a dense, solid meal to buffer your stomach",
    mealSuggestion: "Protein-heavy meal: e.g., 3 pasture-raised eggs, avocado, and sautéed spinach.",
    fastingNote: "Break your fast gently with high protein and fats rather than refined carbs.",
    items: [
      { id: "breakfast-folinic", name: "Folinic Acid (Calcium Folinate)", dosage: "800–1200 mcg", benefits: "Supports DNA methylation, cellular energy, and neurotransmitter production.", pairings: "Pair with B12 for synergistic methylation support.", foodSources: "Dark leafy greens (spinach, kale), asparagus, and beef liver." },
      { id: "breakfast-b12", name: "Hydroxo/Adeno-cobalamin (Vitamin B12)", dosage: "1000–2000 mcg", benefits: "Crucial for nerve health, brain function, and red blood cell production.", pairings: "Pair with Folate (B9) to support the methylation cycle.", foodSources: "Clams, sardines, beef liver, and nutritional yeast." },
      { id: "breakfast-b2", name: "Riboflavin-5-Phosphate (Vitamin B2)", dosage: "50–100 mg", benefits: "Key cofactor for energy production and recycling glutathione.", pairings: "Take with other B-vitamins to maintain balance.", foodSources: "Almonds, grass-fed dairy, and organ meats." },
      { id: "breakfast-b6", name: "Pyridoxal-5-Phosphate (P-5-P / Vitamin B6)", dosage: "25–50 mg", benefits: "Helps synthesize serotonin and dopamine, improving mood and focus.", pairings: "Pair with Magnesium for better absorption and neurotransmitter balance.", foodSources: "Wild-caught salmon, chickpeas, and poultry." },
      { id: "breakfast-zinc", name: "Zinc Picolinate", dosage: "15–30 mg", notes: "Crucial: Do not take on an empty stomach", isCrucial: true, benefits: "Supports immune function, testosterone production, and gut lining repair.", pairings: "Pair with Quercetin to push zinc into cells.", foodSources: "Oysters, pumpkin seeds, and grass-fed beef." },
      { id: "breakfast-dim", name: "DIM", dosage: "200 mg", benefits: "Supports healthy estrogen metabolism and hormonal balance.", pairings: "Pair with cruciferous vegetables to enhance its natural effects.", foodSources: "Broccoli, cauliflower, and Brussels sprouts." },
      { id: "breakfast-tmg", name: "Betaine (TMG)", dosage: "500–1500 mg", benefits: "Lowers homocysteine levels and supports healthy liver function.", pairings: "Pair with Choline or B12 for optimal methylation.", foodSources: "Beets, quinoa, and spinach." },
      { id: "breakfast-molybdenum", name: "Molybdenum", dosage: "75–150 mcg", benefits: "Helps the liver break down sulfites and toxins.", pairings: "Helpful alongside NAC to balance sulfur pathways.", foodSources: "Lentils, black-eyed peas, and oats." },
      { id: "breakfast-cordyceps", name: "Cordyceps Mushroom Extract", dosage: "As directed on packaging", notes: "Monitor closely for anxiety/overstimulation", benefits: "Boosts physical stamina and oxygen utilization in cells.", pairings: "Pair with healthy fats like coconut oil for absorption.", foodSources: "Natural cordyceps (rare), but other adaptogenic mushrooms offer similar resilience." },
      { id: "breakfast-collagen", name: "Multi Collagen", dosage: "As directed on packaging", notes: "Can be taken here, or moved to Lunch/Dinner. Do not take \"Upon Waking\"", benefits: "Repairs gut lining, supports joint health, and improves skin elasticity.", pairings: "Pair with Vitamin C to stimulate natural collagen synthesis.", foodSources: "Bone broth, tough cuts of slow-cooked meat." },
    ],
  },
  {
    id: "lunch",
    title: "LUNCH",
    timeOfDay: "Afternoon",
    iconName: "SunMedium",
    mealTime: "12:30",
    prepTimeMinutes: 15,
    mealSuggestion: "Focus on micronutrients: A large salad with mixed greens, olive oil, and wild-caught salmon.",
    items: [
      { id: "lunch-nac", name: "N-Acetylcysteine (NAC)", dosage: "600–900 mg", benefits: "Precursor to glutathione, the body's master antioxidant. Protects liver and brain.", pairings: "Pair with Vitamin C or Selenium to boost antioxidant capacity.", foodSources: "High-protein foods like chicken, turkey, and eggs (which contain cysteine)." },
      { id: "lunch-taurine", name: "Taurine", dosage: "500–1000 mg", benefits: "Supports cardiovascular health, bile acid production, and nervous system calm.", pairings: "Pair with Magnesium to enhance relaxation.", foodSources: "Scallops, mussels, and dark poultry meat." },
      { id: "lunch-kidney", name: "Grassfed Kidney / DAO Enzyme", dosage: "As directed on packaging", notes: "Take with your highest-histamine meals", benefits: "Provides naturally occurring DAO to break down histamine in foods.", pairings: "Pair with Quercetin for a dual anti-histamine effect.", foodSources: "Fresh, un-aged meats; avoid fermented foods if histamine intolerant." },
      { id: "lunch-quercetin", name: "Quercetin", dosage: "500 mg", benefits: "Acts as a natural antihistamine and anti-inflammatory agent.", pairings: "Pair with Zinc (acts as an ionophore) and Vitamin C.", foodSources: "Capers, red onions, apples, and berries." },
      { id: "lunch-coq10", name: "CoQ10 (Ubiquinol)", dosage: "100–200 mg", benefits: "Vital for mitochondrial energy production and heart health.", pairings: "Pair with PQQ for synergistic mitochondrial support and take with fats.", foodSources: "Beef heart, sardines, and mackerel." },
      { id: "lunch-pqq", name: "PQQ", dosage: "10–20 mg", benefits: "Stimulates mitochondrial biogenesis (creation of new mitochondria).", pairings: "Pair with CoQ10.", foodSources: "Natto, parsley, green peppers, and kiwi." },
      { id: "lunch-ala", name: "Alpha-Lipoic Acid (ALA)", dosage: "As directed on packaging", benefits: "Powerful antioxidant that helps recycle Vitamin C and E and supports blood sugar.", pairings: "Pair with Acetyl-L-Carnitine (ALCAR) for brain energy.", foodSources: "Broccoli, spinach, and organ meats." },
      { id: "lunch-selenium", name: "Selenium", dosage: "200 mcg", benefits: "Essential for thyroid hormone conversion and glutathione production.", pairings: "Pair with Iodine (carefully) for thyroid health.", foodSources: "Brazil nuts (just 2-3 per day), yellowfin tuna." },
    ],
  },
  {
    id: "dinner",
    title: "DINNER",
    timeOfDay: "Evening",
    iconName: "Utensils",
    mealTime: "18:30",
    prepTimeMinutes: 30,
    instructions: "Must include healthy fats for absorption",
    mealSuggestion: "Fats and veggies: Grass-fed ribeye or wild salmon with roasted asparagus and grass-fed butter.",
    fastingNote: "Aim to finish this meal 3-4 hours before bedtime to start your evening fasting window.",
    items: [
      { id: "dinner-nac", name: "N-Acetylcysteine (NAC)", dosage: "600–900 mg", notes: "This is your second dose to maintain glutathione levels", benefits: "Continuous antioxidant support throughout the night.", pairings: "Pair with Glycine before bed for enhanced glutathione synthesis.", foodSources: "Pork, chicken, and yogurt." },
      { id: "dinner-d3k2", name: "Vitamin D3 + K2 (MK-7)", dosage: "As needed", benefits: "D3 supports immunity and mood; K2 ensures calcium is deposited in bones, not arteries.", pairings: "Must pair with healthy dietary fats (e.g., avocado or butter) for absorption.", foodSources: "Wild salmon, egg yolks, and natto (for K2)." },
      { id: "dinner-epa-dha", name: "EPA / DHA (Fish Oil)", dosage: "As directed on packaging", benefits: "Reduces systemic inflammation and supports brain cell membranes.", pairings: "Pair with Astaxanthin or Vitamin E to prevent oxidation.", foodSources: "Sardines, mackerel, and anchovies (SMASH fish)." },
    ],
  },
  {
    id: "bedtime",
    title: "BEDTIME",
    timeOfDay: "Night",
    iconName: "Moon",
    mealTime: "22:00",
    prepTimeMinutes: 5,
    fastingNote: "Fasting state should be active. Only consume water or herbal teas (like chamomile).",
    items: [
      { id: "bedtime-magnesium", name: "Magnesium Glycinate", dosage: "400–600 mg", benefits: "Relaxes muscles, calms the nervous system, and improves deep sleep architecture.", pairings: "Pair with L-Theanine for enhanced sleep quality.", foodSources: "Pumpkin seeds, spinach, and dark chocolate." },
      { id: "bedtime-theanine", name: "L-Theanine", dosage: "200–400 mg", benefits: "Promotes alpha brain waves, facilitating relaxation without drowsiness.", pairings: "Pair with Magnesium or Apigenin (chamomile).", foodSources: "Green tea (though avoid the caffeine at night) and specific mushrooms." },
      { id: "bedtime-phosphatidylserine", name: "Phosphatidylserine", dosage: "100–300 mg", benefits: "Lowers nighttime cortisol levels, helping the brain switch off and stay asleep.", pairings: "Pair with Omega-3s earlier in the day to build cell membranes.", foodSources: "Mackerel, herring, and soy lecithin." },
      { id: "bedtime-reishi", name: "Reishi Mushroom Extract", dosage: "As directed on packaging", benefits: "Acts as a grounding adaptogen to calm the immune and nervous systems.", pairings: "Pair with chamomile or passionflower tea.", foodSources: "Reishi mushroom tea or dual-extract tinctures." },
    ],
  }
];

// Helper to get total items in schedule
export const getTotalSupplements = (schedule: ScheduleBlock[] = vitaminSchedule): number => {
  return schedule.reduce((total, block) => total + block.items.length, 0);
};
