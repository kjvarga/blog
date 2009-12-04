/**
 * Run jQuery in no conflict mode so that it doesn't clash with MooTools $() function.
 * The jQuery $() function is now accessed as $().
 */
//var $ = jQuery.noConflict();

/**
 * Add an escape function to the RegExp object.
 * 
 * @see http://simonwillison.net/2006/Jan/20/escape/
 *
 * KJV: Modified to include '^' and '$' which match at the
 * start and end of a line (with the g modifier).
 */
RegExp.escape = function(text) {
  if (!arguments.callee.sRE) {
    var specials = [
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\', '^', '$'
    ];
    arguments.callee.sRE = new RegExp(
      '(\\' + specials.join('|\\') + ')', 'g'
    );
  }
  return text.replace(arguments.callee.sRE, '\\$1');
};

/**
 * Add new functions to String
 *
 * Return the first word in the string, or the empty string if none
 * can be found.
 *
 * @return a new string
 */
String.prototype.firstWord = function() {
  var match = this.match(/\w+/);
  return match ? match[0] : '';
};

/**
 * Trim whitespace from the beginning and end of the string.
 *
 * @return a new string
 */
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, '');
};


/**
 * Set default settings for AJAX queries.  Override as needed.
 */
jQuery.ajaxSetup({
  timeout: 30000,
  error: function(xmlreq, status, error) {
    if (status == 'timeout') {
      alert('There was a timeout. Please try again.');
    } else {
      alert('An ' + status + ' occurred (details ' + error + ')');
    }
  }
});

/** 
 * Extend jQuery.
 *
 */
