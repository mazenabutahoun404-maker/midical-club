import { campusDestinations } from "../homepage/living-campus";

/** The central plaza stays free for the form. Coordinates are in the new 1672 × 941 artwork. */
const positions: Record<
  string,
  {
    polygon: string;
    route: string;
    labelX: number;
    labelY: number;
    rotation: number;
    lightX: number;
    lightY: number;
  }
> = {
  learning: {
    polygon: "135,76 325,13 434,17 455,219 466,290 386,329 170,329 108,245",
    labelX: 288,
    labelY: 289,
    rotation: -6,
    lightX: 310,
    lightY: 214,
    route:
      "M836 730C663 744 564 678 556 566C543 450 494 409 511 340C532 281 477 257 423 286",
  },
  media: {
    polygon: "154,302 307,295 392,343 438,469 433,564 167,570 83,509 98,408",
    labelX: 235,
    labelY: 515,
    rotation: 7,
    lightX: 287,
    lightY: 435,
    route: "M836 730C649 748 531 665 498 570C480 524 436 505 401 497",
  },
  community: {
    polygon:
      "1158,76 1349,58 1448,98 1483,255 1461,332 1350,371 1168,331 1148,216",
    labelX: 1280,
    labelY: 299,
    rotation: 9,
    lightX: 1297,
    lightY: 224,
    route: "M836 730C1040 766 1122 654 1149 503C1166 410 1187 356 1262 333",
  },
  mentorship: {
    polygon:
      "1449,313 1550,300 1625,331 1644,470 1614,589 1463,627 1373,570 1357,448",
    labelX: 1464,
    labelY: 562,
    rotation: 8,
    lightX: 1500,
    lightY: 463,
    route: "M836 730C1033 775 1186 704 1261 604C1313 534 1387 503 1430 504",
  },
  contribution: {
    polygon:
      "1133,636 1278,571 1408,587 1463,710 1421,825 1202,858 1084,795 1055,714",
    labelX: 1320,
    labelY: 786,
    rotation: -10,
    lightX: 1286,
    lightY: 712,
    route: "M836 730C991 803 1108 822 1195 768L1235 730",
  },
  journals: {
    polygon: "262,536 426,543 487,641 500,755 435,862 236,848 176,757 175,639",
    labelX: 321,
    labelY: 794,
    rotation: 10,
    lightX: 377,
    lightY: 690,
    route: "M836 730C679 826 550 843 462 798L434 752",
  },
};
export const authDestinations = campusDestinations.map((destination) => ({
  ...destination,
  ...positions[destination.id],
}));
