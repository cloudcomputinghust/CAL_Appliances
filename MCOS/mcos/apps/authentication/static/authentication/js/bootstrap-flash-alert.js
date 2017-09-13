/*
 * Bootstrap Flash Alert
 * Examples of use :
 * $ .alert("Prompt content," {
 *       Title: " Title "
 *       Position: ['left', [-0.1,0]]
 * } )
 * You can also use this
 * $ .alert("Prompt content", "title") ;
 * Location Use
 * Top-left, top-right, bottom-left, bottom-right, center
 */


var alertMessageConfig = {
    alertMessageBox: "body",
    setAlertMessageBox: function (wrapper) {
        this.alertMessageBox = wrapper;
    }
};


(function ($) {
    $.alert_ext = {
        // Default configuration
        defaults: {
            autoClose: true,  // Automatic shutdown
            closeTime: 7000,   // Auto-off time , not less than 1000
            withTime: false, // Timing will be added after the text add ... 10
            type: 'danger',  // Tip Type
            position: ['center', [-0.42, 0]], // Position, the first position, followed by offset, if it is between 1 and -1 percentage
            title: false, // title
            icon: false,
            close: '',   // Bind off event need to drop the button
            speed: 'normal',   // speed
            isOnly: false, //If there is only one
            minTop: 10, //Minimum Top
            animation: true, // animation
            animShow: 'fadeIn',
            animHide: 'fadeOut',
            onShow: function () {
            },  // After opening the callback
            onClose: function () {
            }  // After Close Callback
        },

        // Balloon template
        tmpl: '<div class="alert alert-dismissable ${State}">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">' +
                        '&times;' +
                    '</button>' +
                    '<div class="header">' +
                        '<div class="icon">${Icon}</div>' +
                        '<strong>${Title}</strong>' +
                        '<p>${Content}</p>' +
                    '</div>' +
             '</div>',

        // Initialization function
        init: function (msg, options) {

            this.options = $.extend({}, this.defaults, options);
            this.create(msg);
            this.set_css();
            this.bind_event();

            return this.alertDiv;
        },

        template: function (tmpl, data) {
            $.each(data, function (k, v) {
                tmpl = tmpl.replace('${' + k + '}', v);
            });
            return $(tmpl);
        },

        // Create balloon
        create: function (msg) {
            this.alertDiv = this.template(this.tmpl, {
                State: 'alert-' + this.options.type,
                Title: this.options.title,
                Icon: '<span class="' + this.options.icon + '"></span>',
                Content: msg
            }).hide();
            // $('.header', this.alertDiv).css('float', 'right');
            $('p', this.alertDiv).css('display', 'block');
            // $('p', this.alertDiv).css('white-space', 'nowrap');
            //
            if (!this.options.title) {
                $('strong', this.alertDiv).remove();
                $('.header', this.alertDiv).css('float', 'none');
                // $('.header', this.alertDiv).css('align', 'justify');
                $('.header', this.alertDiv).css('display', 'inline-block');
                $('.header', this.alertDiv).css('margin-right', '-40px');
            } else {
                $('strong', this.alertDiv).css('display', 'inline-block');
                // $('strong', this.alertDiv).css('white-space', 'nowrap');
            }

            // if (!this.options.icon) {
            //     $('span', this.alertDiv).remove();
            // } else {
            //     $('.header', this.alertDiv).css('align', 'justify');
            //     $('.icon', this.alertDiv).css('float', 'left');
            //     $('.icon', this.alertDiv).css('margin-right', '15px');
            //     $('.icon', this.alertDiv).css('margin-top', '7px');
            //     $('p', this.alertDiv).css('margin-right', '40px');
            // }

            // if (this.options.icon && !this.options.title) {
            //     $('p', this.alertDiv).css('display', 'inline');
            //     $('.icon', this.alertDiv).css('margin-top', '-1px');
            // }

            if (this.options.isOnly) {
                $('body > .alert').remove();
            }
            this.alertDiv.appendTo($(alertMessageConfig.alertMessageBox));
        },

        // Setting styles
        set_css: function () {
            var alertDiv = this.alertDiv;

            // Initialization Style
            alertDiv.css({
                'position': 'static',
                'text-align': 'justify'
            })
        },

        // Binding events
        bind_event: function () {
            this.bind_show();
            this.bind_close();

            if ($.browser && $.browser.msie && $.browser.version == '6.0') {
                this.bind_scroll();
            }
        },

        // Show events
        bind_show: function () {

            var alertDiv = this.alertDiv,
                ops = this.options;

            setTimeout(function () {
                ops.onShow($(this));

                if (ops.animation) {
                    // alertDiv.addClass('animated ' + ops.animShow).show();
                    alertDiv.addClass('animated ' + ops.animShow).fadeIn(500);
                } else {
                    alertDiv.show();
                }

            }, ops.speed);

        },

        // Close Event
        bind_close: function () {
            var alertDiv = this.alertDiv,
                ops = this.options,
                closeBtn = $('.close', alertDiv).add($(this.options.close, alertDiv));

            closeBtn.bind('click', function (e) {
                alertDiv.fadeOut(ops.speed, function () {
                    $(this).remove();
                    ops.onClose($(this));
                });

                e.stopPropagation();
            });

            // Automatically shut down binding
            if (this.options.autoClose) {
                var time = parseInt(this.options.closeTime / 1000);
                if (this.options.withTime) {
                    $('p', alertDiv).append('<span>...<em>' + time + '</em></span>');
                }
                var timer = setInterval(function () {
                    $('em', alertDiv).text(--time);

                    if (!time) {
                        if (ops.animation) {
                            alertDiv.removeClass(ops.animShow).addClass(ops.animHide);
                        }
                        clearInterval(timer);
                        closeBtn.trigger('click');
                    }
                }, 1000);
            }
        },

        // IE6 rolling track
        bind_scroll: function () {
            var alertDiv = this.alertDiv,
                top = alertDiv.offset().top - $(window).scrollTop();
            $(window).scroll(function () {
                alertDiv.css("top", top + $(window).scrollTop());
            })
        },

        // Detecting whether the mobile browser
        check_mobile: function () {
            var userAgent = navigator.userAgent;
            var keywords = ['Android', 'iPhone', 'iPod', 'iPad', 'Windows Phone', 'MQQBrowser'];
            for (var i in keywords) {
                if (userAgent.indexOf(keywords[i]) > -1) {
                    return keywords[i];
                }
            }
            return false;
        }
    };

    $.alert_message = function (msg, arg) {
        if ($.alert_ext.check_mobile()) {
            alert(msg);
            return;
        }
        if (!$.trim(msg).length) {
            return false;
        }
        if ($.type(arg) === "string") {
            arg = {
                title: arg
            }
        }
        if (arg && arg.type == 'error') {
            arg.type = 'danger';
        }
        return $.alert_ext.init(msg, arg);
    }
})(jQuery);
