/**
 * Zavele Theme - custom.js
 *
 * Yampi Checkout Integration:
 * When yampiCheckoutUrl is configured in theme settings, all checkout
 * actions redirect to Yampi instead of Shopify's native checkout.
 */

(function () {
  'use strict';

  var yampiUrl = (window.theme && window.theme.yampiCheckoutUrl) || '';

  if (!yampiUrl) return;

  // Intercept Shopify checkout button clicks and redirect to Yampi
  function redirectToYampi(variantId, quantity) {
    var url = yampiUrl;
    if (variantId) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'variant=' + variantId;
    }
    if (quantity && quantity > 1) {
      url += '&qty=' + quantity;
    }
    window.location.href = url;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[name="checkout"], .cart__checkout, [data-action="checkout"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    redirectToYampi();
  }, true);

  // Intercept form submission to /checkout
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form && form.action && form.action.indexOf('/checkout') !== -1) {
      e.preventDefault();
      var variantInput = form.querySelector('[name="id"]');
      var qtyInput = form.querySelector('[name="quantity"]');
      redirectToYampi(
        variantInput ? variantInput.value : null,
        qtyInput ? qtyInput.value : null
      );
    }
  }, true);

})();

/**
 * Theme event hooks (available for custom extensions):
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant;
 * });
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant;
 *   var quantity = event.detail.quantity;
 * });
 */
