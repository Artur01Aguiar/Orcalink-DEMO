export type Product = {
  /** slug estável — usado como id de seção e âncora */
  id: string;
  /** nome grande, renderizado em Fredoka */
  name: string;
  /** linha curta acima do nome */
  eyebrow: string;
  /** frase de impacto abaixo do nome */
  tagline: string;
  /** parágrafo descritivo ao lado do produto */
  description: string;
  /** 3 atributos sensoriais exibidos como chips */
  notes: { label: string; value: string }[];
  /** imagens — troque os arquivos em /public/products mantendo os nomes */
  images: {
    /** embalagem recortada, fundo transparente */
    pack: string;
    /** bala isolada, fundo transparente — também é o sprite da chuva */
    solo: string;
    /** textura com várias balas, usada no fundo da seção */
    pile: string;
  };
  /** paleta da seção */
  theme: {
    from: string;
    to: string;
    accent: string;
    /** cor do texto sobre o gradiente */
    ink: string;
  };
  /** ajuste fino da chuva de balas desse produto */
  rain: {
    /** tamanho base do sprite em px */
    size: number;
    /** quantas balas por segundo no pico */
    rate: number;
    /** giro máximo em graus por segundo */
    spin: number;
  };
};

export const BRAND = {
  red: "#E4002B",
  blue: "#0057B8",
  yellow: "#FFD200",
  cream: "#FFF8EC",
  ink: "#1B1B1F",
} as const;

export const PRODUCTS: Product[] = [
  {
    id: "ursinhos",
    name: "Ursinhos",
    eyebrow: "O clássico",
    tagline: "O primeiro amor de todo mundo.",
    description:
      "O ursinho de goma que abriu a porta do mundo Fini. Massa macia, mordida elástica e um sortido de frutas que ninguém consegue comer só um. É o produto que ensina o resto do portfólio a se comportar.",
    notes: [
      { label: "Textura", value: "Goma macia" },
      { label: "Sabor", value: "Frutas sortidas" },
      { label: "Formato", value: "Ursinho clássico" },
    ],
    images: {
      pack: "/products/ursinhos-pack.png",
      solo: "/products/ursinhos-solo.png",
      pile: "/products/ursinhos-pile.jpg",
    },
    theme: { from: "#F7A81B", to: "#E8452B", accent: "#FFE28A", ink: "#3A1200" },
    rain: { size: 74, rate: 26, spin: 90 },
  },
  {
    id: "minhocas",
    name: "Minhocas",
    eyebrow: "O ícone",
    tagline: "Compridas, coloridas, impossíveis de resistir.",
    description:
      "Duas cores torcidas em uma minhoca só. Estica, enrola, some. A Minhoca é o produto mais reconhecível da Fini e o que transformou goma em brincadeira antes de virar doce.",
    notes: [
      { label: "Textura", value: "Goma elástica" },
      { label: "Sabor", value: "Frutas bicolores" },
      { label: "Formato", value: "Minhoca torcida" },
    ],
    images: {
      pack: "/products/minhocas-pack.png",
      solo: "/products/minhocas-solo.png",
      pile: "/products/minhocas-pile.jpg",
    },
    theme: { from: "#FFD200", to: "#E8452B", accent: "#FFF3A8", ink: "#3A1A00" },
    rain: { size: 92, rate: 22, spin: 140 },
  },
  {
    id: "beijos",
    name: "Beijos",
    eyebrow: "O doce",
    tagline: "Morango e creme na medida certa.",
    description:
      "Duas camadas: a de cima com açúcar e morango, a de baixo cremosa e branquinha. O Beijos é o item mais macio da linha — feito para quem prefere doçura a acidez.",
    notes: [
      { label: "Textura", value: "Marshmallow e goma" },
      { label: "Sabor", value: "Morango com creme" },
      { label: "Cobertura", value: "Açúcar cristal" },
    ],
    images: {
      pack: "/products/beijos-pack.png",
      solo: "/products/beijos-solo.png",
      pile: "/products/beijos-pile.jpg",
    },
    theme: { from: "#FF3D7F", to: "#C2005A", accent: "#FFD3E4", ink: "#40001B" },
    rain: { size: 70, rate: 24, spin: 70 },
  },
  {
    id: "dentaduras",
    name: "Dentaduras",
    eyebrow: "O divertido",
    tagline: "A bala que sorri de volta.",
    description:
      "Ninguém come uma Dentadura sem antes colocar na boca e mostrar pra alguém. É doce e é piada — o formato virou marca registrada da Fini em recreio de escola no Brasil inteiro.",
    notes: [
      { label: "Textura", value: "Goma e marshmallow" },
      { label: "Sabor", value: "Morango com creme" },
      { label: "Formato", value: "Dentadura sorridente" },
    ],
    images: {
      pack: "/products/dentaduras-pack.png",
      solo: "/products/dentaduras-solo.png",
      pile: "/products/dentaduras-pile.jpg",
    },
    theme: { from: "#00A3E0", to: "#FF4D8D", accent: "#CDEEFF", ink: "#00243A" },
    rain: { size: 86, rate: 20, spin: 110 },
  },
  {
    id: "azedinhas",
    name: "Azedinhas",
    eyebrow: "O desafio",
    tagline: "Aperta o olho e pede a segunda.",
    description:
      "A Minhoca coberta de açúcar azedinho. O primeiro segundo é ácido, o resto é fruta. É o produto que divide a mesa entre quem aguenta e quem entrega o pacote.",
    notes: [
      { label: "Textura", value: "Goma com cristais" },
      { label: "Sabor", value: "Frutas azedas" },
      { label: "Cobertura", value: "Açúcar ácido" },
    ],
    images: {
      pack: "/products/azedinhas-pack.png",
      solo: "/products/azedinhas-solo.png",
      pile: "/products/azedinhas-pile.jpg",
    },
    theme: { from: "#8E44AD", to: "#2ECC71", accent: "#E8D3F5", ink: "#25003A" },
    rain: { size: 92, rate: 22, spin: 150 },
  },
];
