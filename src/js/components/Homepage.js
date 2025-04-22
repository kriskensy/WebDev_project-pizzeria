import { select, templates, homepageGalleryImages } from "../settings.js";
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

    // console.log('homepageWIdget: ', templates.homepageWidget);

    this.dom.orderSection = container.querySelector(select.homepage.orderSection);
    this.dom.bookingSection = container.querySelector(select.homepage.bookingSection);
    this.dom.carousel = container.querySelector(select.homepage.carousel);
    this.dom.fotoGallery = container.querySelector(select.homepage.fotoGalleryWrapper);

    this.renderFotoGallery();
  }

  renderFotoGallery(){
    const thisHomepage = this;

    const fragment = document.createDocumentFragment();
    thisHomepage.dom.fotoGallery.innerHTML = '';

    for(let imagePath of homepageGalleryImages){
      const imageWrapper = document.createElement("div");
      imageWrapper.classList.add("gallery-item");

      const image = document.createElement("img");
      image.src = imagePath;
      image.alt = "Sweet foto";

      imageWrapper.appendChild(image);
      fragment.appendChild(imageWrapper);
    }

    thisHomepage.dom.fotoGallery.appendChild(fragment);
  }

  initCarousel(){
    const thisHomepage = this;
    //TODO implementation

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