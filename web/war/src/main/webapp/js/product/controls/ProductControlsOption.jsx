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
            tool: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                componentPath: PropTypes.string,
                icon: PropTypes.string,
                label: PropTypes.string,
                props: PropTypes.object
            }),
            active: PropTypes.bool,
            onClick: PropTypes.func,
            rightOffset: PropTypes.number
        },

        render() {
            const { active, tool, onOptionMouseEnter, onOptionMouseLeave } = this.props;
            const { props: toolProps, icon, label, buttonClass, identifier, componentPath, placementHint } = tool;

            return (
                <li
                    className={classNames('controls-option', { active })}
                    onClick={this.onOptionClick}
                    ref={(ref) => { this.option = ref }}
                    onMouseEnter={(event) => { onOptionMouseEnter(identifier) }}
                    onMouseLeave={(event) => { onOptionMouseLeave(identifier) }}
                >
                  {componentPath
                      ? placementHint && placementHint === 'popover'
                          ? this.renderPopoverOption()
                          : this.renderOption()
                      : this.renderButton()}
                </li>
            );
        },

        renderButton() {
            const { active, tool } = this.props;
            const { props: toolProps, icon, label, buttonClass, identifier, componentPath } = tool;

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
            const { props: toolProps, identifier, componentPath } = this.props.tool;

            return (
                <Attacher
                    key={identifier}
                    componentPath={componentPath}
                    {...(toolProps || {})}
                />
            )
        },

        renderPopoverOption() {
            const { active, tool } = this.props;
            const { props: toolProps, icon, label, buttonClass, identifier, componentPath } = tool;

            return (
                <div>
                    <div className={classNames('button', buttonClass)}>
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
                            componentPath={componentPath}
                            afterAttach={this.positionPopover}
                            {...(toolProps || {})}
                       /> : null}
                    </div>
                    <div className="arrow top"></div>
                </div>
            )
        },

        onOptionClick(event) {
            if (!$(event.target).closest('.option-container').length) {
                const { props: toolProps = {}, identifier } = this.props.tool;
                if (_.isFunction(toolProps.handler)) {
                    toolProps.handler();
                } else {
                    this.props.onClick(identifier);
                }
            }
        },

        positionPopover(attacher) {
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
