const compositions = [
  {
    id: 1,
    name: "Default Attack",
    map: "Ascent",
    agents: [
      { name: "Jett", role: "Duelist", main_image: "/images/jett.webp" },
      { name: "Sova", role: "Initiator", main_image: "/images/sova.webp" },
      { name: "Omen", role: "Controller", main_image: "/images/omen.webp" },
      { name: "Killjoy", role: "Sentinel", main_image: "/images/killjoy.webp" },
      { name: "Skye", role: "Initiator", main_image: "/images/skye.webp" }
    ],
    strategy: "Focus on mid control with Sova recon and Jett entry",
    difficulty: "Medium"
  },
  {
    id: 2,
    name: "Fast B Push",
    map: "Bind",
    agents: [
      { name: "Raze", role: "Duelist", main_image: "/images/raze.webp" },
      { name: "Breach", role: "Initiator", main_image: "/images/breach.webp" },
      { name: "Brimstone", role: "Controller", main_image: "/images/brimstone.webp" },
      { name: "Cypher", role: "Sentinel", main_image: "/images/cypher.webp" },
      { name: "Phoenix", role: "Duelist", main_image: "/images/phoenix.webp" }
    ],
    strategy: "Quick B site execute with Breach stuns and Raze clearing corners",
    difficulty: "Easy"
  },
  {
    id: 3,
    name: "Split Defense",
    map: "Split",
    agents: [
      { name: "Viper", role: "Controller", main_image: "/images/viper.webp" },
      { name: "Sage", role: "Sentinel", main_image: "/images/sage.webp" },
      { name: "Chamber", role: "Sentinel", main_image: "/images/chamber.webp" },
      { name: "KAY/O", role: "Initiator", main_image: "/images/kayo.webp" },
      { name: "Fade", role: "Initiator", main_image: "/images/fade.webp" }
    ],
    strategy: "Strong mid control with double sentinel setup for site lockdown",
    difficulty: "Hard"
  }
];

module.exports = compositions; 