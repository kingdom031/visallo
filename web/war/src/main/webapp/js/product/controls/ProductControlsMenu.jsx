define([
    'create-react-class',
    'prop-types',
    'components/Attacher'
], function(createReactClass, PropTypes, Attacher) {
    'use strict';

    const ProductControlsMenu = createReactClass({

        propTypes: {
            //TODO
        },

        render() {
            const { active, options, onToggle } = this.props;
            if (_.isEmpty(options)) {
                return null;
            }

            return (
                <div className="controls-menu">
                    <button
                        className={active ? 'active' : ''}
                        onClick={onToggle}
                        title={i18n('controls.options.toggle')}>Option</button>
                    <div style={{display: (active ? 'block' : 'none')}} className="option-container">
                        <ul>{
                            options.map(option => {
                                return <Attacher
                                    nodeType="li"
                                    key={option.identifier}
                                    componentPath={option.componentPath}
                                    {...(option.props || {})} />
                            })
                        }</ul>
                    </div>
                </div>
            );
        }
    });

    return ProductControlsMenu;
});
