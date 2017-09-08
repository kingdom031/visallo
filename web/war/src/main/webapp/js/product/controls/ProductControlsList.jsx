define([
    'create-react-class',
    'prop-types',
    './ProductControlsOption',
    './ProductControlsMenu'
], function(
    createReactClass,
    PropTypes,
    ProductControlsOption,
    ProductControlsMenu) {
    'use strict';

    const placementHint = {
        MENU: 'menu',
        BUTTON: 'button'
    };
    const MENU_IDENTIFIER = 'menu';

    const ProductControlsList = createReactClass({

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
            const { onFit, tools } = this.props;
            const toolsByType = _.groupBy(tools, (tool) => tool.placementHint || placementHint.MENU);

            return (
                    <div className="controls-list">
                        <ul className="extensions">
                            {toolsByType[placementHint.BUTTON] ? toolsByType[placementHint.BUTTON].map(tool =>
                                <ProductControlsOption
                                    tool={tool}
                                    active={activeOption === tool.identifier}
                                    key={tool.identifier}
                                    onClick={() => {this.onItemClick(tool.identifier) }}
                                />
                            ) : null}
                        </ul>
                        <div className="controls-menu-container">
                            {toolsByType[placementHint.MENU] ?
                                <ProductControlsMenu
                                    options={toolsByType[placementHint.MENU]}
                                    active={activeOption === MENU_IDENTIFIER}
                                    onToggle={() => { this.onItemClick(MENU_IDENTIFIER) }}
                                />
                            : null}
                            <div className="button fit" onClick={onFit}>{i18n('controls.fit')}</div>
                        </div>
                    </div>
            );
        }
    });

    return ProductControlsList;
});
