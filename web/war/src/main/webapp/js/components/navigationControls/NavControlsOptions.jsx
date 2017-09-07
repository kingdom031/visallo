define([
    'create-react-class',
    'prop-types',
    '../Attacher'
], function(createReactClass, PropTypes, Attacher) {
    'use strict';

    const NavControlsOptions = createReactClass({

        propTypes: {
            //TODO
        },

        render() {
            const { active, options, onToggle } = this.props;

            return (
                <li ref="options" className="options">
                    <button className={active ? 'active' : ' '}
                        onClick={() => onToggle('options')}
                        title={i18n('controls.options.toggle')}>Options</button>
                    <div style={{display: (active ? 'block' : 'none')}} className="options-container">
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
                </li>
            );
        }
    });

    return NavControlsOptions;
});
