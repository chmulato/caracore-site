/*!
 * Subconjunto do Bootstrap v5.3.3 (https://getbootstrap.com/) — MIT.
 * Apenas o componente Collapse, que é o único usado nestas páginas via
 * data-bs-toggle="collapse". Substitui o bundle de 80 KB (Popper e os demais
 * componentes não têm uso). API compatível: bootstrap.Collapse.getOrCreateInstance,
 * getInstance, show(), hide(), toggle(), dispose() e os eventos .bs.collapse.
 */
(function () {
  'use strict';

  if (window.bootstrap && window.bootstrap.Collapse) return;

  var SHOW = 'show';
  var COLLAPSE = 'collapse';
  var COLLAPSING = 'collapsing';
  var COLLAPSED = 'collapsed';
  var DATA_TOGGLE = '[data-bs-toggle="collapse"]';
  var DEEPER_CHILD = ':scope .' + COLLAPSE + ' .' + COLLAPSE;
  var instances = new Map();

  function find(selector, root) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function selectorOf(trigger) {
    var target = trigger.getAttribute('data-bs-target');
    if (target) return target;
    var href = trigger.getAttribute('href');
    return href && href.charAt(0) === '#' ? href : null;
  }

  function targetsOf(trigger) {
    var selector = selectorOf(trigger);
    if (!selector) return [];
    try {
      return find(selector, document);
    } catch (error) {
      return [];
    }
  }

  function dispatch(element, name) {
    return element.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true }));
  }

  function transitionMs(element) {
    var cs = window.getComputedStyle(element);
    var durations = (cs.transitionDuration || '0s').split(',');
    var delays = (cs.transitionDelay || '0s').split(',');
    return durations.reduce(function (max, value, index) {
      var ms = (parseFloat(value) || 0) + (parseFloat(delays[index] || delays[0]) || 0);
      return Math.max(max, ms * 1000);
    }, 0);
  }

  function afterTransition(element, callback) {
    var duration = transitionMs(element);
    if (!duration) return callback();
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      element.removeEventListener('transitionend', onEnd);
      callback();
    };
    var onEnd = function (event) {
      if (event.target === element) finish();
    };
    element.addEventListener('transitionend', onEnd);
    window.setTimeout(finish, duration + 60);
  }

  function Collapse(element, config) {
    config = config || {};
    this._element = element;
    this._isTransitioning = false;
    this._triggerArray = [];
    this._parent = null;
    if (config.parent === false) this._parent = null;
    else if (config.parent) this._parent = typeof config.parent === 'string' ? document.querySelector(config.parent) : config.parent;
    else {
      var parentSelector = element.getAttribute('data-bs-parent');
      this._parent = parentSelector ? document.querySelector(parentSelector) : null;
    }

    var triggers = document.querySelectorAll(DATA_TOGGLE);
    for (var i = 0; i < triggers.length; i++) {
      if (targetsOf(triggers[i]).indexOf(element) !== -1) this._triggerArray.push(triggers[i]);
    }

    instances.set(element, this);
    this._initializeChildren();
    if (!this._parent) this._setTriggers(this._triggerArray, this._isShown());
    if (config.toggle !== false) this.toggle();
  }

  Collapse.prototype._isShown = function (candidate) {
    return (candidate || this._element).classList.contains(SHOW);
  };

  Collapse.prototype._dimension = function () {
    return this._element.classList.contains('collapse-horizontal') ? 'width' : 'height';
  };

  Collapse.prototype._setTriggers = function (triggers, isOpen) {
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].classList.toggle(COLLAPSED, !isOpen);
      triggers[i].setAttribute('aria-expanded', String(isOpen));
    }
  };

  // Descendentes do data-bs-parent, excluindo os aninhados dentro de outro collapse.
  Collapse.prototype._getFirstLevelChildren = function (selector) {
    if (!this._parent) return [];
    var nested = find(DEEPER_CHILD, this._parent);
    return find(selector, this._parent).filter(function (child) {
      return nested.indexOf(child) === -1;
    });
  };

  Collapse.prototype._initializeChildren = function () {
    if (!this._parent) return;
    var triggers = this._getFirstLevelChildren(DATA_TOGGLE);
    for (var i = 0; i < triggers.length; i++) {
      var targets = targetsOf(triggers[i]);
      for (var j = 0; j < targets.length; j++) this._setTriggers([triggers[i]], this._isShown(targets[j]));
    }
  };

  Collapse.prototype.toggle = function () {
    if (this._isShown()) this.hide();
    else this.show();
  };

  Collapse.prototype.show = function () {
    if (this._isTransitioning || this._isShown()) return;

    var element = this._element;
    var siblings = this._getFirstLevelChildren('.' + COLLAPSE + '.' + SHOW + ', .' + COLLAPSE + '.' + COLLAPSING)
      .filter(function (child) { return child !== element; })
      .map(function (child) { return Collapse.getOrCreateInstance(child, { toggle: false }); });
    if (siblings.length && siblings[0]._isTransitioning) return;
    if (!dispatch(element, 'show.bs.collapse')) return;

    for (var i = 0; i < siblings.length; i++) siblings[i].hide();

    var dimension = this._dimension();
    element.classList.remove(COLLAPSE);
    element.classList.add(COLLAPSING);
    element.style[dimension] = 0;
    this._setTriggers(this._triggerArray, true);
    this._isTransitioning = true;

    var self = this;
    var complete = function () {
      element.classList.remove(COLLAPSING);
      element.classList.add(COLLAPSE, SHOW);
      element.style[dimension] = '';
      self._isTransitioning = false;
      dispatch(element, 'shown.bs.collapse');
    };

    element.style[dimension] = (dimension === 'width' ? element.scrollWidth : element.scrollHeight) + 'px';
    afterTransition(element, complete);
  };

  Collapse.prototype.hide = function () {
    if (this._isTransitioning || !this._isShown()) return;
    if (!dispatch(this._element, 'hide.bs.collapse')) return;

    var element = this._element;
    var dimension = this._dimension();
    element.style[dimension] = element.getBoundingClientRect()[dimension] + 'px';
    void element.offsetHeight;
    element.classList.add(COLLAPSING);
    element.classList.remove(COLLAPSE, SHOW);
    for (var i = 0; i < this._triggerArray.length; i++) {
      var targets = targetsOf(this._triggerArray[i]);
      for (var j = 0; j < targets.length; j++) {
        if (!this._isShown(targets[j])) this._setTriggers([this._triggerArray[i]], false);
      }
    }
    this._isTransitioning = true;
    element.style[dimension] = '';

    var self = this;
    var complete = function () {
      element.classList.remove(COLLAPSING);
      element.classList.add(COLLAPSE);
      self._isTransitioning = false;
      dispatch(element, 'hidden.bs.collapse');
    };

    afterTransition(element, complete);
  };

  Collapse.prototype.dispose = function () {
    instances.delete(this._element);
  };

  Collapse.getOrCreateInstance = function (element, config) {
    return Collapse.getInstance(element) || new Collapse(element, config);
  };

  Collapse.getInstance = function (element) {
    return instances.get(element) || null;
  };

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest ? event.target.closest(DATA_TOGGLE) : null;
    if (!trigger) return;
    var targets = targetsOf(trigger);
    if (!targets.length) return;
    event.preventDefault();
    for (var i = 0; i < targets.length; i++) {
      Collapse.getOrCreateInstance(targets[i], { toggle: false }).toggle();
    }
  });

  window.bootstrap = window.bootstrap || {};
  window.bootstrap.Collapse = Collapse;
})();
