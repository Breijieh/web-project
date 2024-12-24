/************************************************
   MAIN.JS
   - Loads product.json via AJAX
   - Fills the global allProductsData array
   - Dispatches "allProductsDataLoaded" event
   - Renders product listing (if on listing page)
   - Renders cart (if on cart page), etc.
*************************************************/

let allProductsData = [];

// Toast Notification Box
let toastBox = document.getElementById("toastBox");
let successMsg =
  '<i class="fa-solid fa-circle-check"></i> Added to cart successfully';

// Display a toast notification
function showToast(msg) {
  if (!toastBox) return;
  let toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = msg;
  toastBox.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Retrieve the cart array from localStorage
function getCart() {
  let cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

// Update localStorage with the new cart array
function setCart(cartArray) {
  localStorage.setItem("cart", JSON.stringify(cartArray));
}

// Update the cart count badge in the header
function updateCartCount() {
  let cart = getCart();
  let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#number-cart").text(totalQuantity);
}

// Add a product to the cart
function addToCart(perfume, quantity = 1) {
  let cart = getCart();

  let existingItem = cart.find((item) => item.id === perfume.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...perfume, quantity });
  }

  setCart(cart);
  updateCartCount();
  showToast(successMsg);
}

// Generate HTML for the price section
function createPriceHTML(price, salePrice) {
  if (salePrice) {
    return `
      <div class="price">
        <s>$${price.toFixed(2)}</s>
        $${salePrice.toFixed(2)}
      </div>
    `;
  }
  return `<div class="price">$${price.toFixed(2)}</div>`;
}

// Generate HTML for a single product card (listing)
function createProductCard(perfume) {
  const priceHTML = createPriceHTML(perfume.price, perfume.sale_price);
  return `
    <figure class="snip1418 hover">
      <div class="card-image-container">
        <!-- Clicking this link takes the user to product.html with the product ID -->
        <a href="product.html?id=${perfume.id}">
          <img src="images/${perfume.image_id}" alt="${perfume.title}" />
        </a>
      </div>
      <div class="add-to-cart" data-id="${perfume.id}">
        <i class="fa-solid fa-cart-plus"></i>
        <span>Add to Cart</span>
      </div>
      <figcaption>
        <h3 class="header-font">${perfume.title}</h3>
        <p>${perfume.description}</p>
        ${priceHTML}
      </figcaption>
    </figure>
  `;
}

// Populate all products into a specified container (for listing pages)
function populateAllProducts(productsArray, containerSelector) {
  const $container = $(containerSelector);
  $container.empty();

  productsArray.forEach((perfume) => {
    const cardHTML = createProductCard(perfume);
    $container.append(cardHTML);
  });
}

// Populate category-based products into a specified container (home page sections)
function populateCategory(perfumes, containerSelector) {
  const $container = $(containerSelector);
  $container.empty();

  perfumes.forEach((perfume) => {
    const cardHTML = createProductCard(perfume);
    $container.append(cardHTML);
  });
}

// Render the cart page
function renderCartPage() {
  let cart = getCart();
  const $cartTableBody = $(".cart-table tbody");
  const $subtotal = $("#subtotal");
  const $total = $("#total");

  if (!$cartTableBody.length) return; // Not on cart page

  $cartTableBody.empty();

  const shippingCost = 10.0;
  let subtotalValue = 0;

  cart.forEach((item) => {
    const itemPrice = item.sale_price || item.price;
    const lineTotal = itemPrice * item.quantity;
    subtotalValue += lineTotal;

    const rowHTML = `
      <tr data-id="${item.id}">
        <td>
          <img src="images/${item.image_id}" alt="${
      item.title
    }" class="cart-product-image">
        </td>
        <td>${item.title}</td>
        <td>$${itemPrice.toFixed(2)}</td>
        <td>
          <input type="number" min="1" value="${
            item.quantity
          }" class="quantity-input">
        </td>
        <td class="line-total">$${lineTotal.toFixed(2)}</td>
        <td>
          <a href="#" class="remove-item"><i class="fa-solid fa-trash"></i></a>
        </td>
      </tr>
    `;
    $cartTableBody.append(rowHTML);
  });

  $subtotal.text(`$${subtotalValue.toFixed(2)}`);
  $total.text(`$${(subtotalValue + shippingCost).toFixed(2)}`);

  // Remove item
  $(".remove-item")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      let $tr = $(this).closest("tr");
      let itemId = parseInt($tr.data("id"), 10);

      cart = cart.filter((c) => c.id !== itemId);
      setCart(cart);

      renderCartPage();
      updateCartCount();
    });

  // Change quantity
  $(".quantity-input")
    .off("change")
    .on("change", function () {
      let $tr = $(this).closest("tr");
      let itemId = parseInt($tr.data("id"), 10);
      let newQty = parseInt($(this).val(), 10) || 1;

      let foundItem = cart.find((c) => c.id === itemId);
      if (foundItem) {
        foundItem.quantity = newQty;
      }
      setCart(cart);

      renderCartPage();
      updateCartCount();
    });
}

