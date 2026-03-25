"""
CBC Seed Script — seeds subjects and lessons for all 3 grade tiers.
Run from backend/ directory with the venv active:
    python seed.py
"""

import asyncio
import sys
import os

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import select, text
from app.database import AsyncSessionLocal, engine, Base
from app.models.content import Subject, Lesson


# ---------------------------------------------------------------------------
# CBC DATA
# ---------------------------------------------------------------------------

SUBJECTS = [
    # ── PRIMARY (Grades 4–6) ──────────────────────────────────────────────
    {
        "name": "Mathematics",
        "slug": "primary-mathematics",
        "grade_category": "primary",
        "description": "Number operations, geometry, measurement, and data handling for Grade 4–6 learners.",
        "icon": "calculator",
        "color": "#3B82F6",
        "order": 1,
    },
    {
        "name": "English",
        "slug": "primary-english",
        "grade_category": "primary",
        "description": "Reading, writing, listening, and speaking skills aligned with the CBC English curriculum.",
        "icon": "book-open",
        "color": "#8B5CF6",
        "order": 2,
    },
    {
        "name": "Kiswahili",
        "slug": "primary-kiswahili",
        "grade_category": "primary",
        "description": "Kusoma, kuandika, kusikiliza na kuzungumza Kiswahili kwa wanafunzi wa darasa la 4–6.",
        "icon": "languages",
        "color": "#10B981",
        "order": 3,
    },
    {
        "name": "Science & Technology",
        "slug": "primary-science",
        "grade_category": "primary",
        "description": "Exploring the natural world, basic science concepts, and everyday technology.",
        "icon": "flask",
        "color": "#F59E0B",
        "order": 4,
    },
    {
        "name": "Social Studies",
        "slug": "primary-social-studies",
        "grade_category": "primary",
        "description": "Our environment, community, county, and national identity.",
        "icon": "globe",
        "color": "#EC4899",
        "order": 5,
    },
    {
        "name": "Creative Arts",
        "slug": "primary-creative-arts",
        "grade_category": "primary",
        "description": "Drawing, painting, music, and performing arts for expressive learning.",
        "icon": "palette",
        "color": "#F97316",
        "order": 6,
    },
    {
        "name": "Health Education",
        "slug": "primary-health",
        "grade_category": "primary",
        "description": "Personal hygiene, nutrition, physical fitness, and disease prevention.",
        "icon": "heart",
        "color": "#EF4444",
        "order": 7,
    },

    # ── JUNIOR SECONDARY (Grades 7–9) ─────────────────────────────────────
    {
        "name": "Mathematics",
        "slug": "junior-mathematics",
        "grade_category": "junior",
        "description": "Algebra, geometry, statistics, and problem-solving for Grade 7–9 learners.",
        "icon": "calculator",
        "color": "#3B82F6",
        "order": 1,
    },
    {
        "name": "English",
        "slug": "junior-english",
        "grade_category": "junior",
        "description": "Advanced reading comprehension, essay writing, grammar, and oral communication.",
        "icon": "book-open",
        "color": "#8B5CF6",
        "order": 2,
    },
    {
        "name": "Kiswahili",
        "slug": "junior-kiswahili",
        "grade_category": "junior",
        "description": "Fasihi, sarufi, uandishi wa insha na mazungumzo ya hali ya juu kwa darasa la 7–9.",
        "icon": "languages",
        "color": "#10B981",
        "order": 3,
    },
    {
        "name": "Integrated Science",
        "slug": "junior-integrated-science",
        "grade_category": "junior",
        "description": "Biology, Chemistry, and Physics concepts integrated for the junior secondary learner.",
        "icon": "flask",
        "color": "#F59E0B",
        "order": 4,
    },
    {
        "name": "Social Studies",
        "slug": "junior-social-studies",
        "grade_category": "junior",
        "description": "History, geography, citizenship, and global awareness for junior learners.",
        "icon": "globe",
        "color": "#EC4899",
        "order": 5,
    },
    {
        "name": "Pre-Technical Studies",
        "slug": "junior-pre-technical",
        "grade_category": "junior",
        "description": "Introduction to woodwork, metalwork, drawing, and practical career skills.",
        "icon": "wrench",
        "color": "#6366F1",
        "order": 6,
    },
    {
        "name": "Agriculture & Nutrition",
        "slug": "junior-agriculture",
        "grade_category": "junior",
        "description": "Crop production, animal husbandry, food preparation, and nutrition basics.",
        "icon": "leaf",
        "color": "#84CC16",
        "order": 7,
    },
    {
        "name": "Creative Arts & Sports",
        "slug": "junior-creative-arts-sports",
        "grade_category": "junior",
        "description": "Visual arts, music, drama, physical education, and sports for holistic development.",
        "icon": "palette",
        "color": "#F97316",
        "order": 8,
    },

    # ── SENIOR SECONDARY (Grades 10–12) ──────────────────────────────────
    {
        "name": "Mathematics",
        "slug": "senior-mathematics",
        "grade_category": "senior",
        "description": "Advanced algebra, calculus, probability, and statistics for KCSE preparation.",
        "icon": "calculator",
        "color": "#3B82F6",
        "order": 1,
    },
    {
        "name": "English",
        "slug": "senior-english",
        "grade_category": "senior",
        "description": "Literary analysis, advanced composition, oral literature, and language use.",
        "icon": "book-open",
        "color": "#8B5CF6",
        "order": 2,
    },
    {
        "name": "Kiswahili",
        "slug": "senior-kiswahili",
        "grade_category": "senior",
        "description": "Fasihi ya Kiswahili, lugha, utungo na mawasiliano ya kitaaluma kwa kidato cha 4–6.",
        "icon": "languages",
        "color": "#10B981",
        "order": 3,
    },
    {
        "name": "Biology",
        "slug": "senior-biology",
        "grade_category": "senior",
        "description": "Cell biology, genetics, ecology, evolution, and human physiology.",
        "icon": "dna",
        "color": "#22C55E",
        "order": 4,
    },
    {
        "name": "Chemistry",
        "slug": "senior-chemistry",
        "grade_category": "senior",
        "description": "Organic, inorganic, and physical chemistry including practical laboratory work.",
        "icon": "flask",
        "color": "#F59E0B",
        "order": 5,
    },
    {
        "name": "Physics",
        "slug": "senior-physics",
        "grade_category": "senior",
        "description": "Mechanics, waves, electricity, magnetism, and modern physics concepts.",
        "icon": "zap",
        "color": "#EAB308",
        "order": 6,
    },
    {
        "name": "History & Government",
        "slug": "senior-history",
        "grade_category": "senior",
        "description": "Kenyan, African, and world history with governance and citizenship themes.",
        "icon": "landmark",
        "color": "#EC4899",
        "order": 7,
    },
    {
        "name": "Geography",
        "slug": "senior-geography",
        "grade_category": "senior",
        "description": "Physical and human geography with field study, maps, and statistics.",
        "icon": "globe",
        "color": "#06B6D4",
        "order": 8,
    },
    {
        "name": "Business Studies",
        "slug": "senior-business-studies",
        "grade_category": "senior",
        "description": "Commerce, bookkeeping, office practice, and entrepreneurship skills.",
        "icon": "briefcase",
        "color": "#6366F1",
        "order": 9,
    },
]


