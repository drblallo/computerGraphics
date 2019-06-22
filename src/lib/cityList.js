let TextObject = require("./textObject.js");

let cityList =
  {
    makeCityList: function(context){
      this.context = context;
      this.selected = null;
      this.cities = [];
      let cairo = TextObject.makeCity("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "teggxt\nqwertyuiopasdfghjklzxcvbnm\n1234567890", context);
      let newyork = TextObject.makeCity("NEW YORK", "Did you know?\nNew York is a city\nClaudia knows nothing\nabout.", context);
      //ogg.setTranslation(200, 200);

      cairo.setAnchorPoint(0, 1, 0);
      newyork.setAnchorPoint(0, 0, 1);
      this.cities.push(newyork);
      this.cities.push(cairo);
      for(let i=0; i<this.cities.length; i++){
        this.cities[i].setTextVisible(false);
      }
      this.setCurrentCity = function(index) {
        this.showCurrentCityText(false);
        this.selected = this.cities[index];
      };
      this.showCurrentCityText = function(isVisible){
        if (this.selected != null)
          this.selected.setTextVisible(isVisible);
      };
      this.getCurrentAnchorPoint = function() {
        if (this.selected == null)
          return null;
        return this.selected.getAnchorPoint();
      }
    }


}

module.exports = cityList;