jQuery.fn.extend({
  
  /**
   * Highlight and fade out an element to visibility: hidden so that it still takes up DOM space.
   * Works for table rows (which use display: table-row as opposed to the usual display: block).
   *
   */
  highlightFade: function(speed) {
    this.each(function() { 
    $(this).effect('highlight', { mode: 'hide' }, speed, function() {
      // retore the elements visibility and display type
      this.style.visibility = "hidden";
      if ($(this).is('tr')) {
        this.style.display = 'table-row';
      } else {
        this.style.display = 'block';
      }
    });
  });
  return this;
  },

  /**
   * Highlight and fade out an element to display: none.  Just a wrapper for effect('highlight', ...)
   * for completeness.  Use highlightFade() to highlight and fade but still maintain visibility.
   */
  highlightHide: function(speed) {
    this.effect('highlight', { mode: 'hide' }, speed);
    return this;
  },

  /**
   * Highlight and fade in an element.  Works for visibility: hidden elements as well 
   * as elements with display: none.  jQuery highlight doesn't work on table rows, so
   * we apply the effect to the row cells.
   */
  highlightShow: function(speed) {
    this.each(function() {
    if ($(this).hidden().length) {
      this.style.display = "none";         // highlight only works when display is none
      this.style.visibility = "visible";
    }
    var apply_to = $(this);
    if ($(this).is('tr')) {
      apply_to = apply_to.find('td');
    }
    apply_to.effect('highlight', {}, speed);
  });
  return this;
  },

  /**
   * Highlight fade out and remove.  jQuery highlight doesn't work on table rows, so
   * we apply the effect to the row cells.
   */
  highlightRemove: function(speed, callback) {
  this.each(function() {
    var original_target = $(this);
    var apply_to = original_target;
    if ($(this).is('tr')) {
      apply_to = apply_to.find('td');
    }
    apply_to.effect("highlight", {mode: 'hide'}, speed, function() { 
      original_target.remove();
      if (callback != undefined) {
        callback.call(this);
      }
    });
  });
  return this;
  },

  /**
   * Return elements which have visibility: hidden.
   * The jQuery :hidden selector only matches elements with display: none.
   */
  hidden: function() {
  var hidden = [];
  this.each(function() {
    if (this.style.visibility == 'hidden') {
      hidden.push(this);
    }
  });
  return $(hidden);
  },

  /**
   * Extract a numeric id stored in an element's Id attribute.  Usually used to identify
   * database records on a page for attaching events or link references to them.
   *
   * The id is taken to be any digits on the end of the string.  For example the following
   * shows the id attribute and the functions return value:
   *    person34 => 34
   *    company-45 => 45
   *    person-company-1 => 1
   *  
   * @return integer id if called on a jQuery list of one element, or a list of ids if 
   *    the list contains more than one element.
   */
  extractId: function() {
    var ids = [];
    this.each(function() {
      var id = $(this).attr('id');
      id = id.match(/(\d+$)/)[0];
      ids.push(id);
    });
    return ids.length > 1 ? ids : ids[0];
  },
  
  /**
   * Extracts one or more numeric ids stored in an element's Id attribute.  You commonly
   * need more than one database id to identify rows in a join column.
   *
   * The ids are taken to be any digits on the end of the string, each separated by a dash '-'.  
   * For example the following shows the id attribute and the functions return value:
   *    company-person-34-3 => [34, 3]
   *    job-person-company-2-3-34 => [2,3,34]
   *  
   * @return array of integer ids if called on a jQuery list of one element, or an array of arrays
   *   if the list contains more than one element.
   */
  extractIds: function() {
    var all_ids = [];
    this.each(function() {
      var ids = [];
      var id = $(this).attr('id');
      id = id.split('-');
      for(idx = 0; idx < id.length; idx++) { 
        if (!isNaN(parseInt(id[idx]))) {
          ids.push(id[idx]);
        }
      }
      all_ids.push(ids);
    });
    return all_ids.length > 1 ? all_ids : all_ids[0];
  },
  
  /**
   * Scoll container to make the first item in the jQuery list visible.
   */
  makeVisible: function() {
    var first = this.eq(0);
    var container = first.parent();
    var pos = first.position(), height = first.outerHeight();
    var scrollTop = container.scrollTop(), containerHeight = container.innerHeight();
    
    if (pos.top < 0) { // above viewport
      container.scrollTop(scrollTop + pos.top);
    } else if ((pos.top + height) > containerHeight) { // below viewport
      container.scrollTop(scrollTop + height + pos.top - containerHeight); 
    }
    return this;
  },
  
  /**
   * Position the first element in the jQuery list near another element 
   * using absolute positioning. The element should already have the 
   * proper z-Index set.
   * 
   * @param string align 'bottom' for bottom left, or 'right' for top right,
   *    'left' for top left, 'top' for above left.
   */
  makePositioned: function(align, element) {
    var first = this.eq(0);
    var pos, height, width, left, top, thisHeight, thisWidth;
    pos = element.offset();
    height = element.outerHeight(), width = element.outerWidth();
    left = pos.left, top = pos.top;
    thisHeight = first.outerHeight(), thisWidth = first.outerWidth();
    
    switch (align) { 
      case 'bottom':
        top += height;
      break;
      case 'right':
        left += width;
      break;
      case 'left':
        left = left - thisWidth;
      break;
      case 'top':
        top = top - thisHeight;
      break;
    }

    first.css({ 
      top: parseInt(top)+'px', 
      left: parseInt(left)+'px',
      position: 'absolute'
    });
    
    return this;
  },
  
  /**
   * Submit a form via AJAX. The method, action and form data are used in 
   * constructing the query parameters.  All form elements in the jQuery
   * list are submitted.
   *
   * @param jQuery container (optional) on success the result is loaded into
   *    container.  Pass null/undefined if only passing *callback*.
   * @param function callback (optional) function that is called on success
   * @return jQuery
   *
   * Example:
   *		$(form[name='my_form_name']).submitForm($('#resultpane'));
   */
  submitForm: function(container, callback) {
    this.each(function() {
      
      var form = $(this);
      if (!form.is('form')) return true; // continue
    	jQuery.ajax({
    		type: form.attr('method'),
    		url: form.attr('action'),
    		data: form.serialize(),
    		success: function(data) {
    		  if (container) {
    		    container.html(data);
    		  }
    		  if (callback) {
    		    callback.call(this, data);
    		  }
    		}
    	});
	  });
	  return this;
  },
  
  /**
   * Delay a jQuery animation or event
   *
   * @param time integer time to delay in milliseconds
   * @param callback function callback (optional: only required if you want to delay
   *    something which is not an animation, like changing a class on an element 
   *    for example)
   * @see http://james.padolsey.com/javascript/jquery-delay-plugin/
   */
  delay: function(time, callback) {
    // Empty function:
    jQuery.fx.step.delay = function(){};
    // Return meaningless animation, (will be added to queue)
    return this.animate({delay:1}, time, callback);
  },
  
  /**
  * This little pluggy centers an element on the screen using either 
  * fixed or absolute positioning. Can be used to display messages, pop up images etc.
  *
  * jQuery('#my-element').center(true); would center the element with ID 'my-element' 
  * using absolute position (leave empty for fixed).
  *
  * @see http://andreaslagerkvist.com/jquery/center/?page_type=Article&url_str=jquery-center-element-plugin
  */
  center: function (absolute) {
      return this.each(function () {
          var t = jQuery(this);

          t.css({
              position:    absolute ? 'absolute' : 'fixed', 
              left:        '50%', 
              top:        '50%', 
              zIndex:        '99'
          }).css({
              marginLeft:    '-' + (t.outerWidth() / 2) + 'px', 
              marginTop:    '-' + (t.outerHeight() / 2) + 'px'
          });

          if (absolute) {
              t.css({
                  marginTop:    parseInt(t.css('marginTop'), 10) + jQuery(window).scrollTop(), 
                  marginLeft:    parseInt(t.css('marginLeft'), 10) + jQuery(window).scrollLeft()
              });
          }
      });
  },
  
  outerHTML: function() {
      return $('<div>').append( this.eq(0).clone() ).html();
  }
});

