import Reader from "../lesen/[book]";

// Keep existing Open Translation Bible links on their original route.
export default function OpenBibleChapter() {
  return <Reader fixedEdition="otb" />;
}
