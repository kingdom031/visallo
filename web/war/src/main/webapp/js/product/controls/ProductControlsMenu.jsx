define([
    'create-react-class',
    'prop-types',
    'components/Attacher'
], function(createReactClass, PropTypes, Attacher) {
    'use strict';

    const ProductControlsMenu = ({ active, identifier, options, onToggle, onOptionMouseEnter, onOptionMouseLeave }) => {
        if (_.isEmpty(options)) {
            return null;
        }

        return (
            <div className="controls-menu"
                onMouseEnter={() => { onOptionMouseEnter(identifier) }}
                onMouseLeave={() => { onOptionMouseLeave(identifier) }}
            >
                <button
                    className={active ? 'active' : ''}
                    onClick={() => { onToggle(identifier) }}
                    title={i18n('controls.options.toggle')}>Option</button>
                <div style={{display: (active ? 'block' : 'none')}} className="option-container">
                    <ul>{
                        options.map(({ identifier, optionComponentPath, props }) => {
                            return <Attacher
                                nodeType="li"
                                key={identifier}
                                componentPath={optionComponentPath}
                                {...(props || {})} />
                        })
                    }</ul>
                </div>
            </div>
        );
    };

    ProductControlsMenu.propTypes = {
        identifier: PropTypes.string.isRequired,
        active: PropTypes.bool,
        options: PropTypes.array,
        onToggle: PropTypes.func,
        onOptionMouseEnter: PropTypes.func,
        onOptionMouseLeave: PropTypes.func
    };

    return ProductControlsMenu;
});
