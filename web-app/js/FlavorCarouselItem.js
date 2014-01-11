/**
 * View of a flavor in the flavor carousel.
 *
 * Currently does not use an actual flavor model, but the old flavor object. This should be fixed
 */
var FlavorCarouselItem = Backbone.View.extend({

    tagName: 'li',

    template: _.template(
        '<% if (flavor.isGlutenFree) { %><img class="gf-icon" src="../img/gluten-free-icon.png" /><% } %> \
        <img src="<%= flavor.stageImageUrl %>"/> \
        <div class="flavor-label"><%= flavor.name %></div>'),

    initialize: function() {
        this.$el.addClass('flavor').attr('data-id', this.model.id);
    },

    render: function() {
        this.$el.html(this.template({flavor: this.model}));
        return this;
    }


})