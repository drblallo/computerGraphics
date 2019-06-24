let TextObject = require("./textObject.js");
let utils = require("./utils.js");

let cityList =
  {
    makeCityList: function(context){
      this.context = context;
      this.selected = null;
      this.cities = [];
      let newyork = TextObject.makeCity("NEW YORK", "Did you know?\nNew York is a city\nClaudia knows nothing\nabout.", context);
      let paris = TextObject.makeCity("PARIS", "teggxt\nqwertyuiopasdfghjklzxcvbnm\n1234567890", context);
      let cairo = TextObject.makeCity("CAIRO", "teggxt\nqwertyuiopasdfghjklzxcvbnm\n1234567890", context);
      let sydney = TextObject.makeCity("SIDNEY", "teggxt\nqwertyuiopasdfghjklzxcvbnm\n1234567890", context);
      let tokyo = TextObject.makeCity("TOKYO", "teggxt\nqwertyuiopasdfghjklzxcvbnm\n1234567890", context);
      //ogg.setTranslation(200, 200);

		let normalizingSetAnchorPoint = function(v, city)	
		{
			v = utils.normalizeVector(v);
			city.setAnchorPoint(v[0], v[1], v[2]);
		}
		
		normalizingSetAnchorPoint([-0.4, 0.4, 0.2], newyork);
		normalizingSetAnchorPoint([0.2, 0.7, 1], paris);
		
      cairo.setAnchorPoint(0, 1, 0);
      sydney.setAnchorPoint(1, 1, 1);
      tokyo.setAnchorPoint(1, 0, 0);
	
      this.cities.push(newyork);
      this.cities.push(paris);
      this.cities.push(cairo);
      this.cities.push(sydney);
      this.cities.push(tokyo);
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
