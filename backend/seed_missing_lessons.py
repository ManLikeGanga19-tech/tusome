"""Add lessons to subjects that currently have 0. Safe to re-run."""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.content import Subject, Lesson

MISSING_LESSONS = {
    "junior-english": [
        {"title": "Reading Comprehension Strategies", "slug": "jr-eng-reading", "description": "Skimming, scanning and making inferences from a passage.", "order": 1, "duration_minutes": 35, "is_free_preview": True, "is_published": True, "content": """# Reading Comprehension Strategies

## Learning Outcomes
- Use skimming to get the general idea of a text
- Use scanning to find specific information
- Make inferences from what is implied

## Key Strategies
**Skimming** — read quickly for the main idea (titles, first sentences).
**Scanning** — search for a specific word, date or fact.
**Inference** — work out meaning not directly stated.

## Practice Passage
*Kamau walked into the market at dawn. The traders were already arranging tomatoes and onions in neat rows. The smell of roasting maize filled the air.*

**Questions**
1. What time of day is it? How do you know?
2. Name two items on sale.
3. What can you infer about the traders' daily routine?
"""},
        {"title": "Writing a Formal Letter", "slug": "jr-eng-formal-letter", "description": "Format and language of a formal letter using Kenyan postal conventions.", "order": 2, "duration_minutes": 40, "is_free_preview": False, "is_published": True, "content": """# Writing a Formal Letter

## Learning Outcomes
- Identify the parts of a formal letter
- Use correct register and format

## Letter Format
```
Your Address
Date

Recipient's Name & Title
Organisation
Address

Dear Sir/Madam,

Subject: (underlined)

Body paragraph 1 — reason for writing
Body paragraph 2 — details
Body paragraph 3 — request/action

Yours faithfully,
Your Signature
Your Full Name
```

## Activity
Write a letter to your school principal requesting permission to start a science club.
"""},
        {"title": "Tenses: Past, Present and Future", "slug": "jr-eng-tenses", "description": "Simple, continuous and perfect tenses with Kenyan examples.", "order": 3, "duration_minutes": 30, "is_free_preview": False, "is_published": True, "content": """# Tenses

## Learning Outcomes
- Correctly use simple, continuous and perfect tenses
- Identify tense errors in sentences

## Summary Table
| Tense | Example |
|---|---|
| Simple present | Atieno **goes** to school every day. |
| Present continuous | She **is studying** right now. |
| Simple past | They **visited** Nairobi last week. |
| Past continuous | It **was raining** when we arrived. |
| Present perfect | He **has finished** his homework. |

## Practice
Rewrite these sentences in the tense shown in brackets.
1. The farmer plants maize. (past)
2. We are eating ugali. (simple present)
3. She finished the exam. (present perfect)
"""},
    ],
    "junior-kiswahili": [
        {"title": "Ufahamu wa Kusoma", "slug": "jr-kisw-ufahamu", "description": "Mbinu za kusoma na kujibu maswali ya ufahamu.", "order": 1, "duration_minutes": 35, "is_free_preview": True, "is_published": True, "content": """# Ufahamu wa Kusoma

## Malengo
- Kusoma kwa makini na kuelewa maana ya kifungu
- Kujibu maswali kwa sentensi kamili

## Kifungu cha Kusoma
*Soko la Gikomba linajulikana kote nchini Kenya. Wafanyabiashara wanauza nguo za bei nafuu. Wateja wanakuja asubuhi mapema kupata bidhaa nzuri kabla ya kuchelewa.*

## Maswali
1. Soko hilo linaitwa nani?
2. Wafanyabiashara wanauza nini?
3. Kwa nini wateja wanakuja mapema?
"""},
        {"title": "Insha ya Maelezo", "slug": "jr-kisw-insha", "description": "Jinsi ya kuandika insha ya maelezo yenye muundo kamili.", "order": 2, "duration_minutes": 40, "is_free_preview": False, "is_published": True, "content": """# Insha ya Maelezo

## Muundo wa Insha
1. **Utangulizi** — taja mada kwa ufupi
2. **Kiini** — aya 2–3 za maelezo
3. **Hitimisho** — fupisha mawazo yako

## Vidokezo
- Tumia lugha safi na sahihi
- Kila aya iwe na wazo moja kuu
- Epuka kurudia maneno

## Zoezi
Andika insha ya maneno 150 ukielezea siku yako ya kawaika shuleni.
"""},
        {"title": "Methali za Kiswahili", "slug": "jr-kisw-methali", "description": "Maana na matumizi ya methali za Kiswahili.", "order": 3, "duration_minutes": 30, "is_free_preview": False, "is_published": True, "content": """# Methali za Kiswahili

## Malengo
- Kuelewa maana ya methali
- Kutumia methali katika mazungumzo

## Methali na Maana Zake
| Methali | Maana |
|---|---|
| Haba na haba hujaza kibaba | Kidogo kidogo hukusanyika kuwa kikubwa |
| Haraka haraka haina baraka | Kufanya kitu haraka kunaweza kuleta makosa |
| Umoja ni nguvu | Watu wakishirikiana wanaweza kufanya mengi |

## Zoezi
Tumia kila methali katika sentensi inayoonyesha maana yake.
"""},
    ],
    "junior-pre-technical": [
        {"title": "Workshop Safety Rules", "slug": "jr-pretech-safety", "description": "Essential safety rules and protective equipment in the workshop.", "order": 1, "duration_minutes": 30, "is_free_preview": True, "is_published": True, "content": """# Workshop Safety Rules

## Learning Outcomes
- State the basic safety rules in a technical workshop
- Identify personal protective equipment (PPE)

## Golden Rules
1. Always wear safety goggles when cutting or drilling.
2. Keep tools clean and return them to their proper place.
3. Never run in the workshop.
4. Report any damaged tools to the teacher immediately.
5. Tie back long hair and remove loose jewellery.

## Personal Protective Equipment (PPE)
| PPE | Protects |
|---|---|
| Safety goggles | Eyes from flying debris |
| Gloves | Hands from cuts and heat |
| Apron | Clothes and skin |
| Closed shoes | Feet from falling objects |

## Quick Check
List **3** things you should do before you start working at your bench.
"""},
        {"title": "Introduction to Technical Drawing", "slug": "jr-pretech-drawing", "description": "Basic lines, symbols and simple orthographic views.", "order": 2, "duration_minutes": 40, "is_free_preview": False, "is_published": True, "content": """# Introduction to Technical Drawing

## Learning Outcomes
- Identify types of lines used in technical drawing
- Draw simple front and top views of an object

## Types of Lines
| Line Type | Appearance | Use |
|---|---|---|
| Outline | Thick solid | Visible edges |
| Hidden detail | Dashed | Edges you cannot see |
| Centre line | Dash-dot | Centre of circles/holes |
| Dimension line | Thin with arrows | Showing measurements |

## Orthographic Projection
Shows an object from **three views**: Front, Top (Plan), and Side.

## Activity
Draw the front view and top view of a rectangular wooden block 10 cm × 6 cm × 4 cm.
"""},
        {"title": "Wood Joints", "slug": "jr-pretech-joints", "description": "Common wood joints and their applications in furniture making.", "order": 3, "duration_minutes": 35, "is_free_preview": False, "is_published": True, "content": """# Wood Joints

## Learning Outcomes
- Name common wood joints
- Select the correct joint for a given application

## Common Joints
**Butt Joint** — two pieces joined end-to-face. Simple but weak. Used in boxes.

**Halving Joint** — each piece has half its thickness removed where they cross. Used in frames.

**Mortise and Tenon** — a projecting tenon fits into a matching mortise hole. Strong. Used in chairs and tables.

**Dovetail Joint** — interlocking wedge-shaped fingers. Very strong. Used in drawers.

## Activity
Sketch a mortise and tenon joint and label the mortise and the tenon.
"""},
    ],
    "junior-agriculture": [
        {"title": "Soil Types and Soil Health", "slug": "jr-agri-soil", "description": "Sandy, loam and clay soils — properties and suitability for crops.", "order": 1, "duration_minutes": 35, "is_free_preview": True, "is_published": True, "content": """# Soil Types and Soil Health

## Learning Outcomes
- Distinguish between sandy, loam and clay soils
- Explain why loam soil is best for most crops

## The Three Main Soil Types
| Property | Sandy | Loam | Clay |
|---|---|---|---|
| Texture | Coarse, gritty | Smooth, crumbly | Smooth, sticky |
| Water retention | Low | Medium | High |
| Drainage | Fast | Moderate | Slow |
| Best for | Carrots, groundnuts | Maize, beans, vegetables | Rice |

## Kenyan Context
The Central Highlands (around Nyeri and Kirinyaga) have fertile loam soils — ideal for tea and coffee farming.

## Activity
Collect a small sample of soil from your school compound. Roll it between your fingers. Which type is it most likely to be?
"""},
        {"title": "Crop Production: Maize Farming", "slug": "jr-agri-maize", "description": "Land preparation, planting, weeding and harvesting of maize.", "order": 2, "duration_minutes": 40, "is_free_preview": False, "is_published": True, "content": """# Crop Production: Maize Farming

## Learning Outcomes
- Describe the stages of maize production
- State the correct spacing for maize planting

## Stages of Production
1. **Land preparation** — plough and harrow to break up clods; remove weeds.
2. **Planting** — spacing: 75 cm between rows, 30 cm between seeds. Plant 2–3 seeds per hole, 5 cm deep.
3. **Fertiliser application** — apply DAP at planting; CAN at knee height (top-dressing).
4. **Weeding** — weed at 3 weeks and 6 weeks after germination.
5. **Harvesting** — harvest when husks turn brown and dry (about 3–4 months).

## Kenyan Context
Maize (mahindi) is Kenya's staple food. Main growing areas: Rift Valley, Western Kenya, and Central Kenya.

## Practice Questions
1. What is the correct row spacing for maize?
2. When should top-dressing fertiliser be applied?
"""},
        {"title": "Basic Nutrition: Food Groups", "slug": "jr-agri-nutrition", "description": "The main food groups and their roles in the body.", "order": 3, "duration_minutes": 30, "is_free_preview": False, "is_published": True, "content": """# Basic Nutrition: Food Groups

## Learning Outcomes
- Name the three main food groups
- Give Kenyan examples of each group

## The Three Main Groups
**1. Energy foods (Carbohydrates)**
Give us energy to work and play.
Kenyan examples: ugali, rice, bread, sweet potatoes, arrow roots.

**2. Body-building foods (Proteins)**
Build and repair body tissues, muscles and blood.
Kenyan examples: beans, lentils (ndengu), fish, eggs, meat, milk.

**3. Protective foods (Vitamins & Minerals)**
Protect us from disease and help body processes.
Kenyan examples: sukuma wiki, spinach, tomatoes, oranges, mangoes, carrots.

## A Balanced Meal
A typical Kenyan balanced meal: ugali (energy) + fish/beans (protein) + sukuma wiki (protective).

## Activity
Write down everything you ate yesterday. Label each item with its food group.
"""},
    ],
    "junior-creative-arts-sports": [
        {"title": "Elements of Art: Line, Shape and Colour", "slug": "jr-arts-elements", "description": "Using lines, shapes and colour mixing in visual art.", "order": 1, "duration_minutes": 35, "is_free_preview": True, "is_published": True, "content": """# Elements of Art

## Learning Outcomes
- Identify and use different types of lines
- Mix primary colours to make secondary colours

## Types of Lines
- **Horizontal** — suggest calm and rest
- **Vertical** — suggest strength and height
- **Diagonal** — suggest movement and tension
- **Curved** — suggest softness and flow

## Colour Theory
| Primary Colours | Mixed Together | Make |
|---|---|---|
| Red + Yellow | → | Orange |
| Yellow + Blue | → | Green |
| Blue + Red | → | Purple/Violet |

## Kenyan Connection
Traditional Maasai beadwork uses bold reds, blues and whites. Each colour carries meaning — red for bravery, blue for sky and water.

## Activity
Using pencils or paint, create a pattern inspired by Kenyan beadwork using at least 3 colours.
"""},
        {"title": "Traditional Kenyan Music", "slug": "jr-arts-music", "description": "Traditional instruments and rhythmic patterns from Kenyan communities.", "order": 2, "duration_minutes": 30, "is_free_preview": False, "is_published": True, "content": """# Traditional Kenyan Music

## Learning Outcomes
- Name traditional musical instruments from different Kenyan communities
- Clap or tap a simple rhythmic pattern

## Instruments by Community
| Community | Instrument | Type |
|---|---|---|
| Luo | Nyatiti (8-string lyre) | String |
| Luo | Orutu (1-string fiddle) | String |
| Kikuyu | Gicandi | Rattle/percussion |
| Kamba | Kilumi drums | Percussion |
| Mijikenda | Zomari (flute) | Wind |

## Rhythm Activity
Clap this pattern: **STRONG – weak – weak – STRONG – weak – weak**
This is a triple metre rhythm (3 beats per bar), common in many Kenyan folk songs.

## Discussion
Why is it important to preserve traditional music? Share your ideas with the class.
"""},
        {"title": "Athletics: Sprinting Technique", "slug": "jr-arts-athletics", "description": "Correct sprinting form and Kenya's athletics heritage.", "order": 3, "duration_minutes": 35, "is_free_preview": False, "is_published": True, "content": """# Athletics: Sprinting Technique

## Learning Outcomes
- Demonstrate correct sprinting posture
- Explain the stages of a sprint race

## Correct Sprinting Form
1. **Start** — crouch low, weight forward, fingers on the line.
2. **Drive phase** — push hard off the blocks, body at 45°, powerful arm drive.
3. **Acceleration** — gradually rise to upright position over first 30 m.
4. **Maximum velocity** — upright posture, high knee lift, relaxed face and shoulders.
5. **Finish** — lean or dip at the tape; don't slow down before the line.

## Kenya's Athletics Legacy
Kenya is world-famous for long-distance running. Athletes like Eliud Kipchoge (marathon world record holder) and Faith Kipyegon (1500 m world champion) inspire millions.

Sprinting and distance running both require: **discipline, consistent training, and proper nutrition.**

## Activity
In pairs, time each other running 60 m. Focus on your arm drive and knee lift.
"""},
    ],
    "senior-english": [
        {"title": "Literary Analysis: Prose Fiction", "slug": "sr-eng-prose", "description": "Analysing plot, character, theme and setting in a prose text.", "order": 1, "duration_minutes": 40, "is_free_preview": True, "is_published": True, "content": """# Literary Analysis: Prose Fiction

## Learning Outcomes
- Identify and analyse plot, character, theme and setting
- Support arguments with textual evidence

## Key Literary Elements
**Plot** — the sequence of events. Look for: exposition, rising action, climax, falling action, resolution.

**Character** — who the story is about. Ask: What do they do? What do they say? What do others say about them?

**Theme** — the central message or idea (e.g. corruption, family, identity).

**Setting** — where and when the story takes place. How does it affect mood?

## Worked Example
In *A Grain of Wheat* by Ngũgĩ wa Thiong'o, the setting of post-independence Kenya shapes the theme of betrayal and sacrifice. The village of Thabai becomes a microcosm of the nation's struggle.

## Practice
Read any two pages of a set novel. Write one paragraph each on: (a) character and (b) theme. Use quotations.
"""},
        {"title": "Argumentative Essay Writing", "slug": "sr-eng-argument", "description": "Structuring a well-reasoned argument with a clear thesis.", "order": 2, "duration_minutes": 45, "is_free_preview": False, "is_published": True, "content": """# Argumentative Essay Writing

## Learning Outcomes
- Write a clear thesis statement
- Structure body paragraphs using the PEEL model
- Acknowledge and refute a counterargument

## Essay Structure
1. **Introduction** — hook, background, thesis statement
2. **Body paragraph 1** — strongest point
3. **Body paragraph 2** — second point
4. **Body paragraph 3** — counterargument + refutation
5. **Conclusion** — restate thesis, call to action

## PEEL Paragraph Model
- **P**oint — state your argument
- **E**vidence — quote or example
- **E**xplain — how evidence supports your point
- **L**ink — connect back to the thesis

## Sample Thesis
*"Mobile phones should be allowed in Kenyan secondary schools because they enhance research, improve communication, and prepare students for a digital economy."*

## Practice
Write a full argumentative essay (400–500 words) on: *"Boarding schools are better than day schools."*
"""},
        {"title": "Summary Writing", "slug": "sr-eng-summary", "description": "Identifying main points and writing a concise, accurate summary.", "order": 3, "duration_minutes": 35, "is_free_preview": False, "is_published": True, "content": """# Summary Writing

## Learning Outcomes
- Identify main ideas in a passage
- Write a summary within a specified word limit

## Steps to Write a Good Summary
1. Read the passage **twice** — once for overall meaning, once for main points.
2. Underline or note the **key ideas** (usually one per paragraph).
3. Write in your **own words** — do not copy sentences directly.
4. Use **continuous prose** (not bullet points) unless instructed otherwise.
5. Keep within the **word limit** (usually 50–80 words for KCSE).

## Common Mistakes
- Copying directly from the passage
- Including minor details or examples
- Going over the word limit
- Changing the meaning of the original

## Practice
Read the passage below and write a summary in **not more than 60 words**.

*The mobile phone has transformed communication in Kenya. Farmers in rural areas can now check crop prices before going to market, saving time and money. Fishermen on Lake Victoria use phones to find buyers before they reach shore. Small business owners use M-Pesa to pay suppliers without travelling to a bank. Technology has empowered ordinary Kenyans in remarkable ways.*
"""},
    ],
    "senior-kiswahili": [
        {"title": "Fasihi Simulizi: Hadithi za Jadi", "slug": "sr-kisw-fasihi-simulizi", "description": "Uchambuzi wa hadithi za jadi, wahusika na dhamira.", "order": 1, "duration_minutes": 40, "is_free_preview": True, "is_published": True, "content": """# Fasihi Simulizi: Hadithi za Jadi

## Malengo
- Kuelewa vipengele vya hadithi za jadi
- Kuchunguza dhamira na mafunzo ya hadithi

## Vipengele vya Hadithi
**Wahusika** — watu au wanyama wanaohusika katika hadithi.
**Dhamira** — ujumbe mkuu wa hadithi (mfano: uaminifu, ujasiri, umoja).
**Muundo** — utangulizi, kiini, hitimisho.
**Mazingira** — mahali na wakati hadithi inayoendelea.

## Hadithi Fupi
*Sungura na Tembo walikubaliana kushindana mbio. Wanyama wote walishangaa — tembo ni mkubwa sana! Lakini sungura alimwambia tembo: "Ninaanza kesho asubuhi." Usiku, sungura alipanga ndugu zake kando ya njia. Kila mara tembo alipita, ndugu wa sungura alisema "Nipo hapa!" Tembo alifika mwishoni akiwa amechoka — sungura alikuwa tayari amewasili.*

## Maswali ya Uchambuzi
1. Nani wahusika wakuu katika hadithi hii?
2. Ni dhamira gani inayojitokeza?
3. Hadithi hii inafanana na hadithi nyingine unayoijua?
"""},
        {"title": "Ushairi: Vipengele na Uchambuzi", "slug": "sr-kisw-ushairi", "description": "Vipengele vya ushairi wa Kiswahili na jinsi ya kuuchanganua.", "order": 2, "duration_minutes": 40, "is_free_preview": False, "is_published": True, "content": """# Ushairi wa Kiswahili

## Malengo
- Kutambua vipengele vya ushairi
- Kuchanganua shairi kwa kina

## Vipengele Muhimu
**Mizani** — idadi ya silabi katika mshororo (mstari). Ushairi wa jadi una mizani 8+8 au 16 kwa ubeti.

**Vina** — mwisho wa mistari unaolingana kwa sauti (urari wa vina).

**Kibwagizo** — mshororo unaorudiwa mara kwa mara kwa msisitizo.

**Dhamira** — ujumbe wa shairi.

**Tamathali za usemi** — tashbihi ("kama"), sitiari, tashihisi.

## Shairi Fupi (Mfano)
```
Kenya nchi yangu nzuri,      (8 silabi)
Ardhi yenye kila siri,       (8 silabi)
Milima na mito kiri,         (8 silabi)
Moyo wangu hujaa heri.       (8 silabi)
```

## Zoezi
Changanua shairi hili: taja vina, hesabu mizani, na eleza dhamira yake.
"""},
        {"title": "Insha ya Hoja", "slug": "sr-kisw-insha-hoja", "description": "Muundo wa insha ya hoja yenye hoja kuu na hoja za kusaidia.", "order": 3, "duration_minutes": 40, "is_free_preview": False, "is_published": True, "content": """# Insha ya Hoja

## Malengo
- Kuandika insha ya hoja yenye muundo kamili
- Kutumia lugha ya kushawishi

## Muundo wa Insha ya Hoja
1. **Utangulizi** — taja mada na dai lako kuu
2. **Hoja ya kwanza** — ushahidi na mfano
3. **Hoja ya pili** — ushahidi zaidi
4. **Hoja ya upinzani** — kabili hoja za upande wa pili
5. **Hitimisho** — rudia dai lako, toa wito wa kutenda

## Maneno ya Kushawishi
- *Ni dhahiri kwamba...*
- *Ushahidi unaonyesha...*
- *Ingawa wengine wanasema... hata hivyo...*
- *Kwa hivyo, ni lazima...*

## Zoezi
Andika insha ya maneno 300–400 ukishughulikia mada hii:
**"Matumizi ya simu za mkononi mashuleni yanadhuru zaidi kuliko kusaidia."**
"""},
    ],
}


async def add_missing_lessons():
    print("🌱 Adding lessons to empty subjects...\n")
    added_total = 0

    async with AsyncSessionLocal() as session:
        for slug, lessons_data in MISSING_LESSONS.items():
            # Find subject
            result = await session.execute(select(Subject).where(Subject.slug == slug))
            subject = result.scalar_one_or_none()
            if not subject:
                print(f"  ⚠️  Subject '{slug}' not found — skipping")
                continue

            # Count existing lessons
            count_result = await session.execute(
                select(func.count()).select_from(Lesson).where(Lesson.subject_id == subject.id)
            )
            existing_count = count_result.scalar()

            if existing_count > 0:
                print(f"  ⏭  Skipping '{slug}' — already has {existing_count} lesson(s)")
                continue

            # Add lessons
            for l_data in lessons_data:
                session.add(Lesson(subject_id=subject.id, **l_data))
            added_total += len(lessons_data)
            print(f"  ✅ Added {len(lessons_data)} lessons → {subject.name} ({slug})")

        await session.commit()

    print(f"\n🎉 Done! {added_total} lessons added.")


if __name__ == "__main__":
    asyncio.run(add_missing_lessons())
