"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Reaction = {
  id: string;
  title: string;
  substrate: string;
  product: string;
  category: string;
  startingGroup: string;
  productGroup: string;
  reagents: string;
  equation: string;
  note: string;
  stereo?: string;
  reference: string;
};

const reactions: Reaction[] = [
  {
    id: "alkene-hx",
    title: "إضافة هاليد الهيدروجين إلى الألكين",
    substrate: "ألكين",
    product: "هاليد ألكيل",
    category: "إضافة",
    startingGroup: "ألكين",
    productGroup: "هاليد ألكيل",
    reagents: "HX: HCl أو HBr أو HI",
    equation: "CH3-CH=CH2  +  HBr  ->  CH3-CHBr-CH3",
    note: "يتبع اتجاه Markovnikov عادةً عبر تكوين الكربوكاتيون الأكثر استقرارًا.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hbr-peroxide",
    title: "إضافة HBr بوجود البيروكسيد",
    substrate: "ألكين",
    product: "هاليد ألكيل",
    category: "إضافة جذرية",
    startingGroup: "ألكين",
    productGroup: "هاليد ألكيل",
    reagents: "HBr, ROOR",
    equation: "CH3-CH=CH2  +  HBr  ->  CH3-CH2-CH2Br",
    note: "اتجاه anti-Markovnikov. يختص هذا المسار عادةً بـ HBr وليس HCl أو HI.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hydration",
    title: "إماهة الألكين المحفزة بالحمض",
    substrate: "ألكين",
    product: "كحول",
    category: "إضافة",
    startingGroup: "ألكين",
    productGroup: "كحول",
    reagents: "H2O, H+",
    equation: "CH3-CH=CH2  +  H2O  ->  CH3-CHOH-CH3",
    note: "يعطي كحول Markovnikov وقد تحدث إعادة ترتيب للكربوكاتيون.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-oxymercuration",
    title: "إماهة الألكين بالأوكسي ميركوريشن",
    substrate: "ألكين",
    product: "كحول",
    category: "إضافة",
    startingGroup: "ألكين",
    productGroup: "كحول",
    reagents: "1. Hg(OAc)2, H2O  2. NaBH4",
    equation: "R-CH=CH2  ->  R-CHOH-CH3",
    note: "يعطي كحول Markovnikov دون إعادة ترتيب هيكل الكربون.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hydroboration",
    title: "الإماهة بطريقة الهيدروبوريشن والأكسدة",
    substrate: "ألكين",
    product: "كحول",
    category: "إضافة",
    startingGroup: "ألكين",
    productGroup: "كحول",
    reagents: "1. BH3, THF  2. H2O2, OH-",
    equation: "R-CH=CH2  ->  R-CH2-CH2OH",
    note: "يعطي كحول anti-Markovnikov.",
    stereo: "إضافة syn: تدخل H وOH إلى الوجه نفسه من الرابطة الثنائية.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-halogenation",
    title: "هلجنة الألكين",
    substrate: "ألكين",
    product: "ثنائي هاليد متجاور",
    category: "إضافة",
    startingGroup: "ألكين",
    productGroup: "هاليد ألكيل",
    reagents: "Br2 أو Cl2",
    equation: "R-CH=CH-R  +  Br2  ->  R-CHBr-CHBr-R",
    note: "يمر التفاعل بأيون هالونيوم حلقي.",
    stereo: "إضافة anti: تدخل ذرتا الهالوجين إلى وجهين متعاكسين.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-halohydrin",
    title: "تكوين الهالوهيدرين",
    substrate: "ألكين",
    product: "هالوهيدرين",
    category: "إضافة",
    startingGroup: "ألكين",
    productGroup: "كحول",
    reagents: "Br2, H2O",
    equation: "R-CH=CH2  ->  R-CH(OH)-CH2Br",
    note: "ترتبط OH غالبًا بالكربون الأكثر استبدالًا.",
    stereo: "إضافة anti.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hydrogenation",
    title: "هدرجة الألكين",
    substrate: "ألكين",
    product: "ألكان",
    category: "اختزال",
    startingGroup: "ألكين",
    productGroup: "ألكان",
    reagents: "H2, Pd/C أو Pt",
    equation: "R-CH=CH-R  +  H2  ->  R-CH2-CH2-R",
    note: "تختزل الرابطة الثنائية إلى رابطة أحادية.",
    stereo: "إضافة syn على سطح الفلز.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-ozonolysis",
    title: "تشطير الألكين بالأوزون",
    substrate: "ألكين",
    product: "ألدهيد أو كيتون",
    category: "أكسدة",
    startingGroup: "ألكين",
    productGroup: "مركب كربونيل",
    reagents: "1. O3  2. Zn, H3O+",
    equation: "R2C=CR2  ->  R2C=O  +  O=CR2",
    note: "تُكسر الرابطة الثنائية ويصبح كل كربون منها جزءًا من مجموعة كربونيل.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkyne-hydrogenation",
    title: "الهدرجة الكاملة للألكاين",
    substrate: "ألكاين",
    product: "ألكان",
    category: "اختزال",
    startingGroup: "ألكاين",
    productGroup: "ألكان",
    reagents: "H2 فائض, Pd/C",
    equation: "R-C#C-R  +  2 H2  ->  R-CH2-CH2-R",
    note: "تختزل الرابطة الثلاثية بالكامل.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-lindlar",
    title: "الاختزال الجزئي للألكاين إلى ألكين cis",
    substrate: "ألكاين",
    product: "ألكين",
    category: "اختزال",
    startingGroup: "ألكاين",
    productGroup: "ألكين",
    reagents: "H2, Lindlar catalyst",
    equation: "R-C#C-R  ->  cis-R-CH=CH-R",
    note: "يتوقف الاختزال عند الألكين.",
    stereo: "إضافة syn وينتج الألكين cis.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-na-nh3",
    title: "الاختزال الجزئي للألكاين إلى ألكين trans",
    substrate: "ألكاين",
    product: "ألكين",
    category: "اختزال",
    startingGroup: "ألكاين",
    productGroup: "ألكين",
    reagents: "Na, NH3(l)",
    equation: "R-C#C-R  ->  trans-R-CH=CH-R",
    note: "اختزال بالفلز الذائب ويتوقف عند الألكين.",
    stereo: "ينتج الألكين trans.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-hydration",
    title: "إماهة الألكاين المحفزة بالزئبق",
    substrate: "ألكاين",
    product: "كيتون",
    category: "إضافة ثم توتومرة",
    startingGroup: "ألكاين",
    productGroup: "مركب كربونيل",
    reagents: "HgSO4, H2SO4, H2O",
    equation: "R-C#CH  ->  R-CO-CH3",
    note: "يتكون إنول أولًا ثم يتحول إلى كيتون. الألكاين الطرفي يعطي ميثيل كيتون.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-hydroboration",
    title: "إماهة الألكاين الطرفي بطريقة الهيدروبوريشن",
    substrate: "ألكاين",
    product: "ألدهيد",
    category: "إضافة ثم توتومرة",
    startingGroup: "ألكاين",
    productGroup: "مركب كربونيل",
    reagents: "1. (sia)2BH  2. H2O2, OH-",
    equation: "R-C#CH  ->  R-CH2-CHO",
    note: "يعطي الألكاين الطرفي ألدهيدًا بعد توتومرة الإنول.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "halide-sn2",
    title: "الاستبدال النيوكليوفيلي SN2",
    substrate: "هاليد ألكيل",
    product: "ناتج استبدال",
    category: "استبدال",
    startingGroup: "هاليد ألكيل",
    productGroup: "متنوع",
    reagents: "Nu- قوي، مذيب قطبي لا بروتوني",
    equation: "CH3CH2-Br  +  OH-  ->  CH3CH2-OH  +  Br-",
    note: "يفضل الركائز الميثيلية والأولية، ويتم في خطوة واحدة.",
    stereo: "يحدث انقلاب في التكوين عند المركز الفراغي.",
    reference: "McMurry 7e, Chapter 11",
  },
  {
    id: "halide-sn1",
    title: "الاستبدال النيوكليوفيلي SN1",
    substrate: "هاليد ألكيل",
    product: "ناتج استبدال",
    category: "استبدال",
    startingGroup: "هاليد ألكيل",
    productGroup: "متنوع",
    reagents: "نيوكليوفيل ضعيف، مذيب قطبي بروتوني",
    equation: "(CH3)3C-Br  +  H2O  ->  (CH3)3C-OH",
    note: "يفضل الركائز الثالثية المستقرة ككربوكاتيون وقد تحدث إعادة ترتيب.",
    stereo: "قد ينتج مزيج من المتماكبات عند المركز الفراغي.",
    reference: "McMurry 7e, Chapter 11",
  },
  {
    id: "halide-e2",
    title: "الحذف E2",
    substrate: "هاليد ألكيل",
    product: "ألكين",
    category: "حذف",
    startingGroup: "هاليد ألكيل",
    productGroup: "ألكين",
    reagents: "قاعدة قوية، تسخين",
    equation: "CH3-CHBr-CH3  +  EtO-  ->  CH3-CH=CH2",
    note: "يحدث في خطوة واحدة. غالبًا يفضل ألكين Zaitsev، بينما قد تعطي القاعدة الضخمة ناتج Hofmann.",
    stereo: "يتطلب ترتيب anti-periplanar بين H ومجموعة المغادرة.",
    reference: "McMurry 7e, Chapter 11",
  },
  {
    id: "alcohol-oxidation-primary",
    title: "أكسدة الكحول الأولي",
    substrate: "كحول",
    product: "ألدهيد أو حمض كربوكسيلي",
    category: "أكسدة",
    startingGroup: "كحول",
    productGroup: "مركب كربونيل",
    reagents: "PCC للألدهيد؛ Jones للحمض",
    equation: "R-CH2OH  ->  R-CHO  ->  R-COOH",
    note: "اختيار المؤكسد يحدد إمكان إيقاف الأكسدة عند الألدهيد.",
    reference: "McMurry 7e, Chapter 17",
  },
  {
    id: "alcohol-oxidation-secondary",
    title: "أكسدة الكحول الثانوي",
    substrate: "كحول",
    product: "كيتون",
    category: "أكسدة",
    startingGroup: "كحول",
    productGroup: "مركب كربونيل",
    reagents: "PCC أو CrO3, H3O+",
    equation: "R2CHOH  ->  R2C=O",
    note: "يعطي الكحول الثانوي كيتونًا.",
    reference: "McMurry 7e, Chapter 17",
  },
  {
    id: "alcohol-dehydration",
    title: "نزع الماء من الكحول",
    substrate: "كحول",
    product: "ألكين",
    category: "حذف",
    startingGroup: "كحول",
    productGroup: "ألكين",
    reagents: "H2SO4, heat",
    equation: "CH3-CHOH-CH3  ->  CH3-CH=CH2  +  H2O",
    note: "يُفضّل عادةً الألكين الأكثر استبدالًا.",
    reference: "McMurry 7e, Chapter 17",
  },
  {
    id: "epoxide-opening-basic",
    title: "فتح الإيبوكسيد بالنيوكليوفيل",
    substrate: "إيبوكسيد",
    product: "كحول مستبدل",
    category: "فتح حلقة",
    startingGroup: "إيثر وإيبوكسيد",
    productGroup: "كحول",
    reagents: "Nu- ثم H3O+",
    equation: "epoxide  +  Nu-  ->  Nu-CH2-CH2-OH",
    note: "في الوسط القاعدي يهاجم النيوكليوفيل عادةً الكربون الأقل استبدالًا.",
    stereo: "هجوم خلفي anti.",
    reference: "McMurry 7e, Chapter 18",
  },
  {
    id: "carbonyl-reduction",
    title: "اختزال الألدهيد أو الكيتون",
    substrate: "ألدهيد أو كيتون",
    product: "كحول",
    category: "اختزال",
    startingGroup: "ألدهيد وكيتون",
    productGroup: "كحول",
    reagents: "NaBH4 أو LiAlH4 ثم H3O+",
    equation: "R2C=O  ->  R2CHOH",
    note: "يعطي الألدهيد كحولًا أوليًا، ويعطي الكيتون كحولًا ثانويًا.",
    reference: "McMurry 7e, Chapter 19",
  },
  {
    id: "carbonyl-grignard",
    title: "إضافة كاشف Grignard إلى الكربونيل",
    substrate: "ألدهيد أو كيتون",
    product: "كحول",
    category: "تكوين رابطة C-C",
    startingGroup: "ألدهيد وكيتون",
    productGroup: "كحول",
    reagents: "1. RMgBr  2. H3O+",
    equation: "R2C=O  +  R-MgBr  ->  R3C-OH",
    note: "طريقة مهمة لبناء رابطة كربون-كربون جديدة.",
    reference: "McMurry 7e, Chapter 19",
  },
  {
    id: "carbonyl-wittig",
    title: "تفاعل Wittig",
    substrate: "ألدهيد أو كيتون",
    product: "ألكين",
    category: "تكوين رابطة C=C",
    startingGroup: "ألدهيد وكيتون",
    productGroup: "ألكين",
    reagents: "Ph3P=CR2",
    equation: "R2C=O  +  Ph3P=CR2  ->  R2C=CR2",
    note: "يستبدل أكسجين مجموعة الكربونيل برابطة ثنائية كربون-كربون.",
    reference: "McMurry 7e, Chapter 19",
  },
  {
    id: "acid-esterification",
    title: "أسترة Fischer",
    substrate: "حمض كربوكسيلي",
    product: "إستر",
    category: "استبدال أسيل",
    startingGroup: "حمض كربوكسيلي",
    productGroup: "إستر",
    reagents: "ROH, H+",
    equation: "R-COOH  +  R'-OH  <->  R-COOR'  +  H2O",
    note: "تفاعل اتزان محفز بالحمض.",
    reference: "McMurry 7e, Chapter 21",
  },
  {
    id: "ester-hydrolysis",
    title: "تحلل الإستر القاعدي",
    substrate: "إستر",
    product: "كربوكسيلات وكحول",
    category: "استبدال أسيل",
    startingGroup: "مشتقات الحمض الكربوكسيلي",
    productGroup: "حمض كربوكسيلي",
    reagents: "OH-, H2O, heat",
    equation: "R-COOR'  +  OH-  ->  R-COO-  +  R'-OH",
    note: "يسمى أيضًا التصبن، ويعطي ملح الحمض الكربوكسيلي.",
    reference: "McMurry 7e, Chapter 21",
  },
  {
    id: "acid-chloride-amide",
    title: "تحضير الأميد من كلوريد الأسيل",
    substrate: "كلوريد أسيل",
    product: "أميد",
    category: "استبدال أسيل",
    startingGroup: "مشتقات الحمض الكربوكسيلي",
    productGroup: "أميد",
    reagents: "NH3 أو RNH2",
    equation: "R-COCl  +  2 NH3  ->  R-CONH2  +  NH4Cl",
    note: "كلوريد الأسيل من أكثر مشتقات الحمض نشاطًا.",
    reference: "McMurry 7e, Chapter 21",
  },
  {
    id: "benzene-bromination",
    title: "برومة البنزين",
    substrate: "بنزين",
    product: "هاليد أريل",
    category: "استبدال عطري إلكتروفيلي",
    startingGroup: "مركب عطري",
    productGroup: "هاليد أريل",
    reagents: "Br2, FeBr3",
    equation: "C6H6  +  Br2  ->  C6H5Br  +  HBr",
    note: "تُحفظ عطرية الحلقة عبر الاستبدال بدل الإضافة.",
    reference: "McMurry 7e, Chapter 16",
  },
  {
    id: "benzene-nitration",
    title: "نترتة البنزين",
    substrate: "بنزين",
    product: "نيتروبنزين",
    category: "استبدال عطري إلكتروفيلي",
    startingGroup: "مركب عطري",
    productGroup: "نيترو",
    reagents: "HNO3, H2SO4",
    equation: "C6H6  ->  C6H5-NO2",
    note: "الإلكتروفيل الفعال هو أيون النترونيوم.",
    reference: "McMurry 7e, Chapter 16",
  },
  {
    id: "benzene-friedel-crafts",
    title: "ألكلة Friedel-Crafts",
    substrate: "بنزين",
    product: "ألكيل بنزين",
    category: "استبدال عطري إلكتروفيلي",
    startingGroup: "مركب عطري",
    productGroup: "مركب عطري",
    reagents: "R-Cl, AlCl3",
    equation: "C6H6  +  R-Cl  ->  C6H5-R",
    note: "قد تحدث إعادة ترتيب عند تكوين الكربوكاتيون، وقد تحدث ألكلة متعددة.",
    reference: "McMurry 7e, Chapter 16",
  },
  {
    id: "amine-reductive-amination",
    title: "الأمينة الاختزالية",
    substrate: "ألدهيد أو كيتون",
    product: "أمين",
    category: "اختزال",
    startingGroup: "ألدهيد وكيتون",
    productGroup: "أمين",
    reagents: "1. NH3 أو RNH2  2. NaBH3CN",
    equation: "R2C=O  ->  R2CH-NHR",
    note: "تحول عملي لمركب الكربونيل إلى أمين.",
    reference: "McMurry 7e, Chapter 24",
  },
];

