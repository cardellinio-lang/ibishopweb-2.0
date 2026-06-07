#!/usr/bin/env python3
"""
Design PRO — cartes à couper le souffle !
- ombres portées, coins arrondis, code couleur par catégorie
- dos de cartes uniforme
- boîte d'emballage prête à découper
"""
import os, sys, json, time, urllib.request, urllib.parse, urllib.error
from PIL import Image, ImageDraw, ImageFont, ImageFilter
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

CATEGORY_COLORS = [
    (76, 175, 80),    # 0  المزرعة - Vert
    (255, 87, 34),    # 1  المطعم - Orange profond
    (139, 195, 74),   # 2  الحديقة - Vert clair
    (255, 152, 0),    # 3  السوق - Orange
    (33, 150, 243),   # 4  المستشفى - Bleu
    (255, 193, 7),    # 5  المدرسة - Ambre
    (233, 30, 99),    # 6  حفلة - Rose
    (121, 85, 72),    # 7  المطبخ - Brun
    (0, 188, 212),    # 8  الحمام - Cyan
    (96, 125, 139),   # 9  الشارع - Gris bleu
]

CATEGORIES = [
    "في المزرعة", "في المطعم", "في الحديقة", "في السوق", "في المستشفى",
    "في المدرسة", "في حفلة", "في المطبخ", "في الحمام", "في الشارع",
]

CATEGORIES_EN = [
    "Ferme", "Restaurant", "Parc", "Marché", "Hôpital",
    "École", "Fête", "Cuisine", "Salle de bain", "Rue",
]

