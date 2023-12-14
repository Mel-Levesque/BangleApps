const storage = require("Storage");
const locale = require('locale');
var ENV = process.env;
var W = g.getWidth(), H = g.getHeight();
var screen = 0;
var Layout = require("Layout");

// String variables
let mealName = "";
let category = "";
let area = "";
let instructions = "";
let mealImg = "";

let uri = "https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata";

if (Bangle.http){
  Bangle.http(uri, {timeout:10000}).then(event => {
    console.log("event = "+event);
    console.log("event.resp = "+event.resp);
    let result = event.resp;
  }).catch((e)=>{
    console.log("Request Error = "+e);
  });
} else {
  console.log("No http method found");
}

//get json format and parse it into Strings
function getRecipeData(data){
  mealName = data.meal[0].strMeal;
  category = data.meal[0].strCategory;
  category = data.meal[0].strArea;
  instructions = data.meal[0].strInstructions;
}

var ingredients1 = "Penne rigate: 1 pound\nOlive oil: 1/4 cup\nGarlic: 3 cloves\nChopped tomatoes: \n1 tin\nRed chile flakes: \n1/2 teaspoon";

var ingredients2 = "Italian seasoning: \n1/2 teaspoon\nBasil: 6 leaves\nParmigiano-Reggiano: \nspinkling";

var colors = {0: "#70f", 1:"#70d", 2: "#70g", 3: "#20f", 4: "#30f"};

var screens = [
  {
    name: "General",
    items: [
      {name: "Spicy Arrabiata", fun:  () => ""},
      {name: "", fun:  () => ""},
      {name: "Type: ", fun:  () => splitString("Vege")},
      {name: "Origin: ", fun:  () => splitString("Italian")},
      {name: "", fun:  () => ""},
      {name: "Image: ", fun:  () => getWeatherTemp()},
    ]
  },
  {
    name: "Ingredients",
    items: [
      {name: "Penne rigate: 1 pound", fun:  () => ""},
      {name: "Olive oil: 1/4 cup", fun:  () => ""},
      {name: "Garlic: 3 cloves", fun:  () => ""},
      {name: "Chopped tomatoes: \n1 tin", fun:  () => ""},
      {name: "\nRed chile flakes: \n1/2 teaspoon", fun:  () => ""},
    ]
  },
  {
    name: "Ingredients",
    items: [
      {name: ingredients1, fun:  () => ""},
    ]
  },
  {
    name: "Ingredients",
    items: [
      {name: ingredients2, fun:  () => ""},
    ]
  },
  {
    name: "Recette",
    items: [
      {name: "Firmw.", fun: () => ENV.VERSION},
      {name: "Git", fun: () => ENV.GIT_COMMIT},
    ]
  }
];


function getWeatherTemp(){
  try {
    var weather = storage.readJSON('weather.json').weather;
    return locale.temp(weather.temp-273.15);
  } catch(ex) { }

  return "?";
}

//line break if 8 characters and if more than 24, replaces the remaining characters by a dot
function splitString(inputString) {
  let result = '';
  let interval1 = 8;
  let interval2 = 24;
  let replaceChar = ".";
  
  if (inputString.length >= interval1) {
    // Insert line break after every 8 characters
    result += inputString.substring(0, interval1) + '\n';
  }

  if (inputString.length >= interval2) {
    // Truncate the string after 16 characters and add a dot
    result += inputString.substring(interval1, interval2) + '.';
  }else if (inputString.length > interval1) {
    // If the string is between 8 and 24 characters, include the remaining characters
    result += inputString.substring(interval1);
  }else{
    result = inputString;
  }

  return result;
}


function drawData(name, value, y){
  g.drawString(name, 10, y);
  g.drawString(value, 100, y);
}


function drawInfo() {
  g.reset().clearRect(Bangle.appRect);
  var h=18, y = h;//-h;

  // Header
  g.drawLine(0,25,W,25);
  g.drawLine(0,26,W,26);

  // Info body depending on screen
  g.setFont("Vector",15).setFontAlign(-1,-1).setColor("#0ff");
  screens[screen].items.forEach(function (item, index){
    console.log("index = "+index);
    g.setColor(colors[index]);
    drawData(item.name, item.fun(), y+=h);
  });

  // Bottom
  g.setColor("#000");
  g.drawLine(0,H-h-3,W,H-h-3);
  g.drawLine(0,H-h-2,W,H-h-2);
  g.setFont("Vector",h-2).setFontAlign(-1,-1);
  g.drawString(screens[screen].name, 2, H-h+2);
  g.setFont("Vector",h-2).setFontAlign(1,-1);
  g.drawString((screen+1) + "/" + screens.length, W, H-h+2);
}

drawInfo();

// Change page if user touch the left or the right of the screen
Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    screen = (screen + 1) % screens.length;
  }

  if(isLeft){
    screen -= 1;
    screen = screen < 0 ? screens.length-1 : screen;
  }

  Bangle.buzz(40, 0.6);
  drawInfo();
});

// Example usage
//const originalString = "12345678123456781234567812345678";
//const stringWithLineBreaksAndReplace = insertLineBreaksAndReplace(originalString);

//console.log(stringWithLineBreaksAndReplace);


/*var layout = new Layout( {
  type:"v", c: [
    {type:"h", c: [
       {type:"txt", font:"10%", label:"Spicy Arrabiata", fillx:1, cb: l=>console.log("Change recipe ?") },
    ]},
      {type:"txt", font:"5%", label:"Type: Vegetarian", fillx:0},
      {type:"txt", font:"5%", label:"penne rigate: 1 pound", fillx:0},
      {type:"txt", font:"5%", label:"olive oil: 1/4 cup", fillx:1},
      {type:"txt", font:"5%", label:"garlic: 3 cloves", fillx:1},
    {type:"h", c: [
      {type:"btn", font:"6x8:2", label:"Prev", fillx:1, cb: l=>console.log("Prev") },
      {type:"btn", font:"6x8:2", label:"Next", fillx:1, cb: l=>console.log("Next") }
    ]},
  ]
});

layout.render();*/


Bangle.on('lock', function(isLocked) {
  drawInfo();
});

Bangle.loadWidgets();
Bangle.drawWidgets();