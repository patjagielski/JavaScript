
//these are IFFIEs 
//we can acces them through public test due to closures
//BUDGET CONTROLLER
var budgetController = (function(){
   
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    //we use prototype so all usages of Expense have this inherited
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        
            this.percentage = Math.round((this.value/totalIncome)*100);
            
        }else{
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function(){
        return Math.round(this.percentage);
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0 ;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
        
    };
    
    //object data that holds info of all items and totals for both expenses and incomes
     var data = {
        allItems :{
            exp : [],
            inc: []
        },
        totals : {
            exp : 0,
            inc : 0
        },
         budget: 0,
         percent: -1    
        
        
    };
    
    return {
        addItem : function(type, des, val){
            var newItem, ID;
            //ID = last ID + 1
            //Create new ID
            if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }else{
                ID = 0;
            
            }
            
            //get type of exp or inc
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //Push into our data structure
            data.allItems[type].push(newItem);
            //return new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            //loop over all elements in an expense or inccome array
            
            ids = data.allItems[type].map(function(current){
               return current.id; 
            });
            //indexOf finds the id of a certain object in an array
            index = ids.indexOf(id);
            
            if(index !== -1){
                //use splice to remove elements from array
                //splice method takes where you want to delete and how much you want to delete
                data.allItems[type].splice(index,1);
            }
            
        },
        
        calculateBudget: function(){
            //calculate total income and expenses 
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate % of income that we spent
            if(data.totals.inc> 0){
            data.percent = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percent = -1;
                
            }
            
        },
        
        calculatePercentage: function(){
            
            data.allItems.exp.forEach(function(cur){
             cur.calcPercentage(data.totals.inc);
        });
            
        },
        
        getPercentages: function(){
          var allPercents = data.allItems.exp.map(function(cur){
              return cur.getPercentage();
          });
            return allPercents;
        },
        
        getBudget: function(){
           return{
               budget: data.budget,
               totalInc: data.totals.inc,
               totalExp: data.totals.exp,
               percent: data.percent
           };
        },
        
         testing: function(){
             console.log(data);
         }
    };
    
    
   
    
})();


//UI CONTROLLER
var UIController = (function(){
    var DOMStrings = {
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputVal : '.add__value',
        inputButton : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        expPercentLabel: '.budget__expenses--percentage',
        container : '.container',
        expensesPercentageLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
            
            var numSplit, int, decimal, type;
            /*
            + or - before #
            exactly 2 decimal points
            cmma seperating the thousands, millions, etc.
            1000 -> + 1,000.00
            */
            //num gets overridden each time
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length> 3){
                //we use substring to take a portion of a string and we override the int variable 
                int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3, 3);
                //if input is 1234, output is 1,234
            }
            
            decimal = numSplit[1];
            
            
            return (type === 'exp' ? '-': '+') + ' ' + int + '.'+ decimal;
        
        };
    
    var nodeListForEach = function(list, callback){
                
                for(var i = 0; i < list.length; i++){
                    //call back function sends each part of the list to the function below
                    callback(list[i], i);
                }
            };
    
    return{
      getInput : function(){
          return{
            type : document.querySelector(DOMStrings.inputType).value, //this will either be + or -
            description : document.querySelector(DOMStrings.inputDesc).value,
            value : parseFloat(document.querySelector(DOMStrings.inputVal).value)
              
          };
      },
        addListItem: function(obj, type){
            var html, newHtml;
            
            //Create HTML string with placeholder text 
            if(type === 'inc'){ 
                element = DOMStrings.incomeContainer;
                html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            }else if (type === 'exp'){
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            //Replace the placeholder text with some actual data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            //Insert the HTML into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        
        //made so after each input we clear the input field
        clearFields: function(){
            var fields, fieldsArray;
            //this returns a list, so we need to convert it to an array
           fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputVal);
            
            //easy way of turning list into an Array
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
                
            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            //document.querySelector(DOMStrings.expPercentLabel).textContent = obj.percent;
            
            if(obj.percent > 0){
                document.querySelector(DOMStrings.expPercentLabel).textContent = obj.percent + '%';
           }else{
               document.querySelector(DOMStrings.expPercentLabel).textContent = '---';
    }
            
            
        },
        
        displayPercentages: function(percentages){
            //this returns a node list
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
            //so we create a custom forEach function that gets the percentages
            
            
            
            nodeListForEach(fields, function(current, index){
                //this function takes the call back gets the number from it and adds a percent sign
                if(percentages[index] > 0){
                current.textContent = Math.round(percentages[index]) + '%';
                }else{
                    current.textContent = '---';
                }
                
            });
            
        },
        
        displayMonth: function(){
            //if we pass nothing to constrcutor of Date we get the current date
            //Example christmas = new Date(2015, 11, 25)
            var now, year, month, monthArr;
            now = new Date();
            
            year = now.getFullYear();
            
            month = now.getMonth();
            monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
            document.querySelector(DOMStrings.dateLabel).textContent = monthArr[month]+ ' '+ year;
        
        },
        changeType: function(){
            var fields;
            fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDesc + ',' +
                DOMStrings.inputVal
            );
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
                
            });
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
            
        
        
        },
        
        getDomStrings : function(){
            return DOMStrings;
        }
    };
    
    
    
})();



//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setEventListeners =function(){
          
    var DOM = UICtrl.getDomStrings();
        

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13|| event.which ===13){
            ctrlAddItem();
        }
    });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };
        
    
    
    
    
    var updateBudget = function(){
       
        
        // 1. calculate budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };
    
    
    var updatePercentages = function(){
        
        //1. Calculate percentages
        budgetCtrl.calculatePercentage();
        
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        
        //3. Update the UI the new percentages
        UICtrl.displayPercentages(percentages);
        
        //console.log(percentages);
    
    };
    
    
  
    
    var ctrlAddItem = function(){
        var input, newItem;
         //1. get field input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
        //2. add item to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      
         //3. add new item to user interface
        UICtrl.addListItem(newItem, input.type);
        
        //4. Clear the fields
        UICtrl.clearFields();
       
        //5. Calculate and update Budget
        updateBudget();
            
        //6. Calculate and update percentages
            updatePercentages();
    }
     
    };
    
    var ctrlDeleteItem = function(event){
        var itemID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            
            //1. DELETE item from Data Structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. DELETE item from UI
            UICtrl.deleteListItem(itemID);
            
            //3. UPDATE and present new budget
            updateBudget();
            
            //4. Calculate and update percentages
            updatePercentages();
            
             
        }
    };
    
    //Public initiallizer
    return{
        init : function(){
            console.log("APP has started.");
            UICtrl.displayMonth();
             UICtrl.displayBudget({ 
                 budget: 0,
                 totalInc: 0,
                 totalExp: 0,
                 percent: -1
                                  });
            setEventListeners();
        }
    };
    
    
})(budgetController, UIController);

controller.init();


