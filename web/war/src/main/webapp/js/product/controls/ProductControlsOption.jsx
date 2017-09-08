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
                componentPath: PropTypes.string.isRequired,
                placementHint: PropTypes.string,
                icon: PropTypes.string,
                label: PropTypes.string,
                props: PropTypes.object
            }) //TODO
        },

        render() {
            const { active, onClick, tool, rightOffset } = this.props;
            const { props: toolProps, icon, label, identifier, componentPath } = tool;

            if (!icon && !label) {
                console.warn(tool.identifier + 'option supplied. One of "icon" or "label" is required');
                return null;
            }

            return (
                <li
                    className={classNames('controls-option', { active })}
                    onClick={this.onOptionClick}
                    ref={(ref) => { this.option = ref }}
                >
                    <div className="button">
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
                </li>
            );
        },

        onOptionClick(event) {
            if (!$(event.target).closest('.option-container').length) {
                this.props.onClick();
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
