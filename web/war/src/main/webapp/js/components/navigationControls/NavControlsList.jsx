define([
    'create-react-class',
    'prop-types',
    './NavControlsOption',
    './NavControlsMenu'
], function(
    createReactClass,
    PropTypes,
    NavControlsOption,
    NavControlsMenu) {
    'use strict';

    const displayType = {
        ITEM: 'item',
        BUTTON: 'button'
    };
    const OPTIONS_IDENTIFIER = 'options';

    const NavControlsList = createReactClass({

        propTypes: {
            tools: PropTypes.arrayOf(PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                componentPath: PropTypes.string.isRequired,
                button: PropTypes.shape({
                    icon: PropTypes.string,
                    label: PropTypes.string
                }),
                props: PropTypes.object
            }))
        },

        getDefaultProps() {
            return {
                tools: []
            }
        },

        getInitialState() {
            return {
                activeOption: null
            }
        },

        onItemClick(identifier) {
            const activeOption = this.state.activeOption;
            this.setState({
                activeOption: activeOption === identifier ? null : identifier
            });
        },

        render() {
            const { activeOption } = this.state;
            const { onFit } = this.props;
            const tools = _.groupBy(this.props.tools, (tool) => tool.button ? displayType.BUTTON : displayType.ITEM);

            return (
                    <div className="controls-list">
                        <ul>
                            {tools[displayType.BUTTON].map(tool =>
                                <NavControlsOption
                                    tool={tool}
                                    active={activeOption === tool.identifier}
                                    key={tool.identifier}
                                    onClick={() => {this.onItemClick(tool.identifier) }}
                                />
                            )}
                        </ul>
                        <div className="controls-menu-container">
                            {tools[displayType.ITEM] ?
                                <NavControlsMenu
                                    options={tools[displayType.ITEM]}
                                    active={activeOption === OPTIONS_IDENTIFIER}
                                    onToggle={() => { this.onItemClick(OPTIONS_IDENTIFIER) }}
                                />
                            : null}
                            <button onClick={onFit}>{i18n('controls.fit')}</button>
                        </div>
                    </div>
            );
        }
    });

    return NavControlsList;
});
