// Pre-computed 64 shades for each of the 8 color types
// Generated deterministically from darkest to lightest, including all existing palette colors

// RED shades (64 colors from darkest to lightest)
const RED_SHADES = [
  "#000000", "#080202", "#100303", "#180505", "#200606", "#280808", "#310a0a",  "#390b0b",
 "#410d0d", "#490f0f", "#511010", "#591212", "#611313", "#711717", "#791818",  "#821a1a",
 "#8a1c1c", "#990033", "#921d1d", "#a22020", "#aa2222", "#ba2525", "#c22727",  "#ca2828",
 "#d22a2a", "#db2c2c", "#eb2f2f", "#FF0000", "#f33131", "#D85555", "#FF0080",  "#FF3333",
 "#ff3636", "#ff4343", "#ff4a4a", "#ff5050", "#FF4D6D", "#ff5d5d", "#ff6464",  "#ff6a6a",
 "#FF6B6B", "#ff7171", "#ff7777", "#ff7d7d", "#ff8484", "#ff8a8a", "#ff9191",  "#ff9797",
 "#ff9e9e", "#ffa4a4", "#ffb1b1", "#FFB3B3", "#ffb8b8", "#ffbebe", "#ffc5c5",  "#ffcbcb",
 "#ffd2d2", "#ffd8d8", "#ffdfdf", "#ffe5e5", "#ffecec", "#fff2f2", "#fff9f9", "#ffffff",
];

// ORANGE shades (64 colors from darkest to lightest)
const ORANGE_SHADES = [
  "#000000", "#080400", "#100800", "#180b00", "#200f00", "#281300", "#311700",  "#391a00",
 "#411e00", "#492200", "#512600", "#592a00", "#612d00", "#693100", "#713500",  "#793900",
 "#823c00", "#8a4000", "#924400", "#9a4800", "#a24c00", "#aa4f00", "#b25300",  "#CC4400",
 "#ba5700", "#c25b00", "#d26200", "#db6600", "#e36a00", "#eb6e00", "#FF6600",  "#f37100",
 "#fb7500", "#DD8844", "#FF7700", "#ff7904", "#ff7d0c", "#ff861c", "#FF8800",  "#FF8A5C",
 "#ff8f2d", "#ff9c45", "#FF9F6B", "#ffa455", "#ffa95d", "#ffad65", "#FFB380",  "#ffb675",
 "#ffba7d", "#ffc38e", "#ffc796", "#ffcb9e", "#ffd0a6", "#ffd4ae", "#ffd8b6",  "#ffdcbe",
 "#ffe1c6", "#ffe5ce", "#ffe9d7", "#ffeedf", "#fff2e7", "#fff6ef", "#fffbf7", "#ffffff",
];

// YELLOW shades (64 colors from darkest to lightest)
const YELLOW_SHADES = [
  "#000000", "#080700", "#100e00", "#181500", "#201c00", "#282300", "#312a00",  "#393100",
 "#413800", "#493f00", "#514600", "#594d00", "#615400", "#695b00", "#716200",  "#796900",
 "#827000", "#8a7700", "#927e00", "#9a8500", "#998800", "#a28c00", "#aa9300",  "#b29a00",
 "#baa100", "#c2a800", "#caaf00", "#DDAA33", "#d2b600", "#dbbd00", "#e3c400",  "#ebcb00",
 "#f3d200", "#FFD56B", "#fbd900", "#FFD93D", "#FFDD00", "#ffde04", "#ffdf0c",  "#ffe014",
 "#ffe11c", "#ffe224", "#ffe32d", "#ffe435", "#ffe53d", "#ffe645", "#ffe74d",  "#ffe855",
 "#ffe95d", "#ffea65", "#ffec6d", "#ffed75", "#ffee7d", "#CCFF00", "#ffef86",  "#fff08e",
 "#fff196", "#fff29e", "#fff3a6", "#fff4ae", "#FFF5AA", "#fff5b6", "#fff6be", "#FFFF00",
];

// GREEN shades (64 colors from darkest to lightest)
const GREEN_SHADES = [
  "#000000", "#020702", "#030e03", "#051505", "#061c06", "#082308", "#0a2a0a",  "#0b310b",
 "#0d380d", "#0f3f0f", "#104610", "#124d12", "#135413", "#155b15", "#176217",  "#006600",
 "#1a701a", "#1c771c", "#1d7e1d", "#1f851f", "#208c20", "#229322", "#249a24",  "#25a125",
 "#669944", "#27a827", "#28af28", "#2ab62a", "#2cbd2c", "#2dc42d", "#2fcb2f",  "#31d231",
 "#32d932", "#3ddf3d", "#43e043", "#4ae14a", "#50e250", "#5de45d", "#6ae66a",  "#71e771",
 "#77e877", "#7de97d", "#84ea84", "#8aec8a", "#91ed91", "#97ee97", "#9eef9e",  "#00FF00",
 "#00FF40", "#b1f2b1", "#6BFF9F", "#b8f3b8", "#8CFF6B", "#bef4be", "#c5f5c5",  "#B3FFB3",
 "#d2f7d2", "#d8f9d8", "#dffadf", "#e5fbe5", "#ecfcec", "#f2fdf2", "#f9fef9", "#ffffff",
];

