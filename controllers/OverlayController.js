function OverlayController(dom) {
  if (typeof dom !== 'object' || dom === null) {
    console.dir(dom);
    throw new Error('Invalid object passed!');
  }
  
  this.dom = dom;
  
  function overlayClick(event) {
    if (event.target === overlay.dom) {
      overlay.hide();
      if (typeof eventFunction === 'function') {
        eventFunction();
      }
    }
  }
  
  function overlayKeyPress(event) {
    if (event.which === 27) {
      overlay.hide();
      if (typeof eventFunction === 'function') {
        eventFunction();
      }
    }
  }
  
  this.display = function(addEventListener, eventFunction) {
    this.dom.removeAttribute('style');
    
    if (addEventListener === true) {
      
      this.dom.addEventListener('click', overlayClick, false);
      document.addEventListener('keyup', overlayKeyPress, false);
    }
    
  };
  
  this.hide = function(callback) {
    this.dom.removeEventListener('click', overlayClick);
    document.removeEventListener('keyup', overlayKeyPress);
    this.dom.setAttribute('style', 'display:none;');
    this.dom.children.forEach(function hideChildren(element) {
      element.setAttribute('style', 'display:none;');
    });
  };
}