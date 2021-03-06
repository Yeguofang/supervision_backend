﻿define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'check/build/index',
                }
            });
            var buttons = [
                {
                    name     : 'report',
                    text     : '监督报告',
                    icon     : 'fa fa-list',
                    classname: 'btn btn-info btn-xs btn-detail btn-dialog',
                    url      : 'check/build/report',
                    visible  : function (row) {
                        //返回true时按钮显示,返回false隐藏
                        return true;
                    }
                },{
                    name     : 'deal',
                    text     : '同意验收',
                    classname: 'btn btn-xs btn-success btn-magic btn-ajax',
                    url      : 'check/build/deal',
                    confirm  : '同意验收？',
                    success  : function (data, ret) {
                        Layer.alert(ret.msg );
                    },
                    visible  : function (row) {
                        //返回true时按钮显示,返回false隐藏  质监跟安监都申请了竣工
                        if (row.quality_progress == 3  && row.supervisor_progress == 3) {
                            if (row.build_check == 1) {
                                return false;
                            }
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name     : 'deal',
                    text     : '不同意验收',
                    classname: 'btn btn-xs btn-info btn-magic btn-ajax',
                    url      : 'check/build/nodeal',
                    confirm  : '不同意验收？',
                    success  : function (data, ret) {
                        Layer.alert(ret.msg );
                    },
                    visible  : function (row) {
                        //返回true时按钮显示,返回false隐藏
                        if (row.quality_progress == 3) {
                            if (row.build_check == 3) {
                                return false;
                            }
                            return true;
                        }
                        return false;
                    }
                }
            ];

            var submitForm = function (ids, layero) {
                var options = table.bootstrapTable('getOptions');
                console.log(options);
                var columns = [];
                $.each(options.columns[0], function (i, j) {
                    if (j.field && !j.checkbox && j.visible && j.field != 'operate') {
                        columns.push(j.field);
                    }
                });
                var search = options.queryParams({});
                $("input[name=search]", layero).val(options.searchText);
                $("input[name=ids]", layero).val(ids);
                $("input[name=filter]", layero).val(search.filter);
                $("input[name=op]", layero).val(search.op);
                $("input[name=columns]", layero).val(columns.join(','));
                $("form", layero).submit();z
            };
            $(document).on("click", ".btn-export", function () {
                var ids  = Table.api.selectedids(table);
                var page = table.bootstrapTable('getData');
                var all  = table.bootstrapTable('getOptions').totalRows;
                console.log(ids, page, all);
                Layer.confirm("请选择导出的选项<form action='" + Fast.api.fixurl("check/build/export") + "' method='post' target='_blank'><input type='hidden' name='ids' value='' /><input type='hidden' name='filter' ><input type='hidden' name='op'><input type='hidden' name='search'><input type='hidden' name='columns'></form>", {
                    title  : '导出数据',
                    btn    : ["选中项(" + ids.length + "条)", "本页(" + page.length + "条)", "全部(" + all + "条)"],
                    success: function (layero, index) {
                        $(".layui-layer-btn a", layero).addClass("layui-layer-btn0");
                    }
                    , yes: function (index, layero) {
                        if (ids.length == 0) {
                            alert('请先选择数据！');
                            return false;
                        }
                        submitForm(ids.join(","), layero);
                        return false;
                    }
                    ,
                    btn2: function (index, layero) {
                        var ids = [];
                        $.each(page, function (i, j) {
                            ids.push(j.id);
                        });
                        submitForm(ids.join(","), layero);
                        return false;
                    }
                    ,
                    btn3: function (index, layero) {
                        submitForm("all", layero);
                        return false;
                    }
                })
            });
            
            var table = $("#table");
            table.on('post-body.bs.table', function (e, settings, json, xhr) {
                $(".small").data("area", ["200px","90px"]);

            });
            // 初始化表格
            table.bootstrapTable({
                url       : $.fn.bootstrapTable.defaults.extend.index_url,
                pk        : 'id',
                sortName  : 'id',
                escape    : false,
                showToggle: false,
                search    : false,
                showExport: false,
                columns   : [
                    [
                        //id,worker_code,nickname,mobile,supervisor_card,admin_code,is_law,username,admin_level
                        {checkbox: true},
                        {field: 'id', title: '序号', sortable: true, operate: false},
                        {field: 'licence_code', title: '监督编号', operate: "LIKE"},
                        {field: 'build_dept', title: '建设单位', operate: "LIKE"},
                        {field: 'project_name', title: '工程名称', operate: "LIKE"},
                        {field: 'address', title: '建设地址', operate:false},
                        {field: 'i.project_kind', title: '工程类别', formatter:Controller.api.formatter.kind,searchList: {'0':'市政建设','1': '房建'}},
                        {field: 'i.status', title: '工程状态', formatter:Controller.api.formatter.status,searchList: {'0':'未开工','1': '在建','2':'质量停工','3':'安全停工','4':'局停工','5':'自停工'}},
                        {field: 'supervisor_progress', title: '安监进度', formatter:Controller.api.formatter.supervisor},
                        {field: 'quality_progress', title: '质监进度', formatter:Controller.api.formatter.quality},
                        {field: 'build_check', title: '是否同意验收', formatter:Controller.api.formatter.check,searchList: {'0':'未处理','1': '已同意'}},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate,buttons:buttons}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        deal:function(){
            Controller.api.bindevent();
        },
        report:function(){
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            formatter:{
                kind:function (value,row,index) {
                    if(value == '0'){
                        return "<label class='label bg-green'>市政建设</label>"
                    }else if(value == '1'){
                        return "<label class='label bg-green'>房建</label>"
                    }
                },check:function (value,row,index) {
                    if(value == '0'){
                        return "<label class='label bg-orange'>未处理</label>"
                    }else if(value == '1'){
                        return "<label class='label bg-green'>已同意</label>"
                    }else if(value == '2'){
                        return "<label class='label bg-green'>不同意</label>"
                    }
                },status:function (value,row,index) {
                    if(value == '0'){
                        return "<label class='label bg-orange'>未开工</label>"
                    }else if(value == '1'){
                        return "<label class='label bg-green'>在建</label>"
                    }else if(value == '2'){
                        return "<label class='label bg-red'>质量停工</label>"
                    }else if(value == '3'){
                        return "<label class='label bg-red'>安全停工</label>"
                    }else if(value == '4'){
                        return "<label class='label bg-red'>局停工</label>"
                    }else if(value == '5'){
                        return "<label class='label bg-red'>自停工</label>"
                    }
                },quality:function (value,row,index) {
                    if(value == '0'){
                        return "<label class='label bg-orange'>未申请竣工</label>"
                    }else if(value == '1'){
                        return "<label class='label bg-orange'>已申请竣工并通知副站长</label>"
                    }else if(value == '2'){
                        return "<label class='label bg-orange'>已通知站长</label>"
                    }else if(value == '3'){
                        return "<label class='label bg-green'>站长同意竣工</label>"
                    }else if(value == '4'){
                        return "<label class='label bg-red'>建管不同意验收</label>"
                    }else if(value == '5'){
                        return "<label class='label bg-green'>建管同意验收</label>"
                    }
                },supervisor:function (value,row,index) {
                    if(value == '0'){
                        return "<label class='label bg-orange'>未申请中止施工</label>"
                    }else if(value == '1'){
                        return "<label class='label bg-orange'>已申请中止施工并通知副站长</label>"
                    }else if(value == '2'){
                        return "<label class='label bg-orange'>已通知站长</label>"
                    }else if(value == '3'){
                        return "<label class='label bg-green'>站长同意中止施工</label>"
                    }
                }
            }
        }
    };
    return Controller;
});