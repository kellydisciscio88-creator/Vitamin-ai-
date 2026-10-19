import JSZip from 'jszip';
import { ScheduleBlock, UserProfile } from '../types';

export function generatePromptText(profile: UserProfile, schedule: ScheduleBlock[]): string {
  const totalItems = schedule.reduce((acc, b) => acc + b.items.length, 0);

  let scheduleText = '';
  schedule.forEach((block, idx) => {
    scheduleText += `\n### Block ${idx + 1}: ${block.title} (${block.mealTime || 'Unscheduled'} - ${block.timeOfDay})\n`;
    if (block.instructions) scheduleText += `Instructions: ${block.instructions}\n`;
    if (block.fastingNote) scheduleText += `Fasting/Food: ${block.fastingNote}\n`;
    if (block.items.length === 0) {
      scheduleText += `  *(No supplements in this block)*\n`;
    } else {
      block.items.forEach(item => {
        scheduleText += `- **${item.name}** | Dose: ${item.dosage}${item.isCrucial ? ' [HIGH PRIORITY]' : ''}\n`;
        if (item.notes) scheduleText += `  - Notes: ${item.notes}\n`;
        if (item.benefits) scheduleText += `  - Target Benefit: ${item.benefits}\n`;
        if (item.pairings) scheduleText += `  - Synergies: ${item.pairings}\n`;
        if (item.foodSources) scheduleText += `  - Food Sources: ${item.foodSources}\n`;
      });
    }
  });

  return `You are an expert functional medicine specialist, clinical pharmacologist, and pediatric/adult nutrition expert.

I am sharing my current daily vitamin and supplement stack along with my personal health profile.

### PERSONAL HEALTH PROFILE:
- Name: ${profile.name}
- Age: ${profile.age || 'Not specified'}
- Biological Sex: ${profile.gender || 'Not specified'}
- Dietary Preference: ${profile.dietaryPreference || 'Standard diet'}
- Health Goals: ${profile.healthGoals?.join(', ') || 'General vitality and wellness'}
- Known Sensitivities / Allergies: ${profile.notes || 'None reported'}
- Health Conditions / Notes: ${profile.healthConditions?.join(', ') || 'None reported'}
- Sleep Schedule: Wake ~${profile.wakeTime || '07:00'} | Bed ~${profile.bedTime || '22:00'}

### MY CURRENT DAILY SCHEDULE (${totalItems} supplements):
${scheduleText}

---
### PLEASE CONDUCT A RIGOROUS CLINICAL & PHARMACOLOGICAL REVIEW:
1. **WHAT NOT TO TAKE TOGETHER (Nutrient Clashes)**: 
   Identify any competing absorption pathways or contraindications (e.g. Calcium inhibiting Iron or Zinc absorption; Zinc depleting Copper; fat-soluble vitamins taken without dietary lipids).
2. **TIMING & CIRCADIAN BIOAVAILABILITY**: 
   Are my vitamins taken at the ideal time of day (e.g. B-vitamins and Vitamin D in morning for energy vs. Magnesium and L-Theanine in evening for GABA and sleep)?
3. **FOOD & FASTING COMPLIANCE**: 
   Which items MUST be taken with a fat-containing meal, which require an empty stomach, and which might cause gastric irritation?
4. **SYNERGISTIC CO-FACTORS**: 
   Are there missing co-factors (e.g. pairing D3 with K2 and Magnesium, or Iron with Vitamin C)?
5. **OPTIMIZED REVISED SCHEDULE**: 
   Provide an upgraded morning, midday, and bedtime schedule that resolves all conflicts and maximizes cellular uptake.
`;
}

export function generateMarkdownSchedule(profile: UserProfile, schedule: ScheduleBlock[]): string {
  let md = `# Daily Vitamin Stack & Schedule Protocol\n\n`;
  md += `**Patient / Individual**: ${profile.name}\n`;
  md += `**Dietary Framework**: ${profile.dietaryPreference || 'Standard'}\n`;
  md += `**Generated**: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
  md += `---\n\n`;

  schedule.forEach((block, idx) => {
    md += `## ${idx + 1}. ${block.title}\n`;
    md += `- **Time of Day**: ${block.timeOfDay} (~${block.mealTime || 'flexible'})\n`;
    if (block.instructions) md += `- **Administration**: ${block.instructions}\n`;
    if (block.fastingNote) md += `- **Food / Fasting State**: ${block.fastingNote}\n\n`;

    if (block.items.length === 0) {
      md += `*No items configured in this window.*\n\n`;
    } else {
      md += `| Supplement | Dosage | Crucial? | Clinical Focus | Food / Pairing Notes |\n`;
      md += `| :--- | :--- | :---: | :--- | :--- |\n`;
      block.items.forEach(item => {
        md += `| **${item.name}** | ${item.dosage} | ${item.isCrucial ? '⭐ Yes' : 'No'} | ${item.benefits || item.notes || '-'} | ${item.pairings || item.foodSources || '-'} |\n`;
      });
      md += `\n`;
    }
  });

  return md;
}

