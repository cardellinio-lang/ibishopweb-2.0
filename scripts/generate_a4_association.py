#!/usr/bin/env python3
"""
Generate A4 planches with association cards (2 top images + 1 bottom image)
with crop marks — ready for printing. 10 planches × 9 cards = 90 new cards.
"""
import os, sys, json, time, urllib.request, urllib.parse, urllib.error
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

OUTPUT_DIR = os.path.expanduser("~/Desktop/cartes_orthophonie")
FONT_PATH = "/Users/traddax/Library/Fonts/Hacen-Tunisia-Bold.ttf"
CACHE_DIR = os.path.join(OUTPUT_DIR, "_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

PEXELS_KEY = "Sv9bIAOkmJ4dzDx3ZjwddRr7AcdNvrRevIBkgxrgUYqkTnwwfWq6JxYQ"

A4_W, A4_H = 2480, 3508
CARD_W, CARD_H = 820, 1160
GAP = 10

CATEGORIES = [
    "في المزرعة",
    "في المطعم",
    "في الحديقة",
    "في السوق",
    "في المستشفى",
    "في المدرسة",
    "في حفلة",
    "في المطبخ",
    "في الحمام",
    "في الشارع",
]

# Each card: (label, q1, q2, q3, statement, question, answer)
PLANCHES = [
    # === Planche 1: في المزرعة (À la ferme) ===
    [
        ("ديك يصيح + صباح",
         "rooster crowing sunrise farm",
         "sunrise morning farm landscape",
         "farmer waking up morning work",
         "عندما يصيح الديك، يشرق الصباح في المزرعة",
         "يستيقظ المزارع في الصباح لبدء",
         "عمله"),
        ("دجاجة + بيض",
         "hen sitting on nest eggs",
         "fresh brown eggs in basket",
         "child collecting eggs farm happy",
         "الدجاجة تبيض البيض في العش",
         "نجمع البيض من",
         "العش"),
        ("بقرة + حليب",
         "cow grazing in green field",
         "fresh milk glass pouring",
         "child drinking milk healthy",
         "البقرة تأكل العشب وتعطي حليباً طازجاً",
         "نشرب الحليب لتصبح عظامنا",
         "قوية"),
        ("خروف + صوف",
         "sheep with thick wool farm",
         "wool yarn knitting",
         "child wearing wool sweater warm",
         "الخروف يعطينا الصوف الدافئ",
         "نصنع من الصوف ملابس",
         "دافئة"),
        ("حصان يجري + غبار",
         "horse galloping field dust",
         "horse running fast meadow",
         "child riding horse with helmet",
         "الحصان يركض بسرعة في الحقل",
         "نركب الحصان ونرتدي خوذة لل",
         "سلامة"),
        ("بط في البركة",
         "ducks swimming in pond",
         "pond water ripples ducks",
         "ducks eating bread crumbs",
         "البط يسبح في بركة الماء",
         "نطعم البط بقصاصات",
         "الخبز"),
        ("أرنب + جزرة",
         "rabbit eating carrot garden",
         "carrots growing in soil",
         "child feeding rabbit carrot",
         "الأرنب يأكل الجزر في الحديقة",
         "الأرنب يحب أكل",
         "الجزر"),
        ("مزرعة + حظيرة",
         "red barn farmhouse countryside",
         "farm animals cows sheep",
         "tractor working in farm field",
         "في المزرعة حيوانات كثيرة وحظيرة كبيرة",
         "المزارع يستخدم الجرار لحرث",
         "الأرض"),
        ("نحلة + عسل",
         "bee on flower collecting pollen",
         "honeycomb dripping honey",
         "child tasting honey spoon",
         "النحلة تجمع الرحيق لتصنع العسل",
         "العسل لذيذ ومفيد لل",
         "صحة"),
    ],
    # === Planche 2: في المطعم (Au restaurant) ===
    [
        ("طاولة مطعم + قائمة طعام",
         "restaurant table set menu",
         "person reading menu ordering",
         "waiter serving food to table",
         "نجلس على الطاولة ونقرأ قائمة الطعام",
         "نطلب الطعام من",
         "النادل"),
        ("شوربة ساخنة + ملعقة",
         "hot soup bowl steaming",
         "spoon beside soup bowl",
         "child eating soup carefully",
         "الشوربة ساخنة، نأكلها بالملعقة",
         "ننفخ على الشوربة الساخنة حتى",
         "تبرد"),
        ("سلطة + خلطة",
         "fresh green salad bowl",
         "mixing salad dressing pouring",
         "child eating salad fork",
         "السلطة مصنوعة من الخضروات الطازجة",
         "نتبل السلطة بالخل و",
         "الزيت"),
        ("بيتزا + جبن",
         "pizza mozzarella cheese melted",
         "pizza being sliced cutter",
         "child eating pizza slice happy",
         "البيتزا لذيذة بالجبن الذائب",
         "نقطع البيتزا إلى شرائح صغيرة لنأكلها",
         "باليد"),
        ("عصير طازج + فواكه",
         "fresh juice glass orange",
         "fruits blender juicing",
         "child drinking juice straw",
         "العصير الطازج مصنوع من الفواكه",
         "نشرب العصير في المطعم مع",
         "الطعام"),
        ("حلوى + قطعة كعكة",
         "chocolate cake slice dessert",
         "dessert plate with fork",
         "child eating dessert happy",
         "بعد الأكل، نطلب الحلوى",
         "الكعكة بالشوكولاتة لذيذة و",
         "حلوة"),
        ("منديل + تنظيف اليدين",
         "napkin on table restaurant",
         "child wiping hands with napkin",
         "wet towel cleaning hands",
         "نستخدم المنديل لتنظيف أيدينا",
         "نمسح فمنا بالمنديل بعد",
         "الأكل"),
        ("فاتورة + دفع",
         "restaurant bill check on table",
         "person paying credit card",
         "receipt and coins tip",
         "بعد الأكل، نطلب الفاتورة وندفع الحساب",
         "نترك بقشيشاً للنادل إذا كانت الخدمة",
         "جيدة"),
        ("مطعم مزدحم + طابور",
         "busy restaurant full people",
         "people waiting in line queue",
         "hostess seating guests table",
         "عندما يكون المطعم مزدحماً، ننتظر في الطابور",
         "ننتظر حتى يأتي دورنا للحصول على",
         "طاولة"),
    ],
    # === Planche 3: في الحديقة (Au parc) ===
    [
        ("أطفال يلعبون + أرجوحة",
         "children playing on swing park",
         "swing set playground park",
         "child sliding down slide happy",
         "الأطفال يلعبون على الأرجوحة في الحديقة",
         "نلعب في الحديقة ونستمتع بوقت",
         "الفراغ"),
        ("كرة + مرمى",
         "soccer ball on grass field",
         "football goal net park",
         "children playing football game",
         "نلعب كرة القدم في ملعب الحديقة",
         "نسجل الأهداف في",
         "المرمى"),
        ("نزهة + سلة طعام",
         "picnic basket on blanket grass",
         "family picnic park eating",
         "sandwiches fruit picnic spread",
         "العائلة تجتمع للنزهة في الحديقة",
         "نأخذ سلة الطعام ونفرد البطانية على",
         "العشب"),
        ("طائرة ورقية + رياح",
         "kite flying in blue sky",
         "child flying kite park",
         "wind blowing tree leaves",
         "الطائرة الورقية تطير عالياً مع الرياح",
         "نطير الطائرة الورقية في يوم",
         "عاصف"),
        ("زهور ملونة + فراشات",
         "colorful flowers garden park",
         "butterfly on flower park",
         "child smelling flower garden",
         "الزهور الملونة تجذب الفراشات الجميلة",
         "نشم رائحة الزهور في",
         "الحديقة"),
        ("مقعد + قراءة",
         "park bench under tree",
         "person reading book on bench",
         "relaxing reading park nature",
         "نجلس على المقعد ونقرأ كتاباً",
         "القراءة في الحديقة هادئة و",
         "ممتعة"),
        ("بركة + بط",
         "park pond with ducks",
         "ducks swimming in pond",
         "children feeding ducks bread",
         "البط يسبح في بركة الحديقة",
         "نطعم البط ولا نؤذيه",
         "أبداً"),
        ("دراجة + مسار دراجات",
         "bicycle path park trees",
         "child cycling bike park",
         "family biking together park",
         "نركب الدراجة في مسار الدراجات بالحديقة",
         "نلبس الخوذة لحماية رأسنا أثناء ركوب",
         "الدراجة"),
        ("سحاب + مطر",
         "dark clouds rain approaching",
         "rain falling on grass park",
         "children running under shelter rain",
         "عندما تغطي السحب السماء، يبدأ المطر بالهطول",
         "نختبئ تحت المأوى عندما يمطر لأن",
         "نبتل"),
    ],
    # === Planche 4: في السوق (Au marché) ===
    [
        ("خضروات طازجة + بائع",
         "fresh vegetable market stall",
         "seller arranging vegetables",
         "customer buying vegetables",
         "في السوق، الخضروات طازجة وملونة",
         "نشتري الخضروات من البائع وندفع",
         "الثمن"),
        ("فواكه موسمية + كرموس",
         "seasonal fruits market display",
         "figs and grapes fresh",
         "child eating fruit market",
         "في الصيف نشتري التين والعنب من السوق",
         "الفواكه الموسمية ألذ وأطيب من غير",
         "الموسمية"),
        ("سمك طازج + ثلج",
         "fresh fish on ice market",
         "fish seller market stall",
         "customer buying fish",
         "السمك الطازج موضوع على الثلج في السوق",
         "نشتري السمك الطازج ونطبخه في",
         "البيت"),
        ("خبز بلدي + فرن",
         "traditional bread bakery market",
         "baker taking bread from oven",
         "customer buying bread warm",
         "الخبز البلدي يخرج ساخناً من الفرن",
         "نشتري الخبز الساخن من",
         "المخبز"),
        ("زيتون + زيت",
         "green olives in bowl",
         "olive oil bottle green",
         "dipping bread in olive oil",
         "الزيتون يعصر ليخرج منه الزيت",
         "نستخدم زيت الزيتون في",
         "الطعام"),
        ("أعشاب + توابل",
         "fresh herbs mint parsley",
         "spices market colorful piles",
         "spice merchant selling",
         "الأعشاب والتوابل تفوح منها رائحة عطرة",
         "نضيف التوابل للطعام ليكتسب",
         "النكهة"),
        ("جبن + حليب",
         "fresh cheese market display",
         "milk products cheese varieties",
         "buying cheese from market",
         "الجبن الأبيض يصنع من الحليب الطازج",
         "الجبن الطري لذيذ مع",
         "الخبز"),
        ("ميزان + وزن",
         "old scale weighing produce",
         "seller weighing vegetables scale",
         "fruits on weighing scale",
         "يوزن البائع الخضروات على الميزان",
         "نشتري الفواكه والخضروات بالوزن وليس بال",
         "عدد"),
        ("سلة تسوق + خيوط",
         "woven basket market traditional",
         "shopping bag reusable",
         "carrying groceries basket",
         "نضع المشتريات في السلة أو الكيس",
         "نستخدم الأكياس الورقية بدل البلاستيكية لل",
         "بيئة"),
    ],
    # === Planche 5: في المستشفى (À l'hôpital) ===
    [
        ("طبيب + سماعة طبية",
         "doctor with stethoscope",
         "doctor examining child patient",
         "child visiting doctor checkup",
         "الطبيب يفحص المريض بالسماعة الطبية",
         "نزور الطبيب عندما نكون",
         "مرضى"),
        ("ممرضة + حقنة",
         "nurse holding syringe injection",
         "child getting vaccine shot",
         "brave child after vaccination",
         "الممرضة تعطي الحقنة للطفل",
         "الحقنة تؤلم قليلاً لكنها تحمينا من",
         "الأمراض"),
        ("دواء + ملعقة دواء",
         "medicine bottle and spoon",
         "child taking medicine careful",
         "mother giving medicine to child",
         "نأخذ الدواء بالملعقة حسب وصفة الطبيب",
         "الدواء يساعدنا على الشفاء من",
         "المرض"),
        ("ميزان حرارة + حمى",
         "thermometer digital temperature",
         "child with fever forehead",
         "mother checking child temperature",
         "نستخدم ميزان الحرارة لقياس درجة الحرارة",
         "عندما ترتفع الحرارة، نأخذ خافضاً لل",
         "حرارة"),
        ("جبيرة + كسر",
         "arm cast plaster broken",
         "child with broken arm cast",
         "xray image of broken bone",
         "الطفل كسر يده ووضعها في الجبيرة",
         "الجبيرة تثبت العظم المكسور حتى",
         "يلتئم"),
        ("ضمادة + جرح",
         "bandage on wound knee",
         "child with bandaged knee",
         "nurse bandaging child arm",
         "نضع الضمادة على الجرح ليمتص الدم",
         "نغير الضمادة كل يوم حتى يشفى",
         "الجرح"),
        ("سرير مستشفى + مريض",
         "hospital bed patient resting",
         "child in hospital bed smiling",
         "iv drip hospital room",
         "المريض يستريح في سرير المستشفى",
         "الممرضات يعتنين بالمريض حتى ي",
         "يتحسن"),
        ("عيون + نظارة طبية",
         "eye exam child optometrist",
         "child wearing glasses smile",
         "eye chart vision test",
         "نذهب إلى طبيب العيون لفحص النظر",
         "النظارة تساعدنا على الرؤية",
         "بوضوح"),
        ("أسنان + طبيب أسنان",
         "dentist examining child teeth",
         "child at dentist open mouth",
         "clean teeth after dentist",
         "طبيب الأسنان يفحص أسناننا وينظفها",
         "نغسل أسناننا بالفرشاة يومياً لمنع",
         "التسوس"),
    ],
    # === Planche 6: في المدرسة (À l'école) ===
    [
        ("حقيبة مدرسية + كتب",
         "school backpack books supplies",
         "child packing school bag",
         "child going to school morning",
         "نحضر حقيبتنا المدرسية بالكتب والدفاتر",
         "نذهب إلى المدرسة كل صباح لنتعلم",
         "أشياء"),
        ("صف دراسي + سبورة",
         "classroom desk blackboard",
         "teacher writing on board",
         "students sitting at desks",
         "في الصف، نجلس على المقاعد وننظر إلى السبورة",
         "نكتب الدروس في الدفاتر",
         "بالقلم"),
        ("قلم رصاص + ممحاة",
         "pencil and eraser on desk",
         "child writing with pencil",
         "sharpening pencil with sharpener",
         "نكتب بالقلم الرصاص ونمسح الخطأ بالممحاة",
         "نستخدم البراية لسن",
         "القلم"),
        ("استراحة + أطفال يلعبون",
         "school break children playing yard",
         "children running recess playground",
         "kids eating snack break time",
         "في الاستراحة، نلعب ونأكل الفطور",
         "نلعب مع الأصدقاء في فناء",
         "المدرسة"),
        ("كتاب مدرسي + قراءة",
         "open textbook reading",
         "child reading book focused",
         "library school bookshelf",
         "نقرأ الكتب المدرسية لنتعلم دروساً جديدة",
         "القراءة تنمي عقولنا وتزيد",
         "معرفتنا"),
        ("مسطرة + رسم خطوط",
         "ruler drawing straight line",
         "child drawing geometric shapes",
         "colorful shapes and lines",
         "نستخدم المسطرة لرسم خطوط مستقيمة",
         "نستخدم الفرجار لرسم",
         "الدوائر"),
        ("مقص + ورق ملون",
         "scissors cutting colored paper",
         "child cutting paper craft",
         "paper craft project school",
         "نقص الورق الملون بالمقص لعمل أشغال يدوية",
         "نلصق الورق بالصمغ لنصنع",
         "لوحة"),
        ("سبورة + طباشير",
         "chalkboard with colorful chalk",
         "child writing on chalkboard",
         "erasing chalkboard with eraser",
         "نكتب على السبورة بالطباشير الملون",
         "نمسح السبورة بالممسحة بعد",
         "الدرس"),
        ("جرس المدرسة + خروج",
         "school bell ringing",
         "children leaving school happy",
         "parents waiting at school gate",
         "عندما يرن جرس المدرسة، يحين وقت الخروج",
         "ننتظر أمي أو أبي عند باب",
         "المدرسة"),
    ],
    # === Planche 7: في حفلة (À la fête) ===
    [
        ("بالونات ملونة + زينة",
         "colorful balloons decoration party",
         "party decorations streamers",
         "birthday party room decorated",
         "البالونات الملونة والزينة تزين الحفلة",
         "نزين المنزل بالبالونات للاحتفال بعيد",
         "الميلاد"),
        ("كعكة + شموع",
         "birthday cake with candles",
         "blowing birthday candles",
         "child making wish before blowing",
         "نضع الشموع على كعكة عيد الميلاد",
         "نطفئ الشموع ونتمنى",
         "أمنية"),
        ("هدايا + شرائط",
         "gift boxes with ribbons",
         "child opening gift excited",
         "wrapped presents colorful",
         "الهدايا مربوطة بشرائط جميلة",
         "نفتح الهدية ونفك",
         "الشرائط"),
        ("موسيقى + رقص",
         "children dancing party music",
         "music speaker party",
         "kids dancing happily together",
         "نشغل الموسيقى ونرقص في الحفلة",
         "الرقص مع الأصدقاء ممتع و",
         "مسل"),
        ("قبعة عيد + صفارة",
         "birthday party hat funny",
         "child wearing party hat",
         "party blower noise toy",
         "نلبس قبعات عيد الميلاد الملونة",
         "نستخدم صفارة الحفلة لنصنع",
         "أصواتاً"),
        ("هدية + ورق تغليف",
         "gift wrapping paper roll",
         "wrapping gift with ribbon",
         "colorful gift wrap patterns",
         "نغلف الهدية بورق ملون قبل تقديمها",
         "نقدم الهدية لصاحب العيد ونقول له",
         "مبروك"),
        ("أطفال يلعبون + كراسي موسيقى",
         "children playing musical chairs",
         "musical chairs game party",
         "kids running around chairs game",
         "نلعب لعبة الكراسي الموسيقية في الحفلة",
         "عندما تتوقف الموسيقى، نجلس بسرعة على",
         "كرسي"),
        ("حلويات + سكرية",
         "candy sweets party table",
         "child picking candy from bowl",
         "colorful lollipops candies",
         "الحلويات والسكريات على طاولة الحفلة",
         "نأكل الحلويات لكن لا",
         "نكثر"),
        ("تصفيق + تهاني",
         "people clapping cheering party",
         "family congratulating gathering",
         "happy group celebration",
         "يصفق الجميع ويهنئون صاحب العيد",
         "نقول لصاحب العيد كل عام وأنت",
         "بخير"),
    ],
    # === Planche 8: في المطبخ (Dans la cuisine) ===
    [
        ("طباخ + قدر",
         "chef cooking pot kitchen",
         "steaming pot on stove",
         "stirring soup with ladle",
         "الطباخ يطبخ الطعام في القدر على النار",
         "نقلب الطعام بملعقة الخشب حتى لا",
         "يحترق"),
        ("سكين + تقطيع",
         "cutting board knife vegetables",
         "chopping vegetables on board",
         "slicing tomatoes chef",
         "نقطع الخضروات بالسكين على لوح التقطيع",
         "نستخدم السكين بحذر لأنه",
         "حاد"),
        ("فرن + خبز",
         "oven baking bread kitchen",
         "bread baking inside oven",
         "golden baked bread fresh",
         "نخبز الخبز في الفرن حتى يصبح ذهبياً",
         "نخرج الخبز من الفرن بالقفازات لأنه",
         "ساخن"),
        ("خلاط + عصير",
         "blender mixing fruits",
         "pouring smoothie into glass",
         "fresh smoothie fruit glass",
         "نخلط الفواكه في الخلاط لنصنع عصيراً",
         "نشرب العصير الطازج بعد",
         "الخلط"),
        ("غلاية ماء + شاي",
         "kettle boiling water steam",
         "tea bag in cup hot water",
         "pouring hot water tea cup",
         "نغلي الماء في الغلاية لتحضير الشاي",
         "نسكب الماء الساخن على كيس الشاي في",
         "الكوب"),
        ("صحن + غسيل صحون",
         "dirty dishes sink washing",
         "washing dishes sponge soap",
         "clean dishes drying rack",
         "بعد الأكل، نغسل الصحون في الحوض",
         "نستخدم الصابون والإسفنجة لتنظيف",
         "الصحون"),
        ("ثلاّجة + طعام بارد",
         "refrigerator full food",
         "opening fridge looking food",
         "storing vegetables fridge",
         "نحتفظ بالطعام البارد في الثلاجة",
         "الثلاجة تحفظ الطعام طازجاً دون أن",
         "يفسد"),
        ("ميكروويف + تسخين",
         "microwave oven heating food",
         "pressing microwave buttons",
         "hot food plate microwave",
         "نسخن الطعام في الميكروويف بسرعة",
         "لا نضع المعدن في الميكروويف لأنه",
         "يؤذي"),
        ("ميزان مطبخ + مقادير",
         "kitchen scale measuring ingredients",
         "weighing flour on scale",
         "measuring cups spoons baking",
         "نستخدم الميزان لوزن مقادير الطبخ",
         "نتبع المقادير بالضبط لنحصل على طعام",
         "لذيذ"),
    ],
    # === Planche 9: في الحمام (Dans la salle de bain) ===
    [
        ("صابون + أيدي متسخة",
         "soap bar foam hands",
         "child washing hands with soap",
         "clean hands after washing",
         "نغسل أيدينا بالصابون لقتل الجراثيم",
         "نفرك أيدينا بالصابون لمدة عشرين",
         "ثانية"),
        ("فرشاة أسنان + معجون",
         "toothbrush toothpaste tube",
         "child brushing teeth bathroom",
         "clean white teeth smile",
         "نضع المعجون على فرشاة الأسنان",
         "ننظف أسناننا بالفرشاة صباحاً و",
         "مساءً"),
        ("مشط + شعر متشابك",
         "comb brushing tangled hair",
         "child combing hair mirror",
         "neat combed hair child",
         "نمشط شعرنا بالمشط ليفك التشابك",
         "نستخدم الفرشاة لتنعيم",
         "الشعر"),
        ("شامبو + غسل شعر",
         "shampoo bottle hair wash",
         "child washing hair shower",
         "clean shiny hair towel",
         "نغسل شعرنا بالشامبو والماء",
         "نشطف الشعر بالماء حتى تزول",
         "الرغوة"),
        ("منشفة + تجفيف",
         "towel drying hands",
         "drying face with towel",
         "clean fluffy towel bathroom",
         "بعد الغسل، نجفف أنفسنا بالمنشفة",
         "نعلق المنشفة بعد الاستخدام حتى",
         "تجف"),
        ("حوض استحمام + فقاعات",
         "bathtub bubbles foam water",
         "child playing bath bubbles",
         "bath toys rubber duck",
         "نملأ حوض الاستحمام بالماء الدافئ والفقاعات",
         "نلعب في حوض الاستحمام ونحن",
         "نستحم"),
        ("مرآة + تسريحة شعر",
         "mirror bathroom reflection",
         "child looking in mirror",
         "brushing hair in front mirror",
         "ننظر في المرآة لترتيب هندامنا",
         "المرآة تعكس صورتنا",
         "واضحة"),
        ("صابون سائل + موزع",
         "liquid soap dispenser",
         "pressing soap dispenser pump",
         "washing hands under faucet",
         "نضغط على موزع الصابون السائل",
         "نغسل أيدينا قبل الأكل وبعد استخدام",
         "الحمام"),
        ("ماء + صنبور",
         "water faucet tap running",
         "turning off faucet save water",
         "water drop conservation",
         "نفتح الصنبور ليخرج الماء",
         "نغلق الصنبور بعد الاستخدام لتوفير",
         "الماء"),
    ],
    # === Planche 10: في الشارع (Dans la rue) ===
    [
        ("إشارة مرور + عبور",
         "traffic light pedestrian crossing",
         "person crossing crosswalk green",
         "children waiting at traffic light",
         "عندما تكون الإشارة خضراء، نعبر الطريق بأمان",
         "ننتظر حتى تصبح الإشارة خضراء قبل",
         "العبور"),
        ("سيارة + حزام أمان",
         "car seatbelt buckled",
         "child wearing seatbelt car",
         "family in car safety belts",
         "نربط حزام الأمان في السيارة لحماية أنفسنا",
         "حزام الأمان يحمينا عند",
         "الفرملة"),
        ("دراجة هوائية + خوذة",
         "bicycle helmet protective",
         "child wearing helmet cycling",
         "cycling safety gear knee pads",
         "نلبس الخوذة قبل ركوب الدراجة الهوائية",
         "الخوذة تحمي رأسنا من",
         "الإصابة"),
        ("حافلة + ركوب",
         "school bus stopping children",
         "children boarding school bus",
         "bus driver waiting children",
         "ننتظر الحافلة في موقف الحافلات",
         "نصعد إلى الحافلة ونأخذ",
         "مقعداً"),
        ("رصيف + مشي",
         "sidewalk pedestrian walking",
         "child walking on sidewalk",
         "people walking on pavement",
         "نمشي على الرصيف وليس في الشارع",
         "الرصيف آمن للمشاة بعيداً عن",
         "السيارات"),
        ("كلب + مقود",
         "dog on leash walking",
         "person walking dog leashed",
         "dog and owner park walk",
         "نمسك الكلب بالمقود عند المشي في الشارع",
         "المقود يمنع الكلب من الركض بعيداً أو",
         "العض"),
        ("قمامة + سلة مهملات",
         "trash can garbage bin street",
         "throwing trash in bin",
         "clean street environment",
         "نرمي القمامة في سلة المهملات",
         "نحافظ على نظافة الشارع ولا نرمي النفايات على",
         "الأرض"),
        ("ممر سفلي + أنفاق",
         "underground passage tunnel",
         "subway entrance stairs",
         "people walking underground tunnel",
         "نستخدم الممر السفلي لعبور الشارع بأمان",
         "الممر السفلي آمن لأننا لا نخاطر تحت",
         "السيارات"),
        ("سيارة إسعاف + طوارئ",
         "ambulance emergency lights siren",
         "ambulance speeding hospital",
         "paramedics helping patient stretcher",
         "سيارة الإسعاف تسمع صفارة الإنذار",
         "نفسح الطريق لسيارة الإسعاف في",
         "الحالات"),
    ],
]


def reshape_arabic(text):
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)


