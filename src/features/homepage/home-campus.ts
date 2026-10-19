import { campusDestinations } from "./living-campus";

/** Only the supplied homepage image uses these three destinations and baked-in signs. */
export const homeCampusDestinations = campusDestinations
  .slice(0, 3)
  .map((item) => {
    const sign =
      item.id === "learning"
        ? { labelX: 738, labelY: 354, rotation: -4, labelWidth: 112 }
        : item.id === "media"
          ? { labelX: 1088, labelY: 280, rotation: 1, labelWidth: 78 }
          : { labelX: 1403, labelY: 350, rotation: 4, labelWidth: 154 };
    return {
      ...item,
      ...sign,
      // The new community building extends farther right than the original campus.
      ...(item.id === "community"
        ? {
            polygon:
              "1248,131 1360,86 1466,112 1547,202 1538,330 1560,414 1440,452 1284,403 1222,334 1185,253 1207,180",
          }
        : {}),
    };
  });