export function generateProfileMarkdown(profile: UserProfile, allProfiles?: UserProfile[]): string {
  let md = `# Personal Health Context & Profile\n\n`;
  md += `### Active Profile: ${profile.name}\n`;
  md += `- **Profile ID**: \`${profile.profileId}\`\n`;
  md += `- **Age**: ${profile.age || 'N/A'}\n`;
  md += `- **Gender**: ${profile.gender || 'N/A'}\n`;
  md += `- **Dietary Style**: ${profile.dietaryPreference || 'Omnivore'}\n`;
  md += `- **Health Goals**: ${profile.healthGoals?.join(', ') || 'Longevity, Energy, Sleep'}\n`;
  md += `- **Allergies & Sensitivities**: ${profile.notes || 'None reported'}\n`;
  md += `- **Diagnosed Conditions / Special Context**: ${profile.healthConditions?.join(', ') || 'None reported'}\n`;
  md += `- **Daily Circadian Rhythm**: Wake at ${profile.wakeTime || '07:00'}, Sleep at ${profile.bedTime || '22:00'}\n\n`;

  if (allProfiles && allProfiles.length > 1) {
    md += `### Other Registered Profiles In Household:\n`;
    allProfiles.forEach(p => {
      if (p.profileId !== profile.profileId) {
        md += `- **${p.name}** (Age ${p.age || 'N/A'}, ${p.dietaryPreference || 'Standard'}): ${p.healthGoals?.join(', ') || 'Vitality'}\n`;
      }
    });
    md += `\n`;
  }

  return md;
}

export function generateInteractionsGuide(): string {
  return `# Essential Vitamin & Mineral Interaction Rules

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
`;
}

export async function createChatGPTZipBlob(
  activeProfile: UserProfile,
  schedule: ScheduleBlock[],
  allProfiles?: UserProfile[]
): Promise<Blob> {
  const zip = new JSZip();

  // 1. README
  zip.file(
    'README_CHATGPT_INSTRUCTIONS.md',
    `# Vitality Vitamin Stack Packet for ChatGPT

This package is curated for immediate consultation with ChatGPT (GPT-4o, ChatGPT Plus, or free ChatGPT).

## Quick Start:
1. Drag and drop this .zip file directly into your ChatGPT chat box (or attach it using the paperclip icon).
2. Alternatively, open **PROMPT_TO_PASTE_IN_CHATGPT.txt** and paste it directly into ChatGPT!
3. Ask ChatGPT to evaluate your stack for nutrient clashes, bioavailability timing, and personalized safety.

## Files included:
- **PROMPT_TO_PASTE_IN_CHATGPT.txt**: Ready-to-use consultation prompt with your specific data.
- **CURRENT_VITAMIN_SCHEDULE.md**: Clean markdown schedule with every supplement, dose, and time.
- **PERSONAL_HEALTH_PROFILE.md**: Personal health background, goals, and sensitivities.
- **ALL_DATA.json**: Structured JSON for ChatGPT code analysis or python calculations.
- **VITAMIN_CLASHES_AND_SYNERGIES_REFERENCE.md**: Clinical rules on what not to take together.
`
  );

  // 2. Prompt file
  const promptText = generatePromptText(activeProfile, schedule);
  zip.file('PROMPT_TO_PASTE_IN_CHATGPT.txt', promptText);
  zip.file('FULL_CONSULTATION_PACKET.md', promptText);

  // 3. Human readable schedule
  const scheduleMd = generateMarkdownSchedule(activeProfile, schedule);
  zip.file('CURRENT_VITAMIN_SCHEDULE.md', scheduleMd);

  // 4. Personal profile
  const profileMd = generateProfileMarkdown(activeProfile, allProfiles);
  zip.file('PERSONAL_HEALTH_PROFILE.md', profileMd);

  // 5. Reference guide
  zip.file('VITAMIN_CLASHES_AND_SYNERGIES_REFERENCE.md', generateInteractionsGuide());

  // 6. Machine readable JSON
  zip.file(
    'ALL_DATA.json',
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile: activeProfile,
        allProfiles: allProfiles || [activeProfile],
        schedule: schedule,
      },
      null,
      2
    )
  );

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function triggerDownloadBlob(blob: Blob, filename: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
    }, 15000);
    return true;
  } catch (err) {
    console.error('triggerDownloadBlob error:', err);
    return false;
  }
}

export function downloadFromUrl(url: string, filename: string) {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('downloadFromUrl error:', err);
    window.open(url, '_blank');
  }
}