// BLUE shades (64 colors from darkest to lightest)
const BLUE_SHADES = [
  "#000000", "#020408", "#030810", "#050b18", "#060f20", "#081328", "#0a1731",  "#0b1a39",
 "#0d1e41", "#0f2249", "#122a59", "#132d61", "#1A1A99", "#153169", "#173571",  "#183979",
 "#1a3c82", "#1c408a", "#1d4492", "#1f489a", "#204ca2", "#224faa", "#2557ba",  "#275bc2",
 "#285eca", "#2c66db", "#0066FF", "#2f6eeb", "#3171f3", "#3377FF", "#3679ff",  "#5588AA",
 "#0080FF", "#3d7dff", "#4382ff", "#4a86ff", "#508aff", "#578fff", "#6497ff",  "#6B9DFF",
 "#71a0ff", "#77a4ff", "#6BAAFF", "#7da9ff", "#84adff", "#8ab1ff", "#91b6ff",  "#97baff",
 "#9ebeff", "#a4c3ff", "#b1cbff", "#B3CCFF", "#b8d0ff", "#bed4ff", "#c5d8ff",  "#cbdcff",
 "#d2e1ff", "#d8e5ff", "#dfe9ff", "#e5eeff", "#ecf2ff", "#f2f6ff", "#f9fbff", "#ffffff",
];

// PURPLE shades (64 colors from darkest to lightest)
const PURPLE_SHADES = [
  "#000000", "#050208", "#0b0310", "#100518", "#160620", "#1b0828", "#200a31",  "#260b39",
 "#2b0d41", "#310f49", "#361051", "#3b1259", "#461569", "#4c1771", "#511879",  "#561a82",
 "#660099", "#611d92", "#671f9a", "#6c20a2", "#7122aa", "#7724b2", "#7c25ba",  "#8227c2",
 "#8728ca", "#8000FF", "#8c2ad2", "#972de3", "#8855AA", "#9d2feb", "#a231f3",  "#a732fb",
 "#ab36ff", "#ae3dff", "#b34aff", "#b650ff", "#b957ff", "#9F6BFF", "#bc5dff",  "#be64ff",
 "#c16aff", "#c677ff", "#c97dff", "#D67AFF", "#cc84ff", "#ce8aff", "#d191ff",  "#d497ff",
 "#d79eff", "#d9a4ff", "#dfb1ff", "#E6B3FF", "#e1b8ff", "#e4beff", "#e7c5ff",  "#e9cbff",
 "#ecd2ff", "#efd8ff", "#f2dfff", "#f4e5ff", "#f7ecff", "#faf2ff", "#fcf9ff", "#ffffff",
];

// WHITE shades (64 colors from darkest to lightest) - PRESERVED AS-IS
const WHITE_SHADES = [
  "#202020", "#252525", "#2a2a2a", "#363636", "#3d3d3d", "#444444", "#4a4a4a", "#4f4f4f",
  "#545454", "#595959", "#5d5d5d", "#626262", "#666666", "#6a6a6a", "#6e6e6e", "#727272",
  "#767676", "#7a7a7a", "#7d7d7d", "#818181", "#858585", "#888888", "#8c8c8c", "#8f8f8f",
  "#929292", "#969696", "#999999", "#9c9c9c", "#9f9f9f", "#a2a2a2", "#a5a5a5", "#a9a9a9",
  "#acacac", "#afafaf", "#b2b2b2", "#b5b5b5", "#b7b7b7", "#bababa", "#bdbdbd", "#c0c0c0",
  "#c3c3c3", "#c6c6c6", "#c9c9c9", "#cbcbcb", "#cecece", "#d1d1d1", "#d3d3d3", "#d6d6d6",
  "#d9d9d9", "#dbdbdb", "#dedede", "#e1e1e1", "#e3e3e3", "#e6e6e6", "#e8e8e8", "#ebebeb",
  "#eeeeee", "#f0f0f0", "#F5F0EA", "#F7F7F7", "#FFF8F0", "#F0FDFF", "#FEFEFE", "#FFFFFF",
];

// BLACK shades (64 colors from darkest to lightest)
const BLACK_SHADES = [
  "#000000", "#010101", "#020202", "#030303", "#040404", "#050505", "#080808",  "#0a0a0a",
 "#0c0c0c", "#0d0d0d", "#0e0e0e", "#0f0f0f", "#111111", "#121212", "#151515",  "#161616",
 "#171717", "#181818", "#191919", "#1A1A1A", "#1a1a1a", "#1b1b1b", "#1c1c1c",  "#1d1d1d",
 "#1e1e1e", "#1f1f1f", "#202020", "#212121", "#222222", "#262626", "#2A2A2A",  "#2d2d2d",
 "#3b3b3b", "#3D3D3D", "#424242", "#494949", "#4A4A4A", "#505050", "#575757",  "#5e5e5e",
 "#656565", "#6c6c6c", "#737373", "#7a7a7a", "#818181", "#888888", "#888888",  "#8f8f8f",
 "#969696", "#9d9d9d", "#a4a4a4", "#ababab", "#b2b2b2", "#b9b9b9", "#c0c0c0",  "#c7c7c7",
 "#cecece", "#d5d5d5", "#dcdcdc", "#e3e3e3", "#eaeaea", "#f1f1f1", "#f8f8f8", "#ffffff",
];

// Export all shade arrays
export {
  RED_SHADES,
  ORANGE_SHADES,
  YELLOW_SHADES,
  GREEN_SHADES,
  BLUE_SHADES,
  PURPLE_SHADES,
  WHITE_SHADES,
  BLACK_SHADES,
};

// Combined array for easy access by index
export const ALL_SHADES = [
  RED_SHADES, // 0
  ORANGE_SHADES, // 1
  YELLOW_SHADES, // 2
  GREEN_SHADES, // 3
  BLUE_SHADES, // 4
  PURPLE_SHADES, // 5
  WHITE_SHADES, // 6
  BLACK_SHADES, // 7
];
