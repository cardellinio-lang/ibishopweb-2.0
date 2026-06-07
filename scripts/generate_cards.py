#!/usr/bin/env python3
import os, sys, json, time, subprocess, tempfile, urllib.request, urllib.parse
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

OUTPUT_DIR = os.path.expanduser("~/Desktop/cartes_orthophonie")
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_PATH = "/Users/traddax/Library/Fonts/Hacen-Tunisia-Bold.ttf"
CARD_W, CARD_H = 800, 1200
CACHE_DIR = os.path.join(OUTPUT_DIR, "_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

PEXELS_KEY = "Sv9bIAOkmJ4dzDx3ZjwddRr7AcdNvrRevIBkgxrgUYqkTnwwfWq6JxYQ"

CARDS = [
    # ===== 1. المشاعر والعواطف - ÉMOTIONS (Story Champs style) — 10 =====
    ("يلعب مع الكلب + سعيد",
     "child playing with dog happy",
     "happy boy laughing playing",
     "child sitting alone sad lonely room",
     "الطفل سعيد عندما يلعب مع كلبه",
     "الطفل يشعر بالحزن عندما يكون", "وحيداً"),

    ("هدية عيد + يبتسم",
     "child receiving birthday gift excited",
     "children smiling happy celebration",
     "child fell down crying hurt knee",
     "عندما يأخذ الطفل هدية يكون سعيداً",
     "عندما يقع الطفل ويتألم يكون", "حزيناً"),

    ("أطفال يلعبون بالخارج + فرح",
     "children playing outside park laughing",
     "sunny day children playing grass",
     "child looking out window sad rainy day",
     "الأطفال فرحون عندما يلعبون في الشمس",
     "الطفل حزين عندما لا يستطيع الخروج تحت", "المطر"),

    ("كلب ينبح + طفل خائف",
     "dog barking angry face",
     "child scared expression face",
     "child sleeping peacefully in bed",
     "الطفل يخاف من الكلب النباح",
     "الطفل يشعر بالأمان عندما ينام في", "سريره"),

    ("طفل يضرب صديقه + صديق يبكي",
     "child hitting another child",
     "child crying sad upset",
     "child sharing toys with friend smiling",
     "عندما يضرب الطفل صديقه، صديقه يكون حزيناً",
     "عندما يشارك الطفل ألعابه، صديقه يكون", "سعيداً"),

    ("أم تحتضن طفلها + طفل يبتسم",
     "mother hugging child affection",
     "child smiling happy loved",
     "mother angry scolding child",
     "الطفل يشعر بالحب عندما تحتضنه أمه",
     "الطفل يشعر بالخوف عندما تكون أمه", "غاضبة"),

    ("فريق فائز + ميدالية",
     "winner medal celebration podium",
     "happy champion trophy award",
     "child losing game sad disappointed",
     "الطفل فخور عندما يفوز بالميدالية",
     "الطفل حزين عندما يخسر في", "اللعبة"),

    ("آيس كريم + فرح",
     "child eating ice cream happy",
     "ice cream cone delicious summer",
     "child making face taking medicine",
     "الطفل سعيد عندما يأكل الآيس كريم",
     "الطفل متذمر عندما يشرب", "الدواء"),

    ("أطفال يلعبون معاً + يضحكون",
     "children playing together laughing",
     "group of kids laughing having fun",
     "child playing alone isolated",
     "الأطفال سعداء عندما يلعبون معاً",
     "الطفل الذي يلعب وحده يشعر", "بالوحدة"),

    ("أم تقرأ قصة + طفل سعيد",
     "mother reading bedtime story child",
     "child listening to story happy",
     "lights off child sleeping alone",
     "الطفل سعيد عندما تقرأ له أمه قصة",
     "الطفل ينام عندما تنطفئ", "الأنوار"),

    # ===== 2. السبب والنتيجة - CAUSE & EFFET — 10 =====
    ("غيوم + مطر",
     "dark rain clouds sky",
     "rain falling on umbrella",
     "sun shining children playing outside",
     "عندما تكون السماء ملبدة بالغيوم، سوف يمطر",
     "عندما تشرق الشمس، الأطفال يلعبون في", "الخارج"),

    ("دخان + نار",
     "smoke rising from fire",
     "fire flames burning",
     "fire truck emergency lights",
     "عندما نرى الدخان، هناك نار",
     "عندما نسمع صفارة الإنذار، هناك", "حريق"),

    ("نبات ذابل + بلا ماء",
     "wilted dry plant without water",
     "dead plant brown leaves",
     "green plant being watered garden",
     "النبات يذبل عندما لا يُسقى الماء",
     "النبات ينمو عندما يُسقى", "الماء"),

    ("ليل + قمر",
     "night sky moon stars",
     "city at night dark",
     "sunrise morning sun rising",
     "عندما يحل الليل، نرى القمر والنجوم",
     "عندما يأتي الصباح، تشرق", "الشمس"),

    ("طفل يلمس إناء ساخناً + يبكي",
     "child touching hot pot stove",
     "child crying in pain hurt",
     "child wearing oven mitts safely",
     "عندما يلمس الطفل إناءً ساخناً، يحرق يده",
     "عندما يلبس الطفل قفازات الفرن، يكون", "آمناً"),

    ("يد متسخة + جراثيم",
     "dirty hands with mud",
     "germs bacteria microscope",
     "child washing hands with soap",
     "الأيدي المتسخة تحمل الجراثيم",
     "نغسل الأيدي بالصابون لقتل", "الجراثيم"),

    ("جروح + ضمادة",
     "cut wound on knee",
     "bandage on injured knee",
     "child playing sports healthy active",
     "نضع الضمادة على الجرح ليشفى",
     "الطفل السليم يلعب ويمرح دون", "جروح"),

    ("ثلج + برد",
     "snowy landscape winter cold",
     "thermometer low temperature cold",
     "beach hot summer sun",
     "عندما يتساقط الثلج، الجو بارد",
     "عندما تشرق الشمس بقوة، الجو", "حار"),

    ("سيارة مكسورة + ميكانيكي",
     "broken car engine open hood",
     "mechanic repairing car",
     "car driving smoothly on road",
     "السيارة المكسورة يحتاج الميكانيكي لإصلاحها",
     "السيارة تسير عندما تكون", "سليمة"),

    ("جائع + أكل",
     "hungry child sad holding stomach",
     "child eating food happily",
     "child drinking water thirsty",
     "عندما يكون الطفل جائعاً، يأكل الطعام",
     "عندما يكون الطفل عطشاناً، يشرب", "الماء"),

    # ===== 3. حل المشكلات - RÉSOLUTION DE PROBLÈMES — 10 =====
    ("كوب مسكوب + قطعة قماش",
     "spilled water on table",
     "person cleaning with cloth",
     "child crying hungry",
     "عندما ينسكب الماء، نستخدم القماش لتنظيفه",
     "عندما يكون الطفل جائعاً، يحتاج إلى", "طعام"),

    ("شعر أشعث + مشط",
     "messy tangled hair",
     "comb brushing hair",
     "dirty teeth toothbrush toothpaste",
     "عندما يكون الشعر أشعثاً، نستخدم المشط",
     "عندما تكون الأسنان غير نظيفة، نستخدم الفرشاة و", "المعجون"),

    ("غرفة فوضوية + ألعاب على الأرض",
     "messy room toys scattered floor",
     "child tidying up toys box",
     "unmade bed wrinkled sheets",
     "الغرفة الفوضوية تحتاج إلى ترتيب الألعاب",
     "السرير غير المرتب يحتاج إلى", "الترتيب"),

    ("مطر + بدون مظلة + مبتل",
     "person walking in rain without umbrella",
     "wet clothes dripping water",
     "sunny day person with umbrella",
     "عندما تمطر بدون مظلة، تبتل الملابس",
     "نستخدم المظلة لعدم", "الابتلال"),

    ("نافذة مكسورة + كرة",
     "broken window glass shattered",
     "ball on ground near window",
     "children playing ball safely in park",
     "النافذة انكسرت لأن أحدهم ركل الكرة",
     "نلعب بالكرة في الحديقة لنكون", "آمنين"),

    ("طاولة غير مرتبة + أطباق متسخة",
     "messy table dirty dishes",
     "washing dishes at sink",
     "clean organized dining table",
     "الأطباق المتسخة تحتاج إلى غسل",
     "الطاولة المرتبة تكون", "نظيفة"),

    ("سيارة في زحمة سير + تأخر",
     "traffic jam cars on road",
     "person looking at watch frustrated",
     "empty road car driving fast",
     "في زحمة السير، تتأخر السيارة",
     "في الطريق الخالي، السيارة تسير", "بسرعة"),

    ("طفل نائم + منبه يرن",
     "child sleeping in bed alarm clock",
     "alarm clock ringing morning",
     "child brushing teeth bathroom",
     "عندما يرن المنبه، يستيقظ الطفل من النوم",
     "بعد الاستيقاظ، يذهب الطفل إلى الحمام ليغسل", "وجهه"),

    ("قلم رصاص مكسور + براية",
     "broken pencil tip",
     "pencil sharpener shavings",
     "child drawing with colored pencils",
     "القلم المكسور يحتاج إلى البراية",
     "للرسم الجميل نحتاج إلى ورق و", "ألوان"),

    ("إشارة مرور حمراء + توقف",
     "red traffic light on",
     "cars stopped at traffic light",
     "green traffic light cars moving",
     "عندما تكون الإشارة حمراء، نتوقف",
     "عندما تكون الإشارة خضراء، نسير ونحن", "آمنون"),

    # ===== 4. المهارات الاجتماعية - COMPÉTENCES SOCIALES (Familjen Kippin) — 10 =====
    ("طفلان يتشاجران + كلاهما يبكي",
     "two children fighting over toy",
     "both children crying sad",
     "children sharing toy playing happily",
     "عندما يتشاجر الأطفال، كلاهما يكون حزيناً",
     "عندما يشارك الأطفال، كلاهما يكون", "سعيداً"),

    ("طفل يطلب بأدب + يساعده الآخرون",
     "child asking politely please",
     "adult helping child smiling",
     "child screaming demanding angry",
     "عندما يطلب الطفل بأدب، يساعده الآخرون",
     "عندما يصرخ الطفل، الآخرون لا", "يساعدونه"),

    ("ينتظر دوره في الأرجوحة + سعيد",
     "child waiting turn swing park",
     "child on swing happy playing",
     "child pushing in line angry",
     "الطفل ينتظر دوره ليلعب وهو سعيد",
     "الطفل الذي يدفع الآخرين يجعلهم", "غاضبين"),

    ("طفل يساعد أمه + أم سعيدة",
     "child helping mother tidy room",
     "mother smiling happy with child",
     "child throwing toys on floor",
     "الأم سعيدة عندما يساعدها طفلها",
     "الأم غاضبة عندما يرمي الطفل ألعابه على", "الأرض"),

    ("طفل يقول شكراً + الآخر سعيد",
     "child saying thank you smiling",
     "adult smiling receiving thanks",
     "child not apologizing after mistake",
     "عندما نقول شكراً، الآخر يكون سعيداً",
     "عندما لا يعتذر الطفل، صديقه يكون", "حزيناً"),

    ("طفل يقاطع الحديث + متحدث منزعج",
     "child interrupting conversation",
     "person looking annoyed interrupted",
     "child listening patiently raising hand",
     "عندما يقاطع الطفل الحديث، المتحدث ينزعج",
     "عندما ينتظر الطفل دوره ويتحدث بأدب، الجميع", "يحترمه"),

    ("طفل يشارك الحلوى + صديق سعيد",
     "child sharing candy with friend",
     "friend smiling happily receiving",
     "child eating candy alone selfishly",
     "المشاركة تجعل الأصدقاء سعداء",
     "عندما يأكل الطفل وحده، صديقه يكون", "حزيناً"),

    ("طفل يلعب بلطف مع الهرة + الهرة سعيدة",
     "child gently petting cat",
     "cat purring happy being petted",
     "child pulling cat tail angrily",
     "الهرة تحب عندما يلعب معها الطفل بلطف",
     "الهرة تتألم عندما يشد الطفل", "ذيلها"),

    ("طفل يسلم + صديق يرد السلام",
     "child greeting waving hand",
     "friend waving back smiling",
     "child ignoring friend walking away",
     "التحية تجعل الأصدقاء سعداء",
     "عندما يتجاهل الطفل صديقه، صديقه يشعر", "بالرفض"),

    ("مجموعة أطفال يلعبون + كلهم فرحون",
     "group children playing together happily",
     "children laughing having fun together",
     "child excluded watching others play",
     "الأطفال سعداء عندما يلعبون معاً كمجموعة",
     "الطفل المستبعد من المجموعة يشعر", "بالوحدة"),

    # ===== 5. الصحة والنظافة - SANTÉ & HYGIÈNE — 10 =====
    ("أيدي متسخة + صابون",
     "dirty hands with dirt",
     "washing hands with soap foam",
     "dirty hair needs shampoo",
     "نغسل أيدينا بالصابون لقتل الجراثيم",
     "نغسل شعرنا بالشامبو و", "الماء"),

    ("أسنان صفراء + فرشاة أسنان",
     "yellow stained teeth",
     "brushing teeth with toothbrush",
     "dirty body needs shower",
     "ننظف أسناننا بالفرشاة والمعجون",
     "نغسل جسمنا بالصابون عند", "الاستحمام"),

    ("يعطس + منديل",
     "person sneezing into tissue",
     "tissue box facial tissue",
     "person coughing covering mouth",
     "عندما نعطس، نستخدم المنديل",
     "عندما نسعل، نغطي", "فمنا"),

    ("تفاحة غير مغسولة + جراثيم",
     "unwashed apple on table",
     "germs bacteria on fruit",
     "washing apple under faucet",
     "التفاح غير المغسول عليه جراثيم",
     "نغسل الفاكهة قبل الأكل لتصبح", "نظيفة"),

    ("طفل يأكل خضروات + طفل قوي",
     "child eating vegetables salad",
     "strong healthy child exercising",
     "child eating candy sweets teeth",
     "الخضروات تجعل الطفل قوياً وصحياً",
     "الحلويات الكثيرة تسبب ألم", "الأسنان"),

    ("نوم مبكر + نشاط في الصباح",
     "child sleeping early night",
     "energetic active child morning",
     "child staying up late tired",
     "النوم المبكر يجعل الطفل نشيطاً في الصباح",
     "السهر لوقت متأخر يجعل الطفل", "متعباً"),

    ("حافي القدمين + جرح محتمل",
     "child walking barefoot outside",
     "cut foot from sharp object",
     "child wearing shoes safely",
     "المشي حافياً قد يسبب جرحاً في القدم",
     "نلبس الأحذية لحماية", "القدمين"),

    ("طعام مكشوف + ذباب",
     "food uncovered on table",
     "flies sitting on food",
     "covered food in container",
     "الطعام المكشوف يجذب الذباب",
     "نغطي الطعام لحمايته من", "الذباب"),

    ("ملابس ثقيلة في الصيف + تعرق",
     "child in heavy winter clothes summer",
     "child sweating hot uncomfortable",
     "child in light summer clothes cool",
     "الملابس الثقيلة في الصيف تسبب التعرق",
     "الملابس الخفيفة في الصيف تجعلنا", "منتعشين"),

    ("رياضة + جسم قوي",
     "child playing sports running",
     "strong healthy child smiling",
     "child sitting watching TV long hours",
     "الرياضة تجعل الجسم قوياً",
     "الجلسة الطويلة أمام التلفاز تضعف", "البصر"),

    # ===== 6. الاستدلال والاستنتاج - INFÉRENCE (Langage en situation) — 10 =====
    ("وجوه مبللة + مناشف",
     "wet faces after washing",
     "towel drying face",
     "wet hair dripping water",
     "بعد غسل الوجه، نستخدم المنشفة للتجفيف",
     "بعد غسل الشعر، نستخدم المجفف أو", "المنشفة"),

    ("أطباق متسخة + فرشاة جلي",
     "dirty dishes in sink",
     "washing brush with soap",
     "messy room needs tidying",
     "الأطباق المتسخة تغسل بالفرشاة والصابون",
     "الغرفة الفوضوية تحتاج إلى", "الترتيب"),

    ("أقدام متسخة + حافي",
     "dirty feet from walking barefoot",
     "child walking barefoot in mud",
     "hands stained with paint",
     "القدمان متسختان لأن الطفل كان حافياً",
     "اليدان متسختان من", "الطلاء"),

    ("ملابس مبللة + غسيل",
     "wet clothes laundry pile",
     "washing machine with clothes",
     "dirty dishes stack in sink",
     "الملابس المبللة توضع في الغسالة",
     "الأطباق المتسخة توضع في", "الجلاية"),

    ("ورق ممزق + مقص",
     "torn paper pieces",
     "scissors on table",
     "broken toy on floor",
     "الورقة تمزقت لأن أحدهم استخدم المقص",
     "اللعبة انكسرت لأن أحدهم", "أسقطها"),

    ("جبيرة في اليد + طبيب",
     "child with arm cast plaster",
     "doctor examining xray",
     "child with bandage on head",
     "الطفل كسر يده وذهب إلى الطبيب",
     "الطفل أصيب في رأسه ووضع", "الضمادة"),

    ("سحاب أسود + رياح قوية",
     "dark storm clouds approaching",
     "strong wind blowing trees",
     "bright sunny clear sky",
     "السحاب الأسود والرياح القوية تعني عاصفة",
     "السماء الصافية والشمس تعني جواً", "جميلاً"),

    ("سجادة مبللة + كوب مسكوب",
     "wet carpet floor",
     "spilled cup on its side",
     "broken window with ball nearby",
     "السجادة مبللة لأن الكوب انسكب",
     "النافذة مكسورة لأن الكرة", "ضربتها"),

    ("هدايا + بالونات + كعكة",
     "gifts wrapped with ribbons",
     "colorful balloons decoration",
     "birthday cake with candles",
     "الهدايا والبالونات تعني حفلة عيد ميلاد",
     "الكعكة بالشموع تعني أن هناك", "احتفالاً"),

    ("مظلة مبللة + مطر توقف",
     "wet umbrella drying",
     "rain stopped puddles on ground",
     "sun coming out after rain",
     "المظلة مبللة لأن المطر كان يهطل",
     "بعد المطر، تظهر", "الشمس"),

    # ===== 7. السلامة والأمان - SÉCURITÉ — 10 =====
    ("يد تلمس مقبس كهربائي + خطر",
     "child reaching for electrical socket",
     "danger warning sign electricity",
     "child playing safely with toys",
     "لمس المقبس الكهربائي خطر جداً",
     "اللعب بالألعاب آمن و", "ممتع"),

    ("طفل يعبر الطريق مع أمه + آمن",
     "child crossing street with mother",
     "mother holding child hand crossing",
     "child crossing street alone dangerous",
     "عبور الطريق مع الأم آمن",
     "عبور الطريق وحده", "خطر"),

    ("دراجة بدون خوذة + خطر",
     "child riding bicycle without helmet",
     "head injury bandage",
     "child with helmet riding safely",
     "ركوب الدراجة بدون خوذة خطر",
     "الخوذة تحمي", "الرأس"),

    ("طفل يمسك سكيناً + جرح",
     "child holding sharp knife",
     "cut finger bleeding",
     "child using safe scissors",
     "السكين حادة وقد تسبب جرحاً",
     "نستخدم المقص الآمن لقص", "الورق"),

    ("طفل يسبح وحده + خطر الغرق",
     "child swimming alone in pool",
     "drowning danger sign",
     "child swimming with father safe",
     "السباحة وحده في المسبح خطر",
     "السباحة مع الأب في المسبح", "آمنة"),

    ("دواء + طفل يمد يده",
     "medicine pills on table",
     "child reaching for medicine",
     "child taking medicine from adult",
     "الدواء خطر إذا أخذ بدون إشراف",
     "نأخذ الدواء من الطبيب أو", "الأم"),

    ("غريب + باب المنزل",
     "stranger at front door",
     "door with peephole",
     "family together inside home",
     "فتح الباب للغريب خطر",
     "نفتح الباب فقط للعائلة و", "المعروفين"),

    ("إشارة حمراء + توقف",
     "red traffic light pedestrian",
     "person waiting at crosswalk",
     "green traffic light crossing",
     "الإشارة الحمراء تعني توقف",
     "الإشارة الخضراء تعني", "عبور"),

    ("طفل يلعب في الشارع + سيارة",
     "child playing in middle of road",
     "car approaching fast",
     "children playing safely in playground",
     "اللعب في الشارع خطر",
     "اللعب في الملعب", "آمن"),

    ("طعام ساخن + طفل ينفخ",
     "hot steaming food bowl",
     "child blowing on hot food",
     "child drinking hot beverage",
     "الطعام الساخن يحتاج إلى التبريد قبل الأكل",
     "المشروب الساخن قد يسبب حرقاً", "للفم"),

    # ===== 8. الزمان والمكان - TEMPS & ESPACE — 10 =====
    ("بيجامة + تنظيف أسنان",
     "child in pajamas brushing teeth",
     "night bedtime routine",
     "school uniform backpack morning",
     "قبل النوم، نلبس البيجامة وننظف الأسنان",
     "قبل المدرسة، نلبس الزي المدرسي ونأخذ", "الحقيبة"),

    ("شمس تشرق + ديك يصيح",
     "sunrise rooster crowing",
     "morning farm landscape",
     "moon stars night sky",
     "الديك يصيح عندما تشرق الشمس في الصباح",
     "القمر والنجوم نراها في", "الليل"),

    ("خارج المنزل + أشجار وشمس",
     "outside house garden trees",
     "sunny sky clouds",
     "inside room furniture bed",
     "في الخارج نرى السماء والأشجار",
     "في الداخل نرى الغرف و", "الأثاث"),

    ("قطار في المحطة + ركاب يصعدون",
     "train at station platform",
     "passengers boarding train",
     "bus stop children waiting",
     "الركاب يصعدون إلى القطار في المحطة",
     "الطلاب ينتظرون الحافلة في", "الموقف"),

    ("فوق + تحت",
     "bird flying above tree",
     "cat sitting under table",
     "ball on top of box",
     "العصفور يطير فوق الشجرة",
     "القطة تجلس تحت", "الطاولة"),

    ("قبل + بعد",
     "egg whole uncracked",
     "fried egg in pan",
     "flour and ingredients bowl",
     "البيض النيء قبل القلي",
     "الكعكة تكون بعد", "الخبز"),

    ("داخل + خارج",
     "child inside house by window",
     "child playing outside in garden",
     "toys inside toy box",
     "الطفل داخل المنزل يرى العالم من النافذة",
     "الألعاب داخل الصندوق بعد", "الترتيب"),

    ("بعيد + قريب",
     "far away mountain landscape",
     "close up flower detail",
     "bird far in sky",
     "الجبل نراه من بعيد",
     "الزهرة نرى تفاصيلها من", "قريب"),

    ("سريع + بطيء",
     "race car speeding on track",
     "turtle walking slowly on ground",
     "cheetah running fast",
     "السيارة تسير بسرعة على الحلبة",
     "السلحفاة تمشي", "ببطء"),

    ("أمام + خلف",
     "child standing in front of house",
     "child behind tree hiding",
     "car in front of garage",
     "الطفل يقف أمام المنزل",
     "الطفل يختبئ خلف", "الشجرة"),

    # ===== 9. التصنيف المتقدم - CATÉGORIES AVANCÉES — 10 =====
    ("بطيخ + فراولة + فواكه",
     "watermelon slice red",
     "strawberries red fresh",
     "cabbage lettuce fresh",
     "البطيخ والفراولة من الفواكه",
     "الملفوف والخس من", "الخضروات"),

    ("طائرة + مروحية",
     "airplane flying in sky",
     "helicopter flying",
     "train car on road",
     "الطائرة والمروحية تطيران في السماء",
     "السيارة والقطار يسيران على", "الأرض"),

    ("سمكة + قرش",
     "fish swimming in ocean",
     "shark underwater sea",
     "eagle flying mountains",
     "السمكة وسمك القرش يعيشان في البحر",
     "النسر والعصفور يطيران في", "السماء"),

    ("ثلاجة + فرن",
     "refrigerator in kitchen",
     "oven stove kitchen",
     "bed wardrobe bedroom",
     "الثلاجة والفرن في المطبخ",
     "السرير والدولاب في", "غرفة النوم"),

    ("شمس + نهار",
     "bright sun daytime sky",
     "daylight outdoor scene",
     "moon night stars dark",
     "الشمس تشرق في النهار",
     "القمر والنجوم تظهر في", "الليل"),

    ("قطة + أرنب",
     "cat sitting on floor",
     "rabbit in garden",
     "elephant giraffe large animals",
     "القطة والأرنب حيوانات صغيرة",
     "الفيل والزرافة حيوانات", "كبيرة"),

    ("عصير + ماء",
     "glass of orange juice",
     "glass of water",
     "bread cheese plate",
     "العصير والماء نشربهما",
     "الخبز والجبن", "نأكلهما"),

    ("جمل + صبار + صحراء",
     "camel in desert",
     "cactus plant desert",
     "polar bear snow ice",
     "الجمل والصبار يعيشان في الصحراء",
     "الدب القطبي يعيش في", "الثلج"),

    ("سيارة إطفاء + سيارة إسعاف",
     "fire truck red lights",
     "ambulance emergency vehicle",
     "school bus yellow",
     "سيارة الإطفاء والإسعاف للطوارئ",
     "الحافلة المدرسية تنقل", "التلاميذ"),

    ("أدوات الرسم + لوحة فنية",
     "paint brushes palette",
     "colorful painting on easel",
     "tools hammer saw wood",
     "الفرشاة والألوان للرسم",
     "المنشار والمطرقة لصناعة", "الأثاث"),

    # ===== 10. الوظائف التنفيذية - FONCTIONS EXÉCUTIVES (planification) — 10 =====
    ("قائمة تسوق + عربة تسوق",
     "shopping list on paper",
     "shopping cart supermarket",
     "school backpack books",
     "نأخذ قائمة التسوق عند الذهاب للتسوق",
     "نضع الكتب في الحقيبة قبل الذهاب إلى", "المدرسة"),

    ("ساعة منبه + تقويم",
     "alarm clock on nightstand",
     "calendar with dates marked",
     "ingredients bowl recipe",
     "نضبط المنبه لنستيقظ في الوقت المناسب",
     "نستخدم التقويم لتذكر", "المواعيد"),

    ("ألعاب على الأرض + صندوق ألعاب",
     "toys scattered on floor",
     "toy box with lid",
     "dirty clothes hamper",
     "بعد اللعب، نعيد الألعاب إلى الصندوق",
     "نضع الملابس المتسخة في سلة", "الغسيل"),

    ("نقود + محفظة",
     "coins and banknotes",
     "wallet leather",
     "pencils pencil case",
     "نحتفظ بالنقود في المحفظة",
     "نحتفظ بالأقلام في", "المقلمة"),

    ("علبة طعام + زميل المدرسة",
     "lunch box container",
     "children eating at school table",
     "water bottle gym",
     "نضع الطعام في العلبة لنأخذه إلى المدرسة",
     "نضع الماء في القارورة للذهاب إلى", "النادي"),

    ("ترتيب الطاولة + أطباق نظيفة",
     "setting dinner table plates",
     "clean dishes arranged nicely",
     "making bed folding blankets",
     "نرتب الطاولة بالأطباق النظيفة قبل الأكل",
     "نرتب السرير ونطوي البطانيات بعد", "الاستيقاظ"),

    ("دعوة حفلة + هدية عيد ميلاد",
     "birthday invitation card",
     "gift box with ribbon",
     "shopping list ingredients",
     "نرسل الدعوات قبل حفلة عيد الميلاد",
     "نشتري المقادير قبل", "الطبخ"),

    ("خريطة + وجهة",
     "map with marked route",
     "destination signpost",
     "recipe book ingredients",
     "نستخدم الخريطة للوصول إلى الوجهة",
     "نستخدم الوصفة لتحضير", "الطعام"),

    ("نشرة جوية + مظلة",
     "weather forecast rain",
     "umbrella open",
     "weather forecast snow coat",
     "نأخذ المظلة إذا توقعت النشرة الجوية مطراً",
     "نلبس المعطف الثقيل إذا توقعت النشرة", "ثلجاً"),

    ("ميزانية + قائمة مشتريات",
     "piggy bank coins savings",
     "shopping list with prices",
     "weekly schedule activities",
     "نضع ميزانية قبل التسوق",
     "نخطط للأنشطة اليومية في", "الجدول"),
]


def reshape_arabic(text):
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)


