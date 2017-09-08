define([
    'create-react-class',
    'prop-types',
    '../Attacher'
], function(createReactClass, PropTypes, Attacher) {
    'use strict';

    const NavControlsMenu = createReactClass({

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
                    <button className={active ? 'active' : ' '}
                        onClick={onToggle}
                        title={i18n('controls.options.toggle')}>Options{/*TODO i18n*/}</button>
                    <div style={{display: (active ? 'block' : 'none')}} className="controls-menu-option">
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

    return NavControlsMenu;
});
