import { settings, select, classNames, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    thisBooking.selectedTable = null;
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params: ', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('urls: ', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([booking, eventsCurrent, eventsRepeat]){
        // console.log(booking);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(booking, eventsCurrent, eventsRepeat);
      });
  }

  parseData(booking, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of booking){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked: ', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop: ', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){ //TODO sprawdz metode
    const thisBooking = this;

    //table selection reset
    thisBooking.resetTableSelection();

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    const isHourBooked = thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour]
    // console.log('isHourBooked: ', isHourBooked);

      for(let table of thisBooking.dom.tables){
        const tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
        const isBooked = isHourBooked && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId);

        // console.log('thisBooking.booked:', thisBooking.booked);
        // console.log('Selected date:', thisBooking.date);
        // console.log('Selected hour:', thisBooking.hour);

        // console.log('isBooked: ', isBooked);
        if(isBooked){
          table.classList.add(classNames.booking.tableBooked);
        }
        else{
          table.classList.remove(classNames.booking.tableBooked);
        }
      }
  }

  render(container){
    const thisBooking = this;
      
    this.dom ={};
    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = templates.bookingWidget();

    this.dom.peopleAmount = container.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = container.querySelector(select.booking.hoursAmount);

    this.dom.datePicker = container.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = container.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.form = container.querySelector(select.booking.form);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    // thisBooking.dom.peopleAmount.addEventListener('updated', function(){

    // });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    // thisBooking.dom.hoursAmount.addEventListener('updated', function(){

    // });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    // thisBooking.dom.datePicker.addEventListener('updated', function(){

    // });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // thisBooking.dom.hourPicker.addEventListener('updated', function(){

    // });

    thisBooking.dom.wrapper.addEventListener('updated', () =>{
      thisBooking.updateDOM();
    });

    thisBooking.dom.wrapper.addEventListener("click", (event) =>{
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', (event) =>{
      event.preventDefault();
      thisBooking.sendBooking();
    })
  }

  resetTableSelection(){
    const thisBooking = this;

    for(let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
    }

    thisBooking.selectedTable = null;
  }

  initTables(event){
    const thisBooking = this;

    const clickedElement = event.target.closest(select.booking.tables);

    if(clickedElement){
      const tableNumber = clickedElement.getAttribute('data-table'); 
      // const tableNumber = clickedElement.classList.contains(settings.booking.tableIdAttribute); 
      const tableBooked = clickedElement.classList.contains(classNames.booking.tableBooked);
      const tableSelected = clickedElement.classList.contains(classNames.booking.tableSelected);

      if(tableNumber && tableBooked){
        alert('Sorry, this table is already booked.');
        return;
      }

      if(tableNumber && tableSelected){
        thisBooking.selectedTable = null;
        clickedElement.classList.remove(classNames.booking.tableSelected);
        return;
      }

      //table selection reset
      thisBooking.resetTableSelection();

      if(tableNumber && !tableSelected){
        thisBooking.selectedTable = tableNumber;
        clickedElement.classList.add(classNames.booking.tableSelected);
      }
    }
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable ? parseInt(thisBooking.selectedTable) : null,
      duration: parseInt(thisBooking.hoursAmount.value),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.wrapper.querySelector(select.booking.phone).value,
      address: thisBooking.dom.wrapper.querySelector(select.booking.address).value,
    };

    //if any starter is selected, water is added automatically and possibly the others, but without water
    const checkedStarters = thisBooking.dom.wrapper.querySelectorAll('input[name="starter"]:checked');

    if(checkedStarters){
      payload.starters.push('water');

      for(const starter of checkedStarters){
        if(starter.value != 'water'){
          payload.starters.push(starter.value);
        }
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
    .then(response => {
      if (!response.ok) throw new Error('Booking failed!');
      return response.json();
    })
    .then(data => {
      alert('Booking successful! Table: ' + data.table + ' on ' + data.date + ' at ' + data.hour + '.');
      thisBooking.makeBooked(
        payload.date,
        payload.hour,
        payload.duration,
        payload.table,
      );
      thisBooking.updateDOM();
      thisBooking.resetTableSelection();
    })
    .catch(error => {
      alert('Error: ' + error.message);
    });
  }
}

export default Booking;