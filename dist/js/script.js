/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: "#template-cart-product",
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 5,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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

      // //find the clickable trigger
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

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

      app.cart.add(thisProduct.prepareCartProduct());
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

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);

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

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){
      const thisCart = this;

      //generate HTML based on template
      const generatedHTML = templates.cartProduct(menuProduct);
      //create DOM element
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      //add DOM element to product list
      thisCart.dom.productList.appendChild(generatedDOM);
      //add product to array
      // thisCart.products.push(menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }

    update(){
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for(const product of thisCart.products){
        totalNumber = totalNumber + product.amount;
        subtotalPrice = subtotalPrice + product.price;
      }

      if(totalNumber > 0){
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }

      console.log('deliverFee: ', deliveryFee);
      console.log('totalNumber: ', totalNumber);
      console.log('subtotalPrice: ', subtotalPrice);
      console.log('totalPrice: ', thisCart.totalPrice);

      //update totalPrice, subtotalPrice, totalNumber, deliverFee in HTML
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        //price update in HTML
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
