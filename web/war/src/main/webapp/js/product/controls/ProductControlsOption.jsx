define([
    'create-react-class',
    'prop-types',
    'classnames',
    'components/Attacher'
], function(
    createReactClass,
    PropTypes,
    classNames,
    Attacher) {
    'use strict';

    const PADDING = 10;

    const ProductControlsOption = createReactClass({

        propTypes: {
            option: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                optionComponentPath: PropTypes.string,
                icon: PropTypes.string,
                label: PropTypes.string,
                props: PropTypes.object
            }),
            active: PropTypes.bool,
            onClick: PropTypes.func,
            onOptionMouseEnter: PropTypes.func,
            onOptionMouseLeave: PropTypes.func,
            rightOffset: PropTypes.number
        },

        render() {
            const { active, option, onOptionMouseEnter, onOptionMouseLeave } = this.props;
            const { props: optionProps, icon, label, buttonClass, identifier, optionComponentPath, placementHint } = option;

            return (
                <li
                    className={classNames('controls-option', { active })}
                    onClick={this.onOptionClick}
                    ref={(ref) => { this.option = ref }}
                    onMouseEnter={(event) => { onOptionMouseEnter(identifier) }}
                    onMouseLeave={(event) => { onOptionMouseLeave(identifier) }}
                >
                  {optionComponentPath
                      ? placementHint && placementHint === 'popover'
                          ? this.renderPopoverOption()
                          : this.renderOption()
                      : this.renderButton()}
                </li>
            );
        },

        renderButton() {
            const { active, option } = this.props;
            const { props: optionProps, icon, label, buttonClass, identifier, optionComponentPath } = option;

            return (
                <div className={classNames('button', buttonClass)}>
                    { icon ?
                        <div className="option-icon" style={{backgroundImage: `url(${icon})`}}></div>
                    : null}
                    <span>{label}</span>
                </div>
            )
        },

        renderOption() {
            const { props: optionProps, identifier, optionComponentPath } = this.props.option;

            return (
                <Attacher
                    key={identifier}
                    componentPath={optionComponentPath}
                    {...optionProps}
                />
            )
        },

        renderPopoverOption() {
            const { active, option } = this.props;
            const { props: optionProps = {}, icon, label, buttonClass, identifier, optionComponentPath } = option;


            return (
                <div>
                    <div className={classNames('button', 'has-popover', buttonClass)}>
                        { icon ?
                            <div className="option-icon" style={{backgroundImage: `url(${icon})`}}></div>
                        : null}
                        <span>{label}</span>
                    </div>
                    <div
                        style={{display: (active ? 'block' : 'none')}}
                        className="option-container"
                        ref={(ref) => { this.popover = ref }}
                    >
                       {active ? <Attacher
                            key={identifier}
                            componentPath={optionComponentPath}
                            afterAttach={this.positionPopover}
                            {...optionProps}
                            onResize={this.positionPopover}
                       /> : null}
                    </div>
                    <div className="arrow top"></div>
                </div>
            )
        },

        onOptionClick(event) {
            if (!$(event.target).closest('.option-container').length) {
                const { props: optionProps = {}, identifier } = this.props.option;
                if (_.isFunction(optionProps.handler)) {
                    optionProps.handler();
                } else {
                    this.props.onClick(identifier);
                }
            }
        },

        /**
         * Call `props.onResize` after your component changes size to update the popover's position
         * @callback org.visallo.product.options~onResize
         */
        positionPopover() {
            const rightOffset = this.props.rightOffset;
            const { left: optionLeft, width: optionWidth, right: optionRight } = this.option.getBoundingClientRect();
            const { left, right, width } = this.popover.getBoundingClientRect();
            const windowWidth = $(window).width();
            const maxLeft = windowWidth - width - PADDING - rightOffset;
            const currentOffset = $(this.popover).offset();
            const positionLeft = Math.min(optionLeft, maxLeft);

            $(this.arrow).offset({ top: $(this.arrow).offset.top, left: (optionLeft + (optionWidth / 2))});
            $(this.popover).offset({ top: currentOffset.top, left: Math.max(positionLeft, 40) }); //menubar width
        }
    });

    return ProductControlsOption;
});
