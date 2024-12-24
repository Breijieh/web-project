// product-page.js

/************************************************
  PRODUCT-PAGE SCRIPT
  - Waits for "allProductsDataLoaded" event,
    which is dispatched by main.js after 
    the product.json data finishes loading.
*************************************************/

document.addEventListener("DOMContentLoaded", () => {
  /**
   * We'll do the main logic inside the "allProductsDataLoaded" handler,
   * so we know for sure 'allProductsData' is not empty.
   */
  document.addEventListener("allProductsDataLoaded", () => {
    // 1. Parse the "id" from the query string: ?id=2, etc.
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id"), 10);

    // 2. Access 'allProductsData' (populated by main.js).
    //    'allProductsData' must be a global variable in main.js
    //    that references data.all from product.json.
    if (typeof allProductsData === "undefined") {
      console.error(
        "allProductsData is not defined. Check main.js loading order."
      );
      return;
    }

    // 3. Find the matching product
    const product = allProductsData.find((p) => p.id === productId);

    if (!product) {
      console.error("Product not found for ID:", productId);
      // Optionally redirect to products page
      // window.location.href = "products.html";
      return;
    }

    // 4. Update the DOM with product details
    const productImage = document.getElementById("product-image");
    const productTitle = document.getElementById("product-title");
    const productPrice = document.getElementById("product-price");
    const productDescription = document.getElementById("product-description");
    const quantityInput = document.getElementById("quantity");
    const addToCartBtn = document.querySelector(".add-to-cart");

    // Set the product image (assuming image files are in /images/)
    productImage.src = `images/${product.image_id}`;
    productImage.alt = product.title;

    // Set the title
    productTitle.textContent = product.title;

    // Determine which price to show: sale_price or regular price
    const displayPrice = product.sale_price ?? product.price;
    productPrice.textContent = `$${displayPrice.toFixed(2)}`;

    // Set the description
    productDescription.textContent = product.description;

    // 5. Optional: Handle "Add to Cart" if you'd like
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        // e.g., add the selected product to cart
        const qty = parseInt(quantityInput.value, 10) || 1;
        addToCart(product, qty); // This function should be in main.js
      });
    }
  });
});
