import burger from "@/assets/cat-burgers.jpg";
import pizza from "@/assets/cat-pizza.jpg";
import sides from "@/assets/cat-sides.jpg";
import drinks from "@/assets/cat-drinks.jpg";
import chicken from "@/assets/p-chicken.jpg";
import rings from "@/assets/p-rings.jpg";
import shake from "@/assets/p-shake.jpg";
import hero from "@/assets/hero-burger.jpg";

export type Category = "Burgers" | "Pizza" | "Sides" | "Drinks";

export type Modifier = {
  id: string;
  name: string;
  price: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  type: "single" | "multi";
  required?: boolean;
  options: Modifier[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  rating: number;
  reviews: number;
  trending?: boolean;
  modifiers?: ModifierGroup[];
};

export const categories: { name: Category; image: string; tagline: string }[] = [
  { name: "Burgers", image: burger, tagline: "Stacked & sizzling" },
  { name: "Pizza", image: pizza, tagline: "Wood-fired perfection" },
  { name: "Sides", image: sides, tagline: "Crisp & golden" },
  { name: "Drinks", image: drinks, tagline: "Ice-cold refresh" },
];

const standardMods: ModifierGroup[] = [
  {
    id: "size",
    name: "Choose Size",
    type: "single",
    required: true,
    options: [
      { id: "reg", name: "Regular", price: 0 },
      { id: "med", name: "Medium", price: 1.5 },
      { id: "lrg", name: "Large", price: 3 },
    ],
  },
  {
    id: "extras",
    name: "Add Extras",
    type: "multi",
    options: [
      { id: "cheese", name: "Extra Cheese", price: 1.25 },
      { id: "bacon", name: "Crispy Bacon", price: 2 },
      { id: "jal", name: "Jalapeños", price: 0.75 },
      { id: "avo", name: "Avocado", price: 1.5 },
    ],
  },
  {
    id: "remove",
    name: "Remove",
    type: "multi",
    options: [
      { id: "no-onion", name: "No Onions", price: 0 },
      { id: "no-pickle", name: "No Pickles", price: 0 },
      { id: "no-sauce", name: "No Sauce", price: 0 },
    ],
  },
  {
    id: "meal",
    name: "Make it a Meal",
    type: "single",
    options: [
      { id: "none", name: "Just the item", price: 0 },
      { id: "fries-drink", name: "+ Fries & Drink", price: 4.5 },
    ],
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Hutt Signature Double",
    description: "Two smashed beef patties, double American cheese, special sauce, brioche bun.",
    price: 12.99,
    image: hero,
    category: "Burgers",
    rating: 4.9,
    reviews: 1284,
    trending: true,
    modifiers: standardMods,
  },
  {
    id: "p2",
    name: "Nashville Heat Chicken",
    description: "Buttermilk-fried chicken, fiery glaze, slaw, pickles on toasted brioche.",
    price: 11.49,
    image: chicken,
    category: "Burgers",
    rating: 4.8,
    reviews: 932,
    trending: true,
    modifiers: standardMods,
  },
  {
    id: "p3",
    name: "Margherita Forno",
    description: "San Marzano tomato, fior di latte, fresh basil, 72-hour dough.",
    price: 14.5,
    image: pizza,
    category: "Pizza",
    rating: 4.9,
    reviews: 671,
    trending: true,
    modifiers: [standardMods[0], standardMods[1]],
  },
  {
    id: "p4",
    name: "Pepperoni Inferno",
    description: "Cup-and-char pepperoni, hot honey drizzle, smoked mozzarella.",
    price: 16.0,
    image: pizza,
    category: "Pizza",
    rating: 4.7,
    reviews: 514,
    modifiers: [standardMods[0], standardMods[1]],
  },
  {
    id: "p5",
    name: "Truffle Parm Fries",
    description: "Hand-cut Idaho fries, white truffle oil, parmigiano, fresh herbs.",
    price: 6.5,
    image: sides,
    category: "Sides",
    rating: 4.8,
    reviews: 1102,
    trending: true,
    modifiers: [standardMods[0]],
  },
  {
    id: "p6",
    name: "Beer-Battered Onion Rings",
    description: "Thick cut, crispy beer batter, smoked aioli on the side.",
    price: 5.75,
    image: rings,
    category: "Sides",
    rating: 4.6,
    reviews: 488,
    modifiers: [standardMods[0]],
  },
  {
    id: "p7",
    name: "Midnight Cola",
    description: "Craft cola over hand-chipped ice with a twist of citrus.",
    price: 3.25,
    image: drinks,
    category: "Drinks",
    rating: 4.5,
    reviews: 312,
    modifiers: [standardMods[0]],
  },
  {
    id: "p8",
    name: "Belgian Choco Shake",
    description: "Hand-spun shake with Belgian dark chocolate and whipped cream.",
    price: 5.5,
    image: shake,
    category: "Drinks",
    rating: 4.9,
    reviews: 829,
    trending: true,
    modifiers: [standardMods[0]],
  },
];
