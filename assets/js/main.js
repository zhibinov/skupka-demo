(function () {
  "use strict";

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var fab = document.querySelector(".fab");
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 4200);
  }

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  function onScroll() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }
    if (fab) {
      fab.classList.toggle("is-visible", window.scrollY > 500);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      burger.classList.toggle("is-active", isOpen);
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("menu-open", isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  var revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealElements.forEach(function (element) {
      observer.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-tab");
      tabs.forEach(function (item) {
        var active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.getAttribute("data-panel") === key);
      });
    });
  });

  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".material-card"));
  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      filters.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      cards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-cat") === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  var galleryPhotos = window.SKUPKA_GALLERY || [];
  var galleryTrack = document.getElementById("galleryTrack");
  var galleryViewport = document.getElementById("galleryViewport");
  var galleryPrev = document.getElementById("galleryPrev");
  var galleryNext = document.getElementById("galleryNext");
  var galleryCurrent = document.getElementById("galleryCurrent");
  var galleryTotal = document.getElementById("galleryTotal");
  var gallerySlides = [];
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var currentPhoto = 0;
  var lastTrigger = null;

  function padPhotoNumber(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function showPhoto(index) {
    if (!galleryPhotos.length || !lightboxImg) return;
    currentPhoto = (index + galleryPhotos.length) % galleryPhotos.length;
    lightboxImg.src = galleryPhotos[currentPhoto].src;
    lightboxImg.alt = galleryPhotos[currentPhoto].alt;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastTrigger = gallerySlides[index] || null;
    showPhoto(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastTrigger) lastTrigger.focus();
  }

  function getGalleryStep() {
    if (!gallerySlides.length || !galleryTrack) return 0;
    var gap = parseFloat(window.getComputedStyle(galleryTrack).gap) || 0;
    return gallerySlides[0].getBoundingClientRect().width + gap;
  }

  function getGalleryIndex() {
    if (!galleryViewport) return 0;
    var step = getGalleryStep();
    return step ? Math.round(galleryViewport.scrollLeft / step) : 0;
  }

  function updateGalleryControls() {
    if (!galleryViewport || !gallerySlides.length) return;
    var index = Math.min(getGalleryIndex(), gallerySlides.length - 1);
    if (galleryCurrent) galleryCurrent.textContent = padPhotoNumber(index + 1);
    var maxScroll = galleryViewport.scrollWidth - galleryViewport.clientWidth - 1;
    if (galleryPrev) galleryPrev.disabled = galleryViewport.scrollLeft <= 1;
    if (galleryNext) galleryNext.disabled = galleryViewport.scrollLeft >= maxScroll;
  }

  function scrollGallery(direction) {
    if (!galleryViewport) return;
    galleryViewport.scrollBy({ left: direction * getGalleryStep(), behavior: "smooth" });
  }

  function renderGallery() {
    if (!galleryTrack || !galleryPhotos.length) return;
    galleryPhotos.forEach(function (photo, index) {
      var slide = document.createElement("button");
      slide.className = "gallery-slide";
      slide.type = "button";
      slide.setAttribute("aria-label", "Открыть фото: " + photo.alt);
      slide.addEventListener("click", function () {
        openLightbox(index);
      });

      var image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.alt;
      image.loading = "lazy";

      var zoom = document.createElement("span");
      zoom.className = "gallery-slide__zoom";
      zoom.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg>';

      slide.appendChild(image);
      slide.appendChild(zoom);
      galleryTrack.appendChild(slide);
    });

    gallerySlides = Array.prototype.slice.call(galleryTrack.querySelectorAll(".gallery-slide"));
    if (galleryTotal) galleryTotal.textContent = padPhotoNumber(galleryPhotos.length);
    updateGalleryControls();
  }

  renderGallery();

  if (galleryPrev) {
    galleryPrev.addEventListener("click", function () {
      scrollGallery(-1);
    });
  }
  if (galleryNext) {
    galleryNext.addEventListener("click", function () {
      scrollGallery(1);
    });
  }
  if (galleryViewport) {
    var galleryScrollTick = null;
    galleryViewport.addEventListener(
      "scroll",
      function () {
        if (galleryScrollTick) return;
        galleryScrollTick = window.requestAnimationFrame(function () {
          galleryScrollTick = null;
          updateGalleryControls();
        });
      },
      { passive: true }
    );
    galleryViewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollGallery(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollGallery(1);
      }
    });
    window.addEventListener("resize", updateGalleryControls);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      showPhoto(currentPhoto - 1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      showPhoto(currentPhoto + 1);
    });
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
    if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
  });

  var form = document.getElementById("calcForm");
  var success = document.getElementById("calcSuccess");
  var again = document.getElementById("calcAgain");
  var fileInput = document.getElementById("files");
  var fileName = document.getElementById("fileName");
  var phoneInput = form ? form.querySelector('input[name="phone"]') : null;
  var formEmail = "std.lebedev@yandex.ru";

  function buildMailto() {
    var data = new FormData(form);
    var labels = {
      name: "Имя",
      phone: "Телефон",
      category: "Категория",
      weight: "Объём",
      comment: "Комментарий"
    };
    var lines = ["Заявка с сайта Константа", ""];
    Object.keys(labels).forEach(function (key) {
      var value = data.get(key);
      if (value) lines.push(labels[key] + ": " + value);
    });
    if (fileInput && fileInput.files && fileInput.files.length) {
      var files = Array.prototype.map
        .call(fileInput.files, function (file) {
          return file.name;
        })
        .join(", ");
      lines.push("Файлы (приложите к письму): " + files);
    }
    return (
      "mailto:" +
      formEmail +
      "?subject=" +
      encodeURIComponent("Заявка с сайта Константа") +
      "&body=" +
      encodeURIComponent(lines.join("\n"))
    );
  }

  function formatPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (digits.charAt(0) === "8") digits = "7" + digits.slice(1);
    if (digits.charAt(0) !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);
    var rest = digits.slice(1);
    var result = "+7";
    if (rest.length) result += " (" + rest.slice(0, 3);
    if (rest.length >= 3) result += ") " + rest.slice(3, 6);
    if (rest.length >= 6) result += "-" + rest.slice(6, 8);
    if (rest.length >= 8) result += "-" + rest.slice(8, 10);
    return result;
  }

  if (phoneInput) {
    phoneInput.addEventListener("focus", function () {
      if (!phoneInput.value) phoneInput.value = "+7 ";
    });
    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhone(phoneInput.value);
    });
  }

  if (fileInput && fileName) {
    fileInput.addEventListener("change", function () {
      var count = fileInput.files ? fileInput.files.length : 0;
      fileName.textContent = count
        ? "Выбрано файлов: " + count
        : "JPG, PNG, PDF — до 10 МБ";
    });
  }

  if (form && success) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (phoneInput && phoneInput.value.replace(/\D/g, "").length < 11) {
        phoneInput.setCustomValidity("Введите номер телефона полностью");
        phoneInput.reportValidity();
        phoneInput.addEventListener(
          "input",
          function () {
            phoneInput.setCustomValidity("");
          },
          { once: true }
        );
        return;
      }
      if (phoneInput) phoneInput.setCustomValidity("");
      var mailto = buildMailto();
      form.hidden = true;
      success.hidden = false;
      showToast("Заявка сформирована. Отправьте письмо на " + formEmail + ".");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
      window.location.href = mailto;
    });
  }

  if (again && form && success) {
    again.addEventListener("click", function () {
      form.reset();
      if (fileName) fileName.textContent = "JPG, PNG, PDF — до 10 МБ";
      form.hidden = false;
      success.hidden = true;
      var firstField = form.querySelector("input, select, textarea");
      if (firstField) firstField.focus();
    });
  }

  document.querySelectorAll("[data-placeholder]").forEach(function (element) {
    element.addEventListener("click", function (event) {
      event.preventDefault();
      showToast("«" + element.getAttribute("data-placeholder") + "» появится позже.");
    });
  });

  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  var cookieBanner = document.getElementById("cookieBanner");
  var cookieAccept = document.getElementById("cookieAccept");
  if (cookieBanner && cookieAccept) {
    var cookiesAccepted = false;
    try {
      cookiesAccepted = window.localStorage.getItem("konstanta_cookies") === "accepted";
    } catch (error) {
      cookiesAccepted = false;
    }
    if (!cookiesAccepted) {
      window.setTimeout(function () {
        cookieBanner.classList.add("is-visible");
      }, 900);
    }
    cookieAccept.addEventListener("click", function () {
      cookieBanner.classList.remove("is-visible");
      try {
        window.localStorage.setItem("konstanta_cookies", "accepted");
      } catch (error) {
        /* localStorage may be unavailable */
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
