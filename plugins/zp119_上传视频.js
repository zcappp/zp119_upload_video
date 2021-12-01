import React from "react"
import css from "../css/zp119_上传视频.css"

function render(ref) {
    if (!ref.props.dbf) return <div>请配置表单字段</div>
    let img = ref.getForm(ref.props.dbf)
    if (img) img = img + "?x-oss-process=video/snapshot,m_fast,t_5000,w_0,ar_auto"
    return <React.Fragment>
        <input onChange={e => onChange(ref, e)} type="file" accept="video/*"/>
        {img || ref.progress ? <div>{ref.progress}</div> : <div>{svg}<label>{ref.props.label || "上传视频"}</label></div>}
        {ref.video ? <video src={ref.video}/> : (img ? <img src={img}/> : "")}
        {img && <i className="zplaybtn"/>}
    </React.Fragment>
}

function onChange(ref, e) {
    const { exc, container, props } = ref
    const file = e.target.files[0]
    if (!file || !file.name) return exc('warn("请选择视频文件")')
    if (file.size / 1048576 > (ref.props.max || 900)) return exc(`warn("文件太大, 请压缩至${ref.props.max || 900}M以下")`)
    ref.video = URL.createObjectURL(file)
    ref.progress = "0%"
    ref.render()
    container.classList.add("uploading")
    exc('upload(file, option)', {
        file,
        option: {
            onProgress: r => {
                ref.progress = r.percent + "%"
                ref.render()
            },
            onSuccess: r => {
                ref.setForm(props.dbf, r.url)
                if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext: ref.ctx, ...r }, () => ref.exc("render()"))
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
    URL.revokeObjectURL(ref.video)
    delete ref.video
    delete ref.progress
    ref.render()
    ref.container.classList.remove("uploading")
}

$plugin({
    id: "zp119",
    props: [{
        prop: "dbf",
        type: "text",
        label: "表单字段"
    }, {
        prop: "onSuccess",
        type: "exp",
        label: "onSuccess表达式"
    }, {
        prop: "max",
        type: "number",
        label: "最大文件大小(单位:MB)",
        ph: "默认最大900MB"
    }, {
        prop: "label",
        type: "text",
        label: "[上传视频]文本"
    }],
    render,
    css
})

const svg = <svg className="zsvg" viewBox="64 64 896 896"><path d="M912 302.3L784 376V224c0-35.3-28.7-64-64-64H128c-35.3 0-64 28.7-64 64v576c0 35.3 28.7 64 64 64h592c35.3 0 64-28.7 64-64V648l128 73.7c21.3 12.3 48-3.1 48-27.6V330c0-24.6-26.7-40-48-27.7zM712 792H136V232h576v560zm176-167l-104-59.8V458.9L888 399v226zM208 360h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H208c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"/></svg>