def search_pexels(query, retry=0):
    params = urllib.parse.urlencode({"query": query, "per_page": 5, "orientation": "landscape"})
    url = f"https://api.pexels.com/v1/search?{params}"
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_KEY, "User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        data = json.loads(resp.read())
        return [photo["src"]["large"] for photo in data.get("photos", [])]
    except urllib.error.HTTPError as e:
        if e.code == 429 and retry < 3:
            wait = 60 * (retry + 1)
            print(f"  Rate limited. Waiting {wait}s...")
            time.sleep(wait)
            return search_pexels(query, retry + 1)
        print(f"  Pexels error: {e}")
        return []
    except Exception as e:
        print(f"  Pexels error: {e}")
        return []


def download_image(url, save_path):
    tmp = save_path + ".tmp"
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
            print(f"    {cache_key} ({sz}KB)")
            return cache_path
    img = Image.new("RGB", (400, 300), (245, 245, 245))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype(FONT_PATH, 30)
    except Exception:
        font = ImageFont.load_default()
    draw.text((10, 130), f"[{cache_key}]", fill=(200, 200, 200), font=font)
    img.save(cache_path, "JPEG", quality=80)
    print(f"  fallback {cache_key}")
    return cache_path


def fit_and_crop(img, target_w, target_h):
    iw, ih = img.size
    ratio = max(target_w / iw, target_h / ih)
    nw, nh = int(iw * ratio), int(ih * ratio)
    img = img.resize((nw, nh), Image.LANCZOS)
    l = (nw - target_w) // 2
    t = (nh - target_h) // 2
    return img.crop((l, t, l + target_w, t + target_h))


