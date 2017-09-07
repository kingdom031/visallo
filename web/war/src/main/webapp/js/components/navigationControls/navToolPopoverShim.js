
define([
    'flight/lib/component',
    'util/popovers/withPopover',
    'util/withTeardown',
    'util/component/attacher'
], function(
    defineComponent,
    withPopover,
    withTeardown,
    attacher) {
    'use strict';

    return defineComponent(
        navToolPopoverShim,
        withPopover,
        withTeardown
    );

    function navToolPopoverShim() {

        this.before('teardown', function() {
            this.attacher.teardown();
        })

        this.after('initialize', function() {

            this.after('setupWithTemplate', () => {
                this.attacher = attacher()
                    .node($(this.popover).find('.popover-content'))
                    .path(this.attr.componentPath)
                    .params({
                        ...this.attr.toolProps
                    });

                this.attacher
                    .attach()
                    .then(() => {
                        this.positionDialog();
                    });
            });

        });

        this.getTemplate = function() {
            return new Promise(f => require(['./navToolPopoverTpl'], f));
        };
    }
});
