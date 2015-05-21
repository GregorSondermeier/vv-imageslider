/**
 * jQuery VV Imageslider
 *
 * Displays a Slider / Carousel that is specialized for Images with variable Aspect Ratios.
 *
 * @version: 0.3 (2015-05-21)
 * @author: Gregor Sondermeier (https://github.com/DeLaMuerte/, https://bitbucket.org/GregorDeLaMuerte/)
 * @license: GPL2
 *
 * @todo:
 * - write documentation
 * - implement looping option
 * - separate scrolling Intervals for hovering and clicking so that mouseup event doesn't stop the scrolling because the user is still on mouseover
 * - use CSS animation instead of JS intervalls, duh!
 * - add mobile support (partially done - works only in step mode yet)
 * - maybe do height = options.height / 2 on some mobile devices?
 */
(function($) {

    $.fn.VVImageslider = function(useroptions) {

        /**
         * options definition
         */
        var defaultoptions = {
            height: 700,
            margin: 15,
            mode: 'flow',        // 'flow' || 'step'
            intervalTime: 40,
            baseFlowSpeed: 1,
            hoverSpeedMultiplier: 4,
            clickSpeedMultiplier: 32,
            firstSlide: 0
        };

        // parse the options given with the jQuery constructor
        var options = $.extend(defaultoptions, useroptions);

        // parse the options given with data attributes. @note: the attributed options are stronger.
        options = $.extend(options, this.data());

        /**
         * this boolean indicates if my device support touch interaction
         */
        var touchSupported;

        /**
         * the elements that are needed again and again
         */
        var self = this;
        var ul = self.find('ul');
        var slides = self.find('li.vv-imageslider-slide');
        var imgs = self.find('img');
        var slidecount = imgs.length;
        var currentSlide = 0;

        /**
         * Styling variables
         */
        var containerWidth = self.width();
        var lastImgWidth = 0;
        var totalWidth = 0;

        /**
         * the interval for the flow animation
         */
        var flowInterval;

        /**
         * start this thing
         */
        checkForTouchSupport();
        initStyling();
        addTriggers();
        readImages();


        if (options.mode == 'flow') {
            setFlowListener();
        } else if (options.mode == 'step') {
            addStepClasses();
            setStepListener();
        } else {
            throw new Error('Wrong mode specified. Please choose the correct mode by either specifying it as an ' +
                'attribute like \'data-mode="#MODE#"\' or by passing your #MODE# in the options object. Currently ' +
                'allowed modes: \'flow\' and \'step\'.');
        }

        /**
         * find out if we are on a touch device
         * inspired by https://stackoverflow.com/questions/26442907/detecting-touch-devices-with-jquery
         */
        function checkForTouchSupport() {
            // First try to detect (not entirely reliable)
            touchSupported = !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
            // Overwrite/set touch enabled to false on mousemove
            $(window).on('mousemove', function() { touchSupported = false; });
            // Overwrite/set touch enabled to true on touchstart
            $(window).on('touchstart', function () { touchSupported = true; });
        };

        /**
         * read the options and set the chosen dimensions and possibly do other stuff
         */
        function initStyling() {
            self.height(options.height);
            imgs.height(options.height);
            imgs.show();
            self.find('li:not(:last-child)').css({'margin-right': options.margin + 'px'});
        };

        /**
         * add the triggers to be able to scroll through the content
         */
        function addTriggers() {
            if (!touchSupported) {
                self.append('<div class="vv-imageslider-trigger vv-imageslider-trigger-left"><span class="vv-imageslider-trigger-icon">&lt;</span></div>');
                self.append('<div class="vv-imageslider-trigger vv-imageslider-trigger-right"><span class="vv-imageslider-trigger-icon">&gt;</span></div>');
            }
        };

        function addStepClasses() {
            self.addClass('vv-imageslider-stepmode');
        };

        /**
         * count all images and set the width for the parent ul container
         */
        function readImages() {
            var imgLoad = imagesLoaded(self);

            imgLoad.on('progress', function(instance, image) {
                var itemWidth = $(image.img).parents('li.vv-imageslider-slide').outerWidth(true);
                lastImgWidth = itemWidth;
                totalWidth += itemWidth;
                ul.width(totalWidth);
            });

            imgLoad.on('always', function() {
                scrollToSlide(options.firstSlide);
            });
        };

        /**
         * add the listener to scroll through the DOM elements in flow mode
         */
        function setFlowListener() {
            self.find('.vv-imageslider-trigger-left').mouseenter(function() {
                startFlow('right', options.hoverSpeedMultiplier);
            });
            self.find('.vv-imageslider-trigger-right').mouseenter(function() {
                startFlow('left', options.hoverSpeedMultiplier);
            });
            self.find('.vv-imageslider-trigger-left').mousedown(function() {
                startFlow('right', options.clickSpeedMultiplier);
            });
            self.find('.vv-imageslider-trigger-right').mousedown(function() {
                startFlow('left', options.clickSpeedMultiplier);
            });

            self.find('.vv-imageslider-trigger').bind('mouseleave mouseup', stopFlow);
        };

        /**
         * ignites the flow interval. makes the ul move.
         *
         * @param   {String}    direction       'left' or 'right'
         * @param   {int}       multiplier      determines the flow speed
         */
        function startFlow(direction, multiplier) {
            var newLeft;
            stopFlow();
            flowInterval = setInterval(function() {
                switch (direction) {
                    case 'left':
                        newLeft = ul.position().left - options.baseFlowSpeed * multiplier;
                        break;
                    case 'right':
                        newLeft = ul.position().left + options.baseFlowSpeed * multiplier;
                        break;
                    default:
                        break;
                }

                // left border
                if (totalWidth + newLeft >= totalWidth) {
                    newLeft = 0;
                }
                // right border
                if (totalWidth - containerWidth + newLeft <= 0) {
                    newLeft = containerWidth - totalWidth;
                }
                ul.css({left: newLeft});
            }, options.intervalTime);
        };

        /**
         * stops the flow interval
         */
        function stopFlow() {
            if (flowInterval) {
                clearInterval(flowInterval);
            }
        };

        /**
         * add the listener to scroll through the DOM elements in step mode
         */
        function setStepListener() {
            if (touchSupported) {
                self.on('swiperight', function() {
                    changeSlide('previous');
                });
                self.on('swipeleft', function() {
                    changeSlide('next');
                });
            } else {
                self.find('.vv-imageslider-trigger-left').click(function() {
                    changeSlide('previous');
                });
                self.find('.vv-imageslider-trigger-right').click(function() {
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
         * scrolls the slider to a specific slide and focuses that slide centered
         *
         * @param   {int}   i       - the slide index
         */
        function scrollToSlide(i) {
            var slideWidth = $(slides[i]).outerWidth(true);
            var slideLeft = $(slides[i]).position().left * -1;
            var newLeft = slideLeft - (slideWidth - containerWidth) / 2;
            ul.css({left: newLeft});
        };
    };

}(jQuery));