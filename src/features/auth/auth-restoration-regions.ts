/** Separate projected building regions; the photograph itself never changes between milestones. */
export const authRestorationRegions: Record<string, string> = {
  learning: "M0 0H660V360L470 390L400 333L305 296L157 300L80 389H0Z",
  media: "M0 389H80L157 300L305 296L400 333L470 390L660 360V610L520 651L462 555L350 530L248 538L170 610L0 665Z",
  journals: "M0 665L170 610L248 538L350 530L462 555L520 651L660 610V941H0Z",
  community: "M1030 0H1672V326L1590 300L1500 305L1436 336L1374 448L1050 545Z",
  mentorship: "M1050 545L1374 448L1436 336L1500 305L1590 300L1672 326V714L1510 805L1415 603L1330 573L1200 610L1030 690Z",
  contribution: "M1030 690L1200 610L1330 573L1415 603L1510 805L1672 714V941H1030Z",
};

export const phoneRestorationRegions: Record<string, string> = {
  learning: "M490 0H905L920 330L940 440L915 490H490Z",
  media: "M905 0H1195V322L1075 345L970 325L920 330Z",
  community: "M1195 0H1672V320L1460 290L1400 365L1195 395Z",
  mentorship: "M1400 365L1460 290L1672 320V637L1450 634L1375 557L1360 470Z",
  contribution: "M1080 635L1375 557L1450 634H1672V941H1080Z",
  journals: "M490 490H915L960 595L1000 800V941H490Z",
};

/** Endpoints of the authored routes, in the same coordinates as the photograph. */
export const authArrivalPoints: Record<string, readonly [number, number]> = {
  learning: [423, 286], media: [401, 497], community: [1262, 333],
  mentorship: [1430, 504], contribution: [1235, 730], journals: [434, 752],
};
export const phoneArrivalPoints: Record<string, readonly [number, number]> = {
  learning: [743, 276], media: [1082, 302], community: [1340, 373],
  mentorship: [1406, 437], contribution: [1255, 724], journals: [829, 827],
};
