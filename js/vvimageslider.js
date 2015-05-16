/**
 * jQuery VV Imageslider
 *
 * Displays a Slider / Carousel that is specialized for Images with variable Aspect Ratios.
 *
 * @version: 0.2 (2015-05-16)
 * @author: Gregor Sondermeier (https://github.com/DeLaMuerte)
 * @license: GPL2
 *
 * @todo:
 * - write documentation
 * - implement looping option
 * - scroll per image (done)
 * - fix bug #1: asynchronously filling the slideDimensions array in the imagesLoaded callback
 * - separate scrolling Intervals for hovering and clicking so that mouseup event doesn't stop the scrolling because the user is still on mouseover
 * - use CSS animation instead of JS intervalls, duh!
 */
(function ($) {

    $.fn.VVImageslider = function(useroptions) {

        /**
         * options defintion
         */
        var defaultoptions = {
            height: 700,
            margin: 15,
            mode: 'flow',        // 'flow' || 'step'
            intervalTime: 40,
            baseFlowSpeed: 1,
            hoverSpeedMultiplier: 4,
            clickSpeedMultiplier: 32
        };
        var options = $.extend(defaultoptions, useroptions);

        if (this.data().mode) {
            options.mode = this.data().mode;
        };

        /**
         * the elements that are needed again and again
         */
        var self = this;
        var ul = self.find('ul');
        var imgs = self.find('img');
        var slidecount = imgs.length;
        var slideDimensions = [];
        var currentSlide = 0;

        /**
         * Styling variables
         */
        var containerWidth = self.width();
        var lastImgWidth = 0;
        var totalWidth = 0;

        var flowInterval;

        /**
         * start this thing
         */
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
         * read the options and set the chosen dimensions and possibly do other stuff
         */
        function initStyling() {
            self.height(options.height);
            self.find('li:not(:last-child)').css({'margin-right': options.margin + 'px'});
        };

        /**
         * add the triggers to be able to scroll through the content
         */
        function addTriggers() {
            self.append('<div class="vv-imageslider-trigger vv-imageslider-trigger-left"><span class="vv-imageslider-trigger-icon">&lt;</span></div>');
            self.append('<div class="vv-imageslider-trigger vv-imageslider-trigger-right"><span class="vv-imageslider-trigger-icon">&gt;</span></div>');
        };

        function addStepClasses() {
            self.addClass('vv-imageslider-stepmode');
        };

        /**
         * count all images and set the width for the parent ul container
         */
        function readImages() {
            imgs.each(function(i, img) {
                imagesLoaded(img, (function(i) {
                    var itemWidth = $(img).parents('li.vv-imageslider-slide').outerWidth(true);
                    // console.debug(i);
                    slideDimensions[i] = {
                        width: itemWidth,
                        left: -1 * totalWidth
                    };

                    lastImgWidth = itemWidth;
                    totalWidth += itemWidth;
                    ul.width(totalWidth);
                })(i));
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
            self.find('.vv-imageslider-trigger-left').click(function() {
                changeSlide('previous');
            });
            self.find('.vv-imageslider-trigger-right').click(function() {
                changeSlide('next');
            });
        };

        /**
         * changes the slide by setting a new 'left' CSS rule
         *
         * @param   {String}    target      'previous' or 'next'
         */
        function changeSlide(target) {
            var newLeft;
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
            }

            newLeft = slideDimensions[currentSlide].left - (slideDimensions[currentSlide].width - containerWidth) / 2;
            ul.css({left: newLeft});
        };
    };

}(jQuery));