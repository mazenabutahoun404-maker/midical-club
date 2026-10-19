/** Shared exclusion list keeps More free of destinations already in the phone dock. */
export const phoneDockPaths = (personal: boolean) => [
  personal ? "/my" : "/",
  personal ? "/my/learning" : "/learn",
  "/community",
  "/my/profile",
];
