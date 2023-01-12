import React from "react"
import css from "../css/zp119_上传视频.css"

function render(ref) {
    if (!ref.props.dbf) return <div>{camera}<label>请配置表单字段</label></div>
    let video = ref.getForm(ref.props.dbf)
    return <React.Fragment>
        {!video && !ref.video && <div>{camera}<label>{ref.props.label || "上传视频"}</label></div>}
        <div className="zp119input"><input onChange={e => onChange(ref, e)} type="file" accept="video/*"/></div>
        {!!ref.progress && <div className="zp119progress">{ref.progress}</div>}
        {ref.video || (video && !video.endsWith("mp4")) ? <video src={ref.video}/> : (video ? <img onClick={() => popVideo(ref, video)} src={video + "?x-oss-process=video/snapshot,m_fast,t_5000,w_0,ar_auto"}/> : "")}
        {!!video && <i className="zplaybtn" onClick={() => popVideo(ref, video)}/>}
        {!!video && <svg onClick={e => {e.stopPropagation(); ref.setForm(ref.props.dbf, ""); ref.exc('render()')}} className="zp119rm zsvg" viewBox="64 64 896 896"><path d={remove}/></svg>}
        {!!ref.props.url && !ref.video && <span onClick={() => popUrl(ref)}>URL</span>}
        {ref.modal}
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
                if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, ...r }, () => ref.exc("render()"))
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

function popUrl(ref) {
    ref.modal = <div className="zmodals">
        <div className="zmask" onClick={() => close(ref)}/>
        <div className="zmodal">
            <svg onClick={() => close(ref)} className="zsvg" viewBox="64 64 896 896"><path d={remove}/></svg>
            <div className="zmodal-hd">通过URL上传</div>
            <div className="zmodal-bd"><input placeholder="输入视频URL" className="zinput"/></div>
            <div className="zmodal-ft">
                <div className="zbtn" onClick={() => close(ref)}>取消</div>
                <div className="zbtn zprimary" onClick={() => upload(ref)}>上传</div>
            </div>
        </div>
    </div>
    ref.render()
    setTimeout(() => $(".zp119 .zmodal input").focus(), 9)
}

function popVideo(ref, video) {
    if (!video) return
    ref.modal = <div className="zmodals">
        <div className="zmask" onClick={() => close(ref)}/>
        <div className="zmodal">
            <svg onClick={() => close(ref)} className="zsvg" viewBox="64 64 896 896"><path d={remove}/></svg>
            <div className="zmodal-hd">{ref.props.dbf}</div>
            <div className="zcenter"><video src={video} preload="metadata" controls/></div>
        </div>
    </div>
    ref.render()
}

function close(ref) {
    ref.modal = ""
    ref.render()
}

function upload(ref) {
    const { exc } = ref
    let url = $(".zp119 .zmodal input").value
    if (!url) return exc('alert("请输入视频URL")')
    exc('info("正在上传，请稍候")')
    close(ref)
    exc('$resource.uploads(urls, "v")', { urls: [url] }, r => {
        if (!r || r.ng.length) exc(`alert("上传出错了", reason)`, { reason: r ? r.ng[0].reason : "" })
        if (r.arr.length) {
            ref.setForm(ref.props.dbf, r.arr[0].url)
            if (ref.props.onSuccess) exc(ref.props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, ...r.arr[0] }, () => exc("render()"))
            exc('render()')
        }
    })
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
    }, {
        prop: "url",
        type: "switch",
        label: "允许通过URL上传"
    }],
    render,
    css
})

const camera = <svg className="zsvg zp119camera" viewBox="64 64 896 896"><path d="M912 302.3L784 376V224c0-35.3-28.7-64-64-64H128c-35.3 0-64 28.7-64 64v576c0 35.3 28.7 64 64 64h592c35.3 0 64-28.7 64-64V648l128 73.7c21.3 12.3 48-3.1 48-27.6V330c0-24.6-26.7-40-48-27.7zM712 792H136V232h576v560zm176-167l-104-59.8V458.9L888 399v226zM208 360h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H208c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"/></svg>
const remove = "M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"