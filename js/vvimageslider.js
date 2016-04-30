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
            background: '',
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

		// lightbox
		var documentBody = $('body');
		var lightboxSpinner = $('<img class="vv-imageslider-lightbox-spinner" src="data:image/gif;base64,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" />');
        var lightboxBackdropElem = $('<div class="vv-imageslider-lightbox-backdrop"></div>');
        var lightboxElem = $('<div class="vv-imageslider-lightbox"></div>');

        // start the thing
        setUiMode();
        setDimensions();
        setPreviewsuffix();
        buildHTML();
        applyStyling();
        setResizeListener();
        addTriggers();
        setListeners();
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

                // the slide li and a
                var vvImagesliderA = $('<a href="' + imgHref + '"></a>');
                var vvImagesliderLi = $('<li class="vv-imageslider-slide"></li>');

                // preload the image with vanilla JS so it can be loaded before it is being appended
                // @note: I know, this is a little hacky...
                var previewImg = new Image();
                previewImg.onload = function() {
                    vvImagesliderA.append(previewImg);
                    updateSlidesDimensions(i, vvImagesliderLi);
                    scrollToSlide(options.firstslide);
                };
                previewImg.src = prevpath;
                previewImg.alt = prevpath;
                $(previewImg).height(height);

                // add click listener to image
                vvImagesliderA.bind('click', function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    if (i == currentSlide) {
                        openLightbox(imgHref);
                    } else {
                        scrollToSlide(i);
                    }
                });

                // append the the a to the li
                vvImagesliderLi.append(vvImagesliderA);

                // append the slide li to the ul
                vvImagesliderUl.append(vvImagesliderLi);

                // push the current li to the list of li's
                vvImagesliderLis.push(vvImagesliderLi);
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
         * read the options and set the chosen dimensions, background and possibly do other stuff
         */
        function applyStyling() {
            vvImageslideElem.height(height);
            vvImageslideElem.css({background: options.background});
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
        function setListeners() {
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
            lightboxBackdropElem.bind('click', closeLightbox);
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

            // figure out some stylings
            var isFirstSlide = currentSlide == 0,
                isLastSlide = currentSlide == vvImagesliderLis.length - 1,
                slideWidth = vvImagesliderLis[currentSlide].outerWidth(true),
                slideLeft = vvImagesliderLis[currentSlide].position().left * -1,
                newLeft = slideLeft - (slideWidth - elemWidth) / 2;
            vvImagesliderUl.css({left: newLeft});

            // add classes for previous, current, next slide
            vvImagesliderUl.children().removeClass('vv-imageslider-slide-previous vv-imageslider-slide-current vv-imageslider-slide-next');
            vvImagesliderLis[currentSlide].addClass('vv-imageslider-slide-current');
            if (vvImagesliderLis[currentSlide-1]) {
                vvImagesliderLis[currentSlide-1].addClass('vv-imageslider-slide-previous');
            }
            if (vvImagesliderLis[currentSlide+1]) {
                vvImagesliderLis[currentSlide+1].addClass('vv-imageslider-slide-next');
            }

            // toggle classes for first/last slide status
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

		/**
         * opens a lightbox containing the full image
         * @param imgUrl
         */
        function openLightbox(imgUrl) {
            var fullImg = new Image();
            fullImg.onload = function() {
				lightboxSpinner.detach();
				lightboxElem.append(fullImg);
				$(fullImg).bind('click', closeLightbox);
            };
            fullImg.src = imgUrl;

			var scrollTop;

			// lock the body
			scrollTop = documentBody.scrollTop();
			documentBody.css({top: -scrollTop + 'px', position: 'fixed', width: '100%'});

			lightboxElem.append(lightboxSpinner);
			lightboxElem.css({'z-index': getHightestZIndex() + 2});
			lightboxBackdropElem.css({'z-index': getHightestZIndex() + 1});

			documentBody.append(lightboxElem);
			documentBody.append(lightboxBackdropElem);
        };

		/**
		 * closes the lightbox
		 */
        function closeLightbox() {
			documentBody.css({top: '', position: '', width: ''});
			lightboxElem.detach();
			lightboxElem.empty();
            lightboxBackdropElem.detach();
        };

		/**
		 * get the highest current z-index
		 *
		 * @from:
		 * http://stackoverflow.com/a/18533520
		 *
		 * @returns {Number}		- the hightest z-index of the page
		 */
		function getHightestZIndex() {
			return Math.max.apply(null, documentBody.map(function() {
				var z;
				return isNaN(z = parseInt($(this).css("z-index"), 10)) ? 0 : z;
			}));
		};
    };

}(jQuery));