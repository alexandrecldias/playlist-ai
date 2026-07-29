export type ParsedTrackInput = {
  original: string;
  title: string;
  artist?: string;
};

export function parseTrackInput(input: string): ParsedTrackInput[] {
  const maxEntries = 30;

  // Split by commas and newlines
  const lines = input
    .split(/[,\n]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Remove duplicates (case-insensitive)
  const seen = new Set<string>();
  const unique = lines.filter((line) => {
    const normalized = line.toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });

  // Limit to max entries
  const limited = unique.slice(0, maxEntries);

  // Parse title and artist
  return limited.map((line) => {
    const lastDashIndex = line.lastIndexOf(" - ");

    if (lastDashIndex > 0) {
      const title = line.substring(0, lastDashIndex).trim();
      const artist = line.substring(lastDashIndex + 3).trim();
      return {
        original: line,
        title,
        artist: artist.length > 0 ? artist : undefined,
      };
    }

    return {
      original: line,
      title: line,
      artist: undefined,
    };
  });
}
