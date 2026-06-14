import { useState, useEffect } from 'react';
import { 
  Heart, 
  X, 
  RotateCcw, 
  RotateCw, 
  FileText, 
  Trash2, 
  Utensils, 
  Clock, 
  SlidersHorizontal, 
  ChefHat, 
  CheckCircle,
  Copy
} from 'lucide-react';

interface Meal {
  id: string;
  title: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner';
  appliances: string[];
  effort: 'Low' | 'Medium' | 'High';
  time: string;
  image: string;
}

const INITIAL_MEALS: Meal[] = [
  // --- BREAKFAST (10) ---
  {
    id: 'b1',
    title: 'Air Fryer Chilaquiles Verdes',
    category: 'Breakfast',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '20 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2020/11/chilaquiles-verdes-small-7.jpg'
  },
  {
    id: 'b2',
    title: 'KitchenAid Fluffy Protein Waffles',
    category: 'Breakfast',
    appliances: ['KitchenAid'],
    effort: 'Medium',
    time: '15 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2020/01/waffles-recipe.jpg'
  },
  {
    id: 'b3',
    title: 'Sous Vide Bacon & Gruyère Egg Bites',
    category: 'Breakfast',
    appliances: ['Sous Vide'],
    effort: 'Low',
    time: '65 mins',
    image: 'https://www.simplyrecipes.com/thmb/pL2yQzZ80-mFpP6D-qJ6x6kXkX0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Egg-Bites-LEAD-03-9bb59fcd79df495ca9f564757e7bb704.jpg'
  },
  {
    id: 'b4',
    title: 'Panini Press Breakfast Torta',
    category: 'Breakfast',
    appliances: ['Panini Press'],
    effort: 'Low',
    time: '10 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2020/09/mexican-torta-recipe-small-7.jpg'
  },
  {
    id: 'b5',
    title: 'Oven-Baked Chorizo & Potato Hash',
    category: 'Breakfast',
    appliances: ['Oven'],
    effort: 'Medium',
    time: '30 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2019/11/chorizo-hash-small-1.jpg'
  },
  {
    id: 'b6',
    title: 'Air Fryer Rolled Chicken Taquitos',
    category: 'Breakfast',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '15 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2016/10/baked-chicken-taquitos-recipe-small-4.jpg'
  },
  {
    id: 'b7',
    title: 'KitchenAid Scratch Everything Bagels',
    category: 'Breakfast',
    appliances: ['KitchenAid', 'Oven'],
    effort: 'High',
    time: '120 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2020/05/bagel-recipe.jpg'
  },
  {
    id: 'b8',
    title: 'Sous Vide Shakshuka Poached Eggs',
    category: 'Breakfast',
    appliances: ['Sous Vide', 'Oven'],
    effort: 'Medium',
    time: '45 mins',
    image: 'https://www.gimmesomeoven.com/wp-content/uploads/2025/03/Shakshuka-7.jpg'
  },
  {
    id: 'b9',
    title: 'Panini Press Stuffed French Toast',
    category: 'Breakfast',
    appliances: ['Panini Press'],
    effort: 'Medium',
    time: '15 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2020/04/french-toast.jpg'
  },
  {
    id: 'b10',
    title: 'Oven Berry & Walnut Oatmeal Cake',
    category: 'Breakfast',
    appliances: ['Oven'],
    effort: 'Low',
    time: '40 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2023/05/baked-oatmeal-recipe.jpg'
  },

  // --- LUNCH (15) ---
  {
    id: 'l1',
    title: 'Panini Press Crisp Cubano (No Pickles)',
    category: 'Lunch',
    appliances: ['Panini Press'],
    effort: 'Low',
    time: '12 mins',
    image: 'https://www.recipetineats.com/tachyon/2019/08/Cuban-Sandwich-Cubano_4.jpg'
  },
  {
    id: 'l2',
    title: 'Air Fryer Panko Chicken Tenders',
    category: 'Lunch',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '20 mins',
    image: 'https://www.recipetineats.com/tachyon/2020/05/Crispy-Air-Fryer-Chicken-Tenders_5.jpg'
  },
  {
    id: 'l3',
    title: 'Sous Vide Turkey & Bacon Wrap',
    category: 'Lunch',
    appliances: ['Sous Vide'],
    effort: 'Low',
    time: '90 mins',
    image: 'https://www.simplyrecipes.com/thmb/vC5iLgNnQ0K-1H6t9eC2U7fCq9k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Turkey-Club-Wrap-LEAD-03-3b3fb3ffbc914f6b86fcfdb8b7f8f7c3.jpg'
  },
  {
    id: 'l4',
    title: 'KitchenAid Shredded Beef Street Tacos',
    category: 'Lunch',
    appliances: ['KitchenAid'],
    effort: 'Medium',
    time: '25 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2021/04/mexican-shredded-beef-tacos-small-6.jpg'
  },
  {
    id: 'l5',
    title: 'Panini Press Turkey Pesto Melt',
    category: 'Lunch',
    appliances: ['Panini Press'],
    effort: 'Low',
    time: '10 mins',
    image: 'https://www.recipetineats.com/tachyon/2016/11/Turkey-Panini_1.jpg'
  },
  {
    id: 'l6',
    title: 'Oven-Roasted Salmon Power Bowl',
    category: 'Lunch',
    appliances: ['Oven'],
    effort: 'Low',
    time: '20 mins',
    image: 'https://www.gimmesomeoven.com/wp-content/uploads/2017/01/Roasted-Salmon-Power-Bowl-Recipe-2.jpg'
  },
  {
    id: 'l7',
    title: 'Air Fryer Quesabirria Tortillas',
    category: 'Lunch',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '15 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2021/01/mexican-birria-recipe-small-5.jpg'
  },
  {
    id: 'l8',
    title: 'Sous Vide Chicken Caesar Salad',
    category: 'Lunch',
    appliances: ['Sous Vide'],
    effort: 'Low',
    time: '75 mins',
    image: 'https://www.recipetineats.com/tachyon/2016/05/Caesar-Salad_7.jpg'
  },
  {
    id: 'l9',
    title: 'Panini Press Chipotle Chicken Melt',
    category: 'Lunch',
    appliances: ['Panini Press'],
    effort: 'Low',
    time: '10 mins',
    image: 'https://www.simplyrecipes.com/thmb/X8mZ9PqY_4N_v4P5p_w3c3C6kX0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Chipotle-Chicken-Panini-LEAD-03-8fb59fcd79df495ca9f564757e7bb704.jpg'
  },
  {
    id: 'l10',
    title: 'Oven Sheet Pan Steak Fajitas',
    category: 'Lunch',
    appliances: ['Oven'],
    effort: 'Low',
    time: '20 mins',
    image: 'https://www.gimmesomeoven.com/wp-content/uploads/2018/06/Sheet-Pan-Steak-Fajitas-Recipe-5.jpg'
  },
  {
    id: 'l11',
    title: 'Air Fryer Falafel Pitas',
    category: 'Lunch',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '25 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2020/03/falafel.jpg'
  },
  {
    id: 'l12',
    title: 'KitchenAid Fresh Garlic Butter Pasta',
    category: 'Lunch',
    appliances: ['KitchenAid'],
    effort: 'High',
    time: '45 mins',
    image: 'https://www.recipetineats.com/tachyon/2021/02/Garlic-Butter-Pasta_2.jpg'
  },
  {
    id: 'l13',
    title: 'Sous Vide Pork Tenderloin Salad',
    category: 'Lunch',
    appliances: ['Sous Vide'],
    effort: 'Medium',
    time: '100 mins',
    image: 'https://www.recipetineats.com/tachyon/2015/05/Pork-Tenderloin-Salad_2.jpg'
  },
  {
    id: 'l14',
    title: 'Panini Press Caprese on Focaccia',
    category: 'Lunch',
    appliances: ['Panini Press'],
    effort: 'Low',
    time: '8 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2020/06/caprese-sandwich-1.jpg'
  },
  {
    id: 'l15',
    title: 'Oven High-Protein Egg Salad Slice',
    category: 'Lunch',
    appliances: ['Oven'],
    effort: 'Low',
    time: '15 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2019/04/vegan-egg-salad-scaled.jpg'
  },

  // --- DINNER (15) ---
  {
    id: 'd1',
    title: 'Sous Vide Perfect Ribeye Steak',
    category: 'Dinner',
    appliances: ['Sous Vide'],
    effort: 'Medium',
    time: '120 mins',
    image: 'https://www.recipetineats.com/tachyon/2019/07/Cheffy-Garlic-Butter-Steak_9.jpg'
  },
  {
    id: 'd2',
    title: 'KitchenAid Artisan Pizza Night',
    category: 'Dinner',
    appliances: ['KitchenAid', 'Oven'],
    effort: 'High',
    time: '180 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2019/07/homemade-pizza.jpg'
  },
  {
    id: 'd3',
    title: 'Air Fryer Enchiladas Verdes',
    category: 'Dinner',
    appliances: ['Air Fryer', 'Oven'],
    effort: 'Medium',
    time: '35 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2020/09/chicken-enchiladas-verdes-small-1.jpg'
  },
  {
    id: 'd4',
    title: 'Pressure Cooker Caldo de Pollo',
    category: 'Dinner',
    appliances: ['Pressure Cooker'],
    effort: 'Medium',
    time: '45 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2020/01/caldo-de-pollo-b-small-featured-1.jpg'
  },
  {
    id: 'd5',
    title: 'Sous Vide Glazed Pork Chops',
    category: 'Dinner',
    appliances: ['Sous Vide'],
    effort: 'Medium',
    time: '90 mins',
    image: 'https://www.recipetineats.com/tachyon/2018/09/Pork-Chops-with-Gravy_11.jpg'
  },
  {
    id: 'd6',
    title: 'Air Fryer Crispy Fish Tacos',
    category: 'Dinner',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '25 mins',
    image: 'https://www.recipetineats.com/tachyon/2016/05/Fish-Tacos_6.jpg'
  },
  {
    id: 'd7',
    title: 'KitchenAid Scratch Chicken Pho',
    category: 'Dinner',
    appliances: ['KitchenAid', 'Oven'],
    effort: 'High',
    time: '240 mins',
    image: 'https://www.recipetineats.com/tachyon/2019/04/Chicken-Pho_5.jpg'
  },
  {
    id: 'd8',
    title: 'Oven-Baked Homemade Beef Gorditas',
    category: 'Dinner',
    appliances: ['Oven'],
    effort: 'High',
    time: '50 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2018/04/gorditas-recipe-small-12-e1523448895712.jpg'
  },
  {
    id: 'd9',
    title: 'Sous Vide Mongolian Beef Stir-Fry',
    category: 'Dinner',
    appliances: ['Sous Vide'],
    effort: 'Medium',
    time: '60 mins',
    image: 'https://www.recipetineats.com/tachyon/2016/02/Mongolian-Beef_7.jpg'
  },
  {
    id: 'd10',
    title: 'Air Fryer Stuffed Poblano Peppers',
    category: 'Dinner',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '30 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2021/08/chiles-rellenos-recipe-small-6.jpg'
  },
  {
    id: 'd11',
    title: 'KitchenAid Ricotta & Spinach Ravioli',
    category: 'Dinner',
    appliances: ['KitchenAid'],
    effort: 'High',
    time: '60 mins',
    image: 'https://cdn.loveandlemons.com/wp-content/uploads/opengraph/2020/03/homemade-ravioli.jpg'
  },
  {
    id: 'd12',
    title: 'Sous Vide Teriyaki Salmon Fillet',
    category: 'Dinner',
    appliances: ['Sous Vide', 'Oven'],
    effort: 'Low',
    time: '45 mins',
    image: 'https://www.recipetineats.com/tachyon/2017/04/Easy-Teriyaki-Salmon_3.jpg'
  },
  {
    id: 'd13',
    title: 'Oven Crispy Spatchcock Chicken',
    category: 'Dinner',
    appliances: ['Oven'],
    effort: 'Medium',
    time: '75 mins',
    image: 'https://www.recipetineats.com/tachyon/2016/05/Roast-Chicken_6a.jpg'
  },
  {
    id: 'd14',
    title: 'Air Fryer Carne Asada Loaded Fries',
    category: 'Dinner',
    appliances: ['Air Fryer'],
    effort: 'Medium',
    time: '25 mins',
    image: 'https://www.isabeleats.com/wp-content/uploads/2023/05/carne-asada-fries-10.jpg'
  },
  {
    id: 'd15',
    title: 'Sous Vide Duck Breast Gastrique',
    category: 'Dinner',
    appliances: ['Sous Vide'],
    effort: 'High',
    time: '90 mins',
    image: 'https://www.recipetineats.com/tachyon/2016/09/Duck-Breast-with-Orange-Sauce_7.jpg'
  }
];

