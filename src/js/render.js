export default {
    name: 'renderTree',
    functional: true,
    props: {
        render: Function,
        data: Object,
    },
    render: (h, ctx) => {
        const params = {
            data: ctx.props.data
        };
        return ctx.props.render(h, params);
    }
}