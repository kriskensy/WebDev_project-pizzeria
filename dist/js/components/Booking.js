import { settings, select, classNames, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(container){
    const thisBooking = this;
      
    this.dom ={};
    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = templates.bookingWidget();

    this.dom.peopleAmount = container.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = container.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){

    });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){

    });
  }

}

export default Booking;