def search_pexels(query):
    params = urllib.parse.urlencode({"query": query, "per_page": 5, "orientation": "landscape"})
    url = f"https://api.pexels.com/v1/search?{params}"
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_KEY, "User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        data = json.loads(resp.read())
        return [photo["src"]["large"] for photo in data.get("photos", [])]
    except Exception as e:
        print(f"  ⚠️ Pexels error: {e}")
        return []


def download_image(url, save_path):
    tmp = tempfile.mktemp(suffix=".jpg")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=20)
        data = resp.read()
        if data[:2] == b'\xff\xd8' and len(data) > 5000:
            with open(tmp, "wb") as f:
                f.write(data)
            os.rename(tmp, save_path)
            return True
    except Exception:
        pass
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)
    return False


def get_image(cache_key, query):
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.jpg")
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 5000:
        return cache_path
    urls = search_pexels(query)
    for url in urls:
        if download_image(url, cache_path):
            sz = os.path.getsize(cache_path) // 1024
            print(f"    ✅ {cache_key} ({sz}KB)")
            return cache_path
    img = Image.new("RGB", (400, 300), (235, 235, 235))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype(FONT_PATH, 30)
    except:
        font = ImageFont.load_default()
    draw.text((20, 130), f"[{cache_key}]", fill=(180, 180, 180), font=font)
    img.save(cache_path, "JPEG", quality=80)
    print(f"    ⚠️  fallback {cache_key}")
    return cache_path


