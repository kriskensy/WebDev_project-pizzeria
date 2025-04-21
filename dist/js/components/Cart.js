import { settings, select, classNames, templates } from "../settings.js";
import CartProduct from "./CartProduct.js";
import utils from "../utils.js";

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
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
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
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }

    remove(cartProduct){
      const thisCart = this;

      //remove product from HTML
      cartProduct.dom.wrapper.remove();
      //remove information about product from array thisCart.products
      const index = thisCart.products.indexOf(cartProduct);

      if(index !== -1){
        thisCart.products.splice(index, 1);
      }
      //call the update method
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

      //update subtotalPrice, totalNumber, deliverFee in HTML
      thisCart.dom.deliveryFee.innerHTML = totalNumber > 0 ? deliveryFee : 0;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      
      //update totalPrice for all references
      for(const totalPriceElem of thisCart.dom.totalPrice){
        if(totalPriceElem){
          totalPriceElem.innerHTML = thisCart.totalPrice;
        }
      }
    }

    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      //address and phone are inputs => use 'value'
      const payload = {
        address: thisCart.dom.wrapper.querySelector(select.cart.address).value,
        phone: thisCart.dom.wrapper.querySelector(select.cart.phone).value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: [],
      };

      for(let prod of thisCart.products){
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
    }
  }

export default Cart;