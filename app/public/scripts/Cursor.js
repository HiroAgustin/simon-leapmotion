;(function (win, doc)
{
  'use strict';

  function Cursor (options)
  {
    this.events = {};

    this.element = options.element;
    this.target = options.target;

    this.controller = new Leap.Controller().use('screenPosition', {scale: 0.5});
  }

  Cursor.prototype = {

    start: function ()
    {
      var element, hands, position, x, y
        , target = this.target
        , classList = target.classList;

      this.controller.loop(function (frame)
      {
        hands = frame.hands;

        if (!hands.length)
        {
          if (this.isVisible())
            this.hide();

          return;
        }

        if (!this.isVisible())
          this.show();

        position = hands[0].screenPosition();

        x = position[0];
        y = position[1];

        if (x || y)
          this.transform(x, y);

        element = doc.elementFromPoint(x, y);

        if (element === target)
        {
          if (!classList.contains('active'))
            classList.add('active');

          if (hands[0].grabStrength === 1)
            this.emit('ready');
        }
        else if (classList.contains('active'))
          classList.remove('active');

      }.bind(this));
    }

  , transform: function (x, y)
    {
      var style = this.element.style;

      style.webkitTransform =
      style.MozTransform =
      style.msTransform =
      style.OTransform =
      style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0)';

      return this;
    }

  , on: function (evnt, fn)
    {
      var events = this.events;

      if (!(evnt in events))
        events[evnt] = [];

      events[evnt].push(fn);

      return this;
    }

  , emit: function (evnt)
    {
      var self = this
        , args = Array.prototype.slice.call(arguments, 1);

      this.events[evnt].forEach(function (fn)
      {
        fn.apply(self, args);
      });

      return this;
    }

  , isVisible: function ()
    {
      return this.element.style.display === 'block';
    }

  , display: function (display)
    {
      this.element.style.display = display;

      return this;
    }

  , show: function ()
    {
      return this.display('block');
    }

  , hide: function ()
    {
      return this.display('none');
    }

  , stop: function ()
    {
      this.controller.disconnect();

      // Animation loop iterates one time after disconnect
      // resulting on an unwanted .show()
      setTimeout(this.hide.bind(this), 10);

      return this;
    }
  };

  win.Cursor = Cursor;

}(window, document));
