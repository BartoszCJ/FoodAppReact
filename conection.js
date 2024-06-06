import express from "express";
import mongoose from "mongoose";
import { Food } from "./models/Food.js";
import bodyParser from "body-parser";
import router from "./login.js";
import User from "./models/User.js";
import { Meal } from "./models/Meals.js";

import authenticateToken, { authorizeRole } from "./authenticateToken.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/login", router);

app.use(bodyParser.json());

mongoose.connect(
  "mongodb+srv://Tester123:UNCiTySShYEt6aUU@cluster0.4a7smvw.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//Naprawa błędu z dostępem na inny host
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
  next();
});

app.get("/api/Food", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post("/api/foods", async (req, res) => {
  try {
    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).send(newFood);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.delete("/api/foods/:id", authorizeRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFood = await Food.findByIdAndDelete(id);

    if (deletedFood) {
      res.status(200).json({ message: "Produkt usunięty" });
    } else {
      res.status(404).json({ message: "Produkt nie znaleziony" });
    }
  } catch (error) {
    console.error("Błąd usuwania produktu:", error);
    res.status(500).send("Server Error");
  }
});

app.post("/user/info", authenticateToken, async (req, res) => {
  const { height, weight, old, gender, activitylvl } = req.body;
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.height = height;
    user.weight = weight;
    user.old = old;
    user.gender = gender;
    user.activitylvl = activitylvl;
    await user.save();

    res.status(200).send("Survey data saved successfully");
  } catch (error) {
    console.error("Error saving survey data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/info", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.put("/user/info", authenticateToken, async (req, res) => {
  const { height, weight, old, gender, activitylvl } = req.body;
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.height = height;
    user.weight = weight;
    user.old = old;
    user.gender = gender;
    user.activitylvl = activitylvl;
    await user.save();

    res.status(200).send("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/meals", authenticateToken, async (req, res) => {
  const {
    mealType,
    foodId,
    quantity,
    Nazwa,
    Kcal,
    Jednostka,
    Ilosc_tluszczu,
    Ilosc_bialka,
    Ilosc_weglowodanow,
    Rodzaj,
  } = req.body;
  const userId = req.user._id;

  console.log(
    mealType,
    foodId,
    quantity,
    Nazwa,
    Kcal,
    Jednostka,
    Ilosc_tluszczu,
    Ilosc_bialka,
    Ilosc_weglowodanow,
    Rodzaj,
    userId
  );
  console.log("User ID:", userId);

  try {
    let meal = await Meal.findOne({
      userId,
      date: new Date().setHours(0, 0, 0, 0),
      type: mealType,
    });

    if (!meal) {
      meal = new Meal({
        userId,
        date: new Date().setHours(0, 0, 0, 0),
        type: mealType,
        foodItems: [],
      });
    }

    meal.foodItems.push({
      foodId,
      quantity,
      Nazwa,
      Kcal,
      Jednostka,
      Ilosc_tluszczu,
      Ilosc_bialka,
      Ilosc_weglowodanow,
      Rodzaj,
    });
    await meal.save();

    res.status(201).send(meal);
  } catch (error) {
    console.error("Error saving meal data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/api/meals", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const today = new Date().setHours(0, 0, 0, 0);

  try {
    const meals = await Meal.find({
      userId,
      date: today,
    }).populate("foodItems.foodId");
    res.send(meals);
    console.log(meals);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.delete(
  "/api/meals/:mealId/foods/:foodItemId",
  authenticateToken,
  async (req, res) => {
    const { mealId, foodItemId } = req.params;

    try {
      const meal = await Meal.findById(mealId);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      meal.foodItems.forEach((item, index) => {
        if (item.foodId.toString() === foodItemId) {
          meal.foodItems.splice(index, 1);
        }
      });

      await meal.save();

      res.status(200).json({ message: "Food item removed" });
    } catch (error) {
      console.error("Error deleting food from meal:", error);
      res.status(500).send("Server Error");
    }
  }
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
