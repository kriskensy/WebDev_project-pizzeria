import { select, classNames, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      //object dom for all references
      thisProduct.dom = {};

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProductParams();
      thisProduct.prepareCartProduct();
    }

    renderInMenu(){
      const thisProduct = this;

      //generate HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //create element using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      //START: add event listener to clickable trigger on event click
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
        //prevent default action for event
        event.preventDefault();
        //find active product (with active class)
        const activeProduct = document.querySelector('.active');
        //if there is active product and it's not thisProduct.element, remowe class active for it
        if(activeProduct && activeProduct !== thisProduct.element){
          activeProduct.classList.remove('active');
        }
        //toggle active class on thisProduct.element
        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.addToCart();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;

      //convert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      //set price do default price
      let price = thisProduct.data.price;
      //for every category (param)...
      for(let paramId in thisProduct.data.params){
        //determine param value: paramID='toppings', param={label: 'Toppings', type: 'checkboxes'...}
        const param = thisProduct.data.params[paramId];

        //for every option in this category
        for(let optionId in param.options){
          //determine option value: optionId='olives', option={label: 'Olives', price: 2, default: true}
          const option = param.options[optionId];
          // const optionImage = thisProduct.imageWrapper.querySelector(`.paramId-optionId`); //tak nie bo zwraca dokładną klasę
          const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`); //poprawnie bo z wartościami dynamicznymi

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //check if param=paramId in formData, check if it includes optionId
          if(optionSelected){
            if(!option.default){
              price = price + option.price;
            }
            if(optionImage){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            if(option.default){
              price = price - option.price;
            }
            if(optionImage){
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      //equipping thisProduct with a new property
      thisProduct.priceSingle = price;
      //multiply price by amount
      price *= thisProduct.amountWidget.value;
      //update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

    //   app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
            product: thisProduct.prepareCartProduct(),
        },
      });
      thisProduct.element.dispatchEvent(event);
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        // params: {},
        params: thisProduct.prepareCartProductParams(),
      };

      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      //convert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};
      //for every category (param)...
      for(let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        //create category param in params const
        params[paramId] = {
          label: param.label,
          options: {}
        }

        //for every option in this category
        for(let optionId in param.options){
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected){
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;
    }
}

export default Product;