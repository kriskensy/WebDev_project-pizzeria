import { homepageGalleryImages } from "../settings.js";

class Carousel {
    constructor(element) {
      const thisCarousel = this;

      thisCarousel.dom ={};
      thisCarousel.dom.wrapper = element;

      this.render(element);
      this.initPlugin();
    }
  
    render() {
      const thisCarousel = this;

      thisCarousel.dom.wrapper.innerHTML = '';
      thisCarousel.dom.slidesContainer = document.createElement('div');
      thisCarousel.dom.slidesContainer.classList.add('carousel-slides-container');

      const fragment = document.createDocumentFragment();
  
      for(let imageData of homepageGalleryImages.carouselItems){
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");
  
        const carouselImage = document.createElement("img");
        carouselImage.src = imageData.src;
        carouselImage.alt = imageData.text;

        const carouselText = document.createElement("div");
        carouselText.classList.add("carousel-text");
        carouselText.textContent = imageData.text;
  
        carouselItem.appendChild(carouselImage);
        carouselItem.appendChild(carouselText);
        
        fragment.appendChild(carouselItem);
      }
  
      thisCarousel.dom.slidesContainer.appendChild(fragment);
      thisCarousel.dom.wrapper.appendChild(thisCarousel.dom.slidesContainer);
    }

    updateSlide(){
      const thisCarousel = this;

      const offset = -thisCarousel.currentSlide * 100;
      thisCarousel.dom.slidesContainer.style.transform = `translateX(${offset}%)`;
    }
  
    initPlugin() {
      const thisCarousel = this;

      thisCarousel.currentSlide = 0;
      thisCarousel.slides = thisCarousel.dom.wrapper.querySelectorAll('.carousel-item');

      setInterval(() => {
        thisCarousel.currentSlide = (thisCarousel.currentSlide + 1) % thisCarousel.slides.length;
        thisCarousel.updateSlide();
      }, 3000);
    }
  }

  export default Carousel;