import { select, templates } from "../settings.js";
import Carousel from "./Carousel.js";

class Homepage{
  constructor(element){
    const thisHomepage = this;

    this.render(element);
    this.initWidgets();
    
  }

  render(container){
    const thisHomepage = this;

    this.dom = {};
    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = templates.homepageWidget();

    console.log('homepageWIdget: ', templates.homepageWidget);

    this.dom.orderSection = container.querySelector(select.homepage.orderSection);
    this.dom.bookingSection = container.querySelector(select.homepage.bookingSection);
    this.dom.carousel = container.querySelector(select.homepage.carousel);
    this.dom.fotoGallery = container.querySelector(select.homepage.fotoGallery);

    this.renderFotoGallery();
  }

  renderFotoGallery(){
    const thisHomepage = this;
    //TODO implemenattion

  }

  initCarousel(){
    const thisHomepage = this;
    //TODO implemenattion

  }

  initWidgets(){
    const thisHomepage = this;

    thisHomepage.dom.orderSection.addEventListener('click', (event) =>{
      event.preventDefault();
      window.location.hash = '#/order';
    });

    thisHomepage.dom.bookingSection.addEventListener('click', (event) =>{
      event.preventDefault();
      window.location.hash = '#/booking';
    });
  }
}

export default Homepage;