// Sort products by chosen sortType
function sortProducts(products, sortType) {
  let sorted = [...products];

  switch (sortType) {
    case "titleAsc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "titleDesc":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "priceAsc":
      sorted.sort((a, b) => {
        let priceA = a.sale_price ?? a.price;
        let priceB = b.sale_price ?? b.price;
        return priceA - priceB;
      });
      break;
    case "priceDesc":
      sorted.sort((a, b) => {
        let priceA = a.sale_price ?? a.price;
        let priceB = b.sale_price ?? b.price;
        return priceB - priceA;
      });
      break;
    default:
      return products;
  }
  return sorted;
}

// On Document Ready
$(document).ready(function () {
  updateCartCount();

  // 1. Fetch product data from JSON (asynchronously)
  $.ajax({
    url: "product.json", // Make sure this path is correct
    dataType: "json",
    success: function (data) {
      // 2. Store all products in the global array
      allProductsData = data.all;

      // 3. Dispatch event so product-page.js can know data is loaded
      document.dispatchEvent(new CustomEvent("allProductsDataLoaded"));

      // 4. For the listing pages (if .product-listing is present)
      if ($(".product-listing .product-grid").length) {
        let currentSearchTerm = "";
        let currentSortType = "none";

        function renderProducts() {
          // Filter
          const filtered = allProductsData.filter((perfume) =>
            perfume.title.toLowerCase().includes(currentSearchTerm)
          );

          // Sort
          const finalArray = sortProducts(filtered, currentSortType);

          // Populate
          populateAllProducts(finalArray, ".product-listing .product-grid");
        }

        // Initial render
        renderProducts();

        // Search
        $("#search-bar").on("input", function () {
          currentSearchTerm = $(this).val().toLowerCase();
          renderProducts();
        });

        // Sorting
        $("#sort-select").on("change", function () {
          currentSortType = $(this).val();
          renderProducts();
        });
      }

      // 5. Home page sections
      // e.g. .new-arrivals, .best-selling, .blog-posts
      // If the elements exist, populate them
      if ($(".new-arrivals .product-grid").length) {
        let newArrivalsCat = data.categories.find((cat) => cat.id === 2);
        if (newArrivalsCat) {
          populateCategory(
            newArrivalsCat.perfumes,
            ".new-arrivals .product-grid"
          );
        }
      }
      if ($(".best-selling .product-grid").length) {
        let bestSellingCat = data.categories.find((cat) => cat.id === 3);
        if (bestSellingCat) {
          populateCategory(
            bestSellingCat.perfumes,
            ".best-selling .product-grid"
          );
        }
      }
      if ($(".blog-posts .blog-grid").length) {
        let classicCat = data.categories.find((cat) => cat.id === 1);
        if (classicCat) {
          populateCategory(classicCat.perfumes, ".blog-posts .blog-grid");
        }
      }

      // 6. Cart page
      if ($(".cart-table").length) {
        renderCartPage();
      }
    },
    error: function (error) {
      console.error("Error loading product data:", error);
    },
  });

  // Handle "Add to Cart" clicks
  $(document).on("click", ".add-to-cart", function () {
    const perfumeId = parseInt($(this).data("id"), 10);
    const foundPerfume = allProductsData.find((p) => p.id === perfumeId);
    if (!foundPerfume) {
      console.warn("Perfume not found in allProductsData, skipping addToCart");
      return;
    }
    addToCart(foundPerfume, 1);
  });

  // Mobile menu toggle
  $("#bars").on("click", function () {
    $("#nav-list").toggleClass("active");
  });
});
