let TextObject = require("./textObject.js");
let utils = require("./utils.js");

let cityList =
  {
    makeCityList: function(context){
      this.context = context;
      this.selected = null;
      this.cities = [];
      let parisText = "Paris is the capital and most populous city of France, with an area of 105 square kilometres " +
        "(41 square miles) and an official estimated population of 2,140,526 residents as of 1 January 2019.";
      this.divideText = function(text) {
        let newText = "";
        while(text.length>=29){
          if(text.charAt(28)===' '){
            text = text.substring(29, text.length);
            newText = newText + text.substring(0,28)+'\n';
          }
          else if(text.charAt(29)===' '){
            text = text.substring(30, text.length);
            newText = newText + text.substring(0,29)+'\n';
          }
          else {
            let j=0;
            while(text.charAt(28-j)!==' '){
              j++;
            }
            text = text.substring(28-j+1, text.length);
            newText = newText + text.substring(0,28-j)+'\n';
          }
        }
        return newText;
      };
      /*this.divideText = function(text) {
        let count=0;
        for(let i=0; i<text.length; i++){
          if(count == 29 && text.charAt(i)==' '){
            text.charAt(i+1)='\n';
            count = 0;
            alert(parisText);
          }
          else if(count== 29 && text[i]!=' '){
            let j = 0;
            //alert("here!"+ text[i-1]);
            do{
              j++;
            }
            while(text[i-j]!==' ');
            text[i-j+1]='\n';
            i=i-j+1;
            count = 0;
            //alert("here!!"+ text[i]);
          }
          count++;
        }
      };*/
      parisText = this.divideText(parisText);

      let newyork = TextObject.makeCity("NEW YORK", "New York is the biggest city \nin the United States," +
        " located \nin the state of New York. \nOver 8 million people live in \nit, and over 22 million \n" +
        "people live in the bigger New \nYork metropolitan area.", context);
      let paris = TextObject.makeCity("PARIS", "Paris is the capital and most \npopulous city of France, with \n" +
        "an area of 105 square \nkilometres (41 square miles) \nand an official estimated \npopulation of 2,140,526 \n" +
        "residents as of 1 January \n2019.", context);
      let cairo = TextObject.makeCity("CAIRO", "Cairo city is capital of \nEgypt," +
        " and one of the largest \ncities in Africa. Cairo has \nstood for more than 1,000 \nyears on the same site on the \nbanks of the Nile," +
        " primarily \non the eastern shore, some \n500 miles (800 km) downstream \nfrom the Aswan High Dam. ", context);
      let sydney = TextObject.makeCity("SYDNEY", "Sydney is the state capital \nof New South Wales and the \nmost populous city " +
        "in \nAustralia and Oceania. It is \nmade up of 658 suburbs, 40 \nlocal government areas and 15 \ncontiguous regions. Residents \nof the city are known as \n'Sydneysiders'.", context);
      let tokyo = TextObject.makeCity("TOKYO", "Tokyo, officially Tokyo \nMetropolis, one of the 47 \nprefectures of Japan, has \n" +
        "served as the Japanese \ncapital since 1869. As of \n2018, the Greater Tokyo Area \nranked as the most populous \n" +
        "metropolitan area in the \nworld.", context);
      //ogg.setTranslation(200, 200);
		let normalizingSetAnchorPoint = function(v, city)	
		{
			v = utils.normalizeVector(v);
			city.setAnchorPoint(v[0], v[1], v[2]);
		}
		
		normalizingSetAnchorPoint([-0.4, 0.4, 0.2], newyork);
		normalizingSetAnchorPoint([0.02, 0.24, 0.2], paris);
		normalizingSetAnchorPoint([0.13, 0.125, 0.2], cairo);
    normalizingSetAnchorPoint([0.4, -0.55, -1.0], sydney);
    normalizingSetAnchorPoint([0.71, 0.95, -1.0], tokyo);

	
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
