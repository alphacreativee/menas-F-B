const form = document.querySelector("[data-reservation-form]");

if (form) {
  const textFields = [...form.querySelectorAll(".reservation-input[required]")];
  const dropdowns = [...form.querySelectorAll(".reservation-field[data-required]")];
  const success = form.querySelector(".reservation-success");
  const phone = form.querySelector('[name="phone"]');
  const date = form.querySelector('[name="date"]');

  if (date && window.Lightpick) {
    new window.Lightpick({
      field: date,
      minDate: new Date(),
      singleDate: true,
      numberOfMonths: 1,
      format: "DD/MM/YYYY",
      orientation: "auto",
      onSelect: (selectedDate) => {
        if (!selectedDate) return;
        date.value = selectedDate.format("DD/MM/YYYY");
        date.dispatchEvent(new Event("input", { bubbles: true }));
        date.dispatchEvent(new Event("change", { bubbles: true }));
      },
    });
  }

  const syncFieldState = (field) => {
    const hasValue = Boolean(field.value.trim());
    field.closest(".reservation-field")?.classList.toggle("has-value", hasValue);
  };

  textFields.forEach((field) => {
    syncFieldState(field);
    field.addEventListener("input", () => {
      syncFieldState(field);
      field.classList.remove("is-invalid");
      field.closest(".reservation-field")?.classList.remove("is-invalid");
      if (success) success.hidden = true;
    });
    field.addEventListener("change", () => {
      syncFieldState(field);
      field.classList.remove("is-invalid");
      field.closest(".reservation-field")?.classList.remove("is-invalid");
      if (success) success.hidden = true;
    });
    field.addEventListener("blur", () => syncFieldState(field));
  });

  if (phone) {
    phone.addEventListener("input", () => {
      const start = phone.selectionStart ?? phone.value.length;
      const previous = phone.value;
      const sanitized = previous.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "").slice(0, 13);
      if (sanitized !== previous) {
        phone.value = sanitized;
        phone.setSelectionRange(Math.min(start, sanitized.length), Math.min(start, sanitized.length));
      }
    });
  }

  dropdowns.forEach((dropdown) => {
    dropdown.querySelectorAll(".dropdown-custom-item").forEach((option) => {
      option.addEventListener("click", () => {
        dropdown.classList.remove("is-invalid");
        if (success) success.hidden = true;
      });
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (success) success.hidden = true;

    let valid = true;
    let firstInvalid;

    textFields.forEach((field) => {
      const phoneDigits = field === phone ? field.value.replace(/\D/g, "").length : null;
      const isEmpty = !field.value.trim();
      const invalidPhone = field === phone && (phoneDigits < 10 || phoneDigits > 13);
      const invalidEmail = field.type === "email" && !field.checkValidity();
      const numericValue = field.type === "number" ? Number(field.value) : null;
      const invalidNumber =
        field.type === "number" &&
        (!Number.isInteger(numericValue) || numericValue <= 0);
      const invalid = isEmpty || invalidPhone || invalidEmail || invalidNumber;
      field.classList.toggle("is-invalid", invalid);
      field.closest(".reservation-field")?.classList.toggle("is-invalid", invalid);
      if (invalid) {
        valid = false;
        firstInvalid ||= field;
      }
    });

    dropdowns.forEach((dropdown) => {
      const invalid = !dropdown.classList.contains("selected");
      dropdown.classList.toggle("is-invalid", invalid);
      if (invalid) {
        valid = false;
        firstInvalid ||= dropdown.querySelector(".dropdown-custom-btn");
      }
    });

    if (!valid) {
      firstInvalid?.focus();
      return;
    }

    if (success) success.hidden = false;
  });
}
