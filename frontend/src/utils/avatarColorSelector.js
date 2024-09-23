export const getColorForLetter = (letter) => {
  const colors = {
    A: "#B71C1C", // Dark Red
    B: "#880E4F", // Dark Pink
    C: "#4A148C", // Dark Purple
    D: "#311B92", // Dark Deep Purple
    E: "#1A237E", // Dark Indigo
    F: "#0D47A1", // Dark Blue
    G: "#01579B", // Dark Light Blue
    H: "#006064", // Dark Cyan
    I: "#004D40", // Dark Teal
    J: "#1B5E20", // Dark Green
    K: "#33691E", // Dark Light Green
    L: "#827717", // Dark Lime
    M: "#F57F17", // Dark Yellow
    N: "#FF6F00", // Dark Amber
    O: "#E65100", // Dark Orange
    P: "#BF360C", // Dark Deep Orange
    Q: "#3E2723", // Dark Brown
    R: "#424242", // Dark Grey
    S: "#37474F", // Dark Blue Grey
    T: "#B71C1C", // Dark Red (Repeat for consistency)
    U: "#880E4F", // Dark Pink (Repeat for consistency)
    V: "#4A148C", // Dark Purple (Repeat for consistency)
    W: "#311B92", // Dark Deep Purple (Repeat for consistency)
    X: "#1A237E", // Dark Indigo (Repeat for consistency)
    Y: "#0D47A1", // Dark Blue (Repeat for consistency)
    Z: "#01579B", // Dark Light Blue (Repeat for consistency)
  };

  return colors[letter] || "#37474F"; // Default to Dark Blue Grey if letter not found
};
