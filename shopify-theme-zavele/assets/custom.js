/**
 * Yampi Checkout Integration
 * Quando yampi_checkout_url estiver configurado nas Integrações do tema,
 * os botões de checkout redirecionam para o Yampi automaticamente.
 */
(function () {
  var yampiUrl = (window.theme && window.theme.yampiCheckoutUrl) || '';
  if (!yampiUrl) return;

  function goYampi(variantId, qty) {
    var url = yampiUrl;
    if (variantId) url += (url.indexOf('?') === -1 ? '?' : '&') + 'variant=' + variantId;
    if (qty && qty > 1) url += '&qty=' + qty;
    window.location.href = url;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[name="checkout"], .cart__checkout, [data-action="checkout"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    goYampi();
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form && form.action && form.action.indexOf('/checkout') !== -1) {
      e.preventDefault();
      var v = form.querySelector('[name="id"]');
      var q = form.querySelector('[name="quantity"]');
      goYampi(v ? v.value : null, q ? q.value : null);
    }
  }, true);
})();