# === CONTENT (same 90 association cards) ===
PLANCHES = [
    # Planche 1: المزرعة
    [
        ("ديك يصيح + صباح", "rooster crowing sunrise farm", "sunrise morning farm", "farmer waking up morning",
         "عندما يصيح الديك، يشرق الصباح في المزرعة", "يستيقظ المزارع في الصباح لبدء", "عمله"),
        ("دجاجة + بيض", "hen sitting on nest eggs", "fresh brown eggs basket", "child collecting eggs farm",
         "الدجاجة تبيض البيض في العش", "نجمع البيض من", "العش"),
        ("بقرة + حليب", "cow grazing in green field", "fresh milk glass pouring", "child drinking milk healthy",
         "البقرة تأكل العشب وتعطي حليباً طازجاً", "نشرب الحليب لتصبح عظامنا", "قوية"),
        ("خروف + صوف", "sheep with thick wool farm", "wool yarn knitting", "child wearing wool sweater warm",
         "الخروف يعطينا الصوف الدافئ", "نصنع من الصوف ملابس", "دافئة"),
        ("حصان يجري + غبار", "horse galloping field dust", "horse running fast meadow", "child riding horse helmet",
         "الحصان يركض بسرعة في الحقل", "نركب الحصان ونرتدي خوذة لل", "سلامة"),
        ("بط في البركة", "ducks swimming in pond", "pond water ripples ducks", "ducks eating bread crumbs",
         "البط يسبح في بركة الماء", "نطعم البط بقصاصات", "الخبز"),
        ("أرنب + جزرة", "rabbit eating carrot garden", "carrots growing in soil", "child feeding rabbit carrot",
         "الأرنب يأكل الجزر في الحديقة", "الأرنب يحب أكل", "الجزر"),
        ("مزرعة + حظيرة", "red barn farmhouse countryside", "farm animals cows sheep", "tractor working in farm field",
         "في المزرعة حيوانات كثيرة وحظيرة كبيرة", "المزارع يستخدم الجرار لحرث", "الأرض"),
        ("نحلة + عسل", "bee on flower collecting pollen", "honeycomb dripping honey", "child tasting honey spoon",
         "النحلة تجمع الرحيق لتصنع العسل", "العسل لذيذ ومفيد لل", "صحة"),
    ],
    # Planche 2: المطعم
    [
        ("طاولة مطعم + قائمة طعام", "restaurant table set menu", "person reading menu ordering", "waiter serving food",
         "نجلس على الطاولة ونقرأ قائمة الطعام", "نطلب الطعام من", "النادل"),
        ("شوربة ساخنة + ملعقة", "hot soup bowl steaming", "spoon beside soup bowl", "child eating soup carefully",
         "الشوربة ساخنة، نأكلها بالملعقة", "ننفخ على الشوربة الساخنة حتى", "تبرد"),
        ("سلطة + خلطة", "fresh green salad bowl", "mixing salad dressing pouring", "child eating salad fork",
         "السلطة مصنوعة من الخضروات الطازجة", "نتبل السلطة بالخل و", "الزيت"),
        ("بيتزا + جبن", "pizza mozzarella cheese melted", "pizza being sliced cutter", "child eating pizza happy",
         "البيتزا لذيذة بالجبن الذائب", "نقطع البيتزا إلى شرائح صغيرة لنأكلها", "باليد"),
        ("عصير طازج + فواكه", "fresh juice glass orange", "fruits blender juicing", "child drinking juice straw",
         "العصير الطازج مصنوع من الفواكه", "نشرب العصير في المطعم مع", "الطعام"),
        ("حلوى + قطعة كعكة", "chocolate cake slice dessert", "dessert plate with fork", "child eating dessert happy",
         "بعد الأكل، نطلب الحلوى", "الكعكة بالشوكولاتة لذيذة و", "حلوة"),
        ("منديل + تنظيف اليدين", "napkin on table restaurant", "child wiping hands napkin", "wet towel cleaning hands",
         "نستخدم المنديل لتنظيف أيدينا", "نمسح فمنا بالمنديل بعد", "الأكل"),
        ("فاتورة + دفع", "restaurant bill check table", "person paying credit card", "receipt coins tip",
         "بعد الأكل، نطلب الفاتورة وندفع الحساب", "نترك بقشيشاً للنادل إذا كانت الخدمة", "جيدة"),
        ("مطعم مزدحم + طابور", "busy restaurant full people", "people waiting line queue", "hostess seating guests",
         "عندما يكون المطعم مزدحماً، ننتظر في الطابور", "ننتظر حتى يأتي دورنا للحصول على", "طاولة"),
    ],
    # Planche 3: الحديقة
    [
        ("أطفال + أرجوحة", "children playing swing park", "swing set playground park", "child sliding down slide",
         "الأطفال يلعبون على الأرجوحة في الحديقة", "نلعب في الحديقة ونستمتع بوقت", "الفراغ"),
        ("كرة + مرمى", "soccer ball on grass field", "football goal net park", "children playing football game",
         "نلعب كرة القدم في ملعب الحديقة", "نسجل الأهداف في", "المرمى"),
        ("نزهة + سلة طعام", "picnic basket blanket grass", "family picnic park eating", "sandwiches fruit picnic",
         "العائلة تجتمع للنزهة في الحديقة", "نأخذ سلة الطعام ونفرد البطانية على", "العشب"),
        ("طائرة ورقية + رياح", "kite flying in blue sky", "child flying kite park", "wind blowing tree leaves",
         "الطائرة الورقية تطير عالياً مع الرياح", "نطير الطائرة الورقية في يوم", "عاصف"),
        ("زهور ملونة + فراشات", "colorful flowers garden park", "butterfly on flower", "child smelling flower garden",
         "الزهور الملونة تجذب الفراشات الجميلة", "نشم رائحة الزهور في", "الحديقة"),
        ("مقعد + قراءة", "park bench under tree", "person reading book bench", "relaxing reading park nature",
         "نجلس على المقعد ونقرأ كتاباً", "القراءة في الحديقة هادئة و", "ممتعة"),
        ("بركة + بط", "park pond with ducks", "ducks swimming pond", "children feeding ducks bread",
         "البط يسبح في بركة الحديقة", "نطعم البط ولا نؤذيه", "أبداً"),
        ("دراجة + مسار", "bicycle path park trees", "child cycling bike park", "family biking together park",
         "نركب الدراجة في مسار الدراجات بالحديقة", "نلبس الخوذة لحماية رأسنا أثناء ركوب", "الدراجة"),
        ("سحاب + مطر", "dark clouds rain approaching", "rain falling on grass park", "children under shelter rain",
         "عندما تغطي السحب السماء، يبدأ المطر بالهطول", "نختبئ تحت المأوى عندما يمطر لأن", "نبتل"),
    ],
    # Planche 4: السوق
    [
        ("خضروات طازجة + بائع", "fresh vegetable market stall", "seller arranging vegetables", "customer buying vegetables",
         "في السوق، الخضروات طازجة وملونة", "نشتري الخضروات من البائع وندفع", "الثمن"),
        ("فواكه موسمية", "seasonal fruits market display", "figs and grapes fresh", "child eating fruit market",
         "في الصيف نشتري التين والعنب من السوق", "الفواكه الموسمية ألذ وأطيب من غير", "الموسمية"),
        ("سمك طازج + ثلج", "fresh fish on ice market", "fish seller market stall", "customer buying fish",
         "السمك الطازج موضوع على الثلج في السوق", "نشتري السمك الطازج ونطبخه في", "البيت"),
        ("خبز بلدي + فرن", "traditional bread bakery market", "baker taking bread from oven", "customer buying bread warm",
         "الخبز البلدي يخرج ساخناً من الفرن", "نشتري الخبز الساخن من", "المخبز"),
        ("زيتون + زيت", "green olives in bowl", "olive oil bottle green", "dipping bread in olive oil",
         "الزيتون يعصر ليخرج منه الزيت", "نستخدم زيت الزيتون في", "الطعام"),
        ("أعشاب + توابل", "fresh herbs mint parsley", "spices market colorful", "spice merchant selling",
         "الأعشاب والتوابل تفوح منها رائحة عطرة", "نضيف التوابل للطعام ليكتسب", "النكهة"),
        ("جبن + حليب", "fresh cheese market display", "milk products cheese", "buying cheese from market",
         "الجبن الأبيض يصنع من الحليب الطازج", "الجبن الطري لذيذ مع", "الخبز"),
        ("ميزان + وزن", "old scale weighing produce", "seller weighing vegetables scale", "fruits on weighing scale",
         "يوزن البائع الخضروات على الميزان", "نشتري الفواكه والخضروات بالوزن وليس بال", "عدد"),
        ("سلة تسوق", "woven basket market traditional", "shopping bag reusable", "carrying groceries basket",
         "نضع المشتريات في السلة أو الكيس", "نستخدم الأكياس الورقية بدل البلاستيكية لل", "بيئة"),
    ],
    # Planche 5: المستشفى
    [
        ("طبيب + سماعة", "doctor with stethoscope", "doctor examining child patient", "child visiting doctor checkup",
         "الطبيب يفحص المريض بالسماعة الطبية", "نزور الطبيب عندما نكون", "مرضى"),
        ("ممرضة + حقنة", "nurse holding syringe injection", "child getting vaccine shot", "brave child after vaccination",
         "الممرضة تعطي الحقنة للطفل", "الحقنة تؤلم قليلاً لكنها تحمينا من", "الأمراض"),
        ("دواء + ملعقة", "medicine bottle and spoon", "child taking medicine", "mother giving medicine to child",
         "نأخذ الدواء بالملعقة حسب وصفة الطبيب", "الدواء يساعدنا على الشفاء من", "المرض"),
        ("ميزان حرارة + حمى", "thermometer digital temperature", "child fever forehead", "mother checking temperature",
         "نستخدم ميزان الحرارة لقياس درجة الحرارة", "عندما ترتفع الحرارة، نأخذ خافضاً لل", "حرارة"),
        ("جبيرة + كسر", "arm cast plaster broken", "child with broken arm cast", "xray broken bone",
         "الطفل كسر يده ووضعها في الجبيرة", "الجبيرة تثبت العظم المكسور حتى", "يلتئم"),
        ("ضمادة + جرح", "bandage on wound knee", "child bandaged knee", "nurse bandaging child arm",
         "نضع الضمادة على الجرح ليمتص الدم", "نغير الضمادة كل يوم حتى يشفى", "الجرح"),
        ("سرير + مريض", "hospital bed patient resting", "child in hospital bed smiling", "iv drip hospital room",
         "المريض يستريح في سرير المستشفى", "الممرضات يعتنين بالمريض حتى ي", "يتحسن"),
        ("عيون + نظارة", "eye exam child optometrist", "child wearing glasses smile", "eye chart vision test",
         "نذهب إلى طبيب العيون لفحص النظر", "النظارة تساعدنا على الرؤية", "بوضوح"),
        ("أسنان + طبيب", "dentist examining child teeth", "child dentist open mouth", "clean teeth after dentist",
         "طبيب الأسنان يفحص أسناننا وينظفها", "نغسل أسناننا بالفرشاة يومياً لمنع", "التسوس"),
    ],
    # Planche 6: المدرسة
    [
        ("حقيبة + كتب", "school backpack books supplies", "child packing school bag", "child going to school morning",
         "نحضر حقيبتنا المدرسية بالكتب والدفاتر", "نذهب إلى المدرسة كل صباح لنتعلم", "أشياء"),
        ("صف + سبورة", "classroom desk blackboard", "teacher writing on board", "students sitting desks",
         "في الصف، نجلس على المقاعد وننظر إلى السبورة", "نكتب الدروس في الدفاتر", "بالقلم"),
        ("قلم + ممحاة", "pencil and eraser on desk", "child writing with pencil", "sharpening pencil sharpener",
         "نكتب بالقلم الرصاص ونمسح الخطأ بالممحاة", "نستخدم البراية لسن", "القلم"),
        ("استراحة + أطفال", "school break children playing yard", "children running recess playground", "kids eating snack break",
         "في الاستراحة، نلعب ونأكل الفطور", "نلعب مع الأصدقاء في فناء", "المدرسة"),
        ("كتاب + قراءة", "open textbook reading", "child reading book focused", "library school bookshelf",
         "نقرأ الكتب المدرسية لنتعلم دروساً جديدة", "القراءة تنمي عقولنا وتزيد", "معرفتنا"),
        ("مسطرة + رسم", "ruler drawing straight line", "child drawing geometric shapes", "colorful shapes lines",
         "نستخدم المسطرة لرسم خطوط مستقيمة", "نستخدم الفرجار لرسم", "الدوائر"),
        ("مقص + ورق", "scissors cutting colored paper", "child cutting paper craft", "paper craft project school",
         "نقص الورق الملون بالمقص لعمل أشغال يدوية", "نلصق الورق بالصمغ لنصنع", "لوحة"),
        ("سبورة + طباشير", "chalkboard colorful chalk", "child writing chalkboard", "erasing chalkboard eraser",
         "نكتب على السبورة بالطباشير الملون", "نمسح السبورة بالممسحة بعد", "الدرس"),
        ("جرس + خروج", "school bell ringing", "children leaving school happy", "parents waiting school gate",
         "عندما يرن جرس المدرسة، يحين وقت الخروج", "ننتظر أمي أو أبي عند باب", "المدرسة"),
    ],
    # Planche 7: حفلة
    [
        ("بالونات + زينة", "colorful balloons decoration party", "party decorations streamers", "birthday party decorated",
         "البالونات الملونة والزينة تزين الحفلة", "نزين المنزل بالبالونات للاحتفال بعيد", "الميلاد"),
        ("كعكة + شموع", "birthday cake with candles", "blowing birthday candles", "child making wish before blowing",
         "نضع الشموع على كعكة عيد الميلاد", "نطفئ الشموع ونتمنى", "أمنية"),
        ("هدايا + شرائط", "gift boxes with ribbons", "child opening gift excited", "wrapped presents colorful",
         "الهدايا مربوطة بشرائط جميلة", "نفتح الهدية ونفك", "الشرائط"),
        ("موسيقى + رقص", "children dancing party music", "music speaker party", "kids dancing happily together",
         "نشغل الموسيقى ونرقص في الحفلة", "الرقص مع الأصدقاء ممتع و", "مسل"),
        ("قبعة + صفارة", "birthday party hat funny", "child wearing party hat", "party blower noise toy",
         "نلبس قبعات عيد الميلاد الملونة", "نستخدم صفارة الحفلة لنصنع", "أصواتاً"),
        ("هدية + تغليف", "gift wrapping paper roll", "wrapping gift ribbon", "colorful gift wrap patterns",
         "نغلف الهدية بورق ملون قبل تقديمها", "نقدم الهدية لصاحب العيد ونقول له", "مبروك"),
        ("كراسي موسيقى", "children playing musical chairs", "musical chairs game party", "kids running chairs game",
         "نلعب لعبة الكراسي الموسيقية في الحفلة", "عندما تتوقف الموسيقى، نجلس بسرعة على", "كرسي"),
        ("حلويات + سكرية", "candy sweets party table", "child picking candy bowl", "colorful lollipops candies",
         "الحلويات والسكريات على طاولة الحفلة", "نأكل الحلويات لكن لا", "نكثر"),
        ("تصفيق + تهاني", "people clapping cheering party", "family congratulating gathering", "happy group celebration",
         "يصفق الجميع ويهنئون صاحب العيد", "نقول لصاحب العيد كل عام وأنت", "بخير"),
    ],
    # Planche 8: المطبخ
    [
        ("طباخ + قدر", "chef cooking pot kitchen", "steaming pot on stove", "stirring soup with ladle",
         "الطباخ يطبخ الطعام في القدر على النار", "نقلب الطعام بملعقة الخشب حتى لا", "يحترق"),
        ("سكين + تقطيع", "cutting board knife vegetables", "chopping vegetables on board", "slicing tomatoes chef",
         "نقطع الخضروات بالسكين على لوح التقطيع", "نستخدم السكين بحذر لأنه", "حاد"),
        ("فرن + خبز", "oven baking bread kitchen", "bread baking inside oven", "golden baked bread fresh",
         "نخبز الخبز في الفرن حتى يصبح ذهبياً", "نخرج الخبز من الفرن بالقفازات لأنه", "ساخن"),
        ("خلاط + عصير", "blender mixing fruits", "pouring smoothie into glass", "fresh smoothie fruit glass",
         "نخلط الفواكه في الخلاط لنصنع عصيراً", "نشرب العصير الطازج بعد", "الخلط"),
        ("غلاية + شاي", "kettle boiling water steam", "tea bag cup hot water", "pouring hot water tea cup",
         "نغلي الماء في الغلاية لتحضير الشاي", "نسكب الماء الساخن على كيس الشاي في", "الكوب"),
        ("صحن + غسيل", "dirty dishes sink washing", "washing dishes sponge soap", "clean dishes drying rack",
         "بعد الأكل، نغسل الصحون في الحوض", "نستخدم الصابون والإسفنجة لتنظيف", "الصحون"),
        ("ثلاّجة + طعام", "refrigerator full food", "opening fridge looking food", "storing vegetables fridge",
         "نحتفظ بالطعام البارد في الثلاجة", "الثلاجة تحفظ الطعام طازجاً دون أن", "يفسد"),
        ("ميكروويف + تسخين", "microwave oven heating food", "pressing microwave buttons", "hot food plate microwave",
         "نسخن الطعام في الميكروويف بسرعة", "لا نضع المعدن في الميكروويف لأنه", "يؤذي"),
        ("ميزان + مقادير", "kitchen scale measuring ingredients", "weighing flour on scale", "measuring cups spoons",
         "نستخدم الميزان لوزن مقادير الطبخ", "نتبع المقادير بالضبط لنحصل على طعام", "لذيذ"),
    ],
    # Planche 9: الحمام
    [
        ("صابون + أيدي", "soap bar foam hands", "child washing hands soap", "clean hands after washing",
         "نغسل أيدينا بالصابون لقتل الجراثيم", "نفرك أيدينا بالصابون لمدة عشرين", "ثانية"),
        ("فرشاة + معجون", "toothbrush toothpaste tube", "child brushing teeth bathroom", "clean white teeth smile",
         "نضع المعجون على فرشاة الأسنان", "ننظف أسناننا بالفرشاة صباحاً و", "مساءً"),
        ("مشط + شعر", "comb brushing tangled hair", "child combing hair mirror", "neat combed hair child",
         "نمشط شعرنا بالمشط ليفك التشابك", "نستخدم الفرشاة لتنعيم", "الشعر"),
        ("شامبو + غسل", "shampoo bottle hair wash", "child washing hair shower", "clean shiny hair towel",
         "نغسل شعرنا بالشامبو والماء", "نشطف الشعر بالماء حتى تزول", "الرغوة"),
        ("منشفة + تجفيف", "towel drying hands", "drying face with towel", "clean fluffy towel bathroom",
         "بعد الغسل، نجفف أنفسنا بالمنشفة", "نعلق المنشفة بعد الاستخدام حتى", "تجف"),
        ("حوض + فقاعات", "bathtub bubbles foam water", "child playing bath bubbles", "bath toys rubber duck",
         "نملأ حوض الاستحمام بالماء الدافئ والفقاعات", "نلعب في حوض الاستحمام ونحن", "نستحم"),
        ("مرآة + تسريحة", "mirror bathroom reflection", "child looking in mirror", "brushing hair front mirror",
         "ننظر في المرآة لترتيب هندامنا", "المرآة تعكس صورتنا", "واضحة"),
        ("صابون سائل + موزع", "liquid soap dispenser", "pressing soap dispenser pump", "washing hands faucet",
         "نضغط على موزع الصابون السائل", "نغسل أيدينا قبل الأكل وبعد استخدام", "الحمام"),
        ("ماء + صنبور", "water faucet tap running", "turning off faucet save water", "water drop conservation",
         "نفتح الصنبور ليخرج الماء", "نغلق الصنبور بعد الاستخدام لتوفير", "الماء"),
    ],
    # Planche 10: الشارع
    [
        ("إشارة + عبور", "traffic light pedestrian crossing", "person crossing crosswalk", "children waiting traffic light",
         "عندما تكون الإشارة خضراء، نعبر الطريق بأمان", "ننتظر حتى تصبح الإشارة خضراء قبل", "العبور"),
        ("سيارة + حزام", "car seatbelt buckled", "child wearing seatbelt car", "family in car safety belts",
         "نربط حزام الأمان في السيارة لحماية أنفسنا", "حزام الأمان يحمينا عند", "الفرملة"),
        ("دراجة + خوذة", "bicycle helmet protective", "child wearing helmet cycling", "cycling safety gear knee pads",
         "نلبس الخوذة قبل ركوب الدراجة الهوائية", "الخوذة تحمي رأسنا من", "الإصابة"),
        ("حافلة + ركوب", "school bus stopping children", "children boarding school bus", "bus driver waiting children",
         "ننتظر الحافلة في موقف الحافلات", "نصعد إلى الحافلة ونأخذ", "مقعداً"),
        ("رصيف + مشي", "sidewalk pedestrian walking", "child walking on sidewalk", "people walking pavement",
         "نمشي على الرصيف وليس في الشارع", "الرصيف آمن للمشاة بعيداً عن", "السيارات"),
        ("كلب + مقود", "dog on leash walking", "person walking dog leashed", "dog and owner park walk",
         "نمسك الكلب بالمقود عند المشي في الشارع", "المقود يمنع الكلب من الركض بعيداً أو", "العض"),
        ("قمامة + سلة", "trash can garbage bin street", "throwing trash in bin", "clean street environment",
         "نرمي القمامة في سلة المهملات", "نحافظ على نظافة الشارع ولا نرمي النفايات على", "الأرض"),
        ("ممر سفلي", "underground passage tunnel", "subway entrance stairs", "people walking underground tunnel",
         "نستخدم الممر السفلي لعبور الشارع بأمان", "الممر السفلي آمن لأننا لا نخاطر تحت", "السيارات"),
        ("سيارة إسعاف", "ambulance emergency lights siren", "ambulance speeding hospital", "paramedics helping patient",
         "سيارة الإسعاف تسمع صفارة الإنذار", "نفسح الطريق لسيارة الإسعاف في", "الحالات"),
    ],
]


