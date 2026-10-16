export function customDropdown() {
  const dropdowns = document.querySelectorAll(
    ".dropdown-custom, .dropdown-custom-select",
  );
  if (!dropdowns.length) return;
  dropdowns.forEach((dropdown) => {
    const btnDropdown = dropdown.querySelector(".dropdown-custom-btn");
    const dropdownMenu = dropdown.querySelector(".dropdown-custom-menu");
    const dropdownItems = dropdown.querySelectorAll(".dropdown-custom-item");
    const valueSelect = dropdown.querySelector(".value-select");
    const displayText = dropdown.querySelector(".dropdown-custom-text");

    const isSelectType = dropdown.classList.contains("dropdown-custom-select");

    btnDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
      closeAllDropdowns(dropdown);
      dropdownMenu.classList.toggle("dropdown--active");
      btnDropdown.classList.toggle("--active");
    });

    document.addEventListener("click", function () {
      closeAllDropdowns();
    });

    dropdownItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.stopPropagation();

        if (isSelectType) {
          const optionText = item.textContent;
          displayText.textContent = optionText;
          dropdown.classList.add("selected");
        } else {
          const currentImgEl = valueSelect.querySelector("img");
          const currentImg = currentImgEl ? currentImgEl.src : "";
          const currentText = valueSelect.querySelector("span").textContent;
          const clickedHtml = item.innerHTML;

          valueSelect.innerHTML = clickedHtml;

          const isSelectTime = currentText.trim() === "Time";

          if (!isSelectTime) {
            if (currentImg) {
              item.innerHTML = `<span>${currentText}</span><img src="${currentImg}" alt="" />`;
            } else {
              item.innerHTML = `<span>${currentText}</span>`;
            }
          }
        }

        closeAllDropdowns();
      });
    });

    window.addEventListener("scroll", function () {
      if (dropdownMenu.closest(".header-lang")) {
        dropdownMenu.classList.remove("dropdown--active");
        btnDropdown.classList.remove("--active");
      }
    });
  });

  function closeAllDropdowns(exception) {
    dropdowns.forEach((dropdown) => {
      const menu = dropdown.querySelector(".dropdown-custom-menu");
      const btn = dropdown.querySelector(".dropdown-custom-btn");

      if (!exception || dropdown !== exception) {
        menu.classList.remove("dropdown--active");
        btn.classList.remove("--active");
      }
    });
  }
}

/////// thêm class select-tab vào thì vẫn filter theo đúng type đó, không show hết item.
export function createFilterTab() {
  document.querySelectorAll(".filter-section").forEach((section) => {
    let result;

    const targetSelector = section.dataset.target;
    if (targetSelector) {
      result = document.querySelector(targetSelector);
    } else {
      result = section.querySelector(".filter-section-result");
      if (!result) {
        result = section.nextElementSibling;
        if (!result?.classList.contains("filter-section-result")) return;
      }
    }

    if (!result) return;
    //check select tab
    const isSelectTab = section.classList.contains("select-tab");
    const buttons = section.querySelectorAll(".filter-button[data-type]");

    const activeBtn = section.querySelector(".filter-button.active");
    if (activeBtn) {
      const activeType = activeBtn.dataset.type;
      if (activeType !== "all") {
        result.querySelectorAll(".filter-item").forEach((item) => {
          item.style.display = item.classList.contains(activeType)
            ? ""
            : "none";
        });
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        section
          .querySelectorAll(".filter-button")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        const type = this.dataset.type;
        const items = result.querySelectorAll(".filter-item");

        gsap
          .timeline()
          .to(result, { autoAlpha: 0, duration: 0.3 })
          .call(() => {
            items.forEach((item) => {
              // Nếu là select-tab thì không có trường hợp "all" → luôn filter theo type
              if (!isSelectTab && type === "all") {
                item.style.display = "";
              } else {
                item.style.display = item.classList.contains(type)
                  ? ""
                  : "none";
              }
            });
          })
          .to(result, { autoAlpha: 1, duration: 0.3 });
      });
    });
  });
}

export function getDateLightPick() {
  var picker = new Lightpick({
    field: document.getElementById("datepicker"),
    minDate: new Date(),
    singleDate: false,
    numberOfMonths: 2,
    // lang: "en-US",
  });
}
export function headerScroll() {
  const header = document.getElementById("header");
  if (!header) return null;

  const isMobile = window.innerWidth <= 991;
  // const threshold = isMobile ? 100 : window.innerHeight;

  const banner = document.querySelector(".banner");

  const RATIO = 0.9;
  const baseHeight =
    banner?.getBoundingClientRect().height || window.innerHeight || 100;

  const threshold = isMobile ? 100 : baseHeight * RATIO;

  const trigger = ScrollTrigger.create({
    start: "top top",
    end: 9999,
    onUpdate: (self) => {
      const currentScroll = self.scroll();

      if (currentScroll > threshold) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    },
  });

  return trigger;
}
export function header() {
  const ham = document.getElementById("icon-ham");
  if (!ham) return;

  if (ham.dataset.scriptInitialized) return;
  ham.dataset.scriptInitialized = "true";

  const header = document.getElementById("header");
  const ovl = header?.querySelector(".header-ovl");
  const menu = header?.querySelector(".header-menu");
  if (!ovl || !menu) return;

  // Trạng thái ban đầu: ẩn
  gsap.set(ovl, { autoAlpha: 0 });
  gsap.set(menu, { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true });
  tl.to(ovl, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0).to(
    menu,
    { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
    0.15,
  );

  function open() {
    ham.classList.add("active");
    ovl.classList.add("active");
    menu.classList.add("active");
    // document.body.style.overflow = "hidden";
    tl.timeScale(1).play();
  }

  function close() {
    ham.classList.remove("active");
    ovl.classList.remove("active");
    menu.classList.remove("active");
    // document.body.style.overflow = "";
    tl.timeScale(1.5).reverse(); // đóng nhanh hơn một chút, menu ẩn trước rồi tới overlay
  }

  ham.addEventListener("click", () => {
    ham.classList.contains("active") ? close() : open();
  });

  // Bấm vào overlay hoặc nhấn Esc thì đóng
  ovl.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ham.classList.contains("active")) close();
  });
}