def fit_and_crop(img, target_w, target_h):
    iw, ih = img.size
    ratio = max(target_w / iw, target_h / ih)
    nw, nh = int(iw * ratio), int(ih * ratio)
    img = img.resize((nw, nh), Image.LANCZOS)
    l = (nw - target_w) // 2
    t = (nh - target_h) // 2
    return img.crop((l, t, l + target_w, t + target_h))


def create_card(card_data, index):
    label, q1, q2, q3, statement, question, answer = card_data

    imgs = []
    for suffix, query in [("a", q1), ("b", q2), ("c", q3)]:
        key = f"c{index:02d}_{suffix}"
        path = get_image(key, query)
        imgs.append(Image.open(path).convert("RGB"))

    card = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))
    draw = ImageDraw.Draw(card)

    # ===== TOP: two images side by side =====
    iw, ih = 350, 190
    gap = 30
    total_w = 2 * iw + gap
    xs = (CARD_W - total_w) // 2
    y1 = 25

    for i in range(2):
        cropped = fit_and_crop(imgs[i], iw, ih)
        x = xs + i * (iw + gap)
        card.paste(cropped, (x, y1))
        draw.rectangle([x-1, y1-1, x+iw+1, y1+ih+1], outline=(210, 210, 210), width=2)

    # ===== STATEMENT TEXT =====
    font_s = 38
    font = ImageFont.truetype(FONT_PATH, font_s)
    rtxt = reshape_arabic(statement)
    yt1 = y1 + ih + 15
    bb = draw.textbbox((0, 0), rtxt, font=font)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]
    draw.text(((CARD_W - tw) // 2, yt1), rtxt, fill=(50, 50, 50), font=font)

    # ===== BOTTOM IMAGE (big!) =====
    biw, bih = 740, 600
    xb = (CARD_W - biw) // 2
    yb = yt1 + th + 18
    cropped = fit_and_crop(imgs[2], biw, bih)
    card.paste(cropped, (xb, yb))
    draw.rectangle([xb-1, yb-1, xb+biw+1, yb+bih+1], outline=(210, 210, 210), width=2)

    # ===== QUESTION TEXT =====
    font_q = 40
    fq = ImageFont.truetype(FONT_PATH, font_q)
    qtxt = reshape_arabic(question + " ............")
    yq = yb + bih + 18
    bq = draw.textbbox((0, 0), qtxt, font=fq)
    qw, qh = bq[2]-bq[0], bq[3]-bq[1]
    draw.text(((CARD_W - qw) // 2, yq), qtxt, fill=(40, 40, 40), font=fq)

    # ===== ANSWER HINT (light gray) =====
    fa = ImageFont.truetype(FONT_PATH, 22)
    atxt = reshape_arabic(f"({answer})")
    ba = draw.textbbox((0, 0), atxt, font=fa)
    aw = ba[2] - ba[0]
    draw.text(((CARD_W - aw) // 2, CARD_H - 35), atxt, fill=(195, 195, 195), font=fa)

    out_path = os.path.join(OUTPUT_DIR, f"carte_{index:02d}.jpg")
    card.save(out_path, "JPEG", quality=92)
    return out_path


def main():
    print(f"Génération de {len(CARDS)} cartes — التداعي السمعي")
    print(f"Output: {OUTPUT_DIR}")
    print()

    for i, card in enumerate(CARDS, 1):
        print(f"[{i:02d}/{len(CARDS)}] {card[0]}")
        create_card(card, i)
        print(f"  ✅ Saved")
        print()
        time.sleep(1.5)

    print("Terminé!")


if __name__ == "__main__":
    main()
