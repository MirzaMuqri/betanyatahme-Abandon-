$(document).ready(() => {
    var FadeTransition = Barba.BaseTransition.extend({
        start: function () {
            Promise
                .all([this.newContainerLoading, this.fadeOut()])
                .then(this.fadeIn.bind(this));
        },

        fadeOut: function () {

            return $(this.oldContainer).fadeOut(500).promise();
        },

        fadeIn: function () {

            var _this = this;
            var $el = $(this.newContainer);

            $(this.oldContainer).hide();

            $el.css({
                visibility: 'visible',
                opacity: 1
            });

            _this.done();
        }
    });


    Barba.Pjax.getTransition = function () {

        return FadeTransition;
    };

    Barba.Pjax.start();
});