/**
* hoverIntent r5 // 2007.03.27 // jQuery 1.1.2+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne <brian@cherne.net>
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY;};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev]);}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob);},cfg.interval);}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev]);};var handleHover=function(e){var p=(e.type=="mouseover"?e.fromElement:e.toElement)||e.relatedTarget;while(p&&p!=this){try{p=p.parentNode;}catch(e){p=this;}}if(p==this){return false;}var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);}if(e.type=="mouseover"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob);},cfg.interval);}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob);},cfg.timeout);}}};return this.mouseover(handleHover).mouseout(handleHover);};})(jQuery);

/**
 * jQuery static function extensions.
 */
 
jQuery.extend(jQuery, {
  /**
   * Escape all special jQuery CSS selector characters in *selector*.
   * Useful when you have a class or id which contains special characters
   * which you need to include in a selector.
   */
  escapeSelector: (function() {
    var specials = [
      '#', '&', '~', '=', '>', 
      "'", ':', '"', '!', ';', ','
    ];
    var regexSpecials = [
      '.', '*', '+', '|', '[', ']', '(', ')', '/', '^', '$'
    ];
    var sRE = new RegExp(
      '(' + specials.join('|') + '|\\' + regexSpecials.join('|\\') + ')', 'g'
    );

    return function(selector) {
      return selector.replace(sRE, '\\$1');
    }
  })()
});

