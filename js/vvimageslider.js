/**
 * jQuery VV Imageslider
 *
 * Displays a Slider / Carousel that is specialized for Images with variable Aspect Ratios.
 *
 * @version: 0.6 (2016-04-30)
 * @author: Gregor Sondermeier (https://github.com/DeLaMuerte, https://bitbucket.org/GregorDeLaMuerte)
 * @license: GPL2
 *
 * @todo:
 * - write documentation
 * - implement looping option
 * - swipestart / swipeend instead of swipeleft / swiperight
 * - support asynchronous loading of images
 */
(function($) {

    $.fn.VVImageslider = function(useroptions) {

        var self = this;

        if (!self.length) {
            return;
        };

        /**
         * options definition
         */
        var defaultoptions = {
            basepath: '',
            height: 1000,
            previewsuffix: '',
            mobilemaxheight: 640,
            mobileheight: 350,
            mobilesuffix: '',
            margin: -1,
            firstslide: 0
        };

        // parse the options given with the jQuery constructor
        var options = $.extend(defaultoptions, useroptions);

        // parse the options given with data attributes. @note: the attributed options are stronger.
        options = $.extend(options, self.data());

        // the device's resolution
        var windowHeight;
        var windowWidth;

        // determine the usedheight to use
        var height;

        /**
         * a string representing the ui mode.
         * it will either be 'touch' if the device supports touch interaction or 'mouse' if not.
         */
        var uiMode = '';

        // this suffix will be used for the previewing the images within the slider
        var previewsuffix;

        // this ul will contain the list of slides
        var vvImagesliderUl;

        // this array will contain all slides
        var vvImagesliderLis = [];

        // this is the new base element that will replace self
        var vvImageslideElem;

        // the width of the element in the dom
        var elemWidth = 0;

        // the width of the vvImagesliderUl
        var totalWidth = 0;

        // the number of slides
        var slidecount = self.children('vv-slide').length;

        // the currently focused slide
        var currentSlide = 0;

        // HTML for the left and right triggers
        var leftTrigger = $('<div class="vv-imageslider-trigger vv-imageslider-trigger-left"><span class="vv-imageslider-trigger-icon">&lt;</span></div>');
        var rightTrigger = $('<div class="vv-imageslider-trigger vv-imageslider-trigger-right"><span class="vv-imageslider-trigger-icon">&gt;</span></div>');

        // start the thing
        setUiMode();
        setDimensions();
        setPreviewsuffix();
        buildHTML();
        applyDimensions();
        setResizeListener();
        addTriggers();
        setStepListener();
        replaceHTML();

        /**
         * set the ui mode to either 'touch' or 'mouse' (not entirely reliable)
         * inspired by https://stackoverflow.com/questions/26442907/detecting-touch-devices-with-jquery
         */
        function setUiMode() {
            if (!!('ontouchstart' in window) || !!('onmsgesturechange' in window)) {
                uiMode = 'touch';
            } else {
                uiMode = 'mouse';
            }
        };

        // set the dimensions that are used internally
        function setDimensions() {
            windowHeight = $(window).height();
            windowWidth = $(window).height();
            height = windowHeight > options.mobilemaxheight ? options.height : options.mobileheight;
        };

        function setPreviewsuffix() {
            previewsuffix = options.previewsuffix;
            if (windowHeight <= options.mobilemaxheight) {
                previewsuffix = options.mobilesuffix || options.previewsuffix;
            }
        };

        /**
         * remove the vv-imageslider and vv-slide elements
         */
        function buildHTML() {
            // create the div
            vvImageslideElem = $('<div class="vv-imageslider"></div>');

            // create the ul
            vvImagesliderUl = $('<ul class="vv-imageslider-wrapper"></ul>');

            // read the images and append the li slides to the ul
            $.each(self.children('vv-slide'), function(i, img) {
                var filepath = $(img).data('image');
                var filename = filepath.split('.');
                var fileext = filename[filename.length - 1];
                filename.pop();
                filename = filename.join('.');

                var basepath = options.basepath;

                if (basepath.length && !/\/$/.test(basepath)) {
                    basepath += '/';
                }

                var imgHref = windowHeight > options.mobilemaxheight ? basepath + filename + '.' + fileext : 'javascript:void(0)';
                var prevpath = basepath + filename + previewsuffix + '.' + fileext;

                // the slide li
                var vvImagesliderLi = $('<li class="vv-imageslider-slide"><a href="' + imgHref + '"></a></li>');

                // preload the image with vanilla JS so it can be loaded before it is being appended
                // @note: I know, this is a little hacky...
                var img = new Image();
                img.onload = function() {
                    vvImagesliderLi.find('a').append(img);
                    updateSlidesDimensions(i, vvImagesliderLi);
                    scrollToSlide(options.firstslide);
                };
                img.src = prevpath;
                img.alt = prevpath;
                $(img).height(height);

                // push the current li to the list of li's
                vvImagesliderLis.push(vvImagesliderLi);

                // append the slide li to the ul
                vvImagesliderUl.append(vvImagesliderLi);
            });

            // append the ul to the div
            vvImageslideElem.append(vvImagesliderUl);
        };

        function replaceHTML() {
            // wordpress hack
            if (self.parent().is('p')) {
                self.parent().replaceWith(vvImageslideElem);
            } else {
                self.replaceWith(vvImageslideElem);
            }

            // get the div's width
            elemWidth = vvImageslideElem.width();
        };

        /**
         * read the options and set the chosen dimensions and possibly do other stuff
         */
        function applyDimensions() {
            vvImageslideElem.height(height);
        };

        /**
         * updates the dimensions
         */
        function updateDimensions() {
            totalWidth = 0;
            setDimensions();
            elemWidth = vvImageslideElem.width();
            vvImageslideElem.height(height);
            $.each(vvImagesliderLis, function(i) {
                $(this).find('img').height(height);
                updateSlidesDimensions(i, $(this));
            });
            scrollToSlide(currentSlide);
        };

        /**
         * updates the dimensions for a slide
         * @param   {int}       i           - the index of the current slide
         * @param   {Object}    currentLi   - the current slide
         */
        function updateSlidesDimensions(i, currentLi) {
            currentLi.width('auto');
            var itemWidth = currentLi.width();
            var itemMargin = i < slidecount-1 ? options.margin : 0;
            currentLi.css({'margin-right': itemMargin + 'px'});
            currentLi.width(itemWidth);
            totalWidth += itemWidth + itemMargin;
            vvImagesliderUl.width(totalWidth);
        };

        /**
         * registers a listener on the resize event, in case the resolution changes, like on a switch from
         * portrait to landscape
         */
        function setResizeListener() {
            $(window).resize(function() {
                updateDimensions();
            });
        };

        /**
         * add the triggers to be able to scroll through the content
         */
        function addTriggers() {
            if (uiMode == 'mouse') {
                vvImageslideElem.append(leftTrigger);
                vvImageslideElem.append(rightTrigger);
            }
        };

        /**
         * add the listener to scroll through the DOM elements in step mode
         */
        function setStepListener() {
            if (uiMode == 'touch') {
                vvImageslideElem.on('swiperight', function() {
                    changeSlide('previous');
                });
                vvImageslideElem.on('swipeleft', function() {
                    changeSlide('next');
                });
            }
            if (uiMode == 'mouse') {
                leftTrigger.click(function() {
                    changeSlide('previous');
                });
                rightTrigger.click(function() {
                    changeSlide('next');
                });
            }
        };

        /**
         * increments or decrements the currentSlide Integer and then calls scrollToSlide to scroll to that new
         * currentSlide
         *
         * @param   {String}    target      'previous' or 'next'
         */
        function changeSlide(target) {
            switch (target) {
                case 'previous':
                    if (currentSlide > 0) {
                        currentSlide--;
                    }
                    break;
                case 'next':
                    if (currentSlide < slidecount-1) {
                        currentSlide++;
                    }
                    break;
                default:
                    break;
            };
            scrollToSlide(currentSlide);
        };

        /**
         * scrolls the slider to a specific slide and focuses that slide centered. adds classes for hiding the triggers
         * when the current slide is the first/last slide.
         *
         * @param   {int}   i       - the slide index
         */
        function scrollToSlide(i) {
            currentSlide = vvImagesliderLis[i] ? i : 0;
            var isFirstSlide = currentSlide == 0,
                isLastSlide = currentSlide == vvImagesliderLis.length - 1,
                slideWidth = vvImagesliderLis[currentSlide].outerWidth(true),
                slideLeft = vvImagesliderLis[currentSlide].position().left * -1,
                newLeft = slideLeft - (slideWidth - elemWidth) / 2;

            vvImagesliderUl.css({left: newLeft});

            if (isFirstSlide) {
                vvImageslideElem.addClass('vv-imageslide-first');
            } else {
                vvImageslideElem.removeClass('vv-imageslide-first');
            }

            if (isLastSlide) {
                vvImageslideElem.addClass('vv-imageslide-last');
            } else {
                vvImageslideElem.removeClass('vv-imageslide-last');
            }
        };
    };

}(jQuery));