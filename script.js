document.addEventListener("DOMContentLoaded", () => {
  let isENG = false;
  let oilEffect = false;
  let couponApplied = false;

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }

  function checkFormValidity() {
    const ime = document.querySelector("input[name='ime']")?.value.trim();
    const email = document.querySelector("input[name='email']")?.value.trim();
    const adresa = document.querySelector("input[name='adresa']")?.value.trim();
    const grad = document.querySelector("input[name='grad']")?.value.trim();
    const posta = document.querySelector("input[name='posta']")?.value.trim();
    const buyButton = document.getElementById("buyButton");
    const isValid = ime && validateEmail(email) && adresa && grad && posta;
    if (buyButton) buyButton.disabled = !isValid;
  }

  const formInputs = document.querySelectorAll("#orderForm input");
  formInputs.forEach((input) => input.addEventListener("input", checkFormValidity));

  const cartIcon = document.getElementById("cartIcon");
  const cartCount = document.getElementById("cartCount");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartCount();

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productName = button.dataset.product;
      let productPrice = 10;
      let image = button.parentElement.querySelector("img")?.src || "";
      cart.push({ name: productName, price: productPrice, image });
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
    });
  });

  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      window.location.href = "kosarica.html";
    });
  }

  function updateCartCount() {
    if (!cartCount) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartCount.innerText = cart.length;
    cartCount.style.display = cart.length ? "inline-block" : "none";
  }

  if (window.location.pathname.includes("kosarica.html")) {
    const cartContainer = document.getElementById("cartItems");
    const totalElement = document.getElementById("totalPrice");
    const buyButton = document.getElementById("buyButton");
    const uljeEfekt = document.getElementById("uljeEfekt");
    const couponInput = document.getElementById("couponInput");
    const couponBtn = document.getElementById("applyCouponBtn");
    const couponMessage = document.getElementById("couponMessage");
    let cartData = JSON.parse(localStorage.getItem("cart")) || [];
    let currentTotal = 0;

    function renderCart() {
      cartContainer.innerHTML = "";
      if (cartData.length === 0) {
        cartContainer.innerHTML = isENG ? "<p>The cart is empty.</p>" : "<p>Košarica je prazna.</p>";
        totalElement.innerText = "";
        return;
      }

      currentTotal = 0;
      cartData.forEach((item, index) => {
        currentTotal += item.price;
        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        itemDiv.innerHTML =
          itemDiv.innerHTML =
        '<div class="item-info">' +
            '<img src="' + item.image + '" alt="' + item.name + '" class="cart-thumb">' +
            '<span>' + item.name + ' - ' + item.price.toFixed(2) + ' €</span>' +
        '</div>' +
        '<button class="remove-item" data-index="' + index + '">×</button>';

        cartContainer.appendChild(itemDiv);
      });

      if (oilEffect) currentTotal += 5;
      if (couponApplied) currentTotal *= 0.9;

      totalElement.innerText = isENG
        ? "Total: " + currentTotal.toFixed(2) + " €"
        : "Ukupno: " + currentTotal.toFixed(2) + " €";

      document.querySelectorAll(".remove-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = btn.dataset.index;
          cartData.splice(i, 1);
          localStorage.setItem("cart", JSON.stringify(cartData));
          updateCartCount();
          renderCart();
        });
      });
    }

    renderCart();

    if (uljeEfekt) {
      uljeEfekt.addEventListener("change", () => {
        oilEffect = uljeEfekt.checked;
        renderCart();
      });
    }

    couponBtn.addEventListener("click", () => {
      const code = couponInput.value.trim().toUpperCase();
      const email = document.querySelector("input[name='email']").value.trim();
      const usedEmails = JSON.parse(localStorage.getItem("usedCouponEmails") || "[]");

      if (code === "WELCOME10" && !couponApplied && !usedEmails.includes(email.toLowerCase())) {
        couponApplied = true;
        couponMessage.style.color = "#28a745";
        couponMessage.innerText = "Kupon je uspješno primijenjen! -10%";
        usedEmails.push(email.toLowerCase());
        localStorage.setItem("usedCouponEmails", JSON.stringify(usedEmails));
      } else if (usedEmails.includes(email.toLowerCase())) {
        couponMessage.style.color = "#d9534f";
        couponMessage.innerText = "Već ste iskoristili kupon!";
      } else {
        couponMessage.style.color = "#d9534f";
        couponMessage.innerText = "Nevažeći kupon!";
      }
      renderCart();
    });

    buyButton.addEventListener("click", (e) => {
      e.preventDefault();
      const ime = document.querySelector("input[name='ime']").value;
      const email = document.querySelector("input[name='email']").value;
      const adresa = document.querySelector("input[name='adresa']").value;
      const grad = document.querySelector("input[name='grad']").value;
      const posta = document.querySelector("input[name='posta']").value;

      if (!validateEmail(email)) {
        alert("Molimo unesite ispravan email.");
        return;
      }

      localStorage.setItem("lastPurchase", JSON.stringify(cartData));

      const total = currentTotal;
      const itemsList = cartData.map(item => item.name + " - " + item.price + " €").join("\n");
      const message =
        `Ime i prezime: ${ime}
Email: ${email}
Adresa: ${adresa}
Grad: ${grad}
Poštanski broj: ${posta}

Proizvodi:
${itemsList}

Ukupno: ${total.toFixed(2)} €`;

      const form = document.createElement("form");
      form.action = "https://formspree.io/f/mblyelod";
      form.method = "POST";
      form.style.display = "none";

      const emailInput = document.createElement("input");
      emailInput.name = "email";
      emailInput.value = email;
      form.appendChild(emailInput);

      const messageInput = document.createElement("textarea");
      messageInput.name = "message";
      messageInput.value = message;
      form.appendChild(messageInput);

      document.body.appendChild(form);
      form.submit();

      localStorage.removeItem("cart");
      window.location.href = "hvala.html";
    });
  }

  if (window.location.pathname.includes("hvala.html")) {
    const data = JSON.parse(localStorage.getItem("lastPurchase"));
    if (data && data.length > 0) {
      const div = document.createElement("div");
      div.innerHTML = "<h2>Kupljeni proizvodi:</h2><ul>" + data.map(i => `<li>${i.name} - ${i.price} €</li>`).join("") + "</ul>";
      document.body.appendChild(div);
    }
  }

  // Newsletter modal
  const modal = document.getElementById("newsletterModal");
  const popupModal = document.getElementById("newsletterPopup");
  const openBtn = document.getElementById("newsletterBtn");
  const closeBtn = document.getElementById("closeModal");
  const submitBtn = document.getElementById("submitEmail");
  const emailInput = document.getElementById("emailInput");
  const responseMsg = document.getElementById("responseMsg");
  const popupSubmitBtn = document.getElementById("popupSubmitEmail");
  const popupEmailInput = document.getElementById("popupEmailInput");
  const popupResponseMsg = document.getElementById("popupResponseMsg");
  const closePopupModalBtn = document.getElementById("closePopupModal");

  function handleNewsletterSubmit(emailInputElem, responseElem, modalElem) {
    const email = emailInputElem.value.trim();
    if (!validateEmail(email)) {
      responseElem.style.color = "#d9534f";
      responseElem.innerText = "Unesite ispravan email.";
      return;
    }
    emailjs.send("service_eu0z18p", "template_4qa1fac", {
  email: email,
  coupon_code: "WELCOME10"
}, "sgH_wGapGLRAusYRL")
  .then(() => {
    // ✅ Poruka kupcu uspješno poslana
    responseElem.style.display = "block";
    responseElem.style.color = "green";
    responseElem.innerText = "Hvala na prijavi! Kupon: WELCOME10";

    // ✅ Dodatno: pošalji meni kao vlasnici obavijest
    emailjs.send("service_eu0z18p", "template_l6fgv8h", {
      user_email: email,
      prijavljeno_datum: new Date().toLocaleString("hr-HR")
    }, "sgH_wGapGLRAusYRL");
  })
  .catch((error) => {
    console.error("Greška pri slanju:", error);
    responseElem.style.color = "#d9534f";
    responseElem.innerText = "Došlo je do greške. Pokušajte ponovno.";
  });
  }

  if (openBtn) {
  openBtn.onclick = () => modal.style.display = "flex";
}
if (closeBtn) {
  closeBtn.onclick = () => {
    modal.style.display = "none";
    responseMsg.innerText = "";
    responseMsg.style.display = "none";
    emailInput.value = "";
  };
}
if (closePopupModalBtn) {
  closePopupModalBtn.onclick = () => {
    popupModal.style.display = "none";
    popupResponseMsg.innerText = "";
    popupResponseMsg.style.display = "none";
    popupEmailInput.value = "";
  };
}
if (submitBtn) {
  submitBtn.onclick = () => {
    handleNewsletterSubmit(emailInput, responseMsg, modal);
  };
}
if (popupSubmitBtn) {
  popupSubmitBtn.onclick = () => {
    handleNewsletterSubmit(popupEmailInput, popupResponseMsg, popupModal);
  };
}

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
    if (e.target === popupModal) popupModal.style.display = "none";
  };

