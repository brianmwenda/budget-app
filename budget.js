/*---Budget Controller----*/
var budgetController = (function() {
  //create and expense object
  var Expense = function(ID,Description, Value){
    this.ID = ID;
    this.Description = Description;
    this.Value = Value;
  }
  //creat income object for our items
  var Income = function(ID,Description, Value){
    this.ID = ID;
    this.Description = Description;
    this.Value = Value;
  }
  var calculateTotals = function(type){
    var sum =0;
    data.allItems[type].forEach(function(cur){
      sum += cur.Value;
    });
    data.Totals[type] = sum;
  };

  //create an array to input items in this datastructure
    var data = {
      allItems:{
        exp:[],
        inc:[]
      },
      Totals:{
        exp:0,
        inc:0
      },
      budget:0,
      percentage:-1
    };

    return {
      addItem:function(type,des,val){
        var newItem, ID;
        //create new id
        if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].ID + 1;
        }
        else{
          ID = 0;
        }
      //create new item bassed on inc or exp
        if(type === 'exp'){
          newItem = new Expense(ID,des,val);
        }else if(type === 'inc'){
          newItem = new Income(ID,des,val);
        }
        //push it into the datastructure
        data.allItems[type].push(newItem);
        //return thr new element
        return newItem;
      },
      calculateBudget:function(){
        calculateTotals('exp');
        calculateTotals('inc');
        data.budget = data.Totals.inc - data.Totals.exp;
        data.percentage = Math.round((data.Totals.exp/data.Totals.inc)*100);
      },
      getBudget:function(){
        return{
        budget:data.budget,
        totalinc:data.Totals.inc,
        totalexp:data.Totals.exp,
        percentage:data.percentage
      };
      },

      testing:function(){
        console.log(data);
      }


    };

})();







/*----UI Controller-----*/

var UIController = (function(){
  var DOMStrings = {
    //we put all our selected variables from the html here
      //this is a private function
    inputType:'.add_type',
    inputdes:'.add_description',
    inputvalue:'.add_value',
    inputBtn:'.add_btn',
    incomeContainer:'.income_list',
    expensesContainer:'.expenses_list',
    budgetLabel:'.budget_value',
    incomeLabel:'.budget_income--value',
    expensesLabel:'.budget_expenses--value',
    percentageLabel:'.budget_expenses--percentage'
  }
  return{

    getInput:function () {
      return{//call the selected variables here and get the values
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputdes).value,
        value: parseFloat(document.querySelector(DOMStrings.inputvalue).value),
      };

    },


    addListItem:function(obj, type){
      var html,newHtml,element;
      //create HTML strings with placeholder
      if(type === 'inc'){
        element = DOMStrings.incomeContainer;
      html =  '<div class="item clearfix" id="income-%ID%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

  }else if(type === 'exp'){

  element = DOMStrings.expensesContainer;
  html = '<div class="item clearfix" id="expense-%ID%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

  }
      //replace the placeholder text with some actual datastructure
      newHtml = html.replace('%ID%',obj.ID);
      newHtml = newHtml.replace('%description%',obj.Description);
      newHtml = newHtml.replace('%value%',obj.Value);
      //insert the html into the dom
      var e = document.querySelector(element);
      e.insertAdjacentHTML('beforeend',newHtml)
    },
    //delete input fields
    clearFields:function(){
      var fields,arrFields;
      fields = document.querySelectorAll(DOMStrings.inputdes + ',' +DOMStrings.inputvalue);
      arrFields = Array.prototype.slice.call(fields);
      arrFields.forEach(function(current,index,array){
        current.value = "";
      });
      arrFields[0].focus();

    },
    //display to the ui
    displayBudget:function(obj){
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalexp;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalinc;

      if(obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      }else{
        document.querySelector(DOMStrings.percentageLabel).textContent = '--';
      }

    },
    getDOMStrings:function(){//so we can share this property to other controllers since its a private function
      return DOMStrings;
    }
  }
})();








/*----GLOBAL APP ControllerS---*/
var Controller = (function(budgetctrl, UIctrl){

  var setUpEventListeners = function(){
    var DOM = UIctrl.getDOMStrings();//we access the shared private function using this method
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem)
    document.addEventListener('keypress',function(event){
      if(event.keyCode=== 13 || event.which===13){
            ctrlAddItem();
      }
    });
  }
  var updateBudget = function () {
    //calculate the budget
    budgetctrl.calculateBudget();
    //return the budget_title
    var budget = budgetctrl.getBudget();

    //display the budget on the UI
    UIctrl.displayBudget(budget);
  };


  var ctrlAddItem = function(){
    var input, newItem;

    //1.get field input data;
      var input = UIctrl.getInput();//note UIctrl is used because we passed it as the parameter that points to the UIController
      //console.log(input);
      if(input.description !== "" && input.value != "NAN" && input.value > 0){
        //2.add the item to the budget Controller
        newItem = budgetctrl.addItem(input.type, input.description, input.value)
        //3.add the item to the ui
        UIctrl.addListItem(newItem, input.type);
        //delete input arrFields
        UIctrl.clearFields();
        //4.calc the budget_title
        //5.display the budget on the ui
        updateBudget();
      }


  }
  return {
    init:function () {
      console.log('init initiated');

      //return everything to 0
      UIctrl.displayBudget({
      budget:0,
      totalinc:0,
      totalexp:0,
      percentage:-1
    });

      setUpEventListeners();
    }
  };

})(budgetController, UIController);//we give the location of the pointed field ;pointers in parameters

Controller.init();
