define([
    'create-react-class',
    'prop-types',
    'classnames',
    '../Attacher'
], function(
    createReactClass,
    PropTypes,
    classNames,
    Attacher) {
    'use strict';

    const NavControlsButton = createReactClass({

        propTypes: {
            tool: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                componentPath: PropTypes.string.isRequired,
                button: PropTypes.shape({
                    icon: PropTypes.string,
                    label: PropTypes.string
                }),
                props: PropTypes.object
            })
        },

        render() {
            const { active, onClick, tool } = this.props;
            const { props: toolProps, button, identifier, componentPath } = tool;
            const { icon, label } = button;

            if (!icon && !label) {
                console.warn(tool.identifier + 'option supplied but no button configuration was given');
                return null;
            }

            return (
                <li
                    className={classNames('controls-option', { active })}
                    onClick={onClick}
                >
                    <div className="button">
                        { icon ?
                            <div className="tool-icon" style={{backgroundImage: `url(${icon})`}}></div>
                        : null}
                        <span>{label}</span>
                    </div>
                    <div style={{display: (active ? 'block' : 'none')}} className="option-container">
                       <Attacher
                            key={identifier}
                            componentPath={componentPath}
                            {...(toolProps || {})}
                       />
                    </div>

                </li>
            );
        }
    });

    return NavControlsButton;
});
