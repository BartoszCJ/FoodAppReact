import express from 'express';
import mongoose from 'mongoose';
import { Food } from './models/Food.js';
import bodyParser from 'body-parser';
import router from './login.js'
import User from './models/User.js';
import  { Meal }  from './models/Meals.js';

import authenticateToken, { authorizeRole } from './authenticateToken.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());


app.use('/login', router);


app.use(bodyParser.json());



mongoose.connect("mongodb://localhost:27017/Food", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Naprawa błędu z dostępem na inny host
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
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

app.post('/api/foods', async (req, res) => {
  try {
    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).send(newFood);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


app.delete('/api/foods/:id', authorizeRole(['admin']),async (req, res) => {
    try {
      const { id } = req.params;
      const deletedFood = await Food.findByIdAndDelete(id);
  
      if (deletedFood) {
        res.status(200).json({ message: 'Produkt usunięty' });
      } else {
        res.status(404).json({ message: 'Produkt nie znaleziony' });
      }
    } catch (error) {
      console.error('Błąd usuwania produktu:', error);
      res.status(500).send("Server Error");
    }
  });

  app.post('/user/info', authenticateToken, async (req, res) => {
    const { height, weight, old, gender, activitylvl } = req.body;
    try {
        const username = req.user.username;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.height = height;
        user.weight = weight;
        user.old = old;
        user.gender = gender;
        user.activitylvl = activitylvl;
        await user.save();

        res.status(200).send('Survey data saved successfully');
    } catch (error) {
        console.error('Error saving survey data:', error);
        res.status(500).send('Internal server error');
    }
});

app.get("/user/info", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal server error');
  }
});


app.put('/user/info', authenticateToken, async (req, res) => {
  const { height, weight, old, gender, activitylvl } = req.body;
  try {
      const username = req.user.username;
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).send('User not found');
      }

      user.height = height;
      user.weight = weight;
      user.old = old;
      user.gender = gender;
      user.activitylvl = activitylvl;
      await user.save();

      res.status(200).send('User data updated successfully');
  } catch (error) {
      console.error('Error updating user data:', error);
      res.status(500).send('Internal server error');
  }
});


app.post('/api/meals', authenticateToken, async (req, res) => {
  const { mealType, foodId, quantity } = req.body;
  const userId = req.user._id;

  console.log(mealType, foodId, quantity, userId);
console.log('User ID:', userId);
  try {
    let meal = await Meal.findOne({ userId, date: new Date().setHours(0, 0, 0, 0), type: mealType });

    if (!meal) {
      meal = new Meal({
        userId,
        date: new Date().setHours(0, 0, 0, 0),
        type: mealType,
        foodItems: []
      });
    }

    meal.foodItems.push({ foodId, quantity });
    await meal.save();

    res.status(201).send(meal);
  } catch (error) {
    console.error('Error saving meal data:', error);
    res.status(500).send('Internal server error');
  }
});



app.get('/api/meals', authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const today = new Date().setHours(0, 0, 0, 0);

  try {
    const meals = await Meal.find({
      userId,
      date: today
    }).populate('foodItems.foodId');
    res.send(meals);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
