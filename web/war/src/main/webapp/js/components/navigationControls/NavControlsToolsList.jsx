define([
    'create-react-class',
    'prop-types',
    '../Attacher',
    './NavControlsOptions',
    './navToolPopoverShim'
], function(
    createReactClass,
    PropTypes,
    Attacher,
    NavControlsOptions,
    navToolPopoverShim) {
    'use strict';

    const displayType = {
        ITEM: 'item',
        BUTTON: 'button'
    };
    const OPTIONS_IDENTIFIER = 'options';

    const NavControlsToolsList = createReactClass({

        propTypes: {
            tools: PropTypes.arrayOf(PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                componentPath: PropTypes.string.isRequired,
                button: PropTypes.shape({
                    icon: PropTypes.string,
                    label: PropTypes.string
                }),
                props: PropTypes.object
            })),
            rightOffset: PropTypes.number.isRequired
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

        componentDidUpdate(prevProps, prevState) {
            const { activeOption } = this.state;
            const { tools, rightOffset } = this.props;

            if (activeOption !== prevState.activeOption) {
                $(this.list).teardownAllComponents();

                if (activeOption && activeOption !== OPTIONS_IDENTIFIER) {
                    const tool = tools.find((tool) => tool.identifier === activeOption);
                    const $button = $(this.list).find('.tool-button').filter(function() {
                        return $(this).data('identifier') === tool.identifier
                    });

                    if ($button.length) {
                        navToolPopoverShim.attachTo($(this.list), {
                           componentPath: tool.componentPath,
                           toolProps: tool.props,
                           anchorTo: {
                               page: getButtonPosition($button[0], rightOffset)
                           },
                           teardownOnTap: false,
                           zoomWithGraph: false
                        });
                    }
                }
            }

//            if (activeOption && prevProps.rightOffset !== rightOffset) { //TODO this needs button element
//                $(this.list).trigger('positionChanged', { anchor: , position:  });
//            }

            function getButtonPosition(ele, rightOffset) {
                const rect = ele.getBoundingClientRect();
                return {
                    x: (rect.left + ((rect.right - rect.left) / 2)) - (rightOffset || 0),
                    y: rect.bottom
                }
            }
        },

        onOptionClick(identifier) {
            const activeOption = this.state.activeOption;
            this.setState({
                activeOption: activeOption === identifier ? null : identifier
            });
        },

        render() {
            const { activeOption } = this.state;
            const tools = _.groupBy(this.props.tools, (tool) => tool.button ? displayType.BUTTON : displayType.ITEM);

            return (
                    <div className="tools">
                        <ul className="tools-list" ref={(ref) => { this.list = ref }}>
                            {tools[displayType.BUTTON] ?
                                tools[displayType.BUTTON].map(tool => {
                                    const { icon, label } = tool.button;

                                    if (!icon && !label) {
                                        console.warn(tool.identifier + 'option supplied but no button configuration was given');
                                        return null;
                                    }

                                    return (
                                        <li
                                            className="tool-button"
                                            key={tool.identifier}
                                            data-identifier={tool.identifier}
                                            onClick={() => { this.onOptionClick(tool.identifier) }}
                                        >
                                            <div className="button">
                                                { icon ?
                                                    <div className="tool-icon" style={{backgroundImage: `url(${icon})`}}></div>
                                                : null}
                                                <span>{label}</span>
                                            </div>
                                        </li>
                                    );
                                }) : null
                            }
                            {tools[displayType.ITEM] ?
                                <NavControlsOptions
                                    options={tools[displayType.ITEM]}
                                    active={activeOption === OPTIONS_IDENTIFIER}
                                    onToggle={this.onOptionClick}
                                />
                            : null}
                        </ul>
                    </div>
            );
        }
    });

    return NavControlsToolsList;
});
