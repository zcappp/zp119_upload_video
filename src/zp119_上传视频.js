import React from "react"
import css from "./zp119_上传视频.css"

function render(ref) {
    let { props } = ref
    let { dbf, form } = props
    let video
    if (form) {
        ref.form = typeof form == "string" ? ref.excA(form) : form
        if (typeof ref.form == "object") video = ref.form[dbf]
    } else if (ref.getForm) {
        video = ref.getForm(dbf)
    }
    return <React.Fragment>
        {!video && <div className="zp119input"><input onChange={e => onChange(ref, e)} type="file" accept="video/*"/></div>}
        {!video && !ref.file && <div className={props.noLabel ? "zp119noLabel" : ""}><span className="zvideo"><span/></span><label>{props.noLabel ? "" : (props.label || "上传视频")}</label></div>}
        {ref.file || (video && !video.endsWith("mp4")) ? <video src={ref.file || video}/> : (video ? <img onClick={() => preview(ref, video)} src={video + "?x-oss-process=video/snapshot,m_fast,t_5000,w_0,ar_auto"}/> : "")}
        {!!video && <i className="zplaybtn" onClick={() => preview(ref, video)}/>}
        {!!ref.file && <div className="zp119progress">{ref.progress}</div>}
        {!!video && <i onClick={e => {e.stopPropagation(); ref.form ? delete ref.form[dbf] : ref.setForm(dbf, ""); ref.exc('render()')}} className="zp119rm zdel"/>}
        {!!props.url && !ref.file && <span onClick={() => popUrl(ref)}>URL</span>}
        {ref.modal}
    </React.Fragment>
}

function onChange(ref, e) {
    const { exc, props } = ref
    const file = e.target.files[0]
    if (!file || !file.name) return exc('warn("请选择视频文件")')
    if (file.size / 1048576 > (ref.props.max || 900)) return exc(`warn("文件太大, 请压缩至${ref.props.max || 900}M以下")`)
    ref.file = URL.createObjectURL(file)
    ref.progress = "0%"
    ref.render()
    ref.container.classList.add("uploading")
    exc('upload(file, option)', {
        file,
        option: {
            onProgress: r => {
                ref.progress = r.percent + "%"
                ref.render()
            },
            onSuccess: r => {
                ref.form ? ref.form[props.dbf] = r.url : ref.setForm(props.dbf, r.url)
                if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, $val: r.url, ...r }, () => ref.exc("render()"))
                clean(ref)
            },
            onError: r => {
                exc(`alert("上传出错了", r.error)`, { r })
                clean(ref)
            }
        }
    })
}

function clean(ref) {
    URL.revokeObjectURL(ref.file)
    delete ref.file
    delete ref.progress
    ref.render()
    ref.container.classList.remove("uploading")
}

function popUrl(ref) {
    ref.modal = <div className="zmodals">
        <div className="zmask" onClick={() => close(ref)}/>
        <div className="zmodal">
            <i onClick={() => close(ref)} className="zdel"/>
            <h3 className="hd">通过URL上传</h3>
            <div className="bd"><input placeholder="输入视频URL" className="zinput"/></div>
            <div className="ft">
                <div className="zbtn" onClick={() => close(ref)}>取消</div>
                <div className="zbtn main" onClick={() => upload(ref)}>上传</div>
            </div>
        </div>
    </div>
    ref.render()
    setTimeout(() => {
        $(".zp119 .zmodals").classList.add("open")
        $(".zp119 .zmodal input").focus()
    }, 99)
}

function preview(ref, video) {
    if (!video) return
    ref.modal = <div className="zmodals">
        <div className="zmask" onClick={() => close(ref)}/>
        <div className="zmodal">
            <i onClick={() => close(ref)} className="zdel"/>
            <h3 className="hd">{ref.props.dbf}</h3>
            <div className="zcenter"><video src={video} preload="metadata" controls/></div>
        </div>
    </div>
    ref.render()
    setTimeout(() => $(".zp119 .zmodals").classList.add("open"), 99)
}

function close(ref) {
    ref.modal = ""
    ref.render()
}

function upload(ref) {
    const { props, exc } = ref
    let url = $(".zp119 .zmodal input").value
    if (!url) return exc('alert("请输入视频URL")')
    exc('info("正在上传，请稍候")')
    close(ref)
    exc('$resource.uploads(urls, "v")', { urls: [url] }, r => {
        if (!r || r.ng.length) exc(`alert("上传出错了", reason)`, { reason: r ? r.ng[0].reason : "" })
        if (r.arr.length) {
            const o = r.arr[0]
            ref.form ? ref.form[props.dbf] = o.url : ref.setForm(props.dbf, o.url)
            if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, $val: o.url, ...o }, () => exc("render()"))
        }
    })
}

$plugin({
    id: "zp119",
    props: [{
        prop: "dbf",
        label: "字段名",
        ph: "必填"
    }, {
        prop: "form",
        label: "字段容器",
        ph: "如不填则使用祖先节点的表单容器"
    }, {
        prop: "max",
        type: "number",
        label: "最大文件大小(单位:MB)",
        ph: "默认最大900MB"
    }, {
        prop: "noLabel",
        type: "switch",
        label: "不显示文本"
    }, {
        prop: "label",
        label: "[上传视频] 文本",
        show: "!P.noLabel"
    }, {
        prop: "url",
        type: "switch",
        label: "允许通过URL上传"
    }, {
        prop: "onSuccess",
        type: "exp",
        label: "上传成功表达式",
        ph: "$val"
    }],
    render,
    css
})