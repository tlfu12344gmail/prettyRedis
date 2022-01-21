<template>
    <q-page class="flex flex-center">
        <q-virtual-scroll style="max-height: 800px; width:40%" :items="arr" separator class="shadow-2">
            <template v-slot="{ item }">
                <render :data="item.data" :render="item.render" />
            </template>

        </q-virtual-scroll>
    </q-page>
</template>

<script>
import render from '../js/render.js'

export default {
    name: 'PageIndex',
    data() {
        return {
            arr: []
        }
    },

    created() {
        // 数据模拟
        let treeData = []
        let _self = this

        for (let i = 1; i <= 10; i++) {
            let obj = {
                data: {
                    name: 'render' + i,
                    id: i,
                    pid: i + '',
                    channel: 0,
                    clickColor: false,
                    children: this.getChildren(i, 2)
                },
                render(h, params) {
                    return _self.treeNode(h, params)
                }

            }
            treeData.push(obj)
        }
        this.arr = Object.assign([], treeData)

    },
    mounted() {
        console.log(this.arr)

    },
    methods: {

        getChildren(id, num) {
            if (num > 0) {
                let arr = []
                for (let i = 1; i < 5; i++) {
                    let random = Math.floor(Math.random() + 0.5)
                    let obj = {
                        name: 'children' + id + '_' + i,
                        id: id + '_' + i,
                        pid: id + '_' + i,
                        channel: random,
                        clickColor: false,
                    }
                    if (!random) {
                        obj.children = this.getChildren(id + '_' + i, num - 1)
                    }

                    arr.push(obj)

                }

                return arr
            }

        },

        treeNode(h, params) {
            let _self = this
            let data = params.data
            let children = data.children
            let width = 12

            return h('QExpansionItem', {
                attrs: {
                    group: 'somegroup'
                },
                on: {
                    show() {
                        _self.expansionItemShow(data)
                    }
                },
                scopedSlots: {
                    header() {
                        return h('div', {
                            class: 'flex items-center',
                            style: {
                                'width': '100%'
                            },
                        }, [
                            h('div', {
                                style: {
                                    'padding-left': '12px'
                                }
                            }, data.name),
                        ])
                    }
                }
            }, children && children.length > 0 ? _self.renderChildren(h, children, width) : '')
        },
        renderChildren(h, tempchildren, left) {
            let width = left + 12
            let _self = this

            return [
                h('QVirtualScroll', {
                    attrs: {
                        items: tempchildren,
                        separator: ''
                    },
                    style: {
                        "max-height": 700 + 'px'
                    },
                    class: {
                        scroll: true
                    },
                    scopedSlots: {
                        default ({
                            item,
                            index
                        }) {
                            let tag = ''
                            if (item.channel) {
                                tag = h('QBtn', {
                                    attrs: {
                                        flat: true,
                                        align: 'left',
                                    },
                                    class: {
                                        'full-width': true,
                                        'no-border-radius': true,
                                        'bg-primary': item.clickColor,
                                            'text-white': item.clickColor
                                    },
                                    style: {
                                        'padding-top': '6px',
                                        'padding-bottom': '6px',
                                        'font-weight': '400'
                                    },
                                    on: {
                                        click() {
                                            _self.getName(item)
                                        }
                                    }
                                }, [
                                    h('QIcon', {
                                        attrs: {
                                            name: 'touch_app',
                                            size: '14px',
                                        },
                                        style: {
                                            'padding-left': width + 'px'
                                        }
                                    }),
                                    h('div', {
                                        style: {
                                            'padding-left': '12px',

                                        }
                                    }, item.name)
                                ])
                            } else {
                                tag = h('QExpansionItem', {
                                    attrs: {
                                        group: 'somegroup' + width
                                    },
                                    scopedSlots: {
                                        header() {
                                            return h('div', {
                                                class: 'flex items-center',
                                                style: {
                                                    'width': '100%'
                                                },
                                            }, [
                                                h('QIcon', {
                                                    attrs: {
                                                        name: 'add'
                                                    },
                                                    style: {
                                                        'padding-left': width + 'px',

                                                    }
                                                }),
                                                h('div', {
                                                    style: {
                                                        'padding-left': '12px'

                                                    }
                                                }, item.name),

                                            ])
                                        }
                                    }
                                },  _self.renderChildren(h, item.children, width))
                            }
                            return [h('div', {}, [tag])]
                        }
                    }
                })
            ]
        },
        expansionItemShow(data) {
            console.log(data)
        },
        getName(data){
            console.log(data)
        },



    },
    components: {
        render
    }

}
</script>

<style scoped>
.scroll::-webkit-scrollbar {
    width: 0px;

}

.scroll::-webkit-scrollbar-track {
    background: rgb(239, 239, 239);
    border-radius: 2px;
}

.scroll::-webkit-scrollbar-thumb {
    background: #bfbfbf;
    border-radius: 10px;
}

.scroll::-webkit-scrollbar-thumb:hover {
    background: #333;
}

.scroll::-webkit-scrollbar-corner {
    background: #179a16;
}
</style>
