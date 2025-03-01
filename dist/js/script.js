/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      // console.log('new Product: ', thisProduct);
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
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

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      // //find the clickable trigger
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      //START: add event listener to clickable trigger on event click
      thisProduct.accordionTrigger.addEventListener('click', function(event){
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
      // console.log('initOrderFrom: ', this);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;

      //convert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData: ', formData);
      //set price do default price
      let price = thisProduct.data.price;
      //for every category (param)...
      for(let paramId in thisProduct.data.params){
        //determine param value: paramID='toppings', param={label: 'Toppings', type: 'checkboxes'...}
        const param = thisProduct.data.params[paramId];
        // console.log(paramId, param);

        //for every option in this category
        for(let optionId in param.options){
          //determine option value: optionId='olives', option={label: 'Olives', price: 2, default: true}
          const option = param.options[optionId];
          // console.log(optionId, option);

          // const optionImage = thisProduct.imageWrapper.querySelector(`.paramId-optionId`); //tak nie bo zwraca dokładną klasę
          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`); //poprawnie bo z wartościami dynamicznymi
          // console.log('optionImage: ', optionImage);

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
      //multiply price by amount
      price *= thisProduct.amountWidget.value;
      //update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){
        thisProduct.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments: ', element);

      thisWidget.getElements(element);
      // thisWidget.setValue(thisWidget.input.value);
      if(thisWidget.input.value){
        thisWidget.setValue(thisWidget.input.value);
      } else{
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }

      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      //add validation
      const valueInputIsNumber = thisWidget.value !== newValue && !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;

      if(valueInputIsNumber){
        thisWidget.value = newValue;
      }
      //info about product price change
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

      // const testProduct = new Product();
      // console.log('testProduct: ', testProduct);
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
