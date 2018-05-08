window.custom = window.custom || {};


//variant prototype

let customVariants = {}

let selectors = {
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]',
  comparePrice: '[data-compare-price]',
  comparePriceText: '[data-compare-text]',
  originalSelectorId: '[data-product-select]',
  priceWrapper: '[data-price-wrapper]',
  productFeaturedImage: '[data-product-featured-image]',
  productJson: '[data-product-json]',
  productPrice: '[data-product-price]',
  productThumbs: '[data-product-single-thumbnail]',
  singleOptionSelector: '[data-single-option-selector]', 
  singleOptionSelectorColor: '[data-single-selector-color]'
};

customVariants.onSelectChange = () => {

}

custom.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.singleOptionSelectorColor = options.singleOptionSelectorColor;
    this.radioSelector = options.radioSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
    $('body').on('click', '[data-product-single-thumbnail]', this._productThumbChange.bind(this))
  }

  Variants.prototype = $.extend({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = $.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {

            currentOption.value = $element.val();
            currentOption.index = $element.data('index');
  
            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');
    
          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      // currentOptions = slate.utils.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;
      var found = false;

      variants.forEach(function(variant) {
        var satisfied = true;

        selectedValues.forEach(function(option) {
          if (satisfied) {
            satisfied = (option.value === variant[option.index]);
          }
        });

        if (satisfied) {
          found = variant;
        }
      });

      return found || null;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();
      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });
      var current_option = $('[data-single-selector-color]:checked').data('single-selector-color')
      this._buildColorImages(current_option)
      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    _getQueryParams: function(str) {
       var queryString = str || window.location.search || '';
       var keyValPairs = [];
       var params      = {};
       queryString     = queryString.replace(/.*?\?/,"");

       if (queryString.length)
       {
          keyValPairs = queryString.split('&');
          for (pairNum in keyValPairs)
          {
             var key = keyValPairs[pairNum].split('=')[0];
             if (!key.length) continue;
             if (typeof params[key] === 'undefined')
             params[key] = [];
             params[key].push(keyValPairs[pairNum].split('=')[1]);
          }
       }
       return params;
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }
      
      var current_option = $('[data-single-selector-color]:checked').data('single-selector-color')
      // this._buildColorImages(current_option)
      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id + '&current_option=' + current_option;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    _productThumbChange: function(evt) {
      this.$container.trigger({
        type: 'productThumbChange', 
        thumb: evt.target
      });
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container)[0].value = variant.id;
    }
  });

  return Variants;
})();



