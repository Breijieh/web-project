let allProductsData = [];

let toastBox = document.getElementById("toastBox");
let successMsg =
  '<i class="fa-solid fa-circle-check"></i> Added to cart successfully';

/**
 * Display a toast notification
 * @param {string} msg - The message to display
 */
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

/** Retrieve the cart array from localStorage */
function getCart() {
  let cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

/** Update localStorage with the new cart array */
function setCart(cartArray) {
  localStorage.setItem("cart", JSON.stringify(cartArray));
}

/** Update the cart count badge in the header */
function updateCartCount() {
  let cart = getCart();
  let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#number-cart").text(totalQuantity);
}

/**
 * Add a product to the cart
 * @param {Object} perfume - The product object
 * @param {number} quantity - Quantity to add
 */
function addToCart(perfume, quantity = 1) {
  let cart = getCart();

  let existingItem = cart.find((item) => item.id === perfume.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...perfume, quantity: quantity });
  }

  setCart(cart);
  updateCartCount();
  showToast(successMsg);
}

/** Generate HTML for the price section */
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

/** Generate HTML for a single product card */
function createProductCard(perfume) {
  const priceHTML = createPriceHTML(perfume.price, perfume.sale_price);
  return `
    <figure class="snip1418 hover">
      <div class="card-image-container">
        <img src="images/${perfume.image_id}" alt="${perfume.title}" />
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

/**
 * Populate all products into a specified container
 * @param {Array} productsArray - Array of product objects
 * @param {string} containerSelector - jQuery selector for the container
 */
function populateAllProducts(productsArray, containerSelector) {
  const $container = $(containerSelector);
  $container.empty();

  productsArray.forEach((perfume) => {
    const cardHTML = createProductCard(perfume);
    $container.append(cardHTML);
  });
}

/**
 * Populate category-based products into a specified container
 * @param {Array} perfumes - Array of product objects
 * @param {string} containerSelector - jQuery selector for the container
 */
function populateCategory(perfumes, containerSelector) {
  const $container = $(containerSelector);
  $container.empty();

  perfumes.forEach((perfume) => {
    const cardHTML = createProductCard(perfume);
    $container.append(cardHTML);
  });
}

/**
 * Render the cart page by populating the table with cart items
 */
function renderCartPage() {
  let cart = getCart();
  const $cartTableBody = $(".cart-table tbody");
  const $subtotal = $("#subtotal");
  const $total = $("#total");

  if (!$cartTableBody.length) return;

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

/**
 * Sort products based on sortType
 * @param {Array} products - The array of product objects
 * @param {string} sortType - The type of sorting (titleAsc, titleDesc, priceAsc, priceDesc, etc.)
 * @returns {Array} A new sorted array (or the same array if no sort selected)
 */
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

$(document).ready(function () {
  updateCartCount();

  $.ajax({
    url: "product.json",
    dataType: "json",
    success: function (data) {
      allProductsData = data.all;

      if ($(".product-listing .product-grid").length) {
        let currentSearchTerm = "";
        let currentSortType = "none";

        function renderProducts() {
          const filtered = allProductsData.filter((perfume) => {
            return perfume.title.toLowerCase().includes(currentSearchTerm);
          });

          const finalArray = sortProducts(filtered, currentSortType);

          populateAllProducts(finalArray, ".product-listing .product-grid");
        }

        renderProducts();

        $("#search-bar").on("input", function () {
          currentSearchTerm = $(this).val().toLowerCase();
          renderProducts();
        });

        $("#sort-select").on("change", function () {
          currentSortType = $(this).val();
          renderProducts();
        });
      }

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

      if ($(".cart-table").length) {
        renderCartPage();
      }
    },
    error: function (error) {
      console.error("Error loading product data:", error);
    },
  });

  $(document).on("click", ".add-to-cart", function () {
    const perfumeId = parseInt($(this).data("id"), 10);

    const foundPerfume = allProductsData.find((p) => p.id === perfumeId);
    if (!foundPerfume) {
      console.warn("Perfume not found in allProductsData, skipping addToCart");
      return;
    }

    addToCart(foundPerfume, 1);
  });

  function menuToggle() {
    $("#bars").click(function () {
      $("#nav-list").toggleClass("active");
    });
  }
  menuToggle();
});
