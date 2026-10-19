const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function buildPackets() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const zip = new JSZip();

  const consultationPrompt = `You are an expert functional medicine specialist, clinical pharmacologist, and pediatric/adult nutrition expert.

I am sharing my current daily vitamin and supplement stack along with my personal health profile.

### PERSONAL HEALTH PROFILES:
- Active Profile: Cory (Age 10, Male, 72 lbs)
  - Dietary Style: Omnivore, gentle absorption with food
  - Health Goals: Cognitive Focus & Memory, Mitochondrial Energy, Immune Resilience
  - Known Sensitivities / Allergies: Sensitive Stomach / GERD. High sensitivity to heavy pill stacks; prefers gentle absorption with food.
  - Daily Rhythm: Wake ~07:30 | Bed ~20:30

- Secondary Profile: Taylen (Age 9, Female, 64 lbs)
  - Dietary Style: Low-Histamine, sensory-friendly, low visual clutter
  - Health Goals: Deep REM Sleep, Gut Barrier Repair, Histamine Tolerance
  - Known Sensitivities / Allergies: Histamine Intolerance, Sensory Sensitive
  - Daily Rhythm: Wake ~07:30 | Bed ~20:30

### CURRENT DAILY SCHEDULE (23 Supplements across 5 Circadian Blocks):

#### Block 1: UPON WAKING (07:00 - Empty Stomach / Fasting)
- Filtered Water with Trace Minerals & Sea Salt | Dose: 16 oz (Rehydrates, electrolytes, kickstarts metabolism)
- Creatine Monohydrate | Dose: 3–5 g (Increases ATP production, cellular energy)
- Perfect Amino | Dose: As directed on packaging (Essential amino acids without breaking fast)

#### Block 2: BREAKFAST (08:30 - With Solid Protein Meal)
- Folinic Acid (Calcium Folinate) | Dose: 800–1200 mcg (DNA methylation, neurotransmitter support)
- Hydroxo/Adeno-cobalamin (Vitamin B12) | Dose: 1000–2000 mcg (Nerve health, brain function)
- Riboflavin-5-Phosphate (Vitamin B2) | Dose: 50–100 mg (Cofactor for energy and recycling glutathione)
- Pyridoxal-5-Phosphate (P-5-P / Vitamin B6) | Dose: 25–50 mg (Serotonin & dopamine synthesis)
- Zinc Picolinate | Dose: 15–30 mg [CRUCIAL: Do not take on empty stomach]
- DIM (Diindolylmethane) | Dose: 200 mg (Hormonal balance)
- Betaine (TMG) | Dose: 500–1500 mg (Methylation & liver support)
- Molybdenum | Dose: 75–150 mcg (Sulfur metabolism & toxin breakdown)
- Cordyceps Mushroom Extract | Dose: As directed (Monitor closely for stimulation)
- Multi Collagen | Dose: As directed (Gut lining repair, joint health)

#### Block 3: LUNCH (12:30 - With Micronutrient-Dense Meal)
- N-Acetylcysteine (NAC) | Dose: 600–900 mg (Precursor to master antioxidant Glutathione)
- Taurine | Dose: 500–1000 mg (Cardiovascular & calming neurotransmitter support)
- Grassfed Kidney / DAO Enzyme | Dose: As directed (Breaks down histamine in food)
- Quercetin | Dose: 500 mg (Natural antihistamine, zinc ionophore)
- CoQ10 (Ubiquinol) | Dose: 100–200 mg (Mitochondrial ATP production, take with fats)
- PQQ | Dose: 10–20 mg (Mitochondrial biogenesis)
- Alpha-Lipoic Acid (ALA) | Dose: As directed (Universal antioxidant, recycles Vitamin C & E)
- Selenium | Dose: 200 mcg (Thyroid hormone conversion & glutathione)

#### Block 4: DINNER (18:30 - Must include healthy dietary fats)
- N-Acetylcysteine (NAC) - 2nd Dose | Dose: 600–900 mg (Sustained glutathione overnight)
- Vitamin D3 + K2 (MK-7) | Dose: As needed (D3 absorbs calcium; K2 deposits calcium into bones, not arteries; must have dietary fats)
- EPA / DHA (Fish Oil) | Dose: As directed (Reduces systemic inflammation, brain cell membranes)

#### Block 5: BEDTIME (22:00 - Night / Fasting Window)
- Magnesium Glycinate | Dose: 400–600 mg (Relaxes muscles, nervous system calm, deep sleep)
- L-Theanine | Dose: 200–400 mg (Alpha brain waves, relaxation without drowsiness)
- Phosphatidylserine | Dose: 100–300 mg (Lowers evening cortisol spike)
- Reishi Mushroom Extract | Dose: As directed (Grounding adaptogen for immune/nervous system)

---
### CLINICAL & PHARMACOLOGICAL REVIEW QUESTIONS:
1. WHAT NOT TO TAKE TOGETHER (Nutrient Clashes): Identify competing absorption pathways (e.g. Calcium inhibiting Iron or Zinc; Zinc depleting Copper; fat-soluble vitamins without dietary fats).
2. TIMING & CIRCADIAN BIOAVAILABILITY: Are energizing supplements (B vitamins, Cordyceps, D3) kept strictly to the morning/day, and calming supplements (Magnesium, Theanine, Phosphatidylserine) to bedtime?
3. SENSITIVITY & AGE CHECKS: Check dosages for Cory (Age 10, sensitive stomach) and Taylen (Age 9, histamine intolerance). Identify any supplements that need titration or food buffers.
4. SYNERGISTIC CO-FACTORS: Verify co-factors (e.g. D3 + K2 + Magnesium; Zinc + Quercetin; NAC + Glycine).
5. OPTIMIZED REVISED SCHEDULE: Provide a refined, clash-free schedule with meal timing notes.
`;

  zip.file(
    'README_CHATGPT_INSTRUCTIONS.md',
    `# Vitality Vitamin Stack & Health Packet for ChatGPT

This packet is specifically formatted for direct consultation with ChatGPT (GPT-4o, ChatGPT Plus, or free ChatGPT).

## How to use with ChatGPT:
1. Drag and drop this .zip file directly into your ChatGPT chat box (or attach via the paperclip icon).
2. Or open PROMPT_TO_PASTE_IN_CHATGPT.txt and copy/paste directly!
3. Ask ChatGPT to conduct a comprehensive clinical pharmacology review of your daily schedule.

## Files Included:
- PROMPT_TO_PASTE_IN_CHATGPT.txt: Ready-to-use consultation prompt with all profiles and schedules.
- CURRENT_VITAMIN_SCHEDULE.md: Formatted tables for Morning, Breakfast, Lunch, Dinner, and Bedtime.
- PERSONAL_HEALTH_PROFILE.md: Profiles for Cory (Age 10) and Taylen (Age 9).
- VITAMIN_CLASHES_AND_SYNERGIES_REFERENCE.md: Clinical reference guide on mineral competition and fat solubility.
- ALL_DATA.json: Machine-readable JSON data for calculations.
- FULL_CONSULTATION_PACKET.md: All information combined into one single document.
`
  );

  zip.file('PROMPT_TO_PASTE_IN_CHATGPT.txt', consultationPrompt);
  zip.file('FULL_CONSULTATION_PACKET.md', consultationPrompt);
  zip.file('CURRENT_VITAMIN_SCHEDULE.md', consultationPrompt);

  zip.file(
    'PERSONAL_HEALTH_PROFILE.md',
    `# Personal Health Profiles

### Cory (Age 10)
- Gender: Male
- Weight: 72 lbs
- Height: 4'6"
- Dietary Style: Omnivore
- Goals: Cognitive Focus & Memory, Mitochondrial Energy, Immune Resilience
- Diagnosed Conditions / Sensitivities: Sensitive Stomach / GERD. High sensitivity to heavy pill stacks; prefers gentle absorption with food.
- Circadian Timing: Wake at 07:30, Sleep at 20:30

### Taylen (Age 9)
- Gender: Female
- Weight: 64 lbs
- Height: 4'3"
- Dietary Style: Low-Histamine
- Goals: Deep REM Sleep, Gut Barrier Repair, Histamine Tolerance
- Diagnosed Conditions / Sensitivities: Histamine Intolerance, Sensory Sensitive. Needs low visual clutter and calm pacing.
- Circadian Timing: Wake at 07:30, Sleep at 20:30
`
  );

  zip.file(
    'VITAMIN_CLASHES_AND_SYNERGIES_REFERENCE.md',
    `# Essential Vitamin & Mineral Interaction Rules

### Rule 1: Divalent Cations Compete for DMT1 Transporters
- **The Elements**: Calcium (Ca²⁺), Iron (Fe²⁺/Fe³⁺), Zinc (Zn²⁺), Magnesium (Mg²⁺).
- **The Problem**: When taken together in the same meal or capsule window, these minerals saturate the same intestinal receptors (Divalent Metal Transporter 1), slashing absorption by 40-70%.
- **Action**:
  - Take Iron and Zinc in the morning or early afternoon.
  - Take Calcium and Magnesium in the evening or separated by at least 2 hours.
  - Never take Iron with high-calcium dairy or calcium supplements.

### Rule 2: Fat-Soluble Vitamins Require Dietary Lipids
- **The Elements**: Vitamins A, D3, E, K1/K2, CoQ10, Astaxanthin, Omega-3s.
- **The Problem**: Taken on an empty stomach with plain water, up to 80% passes through without micellization or lymphatic transport.
- **Action**: Always take with at least 5-10g of healthy dietary fats (eggs, avocado, olive oil, nut butter, whole milk/yogurt).

### Rule 3: The Vitamin D3 + K2 + Magnesium Golden Triad
- **Vitamin D3** increases calcium absorption from the gut.
- **Vitamin K2 (MK-7)** activates osteocalcin and Matrix Gla Protein (MGP) to deposit that calcium into bones and teeth, preventing vascular and arterial calcification.
- **Magnesium** is the essential enzymatic co-factor required to convert inactive D3 into circulating 25-hydroxyvitamin D [25(OH)D] and active calcitriol [1,25(OH)2D].

### Rule 4: Coffee, Tea, and Tannin Blocking Window
- **Polyphenols and tannins** in coffee and black/green tea strongly bind to Iron and Zinc, creating insoluble complexes.
- **Action**: Wait 45-60 minutes after your morning coffee before taking mineral capsules.

### Rule 5: Circadian Sleep Hygiene for Supplements
- **Morning (Energizing)**: B-Complex, Vitamin D3, CoQ10, Cordyceps, Rhodiola.
- **Evening (Calming & Repair)**: Magnesium Glycinate/Threonate, L-Theanine, Apigenin, Glycine, Chamomile, Tart Cherry.
`
  );

  zip.file(
    'ALL_DATA.json',
    JSON.stringify(
      {
        appName: 'Vitality Vitamin Protocol',
        exportedAt: new Date().toISOString(),
        profiles: [
          {
            profileId: 'cory',
            name: 'Cory',
            age: 10,
            gender: 'Male',
            weight: '72 lbs',
            height: "4'6\"",
            dietaryPreference: 'Omnivore',
            healthGoals: ['Cognitive Focus & Memory', 'Mitochondrial Energy', 'Immune Resilience'],
            healthConditions: ['Sensitive Stomach / GERD'],
            notes: 'Starting square one. High sensitivity to heavy pill stacks; prefers gentle absorption with food.'
          },
          {
            profileId: 'taylen',
            name: 'Taylen',
            age: 9,
            gender: 'Female',
            weight: '64 lbs',
            height: "4'3\"",
            dietaryPreference: 'Low-Histamine',
            healthGoals: ['Deep REM Sleep', 'Gut Barrier Repair', 'Histamine Tolerance'],
            healthConditions: ['Histamine Intolerance', 'Sensory Sensitive'],
            notes: 'Sensory-friendly, low visual clutter, calm pacing. Low-histamine dietary focus.'
          }
        ]
      },
      null,
      2
    )
  );

  const packetBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(publicDir, 'vitality-chatgpt-packet.zip'), packetBuf);
  console.log('Built public/vitality-chatgpt-packet.zip successfully. Size:', packetBuf.length);
}

buildPackets().catch(err => {
  console.error('Build packets failed:', err);
  process.exit(1);
});