const all = "الكل";

export default function ReactionsPage() {
  const [startingGroup, setStartingGroup] = useState(all);
  const [productGroup, setProductGroup] = useState(all);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(reactions[0].id);

  const startingGroups = [all, ...new Set(reactions.map((reaction) => reaction.startingGroup))];
  const productGroups = [all, ...new Set(reactions.map((reaction) => reaction.productGroup))];

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reactions.filter((reaction) => {
      const matchesStarting = startingGroup === all || reaction.startingGroup === startingGroup;
      const matchesProduct = productGroup === all || reaction.productGroup === productGroup;
      const matchesQuery =
        !normalizedQuery ||
        [
          reaction.title,
          reaction.substrate,
          reaction.product,
          reaction.reagents,
          reaction.category,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStarting && matchesProduct && matchesQuery;
    });
  }, [productGroup, query, startingGroup]);

  const selected =
    filtered.find((reaction) => reaction.id === selectedId) ?? filtered[0] ?? null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-6">
          <Link href="/" className="text-sm font-bold text-orange-700 hover:text-orange-900">
            العودة إلى الصفحة الرئيسية
          </Link>
          <h1 className="mt-4 text-3xl font-bold">أطلس التفاعلات العضوية</h1>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            ملخص تفاعلي للبحث عن التحولات الأساسية حسب المجموعة الوظيفية في الركيزة
            أو حسب نوع الناتج المتوقع.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            المرجع التعليمي: Organic Chemistry, McMurry, 7th Edition. الصياغة مختصرة
            ومُعدة للمراجعة وليست بديلًا عن شرح الكتاب.
          </p>
        </header>

        <section className="grid gap-4 border-b border-slate-200 py-6 md:grid-cols-3">
          <label className="text-sm font-bold text-slate-700">
            المجموعة الوظيفية في الركيزة
            <select
              value={startingGroup}
              onChange={(event) => setStartingGroup(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
            >
              {startingGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-700">
            نوع الناتج
            <select
              value={productGroup}
              onChange={(event) => setProductGroup(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
            >
              {productGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-700">
            بحث سريع
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="مثال: أكسدة، كحول، HBr"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
            />
          </label>
        </section>

        <section className="grid gap-6 py-6 lg:grid-cols-[360px_1fr]">
          <aside>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">التفاعلات</h2>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold">
                {filtered.length}
              </span>
            </div>

            <div className="grid max-h-[720px] gap-2 overflow-y-auto pl-1">
              {filtered.map((reaction) => (
                <button
                  key={reaction.id}
                  type="button"
                  onClick={() => setSelectedId(reaction.id)}
                  className={`rounded-lg border p-3 text-right transition ${
                    selected?.id === reaction.id
                      ? "border-orange-400 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <span className="block font-bold">{reaction.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {reaction.substrate} ← {reaction.product}
                  </span>
                </button>
              ))}

              {!filtered.length && (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                  لا توجد نتيجة بهذه الفلاتر. غيّر أحد الخيارات أو امسح البحث.
                </p>
              )}
            </div>
          </aside>

          {selected && (
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-orange-700">{selected.category}</p>
                  <h2 className="mt-1 text-2xl font-bold">{selected.title}</h2>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                  {selected.reference}
                </span>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border-r-4 border-blue-400 bg-blue-50 p-4">
                  <dt className="text-xs font-bold text-blue-700">الركيزة</dt>
                  <dd className="mt-1 font-bold">{selected.substrate}</dd>
                </div>
                <div className="border-r-4 border-emerald-400 bg-emerald-50 p-4">
                  <dt className="text-xs font-bold text-emerald-700">الناتج</dt>
                  <dd className="mt-1 font-bold">{selected.product}</dd>
                </div>
              </dl>

              <section className="mt-6">
                <h3 className="text-sm font-bold text-slate-500">معادلة مختصرة</h3>
                <p
                  className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-lg text-white"
                  dir="ltr"
                >
                  {selected.equation}
                </p>
              </section>

              <section className="mt-6">
                <h3 className="text-sm font-bold text-slate-500">الكواشف والشروط</h3>
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono" dir="ltr">
                  {selected.reagents}
                </p>
              </section>

              <section className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-bold">الملاحظة المهمة</h3>
                <p className="mt-2 leading-7 text-slate-700">{selected.note}</p>
              </section>

              {selected.stereo && (
                <section className="mt-4 border-r-4 border-violet-400 bg-violet-50 p-4">
                  <h3 className="font-bold text-violet-900">الستيريوكيمياء</h3>
                  <p className="mt-1 leading-7 text-violet-900">{selected.stereo}</p>
                </section>
              )}
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