// Complete lookup database for all 40 recipes
const MEAL_RECIPES_DETAILS: Record<string, { ingredients: string[]; instructions: string[] }> = {
  // Breakfasts
  b1: {
    ingredients: ['Corn Tortillas', 'Tomatillos', 'Serrano Peppers', 'Cilantro', 'Cotija Cheese', 'Mexican Crema'],
    instructions: ['Air fry tortilla wedges with light oil spray at 380°F until crispy.', 'Boil tomatillos and serrano peppers, then blend with cilantro & garlic.', 'Toss warm air-fried chips with salsa verde.', 'Garnish with crumbled cotija, crema, and onion slices.']
  },
  b2: {
    ingredients: ['Protein Powder (Vanilla)', 'Oat Flour', 'Greek Yogurt', 'Egg Whites', 'Baking Powder', 'Almond Milk'],
    instructions: ['Whip egg whites to stiff peaks in the KitchenAid stand mixer.', 'Fold in protein powder, oat flour, yogurt, and milk.', 'Pour into preheated waffle iron.', 'Cook until golden-brown and serve with sugar-free maple syrup.']
  },
  b3: {
    ingredients: ['Eggs', 'Gruyère Cheese', 'Crisp Bacon Bits', 'Cottage Cheese', 'Pinch of Salt'],
    instructions: ['Blend eggs, cottage cheese, gruyère, and salt until completely smooth.', 'Pour into greased small canning jars, adding bacon bits to each.', 'Seal jars finger-tight and place in sous vide water bath at 172°F (77.8°C) for 65 mins.', 'Let cool slightly, run a knife around edge to release, and serve.']
  },
  b4: {
    ingredients: ['Bolillo Roll', 'Eggs', 'Chorizo', 'Refried Beans', 'Oaxaca Cheese', 'Avocado'],
    instructions: ['Scramble eggs with chorizo in a pan.', 'Slice bolillo roll, spread with warm refried beans, egg-chorizo mix, and cheese.', 'Press in the panini press at high heat for 5-8 minutes until golden and cheese melty.', 'Add fresh avocado slices before serving.']
  },
  b5: {
    ingredients: ['Yukon Gold Potatoes', 'Mexican Chorizo', 'Red Bell Pepper', 'Onion', 'Eggs', 'Cilantro'],
    instructions: ['Dice potatoes, toss with olive oil, salt, and spices.', 'Spread potatoes, sliced pepper, onions, and crumbled chorizo on sheet pan.', 'Bake in preheated oven at 400°F (204°C) for 20 minutes.', 'Crack eggs directly onto hash, bake 8-10 more minutes until whites set. Garnish with cilantro.']
  },
  b6: {
    ingredients: ['Corn Tortillas', 'Shredded Chicken Breast', 'Spices (Cumin, Garlic, Chili Powder)', 'Montery Jack Cheese', 'Salsa'],
    instructions: ['Warm tortillas so they are pliable, then fill with chicken and cheese.', 'Roll up tightly and place seam side down in the air fryer basket.', 'Spray lightly with olive oil and air fry at 400°F for 8-10 minutes.', 'Serve hot with salsa and sour cream.']
  },
  b7: {
    ingredients: ['High Gluten Bread Flour', 'Everything Bagel Seasoning', 'Yeast', 'Warm Water', 'Barley Malt Syrup', 'Salt'],
    instructions: ['Knead dough in KitchenAid bowl with dough hook for 10 minutes.', 'Proof dough, shape into bagels, and let rise for 30 minutes.', 'Boil in malted water for 1 minute per side.', 'Coat with everything bagel seasoning and bake at 425°F for 20 minutes.']
  },
  b8: {
    ingredients: ['Shakshuka Tomato Pepper Base', 'Fresh Eggs', 'Feta Cheese', 'Cilantro', 'Warm Crusty Bread'],
    instructions: ['Prepare spicy shakshuka bell pepper and tomato base on the stovetop.', 'Place eggs in a sous vide bath at 145°F (62.8°C) for 45 minutes.', 'Pour hot tomato sauce base into serving dishes and gently crack cooked sous vide eggs on top.', 'Garnish with crumbled feta, fresh cilantro, and serve with warm bread.']
  },
  b9: {
    ingredients: ['Brioche Bread', 'Cream Cheese', 'Fresh Berries', 'Eggs', 'Heavy Cream', 'Maple Syrup'],
    instructions: ['Slice brioche thick and cut a pocket; stuff with cream cheese and berries.', 'Whisk eggs, cream, cinnamon, and vanilla.', 'Dip stuffed slices in egg mixture.', 'Press in the panini press for 4-5 minutes until golden brown. Serve with maple syrup.']
  },
  b10: {
    ingredients: ['Rolled Oats', 'Walnuts', 'Mixed Berries', 'Bananas', 'Almond Milk', 'Chia Seeds'],
    instructions: ['Mash bananas in a bowl, stir in oats, walnuts, milk, and chia seeds.', 'Fold in fresh berries carefully.', 'Spread into a greased baking pan.', 'Bake in preheated oven at 375°F (190°C) for 35-40 minutes until golden on top.']
  },

  // Lunches
  l1: {
    ingredients: ['Cuban Bread', 'Slow-Roasted Pork', 'Sliced Ham', 'Swiss Cheese', 'Yellow Mustard', 'Butter'],
    instructions: ['Slice bread horizontally and spread mustard on both sides.', 'Layer roasted pork, ham, and swiss cheese.', 'Brush outside of bread with melted butter.', 'Press in panini press at medium-high for 8-10 minutes until crispy. No pickles!']
  },
  l2: {
    ingredients: ['Chicken Breast Strips', 'Panko Breadcrumbs', 'Flour & Eggs', 'Garlic Powder', 'Paprika', 'Olive Oil Spray'],
    instructions: ['Dredge chicken strips in seasoned flour, beaten eggs, and then panko.', 'Place in air fryer basket in a single layer.', 'Spray generously with olive oil.', 'Air fry at 400°F (204°C) for 12-15 minutes, flipping halfway.']
  },
  l3: {
    ingredients: ['Turkey Breast', 'Smoked Bacon Slices', 'Flour Tortilla', 'Romaine Lettuce', 'Avocado', 'Ranch Dressing'],
    instructions: ['Cook turkey breast sous vide at 145°F (62.8°C) for 90 minutes; slice thinly.', 'Crisp bacon in a skillet.', 'Lay out tortilla, spread ranch, and arrange turkey, bacon, lettuce, and avocado.', 'Wrap tightly and slice diagonally to serve.']
  },
  l4: {
    ingredients: ['Beef Chuck Roast', 'Corn Tortillas', 'White Onion', 'Fresh Cilantro', 'Lime Wedges', 'Mexican Spices'],
    instructions: ['Shred slow-cooked chuck roast in KitchenAid with the paddle attachment.', 'Warm corn tortillas on a hot griddle.', 'Heap shredded beef onto tortillas.', 'Top with chopped onions, fresh cilantro, and squeeze fresh lime juice on top.']
  },
  l5: {
    ingredients: ['Sourdough Bread', 'Sliced Turkey Breast', 'Basil Pesto', 'Provolone Cheese', 'Tomato Slices'],
    instructions: ['Spread pesto on sourdough bread slices.', 'Layer turkey breast, provolone, and tomato.', 'Assemble sandwich and brush outer crust with olive oil.', 'Press in preheated panini press for 8-10 minutes until bread is toasted and cheese is melted.']
  },
  l6: {
    ingredients: ['Salmon Fillet', 'Quinoa', 'Kale', 'Edamame', 'Avocado', 'Lemon Tahini Dressing'],
    instructions: ['Roast salmon fillet in the oven at 400°F for 12-15 minutes.', 'Steam edamame and cook quinoa.', 'Assemble power bowl with kale, quinoa, avocado, edamame, and salmon.', 'Drizzle with lemon tahini dressing before serving.']
  },
  l7: {
    ingredients: ['Corn Tortillas', 'Birria Beef Strained', 'Consommé Soup', 'Chihuahua Cheese', 'Cilantro', 'Onions'],
    instructions: ['Dip corn tortillas in the birria fat/consommé.', 'Place on hot air fryer tray, fill with cheese and birria beef, and fold.', 'Air fry at 400°F for 8 minutes until crispy.', 'Serve hot with a cup of warm consommé, onion, and cilantro for dipping.']
  },
  l8: {
    ingredients: ['Chicken Breast', 'Romaine Lettuce', 'Parmesan Cheese', 'Croutons', 'Creamy Caesar Dressing'],
    instructions: ['Sous vide chicken breast at 145°F (62.8°C) for 75 minutes.', 'Let chicken cool, then slice into strips.', 'Toss chopped romaine lettuce with Caesar dressing, croutons, and parmesan.', 'Top salad with sliced chicken breast.']
  },
  l9: {
    ingredients: ['Focaccia Bread', 'Grilled Chicken Strips', 'Chipotle Mayo', 'Pepper Jack Cheese', 'Red Onion'],
    instructions: ['Slice focaccia and spread chipotle mayo on both sides.', 'Layer chicken strips, pepper jack cheese, and red onions.', 'Close sandwich and press in panini press.', 'Press for 6-8 minutes until golden brown.']
  },
  l10: {
    ingredients: ['Flank Steak', 'Bell Peppers', 'Red Onion', 'Fajita Seasoning', 'Flour Tortillas', 'Olive Oil'],
    instructions: ['Slice steak, peppers, and onions into thin strips.', 'Toss with olive oil and fajita seasoning on a sheet pan.', 'Bake in preheated oven at 425°F for 15-20 minutes.', 'Serve with warm flour tortillas and sour cream.']
  },
  l11: {
    ingredients: ['Falafel Balls', 'Pita Bread', 'Hummus', 'Cucumber Tomato Salad', 'Tahini Sauce'],
    instructions: ['Air fry prepared falafel balls at 375°F for 10-12 minutes.', 'Warm pita bread and cut open to form pockets.', 'Spread hummus inside pita and stuff with falafel.', 'Top with cucumber tomato salad and drizzle with tahini sauce.']
  },
  l12: {
    ingredients: ['Fettuccine Pasta Flour', 'Fresh Eggs', 'Garlic Cloves', 'Salted Butter', 'Parmesan Cheese', 'Parsley'],
    instructions: ['Make fresh pasta dough in KitchenAid with pasta press attachment.', 'Boil fresh pasta for 2-3 minutes in salted water.', 'Sauté minced garlic in butter until fragrant.', 'Toss pasta with garlic butter, parmesan, and parsley.']
  },
  l13: {
    ingredients: ['Pork Tenderloin', 'Mixed Baby Greens', 'Cherry Tomatoes', 'Vinaigrette Dressing', 'Garlic & Herbs'],
    instructions: ['Sous vide seasoned pork tenderloin at 140°F (60°C) for 100 minutes.', 'Sear tenderloin quickly in a hot pan for crust.', 'Slice pork into medallions.', 'Arrange over mixed greens and tomatoes, then drizzle with vinaigrette.']
  },
  l14: {
    ingredients: ['Focaccia Bread', 'Fresh Mozzarella', 'Heirloom Tomatoes', 'Fresh Basil leaves', 'Balsamic Glaze'],
    instructions: ['Slice focaccia bread horizontally.', 'Layer fresh mozzarella, tomato slices, and basil leaves inside.', 'Press in the panini press for 5-7 minutes until cheese melts.', 'Drizzle with balsamic glaze inside and serve warm.']
  },
  l15: {
    ingredients: ['Hard Boiled Eggs', 'Greek Yogurt', 'Dijon Mustard', 'Celery', 'Fresh Chives', 'High Protein Toast'],
    instructions: ['Mash hard boiled eggs with yogurt, mustard, chopped celery, and chives.', 'Spread evenly on a baking sheet and bake at 350°F for 15 minutes to set.', 'Let cool and slice into portions.', 'Serve over toasted high-protein bread.']
  },

  // Dinners
  d1: {
    ingredients: ['Thick-Cut Ribeye', 'Fresh Rosemary', 'Thyme', 'Garlic Cloves', 'Butter', 'Sea Salt'],
    instructions: ['Season ribeye generously with salt and pepper.', 'Seal in vacuum bag with rosemary, thyme, garlic, and butter.', 'Sous vide cook at 131°F (55°C) for 2 hours for medium-rare.', 'Sear in a ripping hot cast-iron skillet for 1 minute per side. Baste with butter.']
  },
  d2: {
    ingredients: ['Pizza Dough Flour', 'San Marzano Tomatoes', 'Fresh Mozzarella', 'Basil Leaves', 'Olive Oil'],
    instructions: ['Knead dough ingredients in KitchenAid bowl with dough hook for 10 mins.', 'Let proof for 2 hours at room temp.', 'Stretch dough thin, top with crushed tomatoes and mozzarella.', 'Bake in preheated oven on preheated pizza stone at 500°F (260°C) for 10-12 mins. Garnish with fresh basil.']
  },
  d3: {
    ingredients: ['Corn Tortillas', 'Shredded Chicken', 'Salsa Verde', 'Monterey Jack Cheese', 'Crema', 'Cilantro'],
    instructions: ['Roll shredded chicken into tortillas and arrange in baking dish.', 'Pour salsa verde over the top and cover with Monterey Jack cheese.', 'Bake in oven at 375°F for 20 minutes until cheese is bubbly.', 'Finish in air fryer for 3 minutes for crispy edges. Garnish with crema and cilantro.']
  },
  d4: {
    ingredients: ['Chicken Quarters', 'Yukon Gold Potatoes', 'Carrots', 'Zucchini', 'Celery', 'Cilantro'],
    instructions: ['Place chicken, chopped vegetables, and water in pressure cooker.', 'Season with salt, garlic, and cumin.', 'Seal and cook under high pressure for 25 minutes.', 'Release pressure, add fresh cilantro, and serve hot.']
  },
  d5: {
    ingredients: ['Bone-in Pork Chops', 'Brown Sugar', 'Apple Cider Vinegar', 'Dijon Mustard', 'Garlic', 'Butter'],
    instructions: ['Sous vide pork chops at 140°F (60°C) for 90 minutes.', 'Simmer sugar, vinegar, and mustard to create glaze.', 'Sear pork chops in hot butter, brushing glaze on both sides.', 'Spoon pan drippings over chops and serve.']
  },
  d6: {
    ingredients: ['Cod Fillets', 'Corn Tortillas', 'Shredded Cabbage', 'Chipotle Lime Crema', 'Cilantro', 'Lime'],
    instructions: ['Bread cod fillets and air fry at 400°F for 12 minutes until crispy.', 'Warm corn tortillas.', 'Assemble tacos with fish, cabbage, and chipotle crema.', 'Garnish with cilantro and serve with lime wedges.']
  },
  d7: {
    ingredients: ['Rice Noodles', 'Chicken Bones & Meat', 'Ginger', 'Star Anise', 'Fish Sauce', 'Fresh Basil & Sprouts'],
    instructions: ['Roast ginger and onions, then simmer with chicken bones in pressure cooker for broth.', 'Strain broth and season with fish sauce.', 'Boil rice noodles and place in serving bowls with shredded chicken.', 'Pour boiling hot broth over noodles; garnish with herbs and bean sprouts.']
  },
  d8: {
    ingredients: ['Masa Harina', 'Warm Water', 'Shredded Beef / Birria', 'Refried Beans', 'Queso Cotija'],
    instructions: ['Mix masa harina with water and salt; form thick patties.', 'Bake on a hot griddle, then slice open to create a pocket.', 'Stuff with warm refried beans and shredded beef.', 'Warm in oven for 5 minutes; top with cotija cheese.']
  },
  d9: {
    ingredients: ['Flank Steak', 'Soy Sauce', 'Brown Sugar', 'Garlic & Ginger', 'Green Onions', 'Cornstarch'],
    instructions: ['Slice steak thin, toss with cornstarch, and sous vide at 135°F for 60 minutes.', 'Toss steak in a hot pan with sauce.', 'Fold in green onions and serve with steamed rice.']
  },
  d10: {
    ingredients: ['Poblano Peppers', 'Monterey Jack Cheese', 'Black Beans & Corn', 'Spiced Salsa', 'Cilantro'],
    instructions: ['Char poblano peppers in the air fryer at 400°F for 8 minutes; peel skin.', 'Cut a slit and stuff with cheese, beans, and corn.', 'Air fry at 375°F for 6 minutes until cheese is completely melted.', 'Serve hot topped with fresh salsa.']
  },
  d11: {
    ingredients: ['Pasta Flour', 'Eggs', 'Ricotta Cheese', 'Fresh Spinach', 'Nutmeg', 'Marinara Sauce'],
    instructions: ['Whip ricotta, cooked spinach, nutmeg, and eggs in KitchenAid stand mixer.', 'Roll pasta sheet thin and place mounds of filling.', 'Cover with second sheet, seal, and cut into ravioli.', 'Boil ravioli for 3 minutes and toss in hot marinara.']
  },
  d12: {
    ingredients: ['Salmon Fillet', 'Teriyaki Sauce', 'Sesame Seeds', 'Green Onion', 'Broccoli Florets'],
    instructions: ['Sous vide salmon fillet at 122°F (50°C) for 45 minutes.', 'Brush salmon with sweet teriyaki glaze.', 'Broil in oven for 2 minutes to caramelize.', 'Garnish with sesame seeds and green onions; serve with broccoli.']
  },
  d13: {
    ingredients: ['Whole Chicken', 'Garlic Herb Butter', 'Lemon', 'Spices (Paprika, Rosemary)', 'Roasting Veggies'],
    instructions: ['Spatchcock the chicken by removing backbone and pressing flat.', 'Rub garlic herb butter under the skin.', 'Place on top of roasting vegetables on a sheet pan.', 'Roast in oven at 400°F (204°C) for 60-75 minutes.']
  },
  d14: {
    ingredients: ['French Fries', 'Carne Asada Steak', 'Guacamole', 'Sour Cream', 'Cheddar Cheese Blend'],
    instructions: ['Air fry frozen french fries at 400°F for 15-20 minutes until extra crispy.', 'Grill carne asada and slice into bite-sized pieces.', 'Top hot fries with cheese, carne asada, and return to air fryer to melt cheese.', 'Finish with dollops of fresh guacamole and sour cream.']
  },
  d15: {
    ingredients: ['Duck Breast', 'Orange Juice', 'Grand Marnier', 'Honey', 'Butter', 'Fresh Thyme'],
    instructions: ['Score duck breast skin and sous vide at 135°F (57.2°C) for 90 minutes.', 'Sear skin side down in a cold pan, raising heat to render fat until crispy.', 'Reduce orange juice, honey, and Grand Marnier to a syrup.', 'Slice duck breast, fan on plate, and drizzle with gastrique.']
  }
};