# ====== HELPERS ======

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
    cache_path = os.path.join(CACHE_DIR, f"pro_{cache_key}.jpg")
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 5000:
        return cache_path
    # Also check non-pro cache
    old_path = os.path.join(CACHE_DIR, f"{cache_key}.jpg")
    if os.path.exists(old_path) and os.path.getsize(old_path) > 5000:
        return old_path
    urls = search_pexels(query)
    for url in urls:
        if download_image(url, cache_path):
            sz = os.path.getsize(cache_path) // 1024
            print(f"    {cache_key} ({sz}KB)")
            return cache_path
    alt = os.path.join(CACHE_DIR, f"pro_{cache_key}.jpg")
    img = Image.new("RGB", (400, 300), (235, 235, 235))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype(FONT_PATH, 28)
    except Exception:
        font = ImageFont.load_default()
    draw.text((10, 130), f"[{cache_key}]", fill=(180, 180, 180), font=font)
    img.save(alt, "JPEG", quality=80)
    return alt


def fit_and_crop(img, target_w, target_h):
    iw, ih = img.size
    ratio = max(target_w / iw, target_h / ih)
    nw, nh = int(iw * ratio), int(ih * ratio)
    img = img.resize((nw, nh), Image.LANCZOS)
    l = (nw - target_w) // 2
    t = (nh - target_h) // 2
    return img.crop((l, t, l + target_w, t + target_h))


