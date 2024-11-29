class VerticalCarousel {
  /**
   * Create a vertical carousel with advanced interaction capabilities
   */
  constructor(slides, options = {}) {
    // Configuration with sensible defaults
    this.config = {
      visibleRange: [-1, 0, 1],
      slideScale: 0.7,
      dragThreshold: 50,
      transitionDuration: 600,
      ...options,
    };

    this.slides = slides;
    this.currentIndex = 0;
    this.carouselEl = document.querySelector(".wrapper");
    this.carouselEl.setAttribute("role", "region");
    this.carouselEl.setAttribute("aria-label", "Vertical Carousel");

    this.initCarousel();
    this.setupEventListeners();
  }

  /**
   * Initialize carousel by creating slide elements
   */
  initCarousel() {
    this.carouselEl.innerHTML = ""; // Clear existing content

    this.slides.forEach((slide, index) => {
      const slideEl = document.createElement("div");
      slideEl.classList.add("card");
      slideEl.setAttribute("role", "listitem");
      slideEl.setAttribute("aria-posinset", index + 1);
      slideEl.setAttribute("aria-setsize", this.slides.length);
      slideEl.dataset.index = index;
      slideEl.innerHTML = slide.content;
      this.carouselEl.appendChild(slideEl);
    });

    this.updateSlidePositions();
  }

  /**
   * Update visual positioning and state of slides
   */
  updateSlidePositions() {
    const slides = document.querySelectorAll(".card");
    const { visibleRange, slideScale } = this.config;

    slides.forEach((slide, i) => {
      const offset = i - this.currentIndex;

      if (visibleRange.includes(offset)) {
        slide.style.opacity = 1;
        slide.style.transform = `
                    translateY(${offset * 200}px)
                    scale(${offset === 0 ? 1 : slideScale})
                `;
        slide.style.zIndex = offset === 0 ? 10 : 1;
        slide.classList.toggle("focused-slide", offset === 0);
        slide.setAttribute("aria-current", offset === 0 ? "true" : "false");
      } else {
        slide.style.opacity = 0;
        slide.style.transform = `translateY(0) scale(0.6)`;
        slide.style.zIndex = 0;
        slide.classList.remove("focused-slide");
        slide.removeAttribute("aria-current");
      }
    });
  }

  /**
   * Move carousel slides in specified direction
   * @param {number} direction - Direction of movement (-1 or 1)
   */
  moveSlide(direction) {
    this.currentIndex =
      (this.currentIndex + direction + this.slides.length) % this.slides.length;
    this.updateSlidePositions();
  }

  /**
   * Set up comprehensive event listeners for interaction
   */
  setupEventListeners() {
    let startY = 0;
    let isDragging = false;

    // Wheel navigation with debounce
    const debouncedWheelHandler = this.debounce((e) => {
      e.preventDefault();
      this.moveSlide(e.deltaY > 0 ? 1 : -1);
    }, 100);

    this.carouselEl.addEventListener("wheel", debouncedWheelHandler);

    // Drag interaction
    this.setupDragInteraction(
      () => {
        this.carouselEl.style.cursor = "grabbing";
      },
      (deltaY) => {
        this.moveSlide(deltaY > 0 ? -1 : 1);
      },
      () => {
        this.carouselEl.style.cursor = "grab";
      }
    );

    // Keyboard navigation
    this.setupKeyboardNavigation();

    // Click to select
    this.setupClickNavigation();
  }

  /**
   * Enhanced drag interaction with advanced handling
   */
  setupDragInteraction(onDragStart, onDragMove, onDragEnd) {
    let startY = 0;
    let isDragging = false;

    this.carouselEl.addEventListener("mousedown", (e) => {
      startY = e.clientY;
      isDragging = true;
      onDragStart();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      if (Math.abs(deltaY) > this.config.dragThreshold) {
        onDragMove(deltaY);
        isDragging = false;
      }
    });

    ["mouseup", "mouseleave"].forEach((event) => {
      document.addEventListener(event, () => {
        if (isDragging) {
          isDragging = false;
          onDragEnd();
        }
      });
    });
  }

  /**
   * Set up keyboard navigation with ARIA support
   */
  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          this.moveSlide(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          this.moveSlide(1);
          break;
      }
    });
  }

  /**
   * Set up click-based slide selection
   */
  setupClickNavigation() {
    this.carouselEl.addEventListener("click", (e) => {
      const clickedSlide = e.target.closest(".card");
      if (clickedSlide) {
        const index = parseInt(clickedSlide.dataset.index, 10);
        this.currentIndex = index;
        this.updateSlidePositions();
      }
    });
  }

  /**
   * Debounce function to limit event frequency
   */
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

// Example slide data with more semantic structure
const slides = [
  {
    content: `
            <div class="main" aria-label="Slide Background"></div>
            <div class="content" role="presentation">
                <div class="circle" aria-hidden="true"></div>
                <div class="details">
                    <div class="title" aria-label="Slide Title"></div>
                    <div class="description" aria-label="Slide Description"></div>
                </div>
            </div>
        `,
  },
  // ... other slides follow same pattern
].concat(
  new Array(5).fill().map(() => ({
    content: `
        <div class="main" aria-label="Slide Background"></div>
        <div class="content" role="presentation">
            <div class="circle" aria-hidden="true"></div>
            <div class="details">
                <div class="title" aria-label="Slide Title"></div>
                <div class="description" aria-label="Slide Description"></div>
            </div>
        </div>
    `,
  }))
);

// Initialize carousel with optional configuration
new VerticalCarousel(slides, {
  visibleRange: [-1, 0, 1],
  dragThreshold: 50,
});