// ========== COLOR PICKER + PREVIEW ==========
  const imageUpload = document.getElementById("imageUpload");
  const colorPicker = document.getElementById("colorPicker");
  const previewImage = document.getElementById("previewImage");
  const previewArea = document.getElementById("previewArea");

  if (imageUpload && colorPicker && previewImage && previewArea) {
    imageUpload.addEventListener("change", () => {
      const file = imageUpload.files[0];
      if (file) {
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
      }
    });

    colorPicker.addEventListener("input", () => {
      previewArea.style.backgroundColor = colorPicker.value;
    });
  }

  // Delivery info
  const deliveryDate = document.getElementById("deliveryDate");
  const deliveryInfo = document.getElementById("deliveryInfo");
  const langBtn = document.getElementById("langBtn");
  const naslov = document.getElementById("naslov");

  if (langBtn) {
  langBtn.addEventListener("click", () => {
    isENG = !isENG;
    langBtn.innerText = isENG ? "HR" : "ENG";

    // ==================== INDEX.html ====================
    const naslov = document.getElementById("naslov");
    if (naslov) {
      // Provjeri po sadržaju koja je stranica
      if (window.location.pathname.includes("index.html")) {
        naslov.innerText = isENG ? "Welcome to Demo Shop" : "Dobrodošli u Demo Shop";
      } else if (window.location.pathname.includes("kosarica.html")) {
        naslov.innerText = isENG ? "Your Cart" : "Tvoja košarica";
      }
    }

    const newsletterTitle = document.querySelector("#newsletter .section-title");
    if (newsletterTitle) newsletterTitle.innerText = "Newsletter";
    const newsletterBtn = document.querySelector("#newsletterBtn");
    if (newsletterBtn) newsletterBtn.innerText = isENG ? "Subscribe to Newsletter" : "Prijavi se na newsletter";

    const colorLabel = document.querySelector("label[for='colorPicker']");
    if (colorLabel) colorLabel.innerText = isENG ? "Choose background color:" : "Odaberite boju pozadine:";

    const deliverySection = document.querySelector("#delivery .section-title");
    if (deliverySection) deliverySection.innerText = isENG ? "Choose delivery date" : "Odaberite datum isporuke";

    const proizvodiNaslov = document.querySelector("#proizvodi .section-title");
    if (proizvodiNaslov) proizvodiNaslov.innerText = isENG ? "Our Products" : "Naši proizvodi";

    const proizvodi = document.querySelectorAll(".product");
    proizvodi.forEach((el, i) => {
      const naziv = ["Poster A", "Poster B", "Poster C"];
      const opisi = isENG
        ? ["Caricature poster", "Family tree poster", "Star map poster"]
        : ["Poster karikature", "Poster obiteljskog stabla", "Poster zvjezdane mape"];
      el.querySelector("h3").innerText = naziv[i];
      el.querySelectorAll("p")[0].innerText = opisi[i];
      el.querySelector("button").innerText = isENG ? "Add to Cart" : "Dodaj u košaricu";
      });
        
      const oilEffectLabel = document.querySelector("#uljeEfekt")?.parentElement;
      if (oilEffectLabel) {
         oilEffectLabel.innerHTML =
            '<input type="checkbox" id="uljeEfekt">' +
            (isENG ? "I want the oil effect on canvas (+5 €)" : "Želim efekt ulja na platnu (+5 €)");
        }



      const couponInput = document.getElementById("couponInput");
      if (couponInput) {
        couponInput.placeholder = isENG
            ? "Enter coupon"
            : "Unesite kupon";
      }

        const couponButton = document.getElementById("applyCouponBtn");
        if (couponButton) {
        couponButton.innerText = isENG ? "Apply coupon" : "Iskoristi kupon";
        }

        const footerText = document.querySelector("footer p");
        if (footerText) footerText.innerText = isENG ? "Follow us:" : "Pratite nas:";
        

    // ==================== KOŠARICA.html ====================
    const ime = document.querySelector("input[name='ime']");
    const email = document.querySelector("input[name='email']");
    const adresa = document.querySelector("input[name='adresa']");
    const grad = document.querySelector("input[name='grad']");
    const posta = document.querySelector("input[name='posta']");
    const buyBtn = document.getElementById("buyButton");

    if (ime) ime.placeholder = isENG ? "Full Name" : "Ime i prezime";
    if (email) email.placeholder = isENG ? "Email Address" : "Email adresa";
    if (adresa) adresa.placeholder = isENG ? "Address" : "Adresa";
    if (grad) grad.placeholder = isENG ? "City" : "Grad";
    if (posta) posta.placeholder = isENG ? "Postal Code" : "Poštanski broj";
    if (buyBtn) buyBtn.innerText = isENG ? "Buy" : "Kupi";
      
      document.querySelector("footer p").innerText = isENG ? "Follow us:" : "Pratite nas:";
    }); 
    }

    if (deliveryDate && deliveryInfo) {
    deliveryDate.addEventListener("change", () => {
      const selectedDate = new Date(deliveryDate.value);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = selectedDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        deliveryInfo.textContent = isENG ? "Date cannot be in the past." : "Datum ne može biti u prošlosti.";
        deliveryInfo.style.color = "#d9534f";
      } else if (diffDays < 7) {
        deliveryInfo.textContent = isENG ? "Fast delivery (+5 €)" : "Brza isporuka (+5 €)";
        deliveryInfo.style.color = "#d9534f";
      } else {
        deliveryInfo.textContent = isENG ? "Standard delivery (free)" : "Standardna isporuka (besplatno)";
        deliveryInfo.style.color = "#28a745";
      }
    });
  }
});
