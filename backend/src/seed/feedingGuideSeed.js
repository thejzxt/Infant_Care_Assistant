import mongoose from "mongoose";
import dotenv from "dotenv";
import FeedingGuide from "../models/FeedingGuide.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const guides = [

  /* 0–2 MONTHS */
  {
    ageFrom: 0,
    ageTo: 2,
    milkAmount: "60ml to 120ml",
    frequency: "8 to 12 times daily",
    breastFeeding:
      "Breastfeed on demand every 2–3 hours. Breast milk provides complete nutrition.",
    formulaFeeding:
      "60–120ml per feed every 3 hours.",
    solidFeeding: "Not recommended before 4 months.",
    cereals: "Not allowed.",
    fruits: "Not allowed.",
    vegetables: "Not allowed.",
    proteins: "Not allowed.",
    snacks: "Not allowed.",
    developmentNotes:
      "Breast milk or formula provides all nutrients required."
  },

  /* 2–4 MONTHS */
  {
    ageFrom: 2,
    ageTo: 4,
    milkAmount: "120ml to 180ml",
    frequency: "6 to 8 times daily",
    breastFeeding:
      "Continue breastfeeding every 3–4 hours.",
    formulaFeeding:
      "120–180ml per feed.",
    solidFeeding:
      "Not recommended unless pediatrician advises.",
    cereals: "Not recommended.",
    fruits: "Not recommended.",
    vegetables: "Not recommended.",
    proteins: "Not recommended.",
    snacks: "Not recommended.",
    developmentNotes:
      "Baby is still not physically ready for solids."
  },

  /* 4–6 MONTHS */
  {
    ageFrom: 4,
    ageTo: 6,
    milkAmount: "120ml to 240ml",
    frequency: "5 to 6 times daily",
    breastFeeding:
      "4 to 6 feedings per day.",
    formulaFeeding:
      "120–240ml per feed.",
    solidFeeding:
      "Possible if baby holds head up and weighs at least 5kg.",
    cereals:
      "3–5 tbsp single grain iron fortified cereal.",
    fruits:
      "1–2 tbsp plain strained fruits 1–2 times per day.",
    vegetables:
      "1–2 tbsp plain strained vegetables.",
    proteins:
      "1–2 tbsp strained proteins.",
    snacks:
      "Not recommended yet.",
    developmentNotes:
      "Start solids slowly and make cereal very soupy."
  },

  /* 6–8 MONTHS */
  {
    ageFrom: 6,
    ageTo: 8,
    milkAmount: "240ml",
    frequency: "3 to 4 times daily",
    breastFeeding:
      "3 to 5 feedings per day.",
    formulaFeeding:
      "240ml per feed.",
    solidFeeding:
      "Yes. Start soft foods like pureed vegetables, meats, fruits.",
    cereals:
      "5–8 tbsp iron fortified cereal.",
    fruits:
      "2–3 tbsp soft mashed fruits twice daily.",
    vegetables:
      "2–3 tbsp mashed vegetables twice daily.",
    proteins:
      "1–2 tbsp tender chopped meats twice daily.",
    snacks:
      "Plain yogurt, toast, soft finger foods.",
    developmentNotes:
      "Introduce one new food at a time."
  },

  /* 8–10 MONTHS */
  {
    ageFrom: 8,
    ageTo: 10,
    milkAmount: "240ml",
    frequency: "3 to 4 times daily",
    breastFeeding:
      "3–5 feedings daily.",
    formulaFeeding:
      "240ml per feed.",
    solidFeeding:
      "Mashed foods and soft finger foods.",
    cereals:
      "5–8 tbsp mixed cereal.",
    fruits:
      "2–4 tbsp mashed fruits.",
    vegetables:
      "2–4 tbsp soft bite-sized vegetables.",
    proteins:
      "2–3 tbsp finely chopped meats, fish without bones.",
    snacks:
      "Finger foods, cooked green beans, macaroni.",
    developmentNotes:
      "Eating more table foods."
  },

  /* 10–12 MONTHS */
  {
    ageFrom: 10,
    ageTo: 12,
    milkAmount: "240ml",
    frequency: "3 to 4 times daily",
    breastFeeding:
      "3–4 feedings daily.",
    formulaFeeding:
      "240ml per feed.",
    solidFeeding:
      "Table foods. Baby can feed self using spoon and cup.",
    cereals:
      "5–8 tbsp any variety.",
    fruits:
      "2–4 tbsp cooked mashed fruits.",
    vegetables:
      "Soft chopped vegetables.",
    proteins:
      "Table meats, fish, mild cheese.",
    snacks:
      "Finger foods, yogurt, mashed potatoes.",
    developmentNotes:
      "Baby transitions to family foods."
  }

];

const seedData = async () => {
  await FeedingGuide.deleteMany();
  await FeedingGuide.insertMany(guides);
  console.log("Feeding Guide Seeded");
  process.exit();
};

seedData();