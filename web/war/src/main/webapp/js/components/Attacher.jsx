define([
    'react',
    'create-react-class',
    'prop-types',
    'util/component/attacher'
], function(React, createReactClass, PropTypes, attacher) {
    'use strict';

    const Attacher = createReactClass({

        propTypes: {
            componentPath: PropTypes.string.isRequired,
            behavior: PropTypes.object,
            legacyMapping: PropTypes.object,
            nodeType: PropTypes.string,
            nodeStyle: PropTypes.object,
            nodeClassName: PropTypes.string
        },

        getDefaultProps() {
            return { nodeType: 'div', nodeStyle: {}, nodeClassName: '' };
        },

        getInitialState() {
            return { element: null }
        },

        componentDidMount() {
            this.reattach(this.props);
        },

        componentWillReceiveProps(nextProps) {
            if (nextProps !== this.props) {
                this.reattach(nextProps);
            }
        },

        componentWillUnmount() {
            if (this.attacher) {
                this.attacher.teardown();
            }
        },

        render() {
            const { nodeType, nodeStyle, nodeClassName } = this.props;
            const { element } = this.state;

            return element ? element : React.createElement(nodeType, {
                ref: 'node',
                style: nodeStyle,
                className: nodeClassName
            });
        },

        reattach(props) {
            const { componentPath, legacyMapping, behavior, nodeType, nodeStyle, nodeClassName, ...rest } = props;

            const inst = (this.attacher || (this.attacher = attacher({ preferDirectReactChildren: true })))
                .path(componentPath)
                .params(rest);

            if (this.refs.node) {
                inst.node(this.refs.node)
            }

            if (behavior) {
                inst.behavior(behavior)
            }

            if (legacyMapping) {
                inst.legacyMapping(legacyMapping)
            }

            inst.attach({
                teardown: true,
                teardownOptions: { react: false },
                emptyFlight: true
            }).then(attach => {
                if (attach._reactElement) {
                    this.setState({ element: attach._reactElement })
                }
            })
        }
    });

    return Attacher;
});