const getMealDetails = (meal: Meal) => {
  return MEAL_RECIPES_DETAILS[meal.id] || { ingredients: [], instructions: [] };
};

export default function MealSwiperApp() {
  // Persistence state
  const [swipedIds, setSwipedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('food_tinder_swiped_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [keptIds, setKeptIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('food_tinder_kept_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<{ id: string; kept: boolean }[]>(() => {
    const saved = localStorage.getItem('food_tinder_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('All');
  const [effortFilter, setEffortFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [applianceFilter, setApplianceFilter] = useState<string>('All');

  // Animation & Flip states
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | null>(null);
  const [showShoppingList, setShowShoppingList] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('food_tinder_swiped_ids', JSON.stringify(swipedIds));
  }, [swipedIds]);

  useEffect(() => {
    localStorage.setItem('food_tinder_kept_ids', JSON.stringify(keptIds));
  }, [keptIds]);

  useEffect(() => {
    localStorage.setItem('food_tinder_history', JSON.stringify(history));
  }, [history]);

  // Extract all appliances from dataset for filtering drop-down
  const allAppliances = Array.from(
    new Set(INITIAL_MEALS.flatMap((m) => m.appliances))
  ).sort();

  // Filter meals that haven't been swiped yet
  const remainingMeals = INITIAL_MEALS.filter((m) => !swipedIds.includes(m.id));

  // Apply visual category/effort/appliance filters to deck
  const filteredDeck = remainingMeals.filter((m) => {
    if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;
    if (effortFilter !== 'All' && m.effort !== effortFilter) return false;
    if (applianceFilter !== 'All' && !m.appliances.includes(applianceFilter)) return false;
    return true;
  });

  const currentCard = filteredDeck[0] || null;
  const keptMeals = INITIAL_MEALS.filter((m) => keptIds.includes(m.id));

  // Handle Swipe logic
  const performSwipe = (keep: boolean) => {
    if (!currentCard || swipeAnimation) return;

    // Trigger swipe animation
    setSwipeAnimation(keep ? 'right' : 'left');

    setTimeout(() => {
      // Complete state mutation after animation plays out
      if (keep) {
        setKeptIds((prev) => [...prev, currentCard.id]);
      }
      setSwipedIds((prev) => [...prev, currentCard.id]);
      setHistory((prev) => [...prev, { id: currentCard.id, kept: keep }]);
      
      // Reset animations
      setIsFlipped(false);
      setSwipeAnimation(null);
    }, 350);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setSwipedIds((prev) => prev.filter((id) => id !== lastAction.id));
    if (lastAction.kept) {
      setKeptIds((prev) => prev.filter((id) => id !== lastAction.id));
    }
    setHistory((prev) => prev.slice(0, -1));
    setIsFlipped(false);
  };

  const removeKeptMeal = (id: string) => {
    setKeptIds((prev) => prev.filter((mid) => mid !== id));
    // Also remove from swiped so it goes back to the deck
    setSwipedIds((prev) => prev.filter((mid) => mid !== id));
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const resetStack = () => {
    setSwipedIds([]);
    setKeptIds([]);
    setHistory([]);
    setIsFlipped(false);
    setCategoryFilter('All');
    setEffortFilter('All');
    setApplianceFilter('All');
  };

  // Generate aggregate shopping list/ingredients summary
  const getAggregatedShoppingList = () => {
    const list: string[] = [];
    keptMeals.forEach((meal) => {
      const details = getMealDetails(meal);
      details.ingredients.forEach((ing) => {
        if (!list.includes(ing)) {
          list.push(ing);
        }
      });
    });
    return list;
  };

  const copyShoppingList = () => {
    const list = getAggregatedShoppingList();
    const text = `🛒 FOOD TINDER SHOPPING LIST\n\nMeals Selected:\n${keptMeals.map(m => `- ${m.title} (${m.category})`).join('\n')}\n\nIngredients Required:\n${list.map(i => `- [ ] ${i}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-amber-500/30">
      
      {/* Header Container */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-rose-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <ChefHat className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Food Tinder
            </h1>
            <p className="text-sm text-slate-400 font-medium">Curate your premium recipe compilation container</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-xl">
          <div className="text-right">
            <span className="text-xs text-slate-500 block font-semibold uppercase tracking-wider">Overall Progress</span>
            <span className="text-sm font-bold text-white font-mono">{swipedIds.length} / {INITIAL_MEALS.length} Templates</span>
          </div>
          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-300"
              style={{ width: `${(swipedIds.length / INITIAL_MEALS.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Swiper Deck & Filters Column */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Advanced Filter Panel */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-3xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>Tailor Deck Templates</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Meal Category</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="All">All Categories</option>
                  <option value="Breakfast">🍳 Breakfast</option>
                  <option value="Lunch">🥗 Lunch</option>
                  <option value="Dinner">🥩 Dinner</option>
                </select>
              </div>

              {/* Effort Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Preparation Effort</label>
                <select 
                  value={effortFilter} 
                  onChange={(e) => setEffortFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="All">All Levels</option>
                  <option value="Low">Low Effort</option>
                  <option value="Medium">Medium Effort</option>
                  <option value="High">High Effort</option>
                </select>
              </div>

              {/* Appliance Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Required Appliance</label>
                <select 
                  value={applianceFilter} 
                  onChange={(e) => setApplianceFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="All">Any Appliance</option>
                  {allAppliances.map(app => (
                    <option key={app} value={app}>🛠️ {app}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards Deck Viewport */}
          <div className="flex flex-col items-center justify-center py-6 min-h-[460px] relative">
            
            {currentCard ? (
              <div className="w-full max-w-sm flex flex-col items-center gap-6">
                
                {/* 3D Perspective Card Container */}
                <div 
                  className={`w-full h-[450px] perspective-1000 relative cursor-pointer group`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Card Inner Rotator */}
                  <div className={`w-full h-full transform-style-3d transition-transform duration-700 relative rounded-3xl border border-slate-800/80 shadow-2xl ${
                    isFlipped ? 'rotate-y-180' : ''
                  } ${
                    swipeAnimation === 'left' ? 'animate-swipe-left' : ''
                  } ${
                    swipeAnimation === 'right' ? 'animate-swipe-right' : ''
                  }`}>
                    
                    {/* CARD FRONT */}
                    <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-3xl overflow-hidden flex flex-col animate-fadeIn">
                      
                      {/* Card Media */}
                      <div className="relative h-60 w-full bg-slate-950 overflow-hidden">
                        <img
                          src={currentCard.image}
                          alt={currentCard.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        
                        {/* Overlay Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md border ${
                            currentCard.category === 'Breakfast' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            currentCard.category === 'Lunch' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {currentCard.category}
                          </span>
                        </div>

                        {/* Hint to Flip */}
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded-lg text-[10px] text-slate-400 flex items-center gap-1.5 backdrop-blur-md">
                          <RotateCw className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                          <span>Tap to flip recipe details</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-amber-400 transition-colors">
                            {currentCard.title}
                          </h2>
                          
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {currentCard.appliances.map((app) => (
                              <span key={app} className="text-[10px] bg-slate-850 text-slate-300 px-2 py-1 rounded-md font-semibold border border-slate-800">
                                🛠️ {app}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Effort & Timing Metrics */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-sm">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Complexity</span>
                            <span className="font-semibold text-slate-200">{currentCard.effort} Effort</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Est. Cook Time</span>
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {currentCard.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD BACK */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 rounded-3xl overflow-hidden flex flex-col p-6 border-2 border-amber-500/20">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Recipe Specifications</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Tap to flip back</span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-3">{currentCard.title}</h3>
                      
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                        {/* Ingredients */}
                        <div>
                          <h4 className="font-bold text-amber-400 mb-1.5 uppercase tracking-wider text-[10px]">Ingredients list</h4>
                          <ul className="grid grid-cols-2 gap-1.5 text-slate-300">
                            {getMealDetails(currentCard).ingredients.map((ing, i) => (
                              <li key={i} className="bg-slate-955/40 p-1.5 rounded-md border border-slate-850 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                <span className="truncate">{ing}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                          <h4 className="font-bold text-amber-400 mb-1.5 uppercase tracking-wider text-[10px]">Preparation steps</h4>
                          <ol className="space-y-2 text-slate-300">
                            {getMealDetails(currentCard).instructions.map((step, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-amber-500 font-bold font-mono">{i + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                        <span>Category: {currentCard.category}</span>
                        <span>Estimated Time: {currentCard.time}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Tinder Action Buttons Layout */}
                <div className="flex items-center justify-center gap-5 w-full">
                  {/* Skip Left Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); performSwipe(false); }}
                    className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all duration-300 transform active:scale-90"
                    title="Skip Meal (Swipe Left)"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Flip Details Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                    className="w-12 h-12 bg-slate-900 border border-slate-855 rounded-full flex items-center justify-center shadow-md hover:bg-amber-500/10 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 transition-all duration-300 transform active:scale-90"
                    title="Flip Card for Details"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  {/* Keep Right Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); performSwipe(true); }}
                    className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 transition-all duration-300 transform active:scale-90"
                    title="Keep Meal (Swipe Right)"
                  >
                    <Heart className="w-6 h-6 fill-none hover:fill-emerald-400/20" />
                  </button>
                </div>

                {/* Undo Stack Trigger */}
                {history.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="text-xs text-slate-500 hover:text-amber-500 flex items-center gap-1.5 transition-colors font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Undo Last Swipe Decision</span>
                  </button>
                )}

              </div>
            ) : (
              // Empty Deck Container
              <div className="w-full max-w-sm bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center shadow-2xl space-y-5 backdrop-blur-xl">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/25">
                  <CheckCircle className="w-8 h-8 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">Deck Synthesis Complete</h2>
                  <p className="text-sm text-slate-400">
                    {filteredDeck.length === 0 && (categoryFilter !== 'All' || effortFilter !== 'All' || applianceFilter !== 'All') ? (
                      <span>No matching meals remaining with active filter parameters. Try clearing your search parameters or resetting the stack.</span>
                    ) : (
                      <span>All functional meal cards have been successfully processed. Reset the container to start fresh!</span>
                    )}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                  {/* Reset Stack Button */}
                  <button
                    onClick={resetStack}
                    className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] text-sm"
                  >
                    Reset Stack & Filters
                  </button>
                  
                  {/* Clear Filters Only if Active */}
                  {(categoryFilter !== 'All' || effortFilter !== 'All' || applianceFilter !== 'All') && (
                    <button
                      onClick={() => { setCategoryFilter('All'); setEffortFilter('All'); setApplianceFilter('All'); }}
                      className="w-full bg-slate-800 hover:bg-slate-755 text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-colors text-xs"
                    >
                      Clear Deck Filters Only
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Dynamic Curated Selection Drawer */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 h-[calc(100vh-12rem)] min-h-[550px] overflow-y-auto shadow-2xl backdrop-blur-xl flex flex-col justify-between sticky top-8">
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Your Curated Deck</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Aggregated Cache: {keptMeals.length} selected</p>
              </div>
              
              {keptMeals.length > 0 && (
                <button
                  onClick={() => setShowShoppingList(!showShoppingList)}
                  className="bg-slate-800 hover:bg-amber-500 hover:text-slate-955 text-slate-300 p-2 rounded-xl border border-slate-700 transition-colors"
                  title="Generate Shopping List"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Kept list rendering */}
            {keptMeals.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl text-center p-6 bg-slate-950/20">
                <ChefHat className="w-12 h-12 text-slate-700 mb-3 animate-bounce" />
                <span className="text-xs text-slate-500 font-semibold max-w-[180px] leading-relaxed">
                  Awaiting stack validation. Swipe right on meals to populate selection branches.
                </span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                {(['Breakfast', 'Lunch', 'Dinner'] as const).map((category) => {
                  const filtered = keptMeals.filter((m) => m.category === category);
                  if (filtered.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className={`text-[10px] font-extrabold uppercase tracking-wider px-1 ${
                        category === 'Breakfast' ? 'text-amber-400' :
                        category === 'Lunch' ? 'text-blue-400' : 'text-emerald-400'
                      }`}>
                        {category} ({filtered.length})
                      </h4>
                      <ul className="space-y-2">
                        {filtered.map((item) => (
                          <li 
                            key={item.id} 
                            className="text-xs bg-slate-955/40 border border-slate-850 hover:border-slate-700/80 rounded-xl p-3 flex justify-between items-center group/item transition-colors"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <img 
                                src={item.image} 
                                alt="" 
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover bg-slate-955" 
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'; }}
                              />
                              <div className="truncate">
                                <span className="font-semibold text-slate-200 block truncate group-hover/item:text-amber-400 transition-colors">
                                  {item.title}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {item.time} | {item.effort}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeKeptMeal(item.id)}
                              className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-all duration-200"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aggregated recipe list footer controls */}
          {keptMeals.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={copyShoppingList}
                className="w-full bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
              >
                {copyFeedback ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Copied Shopping List!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-500" />
                    <span>Copy Recipe Shopping List</span>
                  </>
                )}
              </button>
              
              <button
                onClick={resetStack}
                className="w-full bg-slate-955 hover:bg-rose-955/20 text-slate-500 hover:text-rose-400 border border-slate-850/80 font-bold py-2 px-4 rounded-xl transition-all text-[11px]"
              >
                Reset Curated Collection Stack
              </button>
            </div>
          )}

        </section>

      </main>

      {/* Shopping List Modal Container */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 max-h-[85vh] flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <span>Recipe Ingredients Matrix</span>
                </h3>
                <button 
                  onClick={() => setShowShoppingList(false)}
                  className="text-slate-400 hover:text-white text-sm bg-slate-800 hover:bg-slate-750 p-1.5 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 mb-1">Selected Meals:</h4>
                  <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                    {keptMeals.map(m => <li key={m.id}>{m.title}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-amber-400 mb-2 uppercase tracking-wide text-[10px]">Aggregated Grocery List</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {getAggregatedShoppingList().map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
                        <input type="checkbox" className="accent-amber-500 rounded border-slate-700 bg-slate-900" id={`ing-${idx}`} />
                        <label htmlFor={`ing-${idx}`} className="select-none cursor-pointer">{ing}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-805 flex gap-3">
              <button
                onClick={copyShoppingList}
                className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all text-xs"
              >
                {copyFeedback ? 'Copied List!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => setShowShoppingList(false)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