def create_card(card_data, card_index):
    label, q1, q2, q3, statement, question, answer = card_data

    imgs = []
    for suffix, query in [("a", q1), ("b", q2), ("c", q3)]:
        key = f"assoc_{card_index:03d}_{suffix}"
        path = get_image(key, query)
        imgs.append(Image.open(path).convert("RGB"))

    card = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))
    draw = ImageDraw.Draw(card)

    # Top two images side by side
    iw, ih = 360, 170
    gap = 25
    total_w = 2 * iw + gap
    xs = (CARD_W - total_w) // 2
    y1 = 12

    for i in range(2):
        cropped = fit_and_crop(imgs[i], iw, ih)
        x = xs + i * (iw + gap)
        card.paste(cropped, (x, y1))
        draw.rectangle([x-1, y1-1, x+iw+1, y1+ih+1], outline=(200, 200, 200), width=1)

    # Statement
    font_s = 26
    font = ImageFont.truetype(FONT_PATH, font_s)
    rtxt = reshape_arabic(statement)
    yt1 = y1 + ih + 8
    bb = draw.textbbox((0, 0), rtxt, font=font)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]
    draw.text(((CARD_W - tw) // 2, yt1), rtxt, fill=(50, 50, 50), font=font)

    # Bottom image (large)
    biw, bih = 760, 510
    xb = (CARD_W - biw) // 2
    yb = yt1 + th + 10
    cropped = fit_and_crop(imgs[2], biw, bih)
    card.paste(cropped, (xb, yb))
    draw.rectangle([xb-1, yb-1, xb+biw+1, yb+bih+1], outline=(200, 200, 200), width=1)

    # Question
    font_q = 28
    fq = ImageFont.truetype(FONT_PATH, font_q)
    qtxt = reshape_arabic(f"{question} ............")
    yq = yb + bih + 10
    bq = draw.textbbox((0, 0), qtxt, font=fq)
    qw, qh = bq[2]-bq[0], bq[3]-bq[1]
    draw.text(((CARD_W - qw) // 2, yq), qtxt, fill=(40, 40, 40), font=fq)

    # Answer hint
    fa = ImageFont.truetype(FONT_PATH, 16)
    atxt = reshape_arabic(f"({answer})")
    ba = draw.textbbox((0, 0), atxt, font=fa)
    aw = ba[2] - ba[0]
    draw.text(((CARD_W - aw) // 2, CARD_H - 22), atxt, fill=(195, 195, 195), font=fa)

    # Subtle border
    draw.rectangle([(0, 0), (CARD_W - 1, CARD_H - 1)], outline=(220, 220, 220), width=1)

    return card


def draw_crop_marks(draw, card_x, card_y, card_w, card_h, mark_len=35, color=(0, 0, 0), width=2):
    corners = [
        (card_x, card_y, 'TL'),
        (card_x + card_w, card_y, 'TR'),
        (card_x, card_y + card_h, 'BL'),
        (card_x + card_w, card_y + card_h, 'BR'),
    ]
    for x, y, pos in corners:
        if pos in ('TL', 'TR'):
            draw.line([(x, y - mark_len), (x, y)], fill=color, width=width)
        if pos in ('BL', 'BR'):
            draw.line([(x, y), (x, y + mark_len)], fill=color, width=width)
        if pos in ('TL', 'BL'):
            draw.line([(x - mark_len, y), (x, y)], fill=color, width=width)
        if pos in ('TR', 'BR'):
            draw.line([(x, y), (x + mark_len, y)], fill=color, width=width)


def create_planche(planche_index, cards_data):
    sheet = Image.new("RGB", (A4_W, A4_H), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)

    total_h = 3 * CARD_H + 2 * GAP
    y_start = (A4_H - total_h) // 2

    card_number = (planche_index - 1) * 9

    for i, card_entry in enumerate(cards_data):
        col = i % 3
        row = i // 3
        x = col * (CARD_W + GAP)
        y = y_start + row * (CARD_H + GAP)

        card_number += 1
        print(f"    Card {i+1}/9: {card_entry[0]}")
        card_img = create_card(card_entry, card_number)
        sheet.paste(card_img, (x, y))
        draw_crop_marks(draw, x, y, CARD_W, CARD_H, color=(30, 30, 30))

    # Category label
    cat = CATEGORIES[planche_index - 1]
    try:
        font_small = ImageFont.truetype(FONT_PATH, 26)
        rcat = reshape_arabic(cat)
        bb = draw.textbbox((0, 0), rcat, font=font_small)
        tw = bb[2] - bb[0]
        draw.text(((A4_W - tw) // 2, 8), rcat, fill=(160, 160, 160), font=font_small)
    except Exception:
        pass

    return sheet


def main():
    print("Generation de 10 planches A4 (90 cartes association) — pretes a imprimer")
    print()
    print("Chaque carte: 2 images en haut + phrase + 1 grande image + question a completer")
    print()

    for p_idx, planche_cards in enumerate(PLANCHES, 1):
        cat = CATEGORIES[p_idx - 1]
        print(f"[Planche {p_idx}/10] {cat}")
        sheet = create_planche(p_idx, planche_cards)

        pdf_path = os.path.join(OUTPUT_DIR, f"planche_assoc_{p_idx:02d}.pdf")
        sheet.save(pdf_path, "PDF", resolution=300)
        print(f"  PDF: {pdf_path}")

        jpg_path = os.path.join(OUTPUT_DIR, f"planche_assoc_{p_idx:02d}.jpg")
        sheet.save(jpg_path, "JPEG", quality=95)
        print(f"  JPG: {jpg_path}")
        print()

        time.sleep(1.5)

    print("Termine! 10 planches A4 avec 90 cartes association.")
    print("Fichiers: planche_assoc_XX.pdf / planche_assoc_XX.jpg")


if __name__ == "__main__":
    main()
