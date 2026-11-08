import { BookLightTrack } from "./BookLightTrack";

/** Compatibility entry point; the registered John geometry remains unchanged. */
export function JohnLightTrack({ progress }: { progress: number }) {
  return <BookLightTrack book="JHN" progress={progress} />;
}