# ====== PROFESSIONAL IMAGE FX ======

def rounded_rect_image(img, radius):
    """Apply rounded corners mask to an RGBA image."""
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (img.width - 1, img.height - 1)], radius=radius, fill=255)
    result = img.copy()
    result.putalpha(mask)
    return result


def drop_shadow(img, offset=(0, 4), radius=6, opacity=60):
    """Create a drop shadow for an RGBA image. Returns RGBA composite."""
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.rounded_rectangle([(0, 0), (img.width - 1, img.height - 1)], radius=radius + 2, fill=(0, 0, 0, opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius))

    result = Image.new("RGBA", (img.width + abs(offset[0]), img.height + abs(offset[1])), (0, 0, 0, 0))
    sx = max(offset[0], 0)
    sy = max(offset[1], 0)
    result.paste(shadow, (sx, sy), shadow)
    result.paste(img, (0, 0), img)
    return result


def gradient_bar(draw, x, y, w, h, color, alpha=30):
    """Draw a very subtle gradient bar (just a solid rectangle for simplicity)."""
    draw.rectangle([(x, y), (x + w, y + h)], fill=(color[0], color[1], color[2], alpha))


# ====== CARD CREATION ======

def create_pro_card(card_data, card_index, cat_index):
    label, q1, q2, q3, statement, question, answer = card_data
    cat_color = CATEGORY_COLORS[cat_index]
    r, g, b = cat_color

    # Load images
    imgs = []
    for suffix, query in [("a", q1), ("b", q2), ("c", q3)]:
        key = f"assoc_{card_index:03d}_{suffix}"
        path = get_image(key, query)
        imgs.append(Image.open(path).convert("RGB"))

    card = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))
    draw = ImageDraw.Draw(card)

    # ===== TOP ACCENT STRIP =====
    draw.rectangle([(0, 0), (CARD_W, 7)], fill=(r, g, b))

    # ===== TOP TWO IMAGES =====
    iw, ih = 360, 172
    gap = 25
    total_w = 2 * iw + gap
    xs = (CARD_W - total_w) // 2
    y1 = 14
    radius = 10

    for i in range(2):
        cropped = fit_and_crop(imgs[i], iw, ih)
        cropped_rgba = cropped.convert("RGBA")
        rounded = rounded_rect_image(cropped_rgba, radius)
        shadowed = drop_shadow(rounded, offset=(0, 3), radius=5, opacity=50)
        x = xs + i * (iw + gap)
        # Center the shadowed version (it might be slightly larger due to offset)
        sh_w, sh_h = shadowed.size
        card.paste(shadowed, (x, y1), shadowed)

    # ===== STATEMENT IN COLORED PILL =====
    font_s = 23
    font = ImageFont.truetype(FONT_PATH, font_s)
    rtxt = reshape_arabic(statement)
    yt1 = y1 + ih + 10
    bb = draw.textbbox((0, 0), rtxt, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]

    pill_pad = 16
    pill_w = tw + pill_pad * 2
    pill_h = th + 10
    pill_x = (CARD_W - pill_w) // 2
    pill_y = yt1

    # Draw pill background
    draw.rounded_rectangle([(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
                           radius=pill_h // 2, fill=(r, g, b))
    # White text on colored pill
    draw.text(((CARD_W - tw) // 2, pill_y + (pill_h - th) // 2 - 2), rtxt, fill=(255, 255, 255), font=font)

    # ===== BOTTOM LARGE IMAGE =====
    biw, bih = 760, 510
    xb = (CARD_W - biw) // 2
    yb = pill_y + pill_h + 12
    cropped = fit_and_crop(imgs[2], biw, bih)
    cropped_rgba = cropped.convert("RGBA")
    rounded = rounded_rect_image(cropped_rgba, radius)
    shadowed = drop_shadow(rounded, offset=(0, 4), radius=6, opacity=55)
    card.paste(shadowed, (xb, yb), shadowed)

    # ===== UNDERLINE ACCENT BELOW IMAGE =====
    underline_y = yb + bih + 6
    draw.rounded_rectangle([(xb + 80, underline_y), (xb + biw - 80, underline_y + 3)],
                           radius=2, fill=(r, g, b, 80))

    # ===== QUESTION TEXT =====
    font_q = 26
    fq = ImageFont.truetype(FONT_PATH, font_q)
    qtxt = reshape_arabic(f"{question} ............")
    yq = underline_y + 10
    bq = draw.textbbox((0, 0), qtxt, font=fq)
    qw, qh = bq[2] - bq[0], bq[3] - bq[1]
    draw.text(((CARD_W - qw) // 2, yq), qtxt, fill=(40, 40, 40), font=fq)

    # ===== ANSWER HINT =====
    fa = ImageFont.truetype(FONT_PATH, 16)
    atxt = reshape_arabic(f"({answer})")
    ba = draw.textbbox((0, 0), atxt, font=fa)
    aw = ba[2] - ba[0]
    ay = CARD_H - 22
    draw.text(((CARD_W - aw) // 2, ay), atxt, fill=(180, 180, 180), font=fa)

    # ===== CATEGORY BADGE =====
    cat_short = CATEGORIES_EN[cat_index]
    font_cat = ImageFont.truetype(FONT_PATH, 12)
    cat_reshaped = reshape_arabic(cat_short)
    cb = draw.textbbox((0, 0), cat_reshaped, font=font_cat)
    cw, ch = cb[2] - cb[0], cb[3] - cb[1]
    cp_x = CARD_W - cw - 16
    cp_y = 10
    draw.rounded_rectangle([(cp_x - 6, cp_y - 3), (cp_x + cw + 6, cp_y + ch + 3)],
                           radius=8, fill=(r, g, b, 200))
    draw.text((cp_x, cp_y), cat_reshaped, fill=(255, 255, 255), font=font_cat)

    # ===== CARD NUMBER =====
    font_num = ImageFont.truetype(FONT_PATH, 11)
    num_text = f"#{card_index:02d}"
    draw.text((CARD_W - 45, CARD_H - 16), num_text, fill=(190, 190, 190), font=font_num)

    return card


# ====== CROP MARKS ======

def draw_crop_marks(draw, card_x, card_y, card_w, card_h, mark_len=35, color=(0, 0, 0), width=2):
    corners = [
        (card_x, card_y, 'TL'), (card_x + card_w, card_y, 'TR'),
        (card_x, card_y + card_h, 'BL'), (card_x + card_w, card_y + card_h, 'BR'),
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


# ====== PLANCHES ======

def create_planche(planche_index, cards_data, cat_index):
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
        card_img = create_pro_card(card_entry, card_number, cat_index)
        sheet.paste(card_img, (x, y))
        draw_crop_marks(draw, x, y, CARD_W, CARD_H, color=(30, 30, 30))

    # Category header
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


# ====== CARD BACKS ======

def create_card_backs_planche():
    """Create an A4 sheet with 90 card backs (same design for all)."""
    sheet = Image.new("RGB", (A4_W, A4_H), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)

    total_h = 3 * CARD_H + 2 * GAP
    y_start = (A4_H - total_h) // 2

    # Background pattern — subtle dots
    for px in range(0, A4_W, 40):
        for py in range(0, A4_H, 40):
            draw.ellipse([(px, py), (px + 3, py + 3)], fill=(235, 235, 235))

    for row in range(3):
        for col in range(3):
            x = col * (CARD_W + GAP)
            y = y_start + row * (CARD_H + GAP)

            # Card back background
            r, g, b = CATEGORY_COLORS[row * 3 + col]
            draw.rounded_rectangle([(x, y), (x + CARD_W, y + CARD_H)],
                                   radius=12, fill=(r, g, b, 25))

            # Border
            draw.rounded_rectangle([(x + 15, y + 15), (x + CARD_W - 15, y + CARD_H - 15)],
                                   radius=8, outline=(r, g, b, 60), width=2)

            # Central decorative circle
            cx, cy = x + CARD_W // 2, y + CARD_H // 2
            circle_r = 80
            draw.ellipse([(cx - circle_r, cy - circle_r), (cx + circle_r, cy + circle_r)],
                         outline=(r, g, b, 50), width=3)

            # Inner circle
            draw.ellipse([(cx - 30, cy - 30), (cx + 30, cy + 30)],
                         fill=(r, g, b, 60))

            # Speech bubble icon (simple circle with tail)
            draw.ellipse([(cx - 45, cy - 35), (cx + 45, cy + 35)],
                         outline=(r, g, b, 80), width=2)

            # Arabic title
            try:
                font_back = ImageFont.truetype(FONT_PATH, 28)
                title = reshape_arabic("التداعي")
                bb = draw.textbbox((0, 0), title, font=font_back)
                tw, th = bb[2] - bb[0], bb[3] - bb[1]
                draw.text((x + (CARD_W - tw) // 2, y + CARD_H - 80), title,
                          fill=(r, g, b, 120), font=font_back)

                title2 = reshape_arabic("السمعي")
                bb2 = draw.textbbox((0, 0), title2, font=font_back)
                tw2 = bb2[2] - bb2[0]
                draw.text((x + (CARD_W - tw2) // 2, y + CARD_H - 50), title2,
                          fill=(r, g, b, 120), font=font_back)
            except Exception:
                pass

            # Crop marks
            draw_crop_marks(draw, x, y, CARD_W, CARD_H, color=(30, 30, 30))

    return sheet


# ====== BOX TEMPLATE ======

def create_box_template():
    """Create a print-ready tuck box for the 90 cards on A4."""
    sheet = Image.new("RGB", (A4_W, A4_H), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)

    mm = 300 / 25.4  # pixels per mm
    # Box dimensions (internal card: 70×99mm, box slightly bigger)
    card_w = int(72 * mm)   # 72mm wide
    card_h = int(101 * mm)  # 101mm tall
    depth = int(24 * mm)    # 24mm deep (for 90 cards)

    # Tuck box net layout
    # Panels: back → bottom → front → top (with tuck flap)
    # Sides on left/right

    margin = int(10 * mm)
    x_start = margin
    y_start = int(10 * mm)

    # Panel dimensions
    pw = card_w
    ph = card_h

    # Net layout (vertical):
    # [tuck flap] [top] [front] [bottom] [back]
    # Side flaps on left/right of front panel
    # 
    # Actually, standard tuck box:
    #    [glue flap]
    # [back][bottom][front][top][tuck]
    #    [glue flap]
    # Side flaps on back panel edges

    # Let me do a simpler layout:
    # Row 1: back panel + side flaps
    # Row 2: bottom panel
    # Row 3: front panel
    # Row 4: top panel + tuck flap
    # Side flaps on left/right of front/back

    # Actually, the most common tuck box layout:
    # ┌──────────────────────────────────┐
    # │         back panel               │ side
    # │                           │ flap │
    # ├──────────────────────────────────┤
    # │         bottom panel             │
    # ├──────────────────────────────────┤
    # │         front panel              │
    # ├──────────────────────────────────┤
    # │         top panel   │ tuck flap  │
    # └──────────────────────────────────┘
    #  side flap on left of back
    #  side flap on right of back

    # Panel positions
    cx = A4_W // 2  # center

    back_x = cx - pw // 2
    back_y = y_start

    side_w = int(10 * mm)  # glue flap width

    # Row 1: back + side flaps
    # Back panel
    draw.rectangle([(back_x, back_y), (back_x + pw, back_y + ph)],
                   outline=(0, 0, 0), width=2, fill=(245, 245, 250))

    # Left side flap (attached to back)
    draw.rectangle([(back_x - side_w, back_y), (back_x, back_y + ph)],
                   outline=(0, 0, 0), width=1, fill=(230, 230, 240))

    # Right side flap (attached to back)
    draw.rectangle([(back_x + pw, back_y), (back_x + pw + side_w, back_y + ph)],
                   outline=(0, 0, 0), width=1, fill=(230, 230, 240))

    # Bottom panel
    bottom_y = back_y + ph
    draw.rectangle([(back_x, bottom_y), (back_x + pw, bottom_y + depth)],
                   outline=(0, 0, 0), width=2, fill=(250, 250, 255))

    # Front panel
    front_y = bottom_y + depth
    draw.rectangle([(back_x, front_y), (back_x + pw, front_y + ph)],
                   outline=(0, 0, 0), width=2, fill=(255, 255, 255))

    # Side flaps for front (shorter, just for gluing)
    fside_w = side_w
    draw.rectangle([(back_x - fside_w, front_y), (back_x, front_y + ph)],
                   outline=(0, 0, 0), width=1, fill=(240, 240, 250))
    draw.rectangle([(back_x + pw, front_y), (back_x + pw + fside_w, front_y + ph)],
                   outline=(0, 0, 0), width=1, fill=(240, 240, 250))

    # Top panel
    top_y = front_y + ph
    draw.rectangle([(back_x, top_y), (back_x + pw, top_y + depth)],
                   outline=(0, 0, 0), width=2, fill=(250, 250, 255))

    # Tuck flap
    tuck_h = int(15 * mm)
    tuck_y = top_y + depth
    draw.rectangle([(back_x, tuck_y), (back_x + pw, tuck_y + tuck_h)],
                   outline=(0, 0, 0), width=2, fill=(245, 245, 250))

    # Tuck flap tab (rounded end)
    tab_w = int(50 * mm)
    tab_x = cx - tab_w // 2
    draw.rounded_rectangle([(tab_x, tuck_y + tuck_h), (tab_x + tab_w, tuck_y + tuck_h + int(8 * mm))],
                           radius=int(4 * mm), outline=(0, 0, 0), width=2, fill=(245, 245, 250))

    # === DESIGN ON FRONT PANEL ===
    r, g, b = 76, 175, 80  # Green theme for box

    # Front panel background
    draw.rounded_rectangle([(back_x + 5, front_y + 5), (back_x + pw - 5, front_y + ph - 5)],
                           radius=8, fill=(r, g, b, 15))

    # Title on front
    try:
        font_title = ImageFont.truetype(FONT_PATH, 50)
        title = reshape_arabic("التداعي السمعي")
        bb = draw.textbbox((0, 0), title, font=font_title)
        tw = bb[2] - bb[0]
        draw.text((cx - tw // 2, front_y + 70), title, fill=(r, g, b), font=font_title)

        font_sub = ImageFont.truetype(FONT_PATH, 28)
        subtitle = reshape_arabic("بطاقات علاج النطق")
        bb2 = draw.textbbox((0, 0), subtitle, font=font_sub)
        tw2 = bb2[2] - bb2[0]
        draw.text((cx - tw2 // 2, front_y + 140), subtitle, fill=(100, 100, 100), font=font_sub)

        # Decorative line
        draw.rounded_rectangle([(cx - 150, front_y + 175), (cx + 150, front_y + 179)],
                               radius=2, fill=(r, g, b))

        # Categories list on front
        font_cat = ImageFont.truetype(FONT_PATH, 16)
        cat_text = " ".join(CATEGORIES[:5])
        rcat = reshape_arabic(cat_text)
        bb3 = draw.textbbox((0, 0), rcat, font=font_cat)
        tw3 = bb3[2] - bb3[0]
        draw.text((cx - tw3 // 2, front_y + 200), rcat, fill=(120, 120, 120), font=font_cat)

        cat_text2 = " ".join(CATEGORIES[5:])
        rcat2 = reshape_arabic(cat_text2)
        bb4 = draw.textbbox((0, 0), rcat2, font=font_cat)
        tw4 = bb4[2] - bb4[0]
        draw.text((cx - tw4 // 2, front_y + 225), rcat2, fill=(120, 120, 120), font=font_cat)

        # Card count
        font_count = ImageFont.truetype(FONT_PATH, 22)
        count_txt = reshape_arabic("٩٠ بطاقة")
        bb5 = draw.textbbox((0, 0), count_txt, font=font_count)
        tw5 = bb5[2] - bb5[0]
        draw.text((cx - tw5 // 2, front_y + 270), count_txt, fill=(r, g, b, 180), font=font_count)

    except Exception:
        pass

    # === DESIGN ON BACK PANEL ===
    try:
        font_back = ImageFont.truetype(FONT_PATH, 28)
        back_title = reshape_arabic("طريقة اللعب")
        bb6 = draw.textbbox((0, 0), back_title, font=font_back)
        tw6 = bb6[2] - bb6[0]
        draw.text((cx - tw6 // 2, back_y + 30), back_title, fill=(100, 100, 100), font=font_back)

        font_instr = ImageFont.truetype(FONT_PATH, 18)
        instructions = [
            "يظهر للطفل صورتان في الأعلى",
            "ثم يقرأ المختص الجملة الواصفة",
            "يخمن الطفل العلاقة بين الصورتين",
            "تظهر الصورة الكبيرة في الأسفل",
            "يكمل الطفل الجملة الناقصة",
            "مناسب للأطفال من 4 إلى 8 سنوات",
        ]
        for idx, line in enumerate(instructions):
            rline = reshape_arabic(line)
            bb7 = draw.textbbox((0, 0), rline, font=font_instr)
            tw7 = bb7[2] - bb7[0]
            draw.text((cx - tw7 // 2, back_y + 80 + idx * 32), rline,
                      fill=(130, 130, 130), font=font_instr)
    except Exception:
        pass

    # === FOLD LINES (dashed where needed) ===
    # Fold lines between panels (solid)
    fold_color = (180, 180, 180)
    # Between back-bottom
    draw.line([(back_x, bottom_y), (back_x + pw, bottom_y)], fill=fold_color, width=1)
    # Between bottom-front
    draw.line([(back_x, front_y), (back_x + pw, front_y)], fill=fold_color, width=1)
    # Between front-top
    draw.line([(back_x, top_y), (back_x + pw, top_y)], fill=fold_color, width=1)
    # Between top-tuck
    draw.line([(back_x, tuck_y), (back_x + pw, tuck_y)], fill=fold_color, width=1)

    # Labels
    try:
        font_label = ImageFont.truetype(FONT_PATH, 12)
        labels = [
            (back_x + pw + side_w + 5, back_y + ph // 2, "GLUE"),
            (back_x - side_w - 40, back_y + ph // 2, "GLUE"),
        ]
        for lx, ly, txt in labels:
            draw.text((lx, ly), txt, fill=(180, 180, 180), font=font_label)
    except Exception:
        pass

    return sheet


# ====== MAIN ======

def main():
    print("=" * 60)
    print("  DESIGN PRO — cartes a couper le souffle !")
    print("  Ombres, coins arrondis, code couleur, emballage")
    print("=" * 60)
    print()

    # 1. Generate the 10 professional planches
    for p_idx, planche_cards in enumerate(PLANCHES, 1):
        cat = CATEGORIES[p_idx - 1]
        print(f"[Planche PRO {p_idx}/10] {cat}")
        sheet = create_planche(p_idx, planche_cards, p_idx - 1)

        pdf_path = os.path.join(OUTPUT_DIR, f"planche_pro_{p_idx:02d}.pdf")
        sheet.save(pdf_path, "PDF", resolution=300)
        print(f"  PDF: {pdf_path}")

        jpg_path = os.path.join(OUTPUT_DIR, f"planche_pro_{p_idx:02d}.jpg")
        sheet.save(jpg_path, "JPEG", quality=95)
        print(f"  JPG: {jpg_path}")
        print()
        time.sleep(1.0)

    # 2. Card backs
    print("[Card Backs] Dos de cartes uniformes")
    backs = create_card_backs_planche()
    backs_pdf = os.path.join(OUTPUT_DIR, "planche_dos_cartes.pdf")
    backs.save(backs_pdf, "PDF", resolution=300)
    backs_jpg = os.path.join(OUTPUT_DIR, "planche_dos_cartes.jpg")
    backs.save(backs_jpg, "JPEG", quality=95)
    print(f"  PDF: {backs_pdf}")
    print(f"  JPG: {backs_jpg}")
    print()

    # 3. Box template
    print("[Box] Emballage professionnel")
    box = create_box_template()
    box_pdf = os.path.join(OUTPUT_DIR, "boite_emballage.pdf")
    box.save(box_pdf, "PDF", resolution=300)
    box_jpg = os.path.join(OUTPUT_DIR, "boite_emballage.jpg")
    box.save(box_jpg, "JPEG", quality=95)
    print(f"  PDF: {box_pdf}")
    print(f"  JPG: {box_jpg}")
    print()

    print("=" * 60)
    print("  TERMINE ! Tout est pret pour impression")
    print("=" * 60)
    print("  Fichiers generes :")
    print(f"    - 10 planches PRO (planche_pro_XX.pdf)")
    print(f"    - 1 planche dos de cartes (planche_dos_cartes.pdf)")
    print(f"    - 1 boite d'emballage (boite_emballage.pdf)")
    print("=" * 60)


if __name__ == "__main__":
    main()