# Map subject slug → list of lesson dicts
LESSONS: dict[str, list[dict]] = {

    # ── PRIMARY MATHEMATICS ──────────────────────────────────────────────
    "primary-mathematics": [
        {
            "title": "Introduction to Whole Numbers",
            "slug": "primary-maths-whole-numbers",
            "description": "Understanding place value and the number system up to 1,000,000.",
            "order": 1, "duration_minutes": 30, "is_free_preview": True, "is_published": True,
            "content": """# Whole Numbers

## Learning Outcomes
By the end of this lesson you should be able to:
- Read and write whole numbers up to 1,000,000
- Identify the place value of each digit

## Place Value Chart
| Hundreds of Thousands | Ten Thousands | Thousands | Hundreds | Tens | Ones |
|---|---|---|---|---|---|
| 5 | 4 | 3 | 2 | 1 | 0 |

The number above is **543,210** — Five hundred and forty-three thousand, two hundred and ten.

## Activity
Write the following numbers in words:
1. 47,500
2. 302,060
3. 999,999
""",
        },
        {
            "title": "Addition of Whole Numbers",
            "slug": "primary-maths-addition",
            "description": "Adding numbers with and without carrying, including word problems.",
            "order": 2, "duration_minutes": 35, "is_free_preview": False, "is_published": True,
            "content": """# Addition of Whole Numbers

## Key Concepts
- When digits in a column add up to 10 or more, we **carry** the extra digit to the next column.
- Always add from right to left (ones → tens → hundreds → thousands).

## Worked Example
```
  24,365
+  8,487
--------
 32,852
```

## Word Problem
A school collected **12,450** bottles in Week 1 and **9,875** bottles in Week 2.
How many bottles were collected altogether?

**Solution:** 12,450 + 9,875 = **22,325 bottles**

## Practice Questions
1. 56,234 + 27,891 = ?
2. 104,500 + 68,750 = ?
""",
        },
        {
            "title": "Subtraction of Whole Numbers",
            "slug": "primary-maths-subtraction",
            "description": "Subtracting numbers with borrowing and applying to real-life situations.",
            "order": 3, "duration_minutes": 35, "is_free_preview": False, "is_published": True,
            "content": """# Subtraction of Whole Numbers

## Key Concept: Borrowing
When a digit in a column is smaller than the digit below it, we **borrow** from the next column.

## Worked Example
```
  83,200
- 47,568
--------
  35,632
```

## Word Problem
A farmer had **53,400** bags of maize. He sold **28,750** bags.
How many bags remained?

**Solution:** 53,400 − 28,750 = **24,650 bags**
""",
        },
        {
            "title": "Multiplication of Whole Numbers",
            "slug": "primary-maths-multiplication",
            "description": "Multiplying 2-digit and 3-digit numbers using the long multiplication method.",
            "order": 4, "duration_minutes": 40, "is_free_preview": False, "is_published": True,
            "content": """# Multiplication of Whole Numbers

## Long Multiplication Steps
1. Multiply the top number by the **ones** digit of the bottom number.
2. Add a zero, then multiply by the **tens** digit.
3. Add the two partial products.

## Worked Example
```
    324
  ×  56
  -----
   1944   (324 × 6)
+ 16200   (324 × 50)
  -----
  18144
```

## Practice
1. 425 × 38 = ?
2. 607 × 74 = ?
""",
        },
        {
            "title": "Division of Whole Numbers",
            "slug": "primary-maths-division",
            "description": "Long division with remainders, and interpreting remainders in context.",
            "order": 5, "duration_minutes": 40, "is_free_preview": False, "is_published": True,
            "content": """# Division of Whole Numbers

## Long Division
Divide → Multiply → Subtract → Bring down → Repeat

## Worked Example
848 ÷ 16 = ?

```
   53
  ----
16)848
   -80
   ---
    48
   -48
   ---
     0
```

848 ÷ 16 = **53**

## Word Problem
372 pupils are to be seated in rows of 12.
How many complete rows will there be? How many pupils are left over?

**Solution:** 372 ÷ 12 = **31 rows** remainder **0**
""",
        },
        {
            "title": "Fractions",
            "slug": "primary-maths-fractions",
            "description": "Understanding proper fractions, equivalent fractions, and simple operations.",
            "order": 6, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Fractions

## Types of Fractions
- **Proper fraction**: numerator < denominator (e.g. 3/4)
- **Improper fraction**: numerator > denominator (e.g. 7/4)
- **Mixed number**: whole part + fraction (e.g. 1¾)

## Equivalent Fractions
1/2 = 2/4 = 4/8 = 50/100

## Adding Fractions (same denominator)
3/8 + 2/8 = **5/8**

## Adding Fractions (different denominators)
1/3 + 1/4 = 4/12 + 3/12 = **7/12**
""",
        },
    ],

    # ── PRIMARY ENGLISH ───────────────────────────────────────────────────
    "primary-english": [
        {
            "title": "Reading Comprehension — Narrative Texts",
            "slug": "primary-eng-narrative-comprehension",
            "description": "Understanding story elements: plot, character, setting, and theme.",
            "order": 1, "duration_minutes": 35, "is_free_preview": True, "is_published": True,
            "content": """# Narrative Texts — Reading Comprehension

## What is a Narrative?
A narrative tells a **story**. It has:
- **Characters** — the people or animals in the story
- **Setting** — where and when the story happens
- **Plot** — the sequence of events
- **Theme** — the main message or lesson

## Sample Passage
> Amina woke up early on Saturday morning. She packed her bag carefully — notebook, pencils, and a water bottle. Today was the day she would help plant trees at Uhuru Park. When she arrived, fifty other children were already there, each holding a small seedling...

## Comprehension Questions
1. Who is the main character?
2. Where does the story take place?
3. What is Amina doing on Saturday morning?
4. What theme does this story suggest?
""",
        },
        {
            "title": "Grammar — Nouns and Pronouns",
            "slug": "primary-eng-nouns-pronouns",
            "description": "Identifying and using common, proper, collective, and abstract nouns. Replacing nouns with pronouns.",
            "order": 2, "duration_minutes": 30, "is_free_preview": False, "is_published": True,
            "content": """# Nouns and Pronouns

## Types of Nouns
| Type | Definition | Examples |
|---|---|---|
| Common noun | General name of a person, place, or thing | teacher, city, book |
| Proper noun | Specific name (capitalised) | Nairobi, Wanjiru, Tusome |
| Collective noun | Name of a group | flock, herd, team |
| Abstract noun | Idea or feeling | courage, happiness, knowledge |

## Pronouns
Pronouns replace nouns to avoid repetition.

**Example:**
❌ *Otieno said Otieno was going to Otieno's grandmother's house.*
✅ *Otieno said **he** was going to **his** grandmother's house.*

## Exercise
Replace the underlined nouns with the correct pronoun:
1. **Maria and I** went to school early. ___ arrived at 7 a.m.
2. **The cat** sat on the mat. ___ was very lazy.
""",
        },
        {
            "title": "Writing — Descriptive Essays",
            "slug": "primary-eng-descriptive-essay",
            "description": "Using vivid language and sensory details to describe people, places, and objects.",
            "order": 3, "duration_minutes": 40, "is_free_preview": False, "is_published": True,
            "content": """# Descriptive Essays

## What Makes Writing Descriptive?
Good descriptive writing uses:
- **Sensory details** — what you see, hear, smell, taste, and touch
- **Vivid adjectives** — colourful, enormous, gleaming
- **Similes & metaphors** — *as bright as the sun*, *the road was a ribbon*

## Structure
1. **Opening** — Introduce the subject
2. **Body** — Describe features in detail
3. **Conclusion** — Leave the reader with a strong impression

## Sample Opening
> The old mango tree behind our homestead was a giant with bark like crinkled elephant skin. In the afternoon, its shade felt like a cool blanket spread over the red earth...

## Your Task
Write a descriptive paragraph (8–10 sentences) about your school compound.
""",
        },
        {
            "title": "Vocabulary — Context Clues",
            "slug": "primary-eng-context-clues",
            "description": "Using surrounding words and sentences to work out the meaning of unfamiliar words.",
            "order": 4, "duration_minutes": 25, "is_free_preview": False, "is_published": True,
            "content": """# Context Clues

## What are Context Clues?
Context clues are **hints within the sentence or paragraph** that help you understand a new word without a dictionary.

## Types of Context Clues
1. **Definition clue** — The word is defined right away.
   *"The athlete was **tenacious**, meaning she never gave up."*

2. **Synonym clue** — A similar word is used nearby.
   *"The student was **loquacious**, always chatting and talking."*

3. **Example clue** — Examples show the meaning.
   *"Tropical **fauna**, such as lions, elephants, and zebras, roam the savannah."*

## Practice
Use context clues to define the bold word:
1. "The *arid* desert had no rain for three years. Animals migrated to wetter regions."
2. "She spoke in a *hushed*, barely audible whisper."
""",
        },
        {
            "title": "Oral Communication — Public Speaking",
            "slug": "primary-eng-public-speaking",
            "description": "Delivering a short speech with confidence, eye contact, and clear pronunciation.",
            "order": 5, "duration_minutes": 30, "is_free_preview": False, "is_published": True,
            "content": """# Public Speaking

## Tips for a Great Speech
1. **Know your topic** — research and prepare notes
2. **Speak clearly** — not too fast, not too slow
3. **Use eye contact** — look at your audience, not just your notes
4. **Stand straight** — good posture shows confidence
5. **Practise** — rehearse several times before the real speech

## Speech Structure
- **Introduction**: Greet the audience and state your topic
- **Body**: 3 main points with supporting details
- **Conclusion**: Summarise and end with a strong closing statement

## Mini-Task
Prepare a 1-minute speech on: **"Why we should protect our forests."**
""",
        },
    ],

    # ── PRIMARY KISWAHILI ─────────────────────────────────────────────────
    "primary-kiswahili": [
        {
            "title": "Kusoma na Kuelewa — Hadithi",
            "slug": "primary-kisw-hadithi",
            "description": "Kuelewa muundo wa hadithi: wahusika, mandhari, maudhui na muundo.",
            "order": 1, "duration_minutes": 30, "is_free_preview": True, "is_published": True,
            "content": """# Hadithi — Kusoma na Kuelewa

## Sehemu za Hadithi
Hadithi nzuri ina:
- **Wahusika** — watu au wanyama katika hadithi
- **Mandhari** — mahali hadithi inapoendelea
- **Maudhui** — ujumbe mkuu wa hadithi
- **Muundo** — utangulizi, kiini, na hitimisho

## Hadithi: Sungura na Kobe
Siku moja, Sungura alimwambia Kobe, "Mimi ni mwepesi kuliko wewe." Kobe akamjibu, "Tushindane mbio." Sungura alianza mbio haraka haraka, akaona ana muda wa kulala. Kobe aliendelea taratibu taratibu bila kusimama. Wakati Sungura alipoamka na kukimbia, Kobe alikuwa ameshafika mwisho wa safari!

## Maswali
1. Ni nani wahusika wakuu wa hadithi hii?
2. Hadithi inaendelea wapi?
3. Ni funzo gani unalojifunza kutoka kwa hadithi hii?
""",
        },
        {
            "title": "Sarufi — Nomino na Viwakilishi",
            "slug": "primary-kisw-nomino",
            "description": "Kutambua na kutumia nomino za pekee, umoja na wingi, pamoja na viwakilishi.",
            "order": 2, "duration_minutes": 30, "is_free_preview": False, "is_published": True,
            "content": """# Nomino na Viwakilishi

## Nomino
Nomino ni jina la mtu, mahali, kitu, au hali.

| Nomino (Umoja) | Nomino (Wingi) |
|---|---|
| mtoto | watoto |
| mti | miti |
| kitabu | vitabu |
| nyumba | nyumba |

## Viwakilishi
Viwakilishi hubadilisha nomino ili kuepuka kurudia.

**Mfano:**
❌ *Kamau alisema Kamau ataenda shuleni kesho.*
✅ *Kamau alisema **yeye** ataenda shuleni kesho.*

## Zoezi
Badilisha nomino zilizopigwa mstari na kiwakilishi kinachofaa:
1. **Mama** alipika chakula. ___ alipika ugali.
2. **Vitabu** viko mezani. ___ ni vizuri.
""",
        },
        {
            "title": "Uandishi — Insha ya Mazungumzo",
            "slug": "primary-kisw-mazungumzo",
            "description": "Kuandika mazungumzo kwa kutumia alama sahihi za uakifishaji.",
            "order": 3, "duration_minutes": 35, "is_free_preview": False, "is_published": True,
            "content": """# Insha ya Mazungumzo

## Kanuni za Kuandika Mazungumzo
1. Kila msemaji anaanza mstari mpya.
2. Maneno ya msemaji yanawekwa ndani ya alama za kunukuu **(" ")**.
3. Tumia vitenzi kama: **alisema, aliuliza, alijibu, alitangaza**.

## Mfano
> Mwalimu aliuliza, "Ni nani anajua jibu la swali hilo?"
> Aisha aliinua mkono wake. "Mimi, mwalimu," alisema kwa ujasiri.
> "Jibu ni nini, Aisha?" aliuliza mwalimu.
> "Jibu ni sita," Aisha alijibu.

## Kazi Yako
Andika mazungumzo kati ya mwanafunzi na muuzaji wa matunda sokoni (mistari 8–10).
""",
        },
        {
            "title": "Msamiati — Maneno ya Kila Siku",
            "slug": "primary-kisw-msamiati",
            "description": "Kujifunza maneno mapya ya Kiswahili yanayotumika maishani na kuyatumia katika sentensi.",
            "order": 4, "duration_minutes": 25, "is_free_preview": False, "is_published": True,
            "content": """# Msamiati wa Kila Siku

## Maneno Muhimu
| Neno | Maana |
|---|---|
| burudani | entertainment / relaxation |
| mazingira | environment |
| uchumi | economy |
| amani | peace |
| elimu | education |
| afya | health |
| uhusiano | relationship |

## Tumia katika Sentensi
1. **Amani** ni muhimu kwa maendeleo ya nchi yetu.
2. Kila mtu anapaswa kulinda **mazingira** yake.
3. **Elimu** ndiyo ufunguo wa maisha bora.

## Zoezi
Tunga sentensi moja kwa kila neno: *burudani, uchumi, afya*.
""",
        },
        {
            "title": "Ushairi — Mashairi ya Watoto",
            "slug": "primary-kisw-shairi",
            "description": "Kuelewa na kusoma mashairi ya watoto kwa kuzingatia mdundo, vina na maudhui.",
            "order": 5, "duration_minutes": 30, "is_free_preview": False, "is_published": True,
            "content": """# Mashairi ya Watoto

## Vipengele vya Shairi
- **Mshororo** — mstari mmoja wa shairi
- **Ubeti** — kikundi cha mishororo
- **Vina** — maneno yanayofanana sauti mwishoni
- **Mdundo** — mtiririko wa sauti katika shairi

## Shairi: Shule Yangu
*Shule yangu ni tamu,*
*Wanafunzi wote hamu,*
*Wanasoma kila samu,*
*Maarifa ni daramu.*

*Mwalimu anatusaidia,*
*Sisi tunafurahia,*
*Kitabu ni kinga yetu,*
*Elimu ndiyo nguvu zetu.*

## Maswali
1. Shairi lina vina gani?
2. Ni maudhui gani ya shairi hili?
3. Sema shairi hili kwa sauti ukizingatia mdundo.
""",
        },
    ],

    # ── PRIMARY SCIENCE & TECHNOLOGY ─────────────────────────────────────
    "primary-science": [
        {
            "title": "Living and Non-Living Things",
            "slug": "primary-sci-living-non-living",
            "description": "Characteristics of living things and distinguishing them from non-living things.",
            "order": 1, "duration_minutes": 30, "is_free_preview": True, "is_published": True,
            "content": """# Living and Non-Living Things

## Characteristics of Living Things (MRS GREN)
| Letter | Characteristic |
|---|---|
| M | Movement |
| R | Respiration |
| S | Sensitivity |
| G | Growth |
| R | Reproduction |
| E | Excretion |
| N | Nutrition |

## Examples
**Living:** plants, animals, fungi, bacteria
**Non-living:** stone, water, air, table

> **Note:** Fire moves and grows but does **not** reproduce or feed — it is non-living.

## Activity
Look around your classroom. List 5 living things and 5 non-living things you can see.
""",
        },
        {
            "title": "Plants — Structure and Functions",
            "slug": "primary-sci-plants",
            "description": "Parts of a plant and how each part helps the plant to survive.",
            "order": 2, "duration_minutes": 35, "is_free_preview": False, "is_published": True,
            "content": """# Plants — Structure and Functions

## Parts of a Plant
| Part | Function |
|---|---|
| Roots | Absorb water and minerals; anchor the plant |
| Stem | Carries water and food; supports the plant |
| Leaves | Make food through photosynthesis |
| Flowers | Reproduction (produce seeds) |
| Fruits | Protect seeds and aid dispersal |
| Seeds | Grow into new plants |

## Photosynthesis (Simple)
> **Water + Carbon dioxide + Sunlight → Food (glucose) + Oxygen**

Leaves are green because of **chlorophyll** — the pigment that absorbs sunlight.

## Experiment Idea
Plant two bean seeds — one in a dark box, one on a sunny windowsill. Compare their growth after one week.
""",
        },
        {
            "title": "Matter — Solids, Liquids, and Gases",
            "slug": "primary-sci-states-of-matter",
            "description": "Properties of the three states of matter and changes between them.",
            "order": 3, "duration_minutes": 35, "is_free_preview": False, "is_published": True,
            "content": """# States of Matter

## Three States
| State | Shape | Volume | Examples |
|---|---|---|---|
| Solid | Fixed | Fixed | stone, ice, wood |
| Liquid | No fixed shape | Fixed | water, milk, petrol |
| Gas | No fixed shape | No fixed volume | air, steam, smoke |

## Changes of State
- **Melting** — solid → liquid (e.g. ice melts)
- **Freezing** — liquid → solid (e.g. water freezes)
- **Evaporation/Boiling** — liquid → gas (e.g. water boils)
- **Condensation** — gas → liquid (e.g. steam on a cold window)

## Think About It
Why does a wet shirt dry in the sun?
""",
        },
        {
            "title": "Simple Machines",
            "slug": "primary-sci-simple-machines",
            "description": "Types of simple machines, how they work, and examples in everyday life.",
            "order": 4, "duration_minutes": 40, "is_free_preview": False, "is_published": True,
            "content": """# Simple Machines

## Why Do We Use Simple Machines?
Simple machines make work **easier** by changing the size or direction of a force.

## The Six Simple Machines
1. **Lever** — see-saw, crowbar, bottle opener
2. **Wheel and Axle** — bicycle wheel, doorknob
3. **Pulley** — flagpole, well bucket
4. **Inclined Plane** — ramp, staircase, wedge
5. **Screw** — bolt, jar lid, drill bit
6. **Wedge** — axe, knife, nail

## Activity
Find one example of each simple machine in your home or school. Draw and label them.
""",
        },
        {
            "title": "Water — Sources and Importance",
            "slug": "primary-sci-water",
            "description": "Sources of fresh water, the water cycle, and safe water practices.",
            "order": 5, "duration_minutes": 30, "is_free_preview": False, "is_published": True,
            "content": """# Water — Sources and Importance

## Sources of Fresh Water
- Rivers and streams
- Lakes (e.g. Lake Victoria, Lake Turkana)
- Underground wells and boreholes
- Rainwater

## The Water Cycle
1. **Evaporation** — sun heats water; it turns to vapour
2. **Condensation** — vapour cools, forms clouds
3. **Precipitation** — rain or snow falls to the ground
4. **Collection** — water collects in rivers, lakes, and the ocean

## Safe Water Practices
- Boil drinking water if unsure of its safety
- Cover water storage containers
- Do not defecate near water sources

## Why is Water Important?
- Drinking and cooking
- Agriculture / irrigation
- Industry and energy (hydroelectric power)
""",
        },
    ],

    # ── PRIMARY SOCIAL STUDIES ────────────────────────────────────────────
    "primary-social-studies": [
        {
            "title": "Kenya — Our Country",
            "slug": "primary-ss-kenya",
            "description": "Location, boundaries, counties, and key physical features of Kenya.",
            "order": 1, "duration_minutes": 30, "is_free_preview": True, "is_published": True,
            "content": """# Kenya — Our Country

## Location
Kenya is in **East Africa**, lying astride the Equator.

### Neighbours
| Direction | Country |
|---|---|
| North | Ethiopia & South Sudan |
| South | Tanzania |
| East | Somalia & Indian Ocean |
| West | Uganda |
| North-West | Lake Victoria |

## Counties
Kenya is divided into **47 counties**, each with its own county government.

## Key Physical Features
- **Mount Kenya** — highest peak in Kenya (5,199 m)
- **Rift Valley** — runs through the middle of the country
- **Lake Victoria** — largest lake in Africa
- **Coast** — Indian Ocean coastline, 536 km long

## Activity
Draw a simple outline map of Kenya and mark: Nairobi, Mt. Kenya, Lake Victoria, and the Indian Ocean.
""",
        },
        {
            "title": "Our Community — Family and Roles",
            "slug": "primary-ss-family",
            "description": "Types of families, roles of family members, and community helpers.",
            "order": 2, "duration_minutes": 25, "is_free_preview": False, "is_published": True,
            "content": """# Family and Community

## Types of Families
- **Nuclear family** — parents and their children
- **Extended family** — includes grandparents, aunts, uncles, cousins

## Roles in the Family
| Member | Role |
|---|---|
| Father/Guardian | Provide income, protect the family |
| Mother/Guardian | Nurture children, manage the home |
| Children | Study, help with chores, respect elders |
| Grandparents | Wisdom, cultural knowledge, childcare |

## Community Helpers
People who serve our community every day:
- **Doctors & nurses** — keep us healthy
- **Police officers** — keep us safe
- **Teachers** — educate the community
- **Farmers** — provide food

## Discuss
How can you contribute positively to your community today?
""",
        },
        {
            "title": "The Environment — Conservation",
            "slug": "primary-ss-environment",
            "description": "Natural resources, environmental challenges, and conservation practices.",
            "order": 3, "duration_minutes": 30, "is_free_preview": False, "is_published": True,
            "content": """# Environmental Conservation

## Natural Resources
**Renewable:** sunlight, wind, water, forests, soil
**Non-renewable:** coal, oil, natural gas, minerals

## Environmental Challenges
- **Deforestation** — cutting down too many trees
- **Pollution** — air, water, and land pollution
- **Soil erosion** — removal of topsoil by water or wind
- **Climate change** — rising temperatures affecting weather patterns

## What Can We Do?
1. Plant trees (reforestation)
2. Reduce, reuse, and recycle waste
3. Use clean energy (solar, wind)
4. Save water — fix leaking taps
5. Avoid burning rubbish

## Kenyan Conservation Success
The **Green Belt Movement** founded by Prof. Wangari Maathai planted over 51 million trees across Kenya.
""",
        },
    ],

    # ── PRIMARY CREATIVE ARTS ─────────────────────────────────────────────
    "primary-creative-arts": [
        {
            "title": "Drawing — Basic Shapes and Lines",
            "slug": "primary-arts-drawing-basics",
            "description": "Using lines and geometric shapes as the building blocks of drawing.",
            "order": 1, "duration_minutes": 40, "is_free_preview": True, "is_published": True,
            "content": """# Drawing — Basic Shapes and Lines

## Types of Lines
- **Horizontal** — calm and peaceful
- **Vertical** — strong and tall
- **Diagonal** — movement and action
- **Curved** — flowing and soft
- **Zigzag** — energy and excitement

## Basic Shapes
Circle, square, triangle, rectangle, oval — all complex drawings start with these!

## Activity: Draw a Kenyan Scene
Using only basic shapes and lines, draw:
1. A round sun in the corner
2. A triangle mountain
3. A rectangle house with a triangle roof
4. Vertical trees with circle tops

## Colouring Tips
- Use warm colours (red, orange, yellow) for sunshine and warmth
- Use cool colours (blue, green, purple) for sky, water, and shadows
""",
        },
        {
            "title": "Music — Rhythm and Beat",
            "slug": "primary-arts-music-rhythm",
            "description": "Understanding beat, rhythm, and tempo through clapping, singing, and simple instruments.",
            "order": 2, "duration_minutes": 35, "is_free_preview": False, "is_published": True,
            "content": """# Music — Rhythm and Beat

## Key Terms
- **Beat** — the steady pulse of music (like a heartbeat)
- **Rhythm** — a pattern of long and short sounds
- **Tempo** — how fast or slow the music is

## Feel the Beat
Clap along to this pattern:
```
CLAP CLAP rest CLAP | CLAP CLAP rest CLAP
 1    2    3    4  |  1    2    3    4
```

## Kenyan Traditional Music
Traditional Kenyan music uses instruments like:
- **Nyatiti** (Luo 8-string lyre)
- **Orutu** (Luo fiddle)
- **Kayamba** (coastal shaker)
- **Drums** — various sizes and beats

## Activity
Listen to a Kenyan song and try to:
1. Clap the beat
2. Identify when the tempo changes
""",
        },
    ],

    # ── PRIMARY HEALTH ────────────────────────────────────────────────────
    "primary-health": [
        {
            "title": "Personal Hygiene",
            "slug": "primary-health-hygiene",
            "description": "Daily hygiene habits that prevent disease and promote wellbeing.",
            "order": 1, "duration_minutes": 25, "is_free_preview": True, "is_published": True,
            "content": """# Personal Hygiene

## Why Hygiene Matters
Good hygiene prevents the spread of **germs** that cause diseases like cholera, typhoid, and skin infections.

## Daily Hygiene Habits
| Practice | How Often |
|---|---|
| Wash hands with soap and water | Before meals, after toilet, after handling animals |
| Brush teeth | Morning and evening |
| Bathe/shower | Daily |
| Cut fingernails | Weekly |
| Wash hair | Regularly |
| Change and wash clothes | Regularly |

## Hand-Washing Steps
1. Wet hands with clean water
2. Apply soap
3. Lather for at least 20 seconds
4. Rinse well
5. Dry with a clean towel

## Dental Health
- Brush for 2 minutes
- Replace toothbrush every 3 months
- Reduce sugary foods — they cause tooth decay
""",
        },
        {
            "title": "Nutrition — Food Groups",
            "slug": "primary-health-nutrition",
            "description": "The seven food groups, their sources, and their role in a balanced diet.",
            "order": 2, "duration_minutes": 30, "is_free_preview": False, "is_published": True,
            "content": """# Nutrition — Food Groups

## The Seven Food Groups
| Group | Nutrient | Examples | Function |
|---|---|---|---|
| Carbohydrates | Energy | Ugali, rice, bread, potatoes | Provide energy |
| Proteins | Body building | Beans, meat, eggs, milk | Growth and repair |
| Fats & Oils | Energy | Butter, avocado, nuts | Energy, warmth |
| Vitamins | Protection | Fruits, vegetables | Disease prevention |
| Minerals | Protection | Milk (calcium), liver (iron) | Bones, blood |
| Water | — | Water, juices | Transport nutrients, regulate temperature |
| Fibre | — | Vegetables, whole grains | Aid digestion |

## Balanced Diet
A balanced diet includes **all food groups** in the right proportions every day.

## Kenya's Plate
A healthy Kenyan meal might include:
- Ugali (carbohydrate) + sukuma wiki (vitamins/fibre) + beef stew (protein) + water
""",
        },
    ],

    # ── JUNIOR MATHEMATICS ────────────────────────────────────────────────
    "junior-mathematics": [
        {
            "title": "Integers — Directed Numbers",
            "slug": "junior-maths-integers",
            "description": "Understanding positive and negative integers, number line, and the four operations.",
            "order": 1, "duration_minutes": 40, "is_free_preview": True, "is_published": True,
            "content": """# Integers — Directed Numbers

## What are Integers?
Integers include all whole numbers and their negatives:
... −4, −3, −2, −1, **0**, 1, 2, 3, 4 ...

## Number Line
```
←  −5  −4  −3  −2  −1   0   1   2   3   4   5  →
```
- Numbers to the **right** are greater
- Numbers to the **left** are smaller

## Operations with Integers
**Addition:**
(−3) + (−4) = −7
(−3) + 5 = **+2** (move right 5 steps from −3)

**Subtraction:**
5 − (−3) = 5 + 3 = **8** (subtracting a negative = adding)

**Multiplication/Division:**
- (+) × (+) = +
- (−) × (−) = +
- (+) × (−) = −

## Real-Life Context
Temperature: If Nairobi is 22°C and the temperature drops 28°C, what is the new temperature?
22 − 28 = **−6°C**
""",
        },
        {
            "title": "Algebra — Linear Expressions and Equations",
            "slug": "junior-maths-algebra-linear",
            "description": "Simplifying algebraic expressions and solving one-step and two-step linear equations.",
            "order": 2, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Linear Expressions and Equations

## Key Terms
- **Variable** — a letter representing an unknown value (e.g. x, y)
- **Expression** — a collection of terms (e.g. 3x + 5)
- **Equation** — two expressions set equal (e.g. 3x + 5 = 20)

## Simplifying Expressions
Collect **like terms** — terms with the same variable:
> 4x + 3y − 2x + y = **2x + 4y**

## Solving One-Step Equations
> x + 7 = 15
> x = 15 − 7 = **8**

## Solving Two-Step Equations
> 3x − 4 = 11
> 3x = 11 + 4 = 15
> x = 15 ÷ 3 = **5**

## Check your answer: substitute back
3(5) − 4 = 15 − 4 = 11 ✓
""",
        },
        {
            "title": "Geometry — Angles and Lines",
            "slug": "junior-maths-angles-lines",
            "description": "Types of angles, angle properties on straight lines, and vertically opposite angles.",
            "order": 3, "duration_minutes": 40, "is_free_preview": False, "is_published": True,
            "content": """# Angles and Lines

## Types of Angles
| Name | Size |
|---|---|
| Acute | 0° < x < 90° |
| Right angle | Exactly 90° |
| Obtuse | 90° < x < 180° |
| Straight angle | Exactly 180° |
| Reflex | 180° < x < 360° |

## Angle Properties
**Angles on a straight line** sum to **180°**
**Angles at a point** sum to **360°**
**Vertically opposite angles** are **equal**

## Parallel Lines (cut by a transversal)
- Corresponding angles: equal
- Alternate angles: equal
- Co-interior (same-side interior) angles: supplementary (add to 180°)

## Problem
Two angles on a straight line are in the ratio 2:3. Find each angle.
Total = 180°; parts = 2 + 3 = 5
Each part = 36°; angles = **72°** and **108°**
""",
        },
        {
            "title": "Statistics — Data Collection and Representation",
            "slug": "junior-maths-statistics",
            "description": "Collecting data, drawing bar charts, pie charts, and calculating mean, median, and mode.",
            "order": 4, "duration_minutes": 50, "is_free_preview": False, "is_published": True,
            "content": """# Data Collection and Representation

## Data Collection Methods
- Observation
- Questionnaire/survey
- Counting/tally marks

## Frequency Table Example
| Marks Range | Tally | Frequency |
|---|---|---|
| 0–19 | II | 2 |
| 20–39 | IIII | 4 |
| 40–59 | IIII IIII | 9 |
| 60–79 | IIII III | 8 |
| 80–100 | IIII | 5 |

## Measures of Central Tendency
**Mean** = Total ÷ Number of values
**Median** = Middle value (when arranged in order)
**Mode** = Most frequently occurring value

## Example
Data: 3, 7, 7, 9, 10, 12
Mean = (3+7+7+9+10+12) ÷ 6 = 48 ÷ 6 = **8**
Median = (7+9) ÷ 2 = **8**
Mode = **7** (appears twice)
""",
        },
        {
            "title": "Pythagoras' Theorem",
            "slug": "junior-maths-pythagoras",
            "description": "Applying Pythagoras' theorem to find missing sides in right-angled triangles.",
            "order": 5, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Pythagoras' Theorem

## The Theorem
In a right-angled triangle:
> **a² + b² = c²**

Where **c** is the **hypotenuse** (the side opposite the right angle — always the longest side).

## Finding the Hypotenuse
If a = 3, b = 4:
c² = 3² + 4² = 9 + 16 = 25
c = √25 = **5**

(This is the famous 3-4-5 right triangle!)

## Finding a Shorter Side
If c = 13, a = 5:
b² = 13² − 5² = 169 − 25 = 144
b = √144 = **12**

## Real-Life Application
A ladder 10 m long leans against a wall. The foot of the ladder is 6 m from the wall.
How high up the wall does the ladder reach?
h² = 10² − 6² = 100 − 36 = 64 → h = **8 m**
""",
        },
    ],

    # ── JUNIOR INTEGRATED SCIENCE ─────────────────────────────────────────
    "junior-integrated-science": [
        {
            "title": "The Cell — Basic Unit of Life",
            "slug": "junior-sci-cell",
            "description": "Cell structure, organelles, and the differences between plant and animal cells.",
            "order": 1, "duration_minutes": 40, "is_free_preview": True, "is_published": True,
            "content": """# The Cell — Basic Unit of Life

## What is a Cell?
The **cell** is the smallest functional unit of all living organisms.

## Cell Organelles
| Organelle | Function |
|---|---|
| Cell membrane | Controls what enters and exits the cell |
| Nucleus | Controls cell activities; contains DNA |
| Mitochondria | Produces energy (ATP) — "power house" |
| Ribosomes | Synthesise proteins |
| Vacuole | Storage of water, food, and waste |

## Plant vs Animal Cells
| Feature | Plant Cell | Animal Cell |
|---|---|---|
| Cell wall | Present (cellulose) | Absent |
| Chloroplasts | Present | Absent |
| Large vacuole | Present | Small or absent |
| Shape | Regular, box-like | Irregular |

## Key Fact
**Unicellular** organisms = one cell (e.g. amoeba, bacteria)
**Multicellular** organisms = many cells (e.g. humans, plants)
""",
        },
        {
            "title": "Atoms and the Periodic Table",
            "slug": "junior-sci-atoms-periodic-table",
            "description": "Structure of the atom (protons, neutrons, electrons) and organisation of the periodic table.",
            "order": 2, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Atoms and the Periodic Table

## Structure of an Atom
- **Protons** — positive charge, in the nucleus
- **Neutrons** — no charge, in the nucleus
- **Electrons** — negative charge, orbit the nucleus in shells

## Atomic Number and Mass Number
- **Atomic number** = number of protons
- **Mass number** = protons + neutrons
- Electrons = protons (neutral atom)

## Electron Shells
Shell 1 holds up to **2** electrons
Shell 2 holds up to **8** electrons
Shell 3 holds up to **8** electrons (first period 3)

## The Periodic Table
- Elements arranged by **increasing atomic number**
- **Period** = horizontal row (same number of shells)
- **Group** = vertical column (same number of valence electrons, similar properties)

## Key Elements to Know
Hydrogen (H, 1), Carbon (C, 6), Oxygen (O, 8), Sodium (Na, 11), Iron (Fe, 26)
""",
        },
        {
            "title": "Forces and Motion",
            "slug": "junior-sci-forces-motion",
            "description": "Newton's laws, types of forces, speed, velocity, and acceleration with calculations.",
            "order": 3, "duration_minutes": 50, "is_free_preview": False, "is_published": True,
            "content": """# Forces and Motion

## Types of Forces
- **Gravity** — attraction between masses
- **Friction** — opposes motion between surfaces
- **Normal reaction** — surface pushing back on an object
- **Tension** — pulling force through a string

## Speed, Velocity, and Acceleration
- **Speed** = Distance ÷ Time (scalar)
- **Velocity** = Displacement ÷ Time (vector — has direction)
- **Acceleration** = Change in velocity ÷ Time

## Newton's Three Laws
1. **Inertia** — An object stays at rest or moving unless a net force acts on it.
2. **F = ma** — Force = Mass × Acceleration
3. **Action-Reaction** — Every action has an equal and opposite reaction.

## Worked Example
A car of mass 1,200 kg accelerates at 3 m/s².
Force = 1,200 × 3 = **3,600 N**
""",
        },
        {
            "title": "Ecology — Ecosystems and Food Chains",
            "slug": "junior-sci-ecology",
            "description": "Biotic and abiotic factors, food chains, food webs, and energy flow in ecosystems.",
            "order": 4, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Ecosystems and Food Chains

## What is an Ecosystem?
An ecosystem includes all living organisms (**biotic**) and non-living factors (**abiotic**) in an area.

## Biotic vs Abiotic Factors
- **Biotic:** plants, animals, fungi, bacteria
- **Abiotic:** sunlight, water, temperature, soil, wind

## Food Chain
Shows the flow of energy from one organism to another:
```
Grass → Grasshopper → Frog → Snake → Eagle
(Producer)(Primary consumer)(Secondary)(Tertiary)(Apex predator)
```

## Food Web
A food web shows multiple overlapping food chains — more realistic than a single chain.

## Energy Flow
Only about **10%** of energy passes from one trophic level to the next.
This is why food chains rarely exceed 5 links.

## Kenyan Savannah Example
```
Grass → Zebra → Lion
Grass → Wildebeest → Cheetah
Wildebeest / Zebra → Hyena (scavenger)
```
""",
        },
        {
            "title": "Reproduction in Humans",
            "slug": "junior-sci-reproduction",
            "description": "The human reproductive system, puberty, fertilisation, and development.",
            "order": 5, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Reproduction in Humans

## Puberty
Puberty is the time when a child's body develops into an adult body.

### Changes in Boys
- Voice deepens
- Facial and body hair grows
- Testes begin producing sperm
- Growth spurt

### Changes in Girls
- Breasts develop
- Menstrual cycle begins
- Body hair grows
- Hips widen

## The Menstrual Cycle
Average cycle: **28 days**
Ovulation occurs around day **14**

## Fertilisation
Sperm + Egg → **Zygote** → develops in the uterus

## Pregnancy and Development
| Stage | Time |
|---|---|
| Zygote to embryo | Weeks 1–8 |
| Embryo to foetus | Week 9 onwards |
| Full-term birth | ~40 weeks (9 months) |
""",
        },
    ],

    # ── JUNIOR SOCIAL STUDIES ─────────────────────────────────────────────
    "junior-social-studies": [
        {
            "title": "Early Civilizations of Africa",
            "slug": "junior-ss-africa-civilizations",
            "description": "Ancient African kingdoms: Egypt, Kush, Great Zimbabwe, Mali, and Axum.",
            "order": 1, "duration_minutes": 40, "is_free_preview": True, "is_published": True,
            "content": """# Early Civilizations of Africa

## Why Africa?
Africa is considered the **cradle of humankind** — the oldest human fossils have been found here.

## Great African Civilizations
| Civilization | Region | Peak Period | Known For |
|---|---|---|---|
| Ancient Egypt | North Africa | 3100–30 BCE | Pyramids, hieroglyphics, Nile farming |
| Kush (Nubia) | Sudan | 2000–350 BCE | Iron smelting, trade, pyramids |
| Axum | Ethiopia/Eritrea | 100–700 CE | Obelisks, Christianity, Red Sea trade |
| Mali Empire | West Africa | 1235–1600 CE | Mansa Musa, gold and salt trade |
| Great Zimbabwe | Southern Africa | 1000–1450 CE | Stone city, gold trade |

## The Kingdom of Kush
- Located along the Nile River
- Known for advanced iron smelting technology
- Eventually conquered by Axum in 350 CE

## Discussion
What factors led to the rise and fall of these great African civilizations?
""",
        },
        {
            "title": "Kenya's Road to Independence",
            "slug": "junior-ss-kenya-independence",
            "description": "The struggle for independence, the Mau Mau movement, and Kenya's path to nationhood.",
            "order": 2, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Kenya's Road to Independence

## Colonial Period
- British East Africa Protectorate established 1895
- Kenya Colony declared 1920
- White settlers took fertile highlands; Africans displaced

## African Resistance
- **Koitalel arap Samoei** — led Nandi resistance (1890s–1905)
- **Me Katilili wa Menza** — led Giriama resistance (1913)

## The Mau Mau Movement (1952–1960)
- Kikuyu-led armed uprising demanding **land and freedom**
- British declared a State of Emergency 1952
- Key figures: Dedan Kimathi, Field Marshal Muthoni

## Political Independence
- **Kenya African National Union (KANU)** founded 1960 — Jomo Kenyatta, Oginga Odinga
- **Independence declared 12 December 1963** — Jamhuri Day
- Republic declared 12 December **1964** — Kenyatta became first President

## Key Dates
| Year | Event |
|---|---|
| 1952 | State of Emergency declared |
| 1963 | Independence |
| 1964 | Kenya becomes a Republic |
""",
        },
        {
            "title": "Climate and Weather in East Africa",
            "slug": "junior-ss-climate-east-africa",
            "description": "Factors affecting climate, rainfall patterns, and the impact of climate change on Kenya.",
            "order": 3, "duration_minutes": 40, "is_free_preview": False, "is_published": True,
            "content": """# Climate and Weather in East Africa

## Weather vs Climate
- **Weather** — short-term atmospheric conditions (today's rain)
- **Climate** — long-term average weather patterns over 30+ years

## Factors Affecting Climate
1. **Latitude** — areas near the equator are warmer
2. **Altitude** — higher = cooler (Mt Kenya is snow-capped!)
3. **Distance from the sea** — coastal areas have moderate temperatures
4. **Ocean currents** — Indian Ocean influences Kenya's coast
5. **Aspect** — which side of the hill faces the rain-bearing winds

## Kenya's Rainfall Zones
| Zone | Rainfall | Areas |
|---|---|---|
| High (>1000mm) | Heavy | Highlands, western Kenya |
| Medium (500–1000mm) | Moderate | Central Kenya, Coast |
| Low (<500mm) | Dry | ASAL (Arid & Semi-Arid Lands) |

## Climate Change Impacts
- Unpredictable rainfall → crop failure
- Rising sea levels → flooding of coastal areas
- Increased droughts in northern Kenya
""",
        },
    ],

    # ── SENIOR MATHEMATICS ────────────────────────────────────────────────
    "senior-mathematics": [
        {
            "title": "Quadratic Equations and Expressions",
            "slug": "senior-maths-quadratics",
            "description": "Factorisation, the quadratic formula, completing the square, and graphing parabolas.",
            "order": 1, "duration_minutes": 55, "is_free_preview": True, "is_published": True,
            "content": """# Quadratic Equations

## Standard Form
> ax² + bx + c = 0 (where a ≠ 0)

## Method 1: Factorisation
x² + 5x + 6 = 0
Find two numbers that multiply to **6** and add to **5**: 2 and 3
(x + 2)(x + 3) = 0
x = **−2** or x = **−3**

## Method 2: Quadratic Formula
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Example: 2x² − 7x + 3 = 0 (a=2, b=−7, c=3)
x = (7 ± √(49−24)) / 4 = (7 ± 5) / 4
x = **3** or x = **0.5**

## The Discriminant (b² − 4ac)
| Value | Nature of Roots |
|---|---|
| > 0 | Two distinct real roots |
| = 0 | One repeated real root |
| < 0 | No real roots |

## Method 3: Completing the Square
x² + 6x − 7 = 0
(x + 3)² − 9 − 7 = 0 → (x + 3)² = 16
x + 3 = ±4 → x = **1** or x = **−7**
""",
        },
        {
            "title": "Trigonometry — Sine, Cosine, Tangent",
            "slug": "senior-maths-trigonometry",
            "description": "SOHCAHTOA, the unit circle, graphs of trig functions, and real-life applications.",
            "order": 2, "duration_minutes": 55, "is_free_preview": False, "is_published": True,
            "content": """# Trigonometry

## SOHCAHTOA (Right-Angled Triangles)
- **sin θ** = Opposite / Hypotenuse
- **cos θ** = Adjacent / Hypotenuse
- **tan θ** = Opposite / Adjacent

## Key Angles
| θ | sin θ | cos θ | tan θ |
|---|---|---|---|
| 0° | 0 | 1 | 0 |
| 30° | ½ | √3/2 | 1/√3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | ½ | √3 |
| 90° | 1 | 0 | undefined |

## The Sine Rule
$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$$
Use when: two angles and a side are known.

## The Cosine Rule
$$a^2 = b^2 + c^2 - 2bc\\cos A$$
Use when: two sides and the included angle are known.

## Application
From the top of a 40 m cliff, the angle of depression to a boat is 28°.
Distance of boat from cliff base = 40 / tan 28° ≈ **75.2 m**
""",
        },
        {
            "title": "Differentiation — Introduction to Calculus",
            "slug": "senior-maths-differentiation",
            "description": "Limits, the derivative from first principles, rules of differentiation, and applications.",
            "order": 3, "duration_minutes": 60, "is_free_preview": False, "is_published": True,
            "content": """# Differentiation

## What is a Derivative?
The derivative measures the **rate of change** of a function — or the gradient of the tangent at any point.

## Power Rule
> If f(x) = xⁿ, then f'(x) = nxⁿ⁻¹

**Examples:**
- f(x) = x³ → f'(x) = **3x²**
- f(x) = 5x² → f'(x) = **10x**
- f(x) = 7 → f'(x) = **0** (constant)

## Sum Rule
d/dx [f(x) + g(x)] = f'(x) + g'(x)

## Finding the Gradient at a Point
f(x) = 2x³ − 3x² + 5
f'(x) = 6x² − 6x
At x = 2: f'(2) = 6(4) − 6(2) = 24 − 12 = **12**

## Applications
- **Maxima and minima** — set f'(x) = 0 and solve
- **Kinematics** — velocity = ds/dt, acceleration = dv/dt
""",
        },
        {
            "title": "Probability",
            "slug": "senior-maths-probability",
            "description": "Basic probability, tree diagrams, conditional probability, and the addition and multiplication rules.",
            "order": 4, "duration_minutes": 50, "is_free_preview": False, "is_published": True,
            "content": """# Probability

## Basic Probability
> P(event) = Number of favourable outcomes / Total number of possible outcomes

P(A) is always between 0 and 1.
P(impossible) = 0, P(certain) = 1

## Mutually Exclusive Events
Events that cannot happen at the same time.
**Addition Rule:** P(A or B) = P(A) + P(B)

## Independent Events
The outcome of one event does not affect the other.
**Multiplication Rule:** P(A and B) = P(A) × P(B)

## Tree Diagram Example
A bag has 3 red and 2 blue balls. Two balls drawn without replacement.
P(both red) = 3/5 × 2/4 = 6/20 = **3/10**

## Conditional Probability
$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$
"Probability of A given that B has already occurred"
""",
        },
        {
            "title": "Vectors",
            "slug": "senior-maths-vectors",
            "description": "Vector notation, operations (addition, subtraction, scalar multiplication), position vectors, and magnitudes.",
            "order": 5, "duration_minutes": 55, "is_free_preview": False, "is_published": True,
            "content": """# Vectors

## What is a Vector?
A vector has both **magnitude** (size) and **direction**.
Scalar = magnitude only (e.g. speed, distance)
Vector = magnitude + direction (e.g. velocity, displacement)

## Notation
**Column vector:** $\\vec{a} = \\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$
**Magnitude:** |**a**| = √(3² + 4²) = √25 = **5**

## Operations
**Addition:** (3, 4) + (1, −2) = **(4, 2)**
**Subtraction:** (3, 4) − (1, −2) = **(2, 6)**
**Scalar multiplication:** 2 × (3, 4) = **(6, 8)**

## Position Vectors
If A = (2, 3) and B = (5, 7):
**Vector AB** = OB − OA = (5−2, 7−3) = **(3, 4)**
|AB| = √(9+16) = **5 units**

## Parallel Vectors
Two vectors are parallel if one is a scalar multiple of the other.
(6, 4) is parallel to (3, 2) since (6, 4) = 2 × (3, 2) ✓
""",
        },
    ],

    # ── SENIOR BIOLOGY ────────────────────────────────────────────────────
    "senior-biology": [
        {
            "title": "Cell Division — Mitosis and Meiosis",
            "slug": "senior-bio-cell-division",
            "description": "Stages of mitosis and meiosis, their significance, and the differences between them.",
            "order": 1, "duration_minutes": 55, "is_free_preview": True, "is_published": True,
            "content": """# Cell Division — Mitosis and Meiosis

## Why Do Cells Divide?
- **Growth** — increase in number of body cells
- **Repair** — replace damaged or worn-out cells
- **Reproduction** — formation of gametes (sex cells)

## Mitosis
Results in **two identical daughter cells** — same number of chromosomes as parent cell.

**Stages:**
1. **Prophase** — chromosomes condense; nuclear membrane breaks down
2. **Metaphase** — chromosomes align at the equator
3. **Anaphase** — sister chromatids separate to opposite poles
4. **Telophase** — two new nuclei form; cell divides (cytokinesis)

**Uses:** Growth, repair, asexual reproduction

## Meiosis
Results in **four genetically unique cells** with **half** the parent's chromosome number (haploid).

Occurs in reproductive organs to produce gametes (sperm, eggs).

## Key Differences
| Feature | Mitosis | Meiosis |
|---|---|---|
| Divisions | 1 | 2 |
| Daughter cells | 2 | 4 |
| Ploidy | Diploid | Haploid |
| Genetic variation | None | Yes (crossing over) |
""",
        },
        {
            "title": "Genetics — Mendelian Inheritance",
            "slug": "senior-bio-genetics-mendelian",
            "description": "Gregor Mendel's laws, Punnett squares, dominant and recessive alleles, genotype vs phenotype.",
            "order": 2, "duration_minutes": 55, "is_free_preview": False, "is_published": True,
            "content": """# Mendelian Genetics

## Key Terms
- **Gene** — unit of inheritance located on a chromosome
- **Allele** — alternative form of a gene
- **Dominant (A)** — expressed when one or two copies are present
- **Recessive (a)** — only expressed when two copies are present (aa)
- **Genotype** — genetic make-up (AA, Aa, aa)
- **Phenotype** — observable trait (e.g. tall, short)

## Mendel's Laws
1. **Law of Segregation** — alleles separate during gamete formation
2. **Law of Independent Assortment** — genes on different chromosomes are inherited independently

## Punnett Square — Monohybrid Cross
Cross: Aa × Aa (both heterozygous)

|   | A | a |
|---|---|---|
| **A** | AA | Aa |
| **a** | Aa | aa |

Ratio: 1 AA : 2 Aa : 1 aa
Genotype ratio: 1:2:1 | Phenotype ratio: **3 dominant : 1 recessive**

## Worked Example
In pea plants, tall (T) is dominant over dwarf (t).
Cross Tt × tt:
Offspring: 50% Tt (tall), 50% tt (dwarf)
""",
        },
        {
            "title": "Ecology — Population Dynamics",
            "slug": "senior-bio-ecology-populations",
            "description": "Population growth models, carrying capacity, limiting factors, and human population growth.",
            "order": 3, "duration_minutes": 50, "is_free_preview": False, "is_published": True,
            "content": """# Population Dynamics

## Population
A **population** = all individuals of one species in one area at one time.

## Population Growth Curves
**J-shaped (exponential) growth:** unlimited resources → rapid increase
**S-shaped (logistic) growth:** limited resources → growth slows at carrying capacity

## Carrying Capacity (K)
The maximum population size that the environment can sustain.

## Limiting Factors
**Density-dependent:**
- Food and water availability
- Disease and predation
- Competition (intraspecific and interspecific)

**Density-independent:**
- Natural disasters
- Climate events
- Pollution

## Human Population Growth
World population ~8 billion (2024). Kenya: ~56 million.

**Demographic transition model:** birth rates and death rates change as a country develops.

## Impact of Overpopulation
- Habitat destruction
- Overconsumption of resources
- Increased pollution and waste
""",
        },
    ],

    # ── SENIOR CHEMISTRY ──────────────────────────────────────────────────
    "senior-chemistry": [
        {
            "title": "Organic Chemistry — Hydrocarbons",
            "slug": "senior-chem-hydrocarbons",
            "description": "Alkanes, alkenes, and alkynes: structures, naming, properties, and reactions.",
            "order": 1, "duration_minutes": 55, "is_free_preview": True, "is_published": True,
            "content": """# Hydrocarbons

## What are Hydrocarbons?
Compounds containing only **carbon** and **hydrogen** atoms.

## Alkanes (Saturated)
General formula: **CₙH₂ₙ₊₂**
- All single bonds (C–C)
- Names end in **-ane**

| n | Name | Formula |
|---|---|---|
| 1 | Methane | CH₄ |
| 2 | Ethane | C₂H₆ |
| 3 | Propane | C₃H₈ |
| 4 | Butane | C₄H₁₀ |

## Alkenes (Unsaturated)
General formula: **CₙH₂ₙ**
- At least one C=C double bond
- Names end in **-ene**
- More reactive than alkanes (addition reactions)

## Alkynes
General formula: **CₙH₂ₙ₋₂**
- At least one C≡C triple bond
- Names end in **-yne**

## Reactions
**Combustion (alkanes):** CH₄ + 2O₂ → CO₂ + 2H₂O
**Addition (alkenes):** CH₂=CH₂ + H₂ → CH₃−CH₃ (hydrogenation)
""",
        },
        {
            "title": "Acids, Bases, and Salts",
            "slug": "senior-chem-acids-bases-salts",
            "description": "Arrhenius and Brønsted–Lowry definitions, pH scale, neutralisation, and salt preparation.",
            "order": 2, "duration_minutes": 50, "is_free_preview": False, "is_published": True,
            "content": """# Acids, Bases, and Salts

## Definitions
**Arrhenius:** Acid → H⁺ ions in water; Base → OH⁻ ions in water
**Brønsted–Lowry:** Acid = proton donor; Base = proton acceptor

## The pH Scale
0 ←————————→ 14
Acidic      Neutral (7)     Alkaline

## Common Acids and Bases
| Substance | pH |
|---|---|
| Hydrochloric acid (HCl) | ~0–1 |
| Lemon juice | ~2 |
| Vinegar | ~3 |
| Pure water | 7 |
| Baking soda | ~9 |
| Bleach | ~12 |
| Sodium hydroxide | ~14 |

## Neutralisation
Acid + Base → Salt + Water
HCl + NaOH → NaCl + H₂O

## Preparing Salts
1. **Titration** — acid + alkali (for soluble salts)
2. **Excess base** — acid + metal oxide/carbonate
3. **Precipitation** — mixing two soluble solutions

## pH Indicators
- **Litmus:** Red in acid, blue in alkali
- **Universal indicator:** full colour range
- **Phenolphthalein:** colourless in acid, pink in alkali
""",
        },
        {
            "title": "Electrochemistry — Electrolysis",
            "slug": "senior-chem-electrolysis",
            "description": "Electrolytic cells, electrolysis of brine and dilute sulphuric acid, Faraday's laws, and industrial applications.",
            "order": 3, "duration_minutes": 55, "is_free_preview": False, "is_published": True,
            "content": """# Electrolysis

## What is Electrolysis?
The decomposition of an electrolyte by passing an **electric current** through it.

## Key Terms
- **Electrolyte** — ionic compound (dissolved or molten) that conducts electricity
- **Anode (+)** — positive electrode; oxidation occurs
- **Cathode (−)** — negative electrode; reduction occurs

## Electrolysis of Brine (NaCl solution)
**At cathode:** 2H⁺ + 2e⁻ → H₂ (gas)
**At anode:** 2Cl⁻ → Cl₂ + 2e⁻ (gas)
**In solution:** NaOH remains

**Industrial uses:** Chlorine for bleach/PVC, hydrogen for fuel, NaOH for soap

## Faraday's Laws
1. Mass of substance deposited ∝ quantity of charge (Q = It)
2. Equal charges deposit different masses depending on molar mass and valency

## Electroplating
Electroplating coats a cheaper metal with a more expensive one (e.g. chromium on car bumpers).
Object to be plated → cathode; coating metal → anode.
""",
        },
    ],

    # ── SENIOR PHYSICS ────────────────────────────────────────────────────
    "senior-physics": [
        {
            "title": "Waves — Properties and Types",
            "slug": "senior-phys-waves",
            "description": "Transverse and longitudinal waves, wave properties (amplitude, wavelength, frequency, speed), and the wave equation.",
            "order": 1, "duration_minutes": 50, "is_free_preview": True, "is_published": True,
            "content": """# Waves

## Types of Waves
**Transverse waves** — oscillation perpendicular to direction of travel
Examples: light, water waves, electromagnetic waves

**Longitudinal waves** — oscillation parallel to direction of travel
Examples: sound waves, P-waves (seismic)

## Wave Properties
| Property | Symbol | Unit | Definition |
|---|---|---|---|
| Amplitude | A | metres | Maximum displacement from equilibrium |
| Wavelength | λ | metres | Distance between two consecutive crests |
| Frequency | f | Hertz (Hz) | Number of complete waves per second |
| Period | T | seconds | Time for one complete wave; T = 1/f |
| Wave speed | v | m/s | Speed of wave travel |

## The Wave Equation
> **v = fλ**

Example: Sound travels at 340 m/s. A sound with frequency 680 Hz has wavelength:
λ = v/f = 340/680 = **0.5 m**

## The Electromagnetic Spectrum (increasing frequency)
Radio → Microwave → Infrared → Visible → UV → X-ray → Gamma ray
""",
        },
        {
            "title": "Electricity — Ohm's Law and Circuits",
            "slug": "senior-phys-electricity",
            "description": "Ohm's Law, resistance, series and parallel circuits, power, and energy calculations.",
            "order": 2, "duration_minutes": 55, "is_free_preview": False, "is_published": True,
            "content": """# Electricity — Ohm's Law and Circuits

## Current, Voltage, and Resistance
- **Current (I)** — rate of flow of charge, measured in Amperes (A)
- **Voltage/P.D. (V)** — energy per unit charge, measured in Volts (V)
- **Resistance (R)** — opposition to current flow, measured in Ohms (Ω)

## Ohm's Law
> **V = IR** (Voltage = Current × Resistance)

## Series Circuits
- Same current through all components
- Total resistance: R_total = R₁ + R₂ + R₃
- Voltage divides: V₁ + V₂ + ... = V_supply

## Parallel Circuits
- Same voltage across all components
- Total resistance: 1/R_total = 1/R₁ + 1/R₂
- Current divides

## Power and Energy
- **Power:** P = IV = I²R = V²/R (Watts)
- **Energy:** E = Pt (Joules)

## Electrical Safety
- Circuit breakers and fuses protect against overcurrent
- Earth wire prevents electric shock
- Never overload sockets
""",
        },
        {
            "title": "Radioactivity",
            "slug": "senior-phys-radioactivity",
            "description": "Nuclear structure, types of radiation (alpha, beta, gamma), half-life, and applications.",
            "order": 3, "duration_minutes": 55, "is_free_preview": False, "is_published": True,
            "content": """# Radioactivity

## Nuclear Structure
- **Proton number (Z)** = number of protons
- **Nucleon number (A)** = protons + neutrons
- **Isotopes** = atoms with same Z but different A (different neutron count)

## Types of Radiation
| Type | Symbol | Charge | Penetration | Stopped by |
|---|---|---|---|---|
| Alpha | α | +2 | Low | Paper, skin |
| Beta | β | −1 | Medium | 5 mm aluminium |
| Gamma | γ | 0 | High | Several cm lead |

## Half-Life
The time for **half** of the radioactive nuclei to decay.

**Example:** A sample starts with 800 atoms, half-life = 10 years.
After 10 years: 400 atoms
After 20 years: 200 atoms
After 30 years: 100 atoms

## Applications of Radioactivity
- **Medicine:** cancer treatment (radiotherapy), tracers, sterilisation
- **Industry:** thickness gauges, smoke detectors
- **Energy:** nuclear power stations
- **Dating:** carbon-14 dating (half-life ~5,730 years)
""",
        },
    ],

    # ── SENIOR HISTORY & GOVERNMENT ──────────────────────────────────────
    "senior-history": [
        {
            "title": "The Scramble for and Partition of Africa",
            "slug": "senior-hist-scramble-africa",
            "description": "The Berlin Conference 1884-85, European motives, African responses, and the legacy of partition.",
            "order": 1, "duration_minutes": 50, "is_free_preview": True, "is_published": True,
            "content": """# The Scramble for and Partition of Africa

## Background
By the 1880s, European powers were competing intensely for African territories.

## European Motives (3Ms + 1)
1. **Missionaries** — spread Christianity and Western education
2. **Merchants** — access to raw materials and new markets
3. **Military** — strategic outposts and prestige
4. **Social Darwinism** — racist ideology justifying colonialism

## The Berlin Conference 1884–85
Called by German Chancellor Otto von Bismarck.

**Key Outcomes:**
- Established rules for claiming African territories
- **Principle of Effective Occupation** — a power must effectively occupy land to claim it
- Divided Africa with no regard for existing ethnic or political boundaries

## African Responses
| Type | Example |
|---|---|
| Armed resistance | Menelik II of Ethiopia (Battle of Adwa, 1896) |
| Diplomacy | Some rulers signed protectorate agreements |
| Religious resistance | Mahdi in Sudan |

## Legacy
- 54 countries created from arbitrary borders
- Ethnic groups split; rival groups merged
- Source of many modern-day conflicts
""",
        },
        {
            "title": "Kenyan Government and Constitution",
            "slug": "senior-hist-kenya-constitution",
            "description": "Kenya's 2010 Constitution, devolution, the three arms of government, and citizens' rights.",
            "order": 2, "duration_minutes": 45, "is_free_preview": False, "is_published": True,
            "content": """# Kenya's Government and Constitution

## The 2010 Constitution
Kenya's constitution was promulgated on **27 August 2010** — passed by 67% of voters.

**Key Features:**
- Bill of Rights
- Devolution (47 county governments)
- Independent judiciary
- Two-chamber parliament (National Assembly + Senate)

## The Three Arms of Government
| Arm | Function | Key Institution |
|---|---|---|
| **Executive** | Implements laws | President, Cabinet |
| **Legislature** | Makes laws | Parliament (NA + Senate) |
| **Judiciary** | Interprets laws | Supreme Court, High Court, Magistrates |

## Devolution
- 47 **counties** each with a Governor and County Assembly
- Brings government closer to the people
- **15%** of national revenue allocated to counties

## Bill of Rights
All Kenyans are guaranteed:
- Right to life
- Right to equality and freedom from discrimination
- Freedom of expression, assembly, and movement
- Right to education, health, and housing

## Chapter 6 — Leadership and Integrity
Public officers must uphold integrity and avoid conflicts of interest.
""",
        },
    ],

    # ── SENIOR GEOGRAPHY ──────────────────────────────────────────────────
    "senior-geography": [
        {
            "title": "Plate Tectonics and Earthquakes",
            "slug": "senior-geo-plate-tectonics",
            "description": "Theory of plate tectonics, types of plate boundaries, earthquake causes, and measuring earthquakes.",
            "order": 1, "duration_minutes": 50, "is_free_preview": True, "is_published": True,
            "content": """# Plate Tectonics and Earthquakes

## The Theory of Plate Tectonics
The Earth's lithosphere is divided into large plates that move on the molten **asthenosphere**.

**Evidence:**
- Fit of continents (e.g. Africa and South America)
- Identical fossils on different continents
- Matching rock formations across oceans

## Types of Plate Boundaries
| Boundary | Movement | Features |
|---|---|---|
| **Convergent** | Plates move together | Mountains, trenches, volcanoes |
| **Divergent** | Plates move apart | Rift valleys, mid-ocean ridges |
| **Transform** | Plates slide past each other | Earthquakes (e.g. San Andreas Fault) |

## Causes of Earthquakes
- Stress builds up along fault lines
- Sudden movement releases energy as seismic waves
- **Focus** = point of origin underground
- **Epicentre** = point on surface directly above focus

## Measuring Earthquakes
- **Richter scale** — measures magnitude (energy released)
- **Mercalli scale** — measures intensity (impact on surface)

## The East African Rift
A divergent boundary — Kenya lies on the East African Rift Valley, causing volcanic activity (Mt. Longonot, Menengai Crater).
""",
        },
        {
            "title": "Agriculture — Types and Systems",
            "slug": "senior-geo-agriculture",
            "description": "Types of farming (subsistence, commercial, mixed), land use changes, irrigation, and food security.",
            "order": 2, "duration_minutes": 50, "is_free_preview": False, "is_published": True,
            "content": """# Agriculture — Types and Systems

## Subsistence vs Commercial Farming
| Feature | Subsistence | Commercial |
|---|---|---|
| Purpose | Food for family | Profit |
| Scale | Small | Large |
| Technology | Minimal | Advanced |
| Labour | Family | Hired |
| Examples | Small-scale maize, beans | Tea estates, flower farms |

## Types of Farming Systems
1. **Arable farming** — growing crops only
2. **Pastoral farming** — keeping livestock only
3. **Mixed farming** — crops + livestock
4. **Plantation farming** — single cash crop on large scale (e.g. tea in Kericho)
5. **Nomadic pastoralism** — moving livestock to follow pasture (e.g. Maasai)

## Irrigation in Kenya
- **Mwea Irrigation Scheme** — rice production near Kirinyaga
- **Perkerra Irrigation Scheme** — chilies and cotton near Marigat
- **Hola Irrigation Scheme** — cotton in Tana River County

## Food Security Challenges
- Climate variability and drought
- Population growth outpacing food production
- Post-harvest losses (poor storage)
- Land fragmentation
""",
        },
    ],

    # ── SENIOR BUSINESS STUDIES ───────────────────────────────────────────
    "senior-business-studies": [
        {
            "title": "Introduction to Business and Entrepreneurship",
            "slug": "senior-biz-intro-entrepreneurship",
            "description": "What is a business? Types of businesses, entrepreneurship skills, and opportunity identification.",
            "order": 1, "duration_minutes": 45, "is_free_preview": True, "is_published": True,
            "content": """# Business and Entrepreneurship

## What is a Business?
A business is an organisation that provides **goods or services** in exchange for **money (profit)**.

## Types of Business Organisations
| Type | Ownership | Examples |
|---|---|---|
| Sole proprietorship | One person | Mama mboga, kinyozi |
| Partnership | 2–20 people | Law firm, medical practice |
| Private limited company (Ltd) | Shareholders | Safaricom Ltd (before IPO) |
| Public limited company (PLC) | General public | KCB Group PLC |
| Cooperative | Members | Ukulima Co-op, KPCU |
| State corporation | Government | Kenya Power, Kenya Airways |

## Entrepreneurship
An **entrepreneur** identifies opportunities and starts businesses despite risk.

## Key Entrepreneurial Skills
1. Initiative and creativity
2. Risk-taking
3. Leadership and communication
4. Financial management
5. Problem-solving

## Opportunity Identification
Look for:
- Unmet needs in your community
- Problems that people face every day
- Gaps between supply and demand

**Kenyan Example:** M-Pesa was created because many Kenyans lacked access to formal banking.
""",
        },
        {
            "title": "Book-Keeping — Double-Entry System",
            "slug": "senior-biz-double-entry",
            "description": "The accounting equation, debit and credit rules, T-accounts, trial balance, and income statement.",
            "order": 2, "duration_minutes": 55, "is_free_preview": False, "is_published": True,
            "content": """# Double-Entry Book-Keeping

## The Accounting Equation
> **Assets = Liabilities + Owner's Equity**

Every transaction affects at least two accounts — hence **double-entry**.

## Debit and Credit Rules
| Account Type | Increase | Decrease |
|---|---|---|
| Asset | **Debit** | Credit |
| Liability | Credit | **Debit** |
| Equity/Capital | Credit | **Debit** |
| Revenue | Credit | **Debit** |
| Expense | **Debit** | Credit |

## T-Account Example
**Cash Account**
```
Dr           Cash           Cr
---------------------------------
Capital 50,000 | Purchases  15,000
Sales   20,000 | Rent         5,000
               | Balance c/d 50,000
---------------------------------
        70,000 |             70,000
```

## Trial Balance
Lists all debit and credit balances. Total debits must equal total credits.

## Income Statement (Profit & Loss)
Revenue − Cost of Sales = **Gross Profit**
Gross Profit − Expenses = **Net Profit**
""",
        },
    ],
}


# ---------------------------------------------------------------------------
# SEED FUNCTION
# ---------------------------------------------------------------------------

async def seed():
    print("🌱 Starting CBC seed...")

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Subject))
        existing = result.scalars().all()
        if existing:
            print(f"⚠️  Database already has {len(existing)} subject(s). Skipping seed.")
            print("   Run with --force to re-seed: python seed.py --force")
            return

        subject_map: dict[str, Subject] = {}

        # Insert subjects
        for s_data in SUBJECTS:
            subject = Subject(**s_data)
            session.add(subject)
            await session.flush()  # get the UUID
            subject_map[s_data["slug"]] = subject
            print(f"  ✅ Subject: [{s_data['grade_category'].upper()}] {s_data['name']}")

        # Insert lessons
        lesson_count = 0
        for subject_slug, lessons_data in LESSONS.items():
            if subject_slug not in subject_map:
                print(f"  ⚠️  No subject found for slug '{subject_slug}' — skipping")
                continue
            subject = subject_map[subject_slug]
            for l_data in lessons_data:
                lesson = Lesson(subject_id=subject.id, **l_data)
                session.add(lesson)
                lesson_count += 1

        await session.commit()

    print(f"\n🎉 Seed complete!")
    print(f"   Subjects: {len(SUBJECTS)}")
    print(f"   Lessons:  {lesson_count}")


async def force_seed():
    """Drop all existing content and re-seed."""
    print("🔥 Force re-seeding — deleting existing subjects and lessons...")
    async with AsyncSessionLocal() as session:
        await session.execute(text("DELETE FROM lessons"))
        await session.execute(text("DELETE FROM subjects"))
        await session.commit()
    await seed()


if __name__ == "__main__":
    import sys
    if "--force" in sys.argv:
        asyncio.run(force_seed())
    else:
        asyncio.run(seed())