var DynamicSelect = function() {
  var self = this;
  
  self.init = function(options) {
    
    var arguments = new Array();
    jQuery.extend(arguments, self.optionDefaults, options);
    
    self.arguments = arguments;
    self.display = $(options['displayInput']);
    self.value = options['hiddenInput'] == undefined? $() : $(options['hiddenInput']);
    self.previous = self.display.val();
    self.values = options['values'];
    self.cache = new Array();
    self.valueSelected = undefined;  // set when a value is selected
    
    // Store a reference to this instance on the display input
    self.display.data('dynamic-select-list', self);
    
    // Combine and save the CSS options
    self.css = self.optionDefaults['css'];
    for (style in options['css']) {
      self.css[style] = options['css'][style];
    }

    self.useAjax = options['url'] != null;
    self.ajaxQuery = undefined; /* The search term for the current results */
    self.ajaxBusy = false;
    
    self.isPositioned = false;
    self.createDynamicDiv();
    self.createDynamicValues(options['values']);
    self.registerHandlers();
    return self;
  };

  self.optionDefaults = {
    // Required. jQuery object containing the input that shows the results. 
    // e.g. $('#my-input-id')
    displayInput: undefined, 
    
    // jQuery object containing the (usually) hidden input that stores the selected id 
    // (or more generally, the key associated with the selected value).  
    // This input is optional and is not required to exist.
    hiddenId: undefined, 
    
    // the minimum number of characters that must be entered to trigger display of the
    // dynamic options (which usually includes an AJAX request - in this case it serves
    // to limit the result set).
    minChars: 1,
    
    // where to match in the results.  values: 'start', 'anywhere'
    match: 'start',
    
    // if set, even rows get this class
    evenClass: undefined,
    
    // if set, odd rows get this class
    oddClass: undefined,
    
    // class applied to the item that is currently "selected".  By default the first
    // item in the list is selected.  The user can use the up and down arrow keys to
    // select other items.  The items being hovered share the same styling, which is
    // set with the :hover CSS selector, not via this class.
    highlightClass: 'selected',
    
    // Maximum number of items to show in the list before it scrolls.
    maxItems: 10,
    
    // alignment position of the dynamic options.  values: 'bottom', 'right'
    // (bottom is bottom left, right is top right)
    position: 'bottom',
    
    // Option values when not using AJAX.  Useful for when your dataset is not so large
    // that you require AJAX. Associative array of { key: value } pairs.  Values shouldn't
    // contain HTML if using *highlightMatches* because it will search in the HTML as well.
    values: {},
    
    // Highlight matching text in the options (applies <b> tags around matching text)
    highlightMatches: true,
    
    // The parameter that is included on the query string of your AJAX url, and which holds
    // the search string.
    ajaxParam: 'search',
    
    // Timeout for AJAX queries in milliseconds.
    ajaxTimeout: 5000,
    
    // Method for the AJAX query, values: 'GET', 'POST'
    ajaxMethod: 'GET',
    
    // URL for the AJAX request
    url: null,
    
    // CSS that is applied to the dynamic options container.  You can override these
    // default values, as well as include any other valid CSS options you desire.
    css: { zIndex: 100, width: '100px' },
    
    // Cache the results of search queries so we don't query on the same search string twice.
    cacheResults: true,       
    
    // force the user to select an option.  if you allow custom values, the dynamic options
    // serve as a guide only.  if not, only dynamic options are valid options.
    allowCustomValue: false,  
    
    // class that is put on the display input if the user enters a custom value (i.e. the
    // value has not been selected from the list).
    customValueClass: 'dynamic-custom-value',
    
    // Force a query (if using AJAX) or show all options if the Enter key is pressed,
    // regardless of how many characters (if any) have been input.  The down arrow key
    // can also be used to the same effect.
    forceShowOnEnter: true,
    
    // optional callback when an option is selected.  *this* refers to the class
    // instance so you have access to all members.
    // @param jQuery selected the option div that was selected.  The
    //    value and key are stored as data in the object.
    optionSelectedCallback: function(selected) {
      selected.data('value');
      selected.data('key');
    }
  };
  
  self.createDynamicDiv = function() {
    self.container = $('<div class="dynamic-drop-shadow" style="display: none;"><div class="dynamic-select-list"></div></div>');
    self.display.after(self.container);
    self.options = self.container.find('.dynamic-select-list');
    var css = { 
      position: 'absolute', 
      top: '0px', 
      left: '-4000px'
    };
    self.container.css(self.css).css(css);
  };
  
  self.createDynamicValues = function(values) {
    
    // Store the values
    self.indexedValues = new Array();
    self.values = values;
    
    self.options.empty();
    if (values == undefined || values.length == 0) return;
    
    var option, value;
    for (key in values) {
       option = $('<div>'+values[key]+'</div>');
       self.options.append(option);
       option.data('key', key).data('value', values[key]);
       self.indexedValues.push(key);
    };
  };
  
  self.keyHandlers = {
    
    /* Escape */
    27: function(e) { 
      e.preventDefault(); // Prevent it from clearing the last dynamically-selected value
      self.container.hide(); 
    },
    
    /**
     * Up Arrow
     *
     * Highlight previous option if showing or last option if at start of list.  
     */
    38: function(e) {
      e.preventDefault();
      if (self.container.is(':visible')) {
        var prev = self.selected.prevAll(':visible:first');
        self.selected.toggleClass(self.arguments['highlightClass']);
        if (prev.length) {
          prev.toggleClass(self.arguments['highlightClass']);
        } else {
          prev = self.selected.nextAll(':visible:last').addClass(self.arguments['highlightClass']);
        }
        prev.makeVisible();
      }
    },
    
    /**
     * Down Arrow
     *
     * Highlight next option if showing or first option if at end of list.   
     */
    40: function(e) {
      e.preventDefault();
      if (self.container.is(':visible')) {
        var next = self.selected.nextAll(':visible:first');
        self.selected.toggleClass(self.arguments['highlightClass']);
        if (next.length) {
          next.toggleClass(self.arguments['highlightClass']);
        } else {
          next = self.selected.prevAll(':visible:last').addClass(self.arguments['highlightClass']);
        }
        next.makeVisible();
      }
    }
  };
  
  self.eventHandlers = {

    /**
     * Item clicked
     */
    optionClicked: function() {
     self.options.listen('click',  'div', function(e) {
       self.optionSelected($(this));
       self.container.hide();
     });
    },

    /**
     * Display input lost focus.
     *
     * Hide the options after a momentary pause (200 msec) to handle the case 
     * where an option is selected via click.  The input loses focus and the options
     * are hidden before the click event gets fired so the click target becomes the
     * background, and not an option as expected.
     *
     */      
    displayBlurred: function() {
      self.display.blur(function(e) {
        setTimeout(function() { self.container.hide(); }, 200);
      });
    },
    
    keyDown: function() {
      self.display.keydown(function(e) {
        if (self.keyHandlers[e.keyCode] != undefined) {
          self.selected = self.options.find(
              '.' + self.arguments['highlightClass'] + ':visible');
          self.keyHandlers[e.keyCode].call(self, e);
        }
      });  
    },
    
    keyUp: function() {
      self.display.keyup(function(e) {
        var query = self.display.val();
        
        /**
         * Enter. 
         *
         * Show options if hidden and input has text.  
         * Select highlighted option otherwise. 
         */
        var forceShow = false;
        if (e.keyCode == 13) {
          
          e.preventDefault(); // prevents form submit if only one input?
          self.selected = self.options.find(
               '.' + self.arguments['highlightClass'] + ':visible');
          
          // Option selected?
          if (self.container.is(':visible') && self.selected.length) {
            self.container.hide();
            self.optionSelected(self.selected);
            return false;
            
          // Force show results?
          } else if (self.container.is(':hidden') 
              && self.arguments['forceShowOnEnter']) {
            forceShow = true;
          }
          
        // If the key has already been handled by a keydown handler or if the
        // value hasn't changed or the value is a selected value (a non-letter key
        // has likely been pressed), don't do anything.
        } else if (self.keyHandlers[e.keyCode] != undefined 
              || self.previous == query
              || query == self.valueSelected) {
          return;
        }
        
        // Store the new value
        self.previous = query;

        // If the current value hasn't been picked from a list, or has changed, 
        // add the custom value class and reset the selected id
        if (self.valueSelected == undefined || query != self.valueSelected) {
          // If the value is empty, unmark it
          if (query == '') {
            self.markAsCustomValue(false, true);
          } else {
            self.markAsCustomValue(true, true);
          }
        }
        
        // If empty, or length is not long enough hide the options.  Don't hide the
        // options if the current query starts with the ajax query, because we may
        // have forced it.
        if (!forceShow && !self.useAjax 
            && query.length < self.arguments['minChars']) {
          self.container.hide();
          return;              
        } else if (!forceShow && self.useAjax 
              && query.length < self.arguments['minChars']
              && (self.ajaxQuery == undefined
                  || self.ajaxQuery != query.substring(0, self.ajaxQuery.length))) {
          self.container.hide();
          return;   
        }

        // Do we need to do an AJAX query?  We call if a query is not already active,
        // and if the start of the search doesn't match the current search query and
        // it is less than or equal to minChars in length.
        // Do query if we are being forced
        // Don't query if we are not using ajax
        //    or if ajax is busy
        // Do query if no query has yet been made
        //    or if the query doesn't start with the current query string
        // Don't query if it's a selected value
        //    or if the query length is > minChars
        if (self.useAjax 
            && !self.ajaxBusy 
            && query != self.valueSelected
            && (
                forceShow 
                || (
                      query.length <= self.arguments['minChars']
                      && (
                          // no query has been made OR the current query doesn't match
                          self.ajaxQuery == undefined
                          || self.ajaxQuery != query.substring(0, self.ajaxQuery.length)
                         )
                    )
                )
            ) {
          self.callAjax(query);
          return;
        }
        
        self.filterOptions(query);
        self.displayOptions();
      });  
    }
  };
  
  /**
   * Display the options div.
   */
  self.displayOptions = function() {
    
    // Position and show the options if hidden
    if (self.container.is(':hidden')) {
      
      // Calculate positioned offsets
      if (!self.isPositioned) {
        self.container.makePositioned(self.arguments['position'], self.display);
        self.isPositioned = true;
      }
      
      // The visible selector only works if it's showing
      self.container.show();
    }

    var items = self.options.find(':visible');
    
    // Don't show if there are no options
    if (!items.length) {
      self.container.hide();
      return;
    }
    
    // Set height
    if (items.length > self.arguments['maxItems']) {
      var height = (self.arguments['maxItems'] * 
          self.options.find(':visible:first').outerHeight());
      self.options.css('height', height + 'px');
    } else {
      self.options.css('height', ''); // Auto height
    }    

    // Show the select.
    var even, odd;
    even = self.arguments['evenClass'], odd = self.arguments['oddClass'];
    if (even) {
      self.options.find('.'+even+':visible:odd').removeClass(even);
      self.options.find(':visible:even').addClass(even);
    } else if (odd) {
      self.options.find('.'+odd+':visible:odd').removeClass(odd);
      self.options.find(':visible:odd').addClass(odd);
    }
    
    // Highlight the first visible option
    self.options.find('.'+self.arguments['highlightClass'])
        .removeClass(self.arguments['highlightClass']);
    self.options.find(':visible:first').addClass(self.arguments['highlightClass']);  
  };
  
  /**
   * Only show options which match the search criteria.
   * Also performs highlighting.
   */
  self.filterOptions = function(query) {

    var regex;
    switch (self.arguments['match']) {
      case 'start':
        regex = new RegExp('^()('+RegExp.escape(query)+')(.*)', 'i');
      break;
      case 'anywhere':
        regex = new RegExp('(.*)('+RegExp.escape(query)+')(.*)', 'i');
      break;
    }
    
    self.options.children().each(function(index) { 
      var match, option, optionText;
      option = $(this);
      optionText = option.data('value');
      match = regex.test(optionText);
      
      if (match && self.arguments['highlightMatches']) {
        option.html(optionText.replace(regex, '$1<b>$2</b>$3'));
      }

      if (!match) { option.hide(); }
      else { option.show(); }
    });
  };
  
  /**
   * The current value has not been selected from the list, mark it as a "custom value".
   * @param boolean mark (optional) pass false to unmark, default is to mark
   */
  self.markAsCustomValue = function(isCustom, resetStoredValue) {
    if (resetStoredValue) {
      self.valueSelected = undefined; // a value has not been selected
      self.value.val(''); // reset the input that stores the key
    }
    if (self.arguments['allowCustomValue']) return;
    if (isCustom == undefined || isCustom) { // mark as custom
      if (!self.display.hasClass(self.arguments['customValueClass'])) {
        self.display.addClass(self.arguments['customValueClass']);
      }
    } else { // unmark
      self.display.removeClass(self.arguments['customValueClass']);
    }
  };
  
  /**
   * Load values using AJAX
   */
  self.callAjax = function(query) {
    
    // ajaxBusy prevents us from calling multiple times if the user keeps typing
    self.ajaxBusy = true;
    self.showMessage('Loading...');
    
    // ajaxQuery holds the current ajax query string.  We won't requery until the
    // user enters a new search string which does not start with the current query.
    self.ajaxQuery = query;

    // Check the cache.  Uses simulated AJAX callbacks.
    var result = self.resultsCache(query);
    if (result != undefined) {
      self.ajaxCallbacks.success(result);
      self.ajaxCallbacks.complete();
      return;
    }
    
    // Do the AJAX query
    dataArr = {};
    dataArr[self.arguments['ajaxParam']] = query;
    
    jQuery.ajax({
      url: self.arguments['url'],
  		data: dataArr,
  		dataType: 'json',
  		timeout: self.arguments['ajaxTimeout'],
  		type: self.arguments['ajaxMethod'],
  		
  		error: self.ajaxCallbacks.error,
  		complete: self.ajaxCallbacks.complete,
  		success: self.ajaxCallbacks.success,
		});
  };
  
  self.ajaxCallbacks = {
    error: function(xmlreq, status, error) {
			if (status == 'timeout') {
				self.clearMessage('Timed out!');
			} else {
				self.clearMessage('Failed!');
			}
		},
		complete: function() {
		  self.ajaxBusy = false;
		},
		success: function(data) {
		  
		  self.createDynamicValues(data);
		  self.resultsCache(self.ajaxQuery, data);
		  if (data.length == 0) {
		    self.clearMessage('No results');
	    } else {
	      self.clearMessage();
	      self.filterOptions(self.display.val());
        self.displayOptions();
	    }
		}
  };

  /**
   * Get and store results in the cache.
   * @param array results (optional) results to store for the given query
   * @return array or undefined if no entry for that query
   */    
  self.resultsCache = function(query, results) {
    if (!self.arguments['cacheResults']) return undefined;;
    if (results != undefined) {
      self.cache[query] = results;
    } 
    return self.cache[query];
  };
  
  self.showMessage = function(message) {
    if (self.message != undefined) self.message.remove();
    self.message = jQuery('<div class="dynamic-message">'+message+'</div>');
    self.container.after(self.message);
    self.message.css({
      zIndex: self.css['zIndex']+1,
      top: '0px', 
      left: '-4000px'
    }).makePositioned(self.arguments['position'], self.display).show();
  };
  
  self.clearMessage = function(message) {
    if (message) {
      self.message.addClass('error').html(message);
      setTimeout(function() {
        self.message.fadeOut('fast', function() { 
          $(this).remove(); 
        });
      }, 3000);
    } else {
      self.message.remove();
    }
  };
  
  self.optionSelected = function(selected) {
    self.markAsCustomValue(false);
    
    // Store and show the text of the selected option
    self.valueSelected = selected.data('value');
    self.display.val(selected.data('value'));
    self.value.val(selected.data('key'));
    
    self.arguments['optionSelectedCallback'].call(this, selected);
  };
        
  self.registerHandlers = function() {
    jQuery.each(self.eventHandlers, function(i, func) {
      func.call(self);
    });
  };
  
  return self;
};
