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
            const { active, onClick, tool } = this.props;
            const { props: toolProps, icon, label, identifier, componentPath } = tool;

            if (!icon && !label) {
                console.warn(tool.identifier + 'option supplied. One of "icon" or "label" is required');
                return null;
            }

            return (
                <li
                    className={classNames('controls-option', { active })}
                    onClick={onClick}
                >
                    <div className="button">
                        { icon ?
                            <div className="option-icon" style={{backgroundImage: `url(${icon})`}}></div>
                        : null}
                        <span>{label}</span>
                    </div>
                    <div style={{display: (active ? 'block' : 'none')}} className="option-container">
                       {active ? <Attacher
                            key={identifier}
                            componentPath={componentPath}
                            {...(toolProps || {})}
                       /> : null}
                    </div>

                </li>
            );
        }
    });

    return ProductControlsOption;
});
