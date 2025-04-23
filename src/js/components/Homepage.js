import { select, templates, homepageGalleryImages } from "../settings.js";
import Carousel from "./Carousel.js";

class Homepage{
  constructor(element){
    const thisHomepage = this;

    this.render(element);
    this.renderFotoGallery();
    this.initActions();
  }

  render(container){
    const thisHomepage = this;

    this.dom = {};
    this.dom.wrapper = container;
    this.dom.wrapper.innerHTML = templates.homepageWidget();

    this.dom.orderSection = container.querySelector(select.homepage.orderSection);
    this.dom.bookingSection = container.querySelector(select.homepage.bookingSection);
    this.dom.carousel = container.querySelector(select.homepage.carousel);
    this.dom.fotoGallery = container.querySelector(select.homepage.fotoGalleryWrapper);
  }

  renderFotoGallery(){
    const thisHomepage = this;

    const fragment = document.createDocumentFragment();
    thisHomepage.dom.fotoGallery.innerHTML = '';

    for(let imagePath of homepageGalleryImages.galleryImages){
      const imageWrapper = document.createElement("div");
      imageWrapper.classList.add("foto-gallery-item");

      const image = document.createElement("img");
      image.src = imagePath;
      image.alt = "Sweet foto";

      const overlay = document.createElement("div");
      overlay.classList.add("overlay");

      const likeIcon = document.createElement("i");
      likeIcon.classList.add("fas", "fa-heart", "likeIcon");
      overlay.appendChild(likeIcon);

      const shareIcon = document.createElement("i");
      shareIcon.classList.add("fas", "fa-share-alt", "shareIcon");
      overlay.appendChild(shareIcon);

      imageWrapper.appendChild(image);
      imageWrapper.appendChild(overlay);

      fragment.appendChild(imageWrapper);
    }

    thisHomepage.dom.fotoGallery.appendChild(fragment);
  }

  initCarousel(){
    const thisHomepage = this;
    //TODO implementation

  }

  initActions(){
    const thisHomepage = this;

    thisHomepage.dom.orderSection.addEventListener('click', (event) =>{
      event.preventDefault();
      window.location.hash = '#/order';
    });

    thisHomepage.dom.bookingSection.addEventListener('click', (event) =>{
      event.preventDefault();
      window.location.hash = '#/booking';
    });

    thisHomepage.dom.fotoGallery.addEventListener('click', (event) =>{
      if(event.target.closest('.likeIcon')){
        event.target.classList.toggle('liked');
      }
      if(event.target.closest('.shareIcon')){
        alert('Share...');
      }
    });
  }
}

export default Homepage;