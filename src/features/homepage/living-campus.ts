import { routes } from "../../constants/routes";
import type { Text } from "../../types/content";

/** Coordinates stay in the original 1672 × 941 space, including the mobile crop. */
export const campusDestinations = [
  {
    id: "learning", href: routes.learn,
    label: { en: "Learning", ar: "التعلّم" },
    description: { en: "Courses, resources and your next chapter of learning.", ar: "مساقات ومصادر وخطوتك التالية في التعلّم." },
    polygon: "544,34 716,20 819,23 899,91 920,217 855,323 805,388 628,400 553,332",
    labelX: 710, labelY: 355, rotation: -4,
    route: "M1060 588C965 581 875 498 827 424C813 402 811 373 817 342C829 303 771 296 743 276",
  },
  {
    id: "media", href: routes.media,
    label: { en: "Media", ar: "الإعلام" },
    description: { en: "Student stories, perspectives and moments worth sharing.", ar: "قصص الطلبة وآراؤهم ولحظات تستحق المشاركة." },
    polygon: "916,17 1047,8 1112,35 1181,114 1170,250 1126,307 989,312 944,266",
    labelX: 1060, labelY: 278, rotation: 1,
    route: "M1090 586C1182 572 1209 498 1181 410C1159 341 1123 316 1090 313L1082 302",
  },
  {
    id: "community", href: routes.community,
    label: { en: "Community", ar: "المجتمع" },
    description: { en: "Find your people and make the journey a shared one.", ar: "تعرّف على مجتمعك وشارك الآخرين رحلتك." },
    polygon: "1230,94 1340,68 1450,97 1465,250 1402,377 1240,376 1200,276 1206,158",
    labelX: 1320, labelY: 337, rotation: 9,
    route: "M1092 586C1195 579 1300 525 1328 420L1340 373",
  },
  {
    id: "mentorship", href: routes.mentorship,
    label: { en: "Mentorship", ar: "الإرشاد" },
    description: { en: "Guidance, conversations and experience to help you move forward.", ar: "توجيه وحوار وخبرات تساعدك على التقدّم." },
    polygon: "1430,318 1516,283 1617,309 1643,488 1624,599 1534,626 1400,590 1360,474 1390,374",
    labelX: 1468, labelY: 544, rotation: 9,
    route: "M1122 601C1258 605 1364 535 1390 463L1406 437",
  },
  {
    id: "contribution", href: routes.contributions,
    label: { en: "Contribution", ar: "المساهمات" },
    description: { en: "Bring your ideas, share your work and help shape MedClub.", ar: "شارك أفكارك وعملك وساهم في بناء ميدكلب." },
    polygon: "1170,639 1270,604 1392,587 1443,666 1425,756 1335,795 1214,794 1153,725",
    labelX: 1310, labelY: 746, rotation: -12,
    route: "M1094 605C1080 691 1116 739 1188 744L1255 724",
  },
  {
    id: "journals", href: routes.journal,
    label: { en: "Journals", ar: "المجلات" },
    description: { en: "Research, writing and knowledge from the medical community.", ar: "أبحاث وكتابات ومعرفة من المجتمع الطبي." },
    polygon: "635,488 753,492 883,575 920,701 865,847 702,839 620,765 621,618",
    labelX: 730, labelY: 774, rotation: 15,
    route: "M1020 610C959 632 956 721 925 776C905 812 860 828 829 827",
  },
] satisfies Array<{
  id: string; href: string; label: Text; description: Text; polygon: string;
  labelX: number; labelY: number; rotation: number; route: string;
}>;
export type CampusDestination = (typeof campusDestinations)[number];
