(()=>{

let modalToast = document.querySelector("#modal")

setTimeout(()=>{
    let stopEvent = false
    let svgDocument = document.querySelector("#showsvg").getSVGDocument()
    svgDocument.addEventListener("dispatchEventLister",(e)=>{
        e.stopPropagation()
        stopEvent = true
        console.log(e.detail,"e.detail.hazcheeseburger",typeof e.detail.hazcheeseburger)
        if(typeof e.detail.hazcheeseburger === "string" && !e.detail.hazcheeseburger.match(/nodeName('|")(\\s)?:/)){
            createModal(e.detail.hazcheeseburger,e.detail.eventInfo)
        }else{
            requestImg(e.detail.nodeKeyName,e.detail.eventInfo)
        }
        setTimeout(()=>{stopEvent = false},500)
    })
    svgDocument.addEventListener("click",(e)=>{
        if(!stopEvent) clearModalChildNodes(modalToast)

    })
},1000)




function createModal(text,e){
    let temDiv = document.createElement("div")
    temDiv.innerText = text
    createStyle(modalToast,e)
    clearModalChildNodes(modalToast)
    modalToast.append(temDiv)
//    modalToast.
}

function createStyle(temDiv,e){
    temDiv.style.position = "fixed"
    temDiv.style.left = e.offsetX
    temDiv.style.top = e.offsetY

    setTimeout(()=>{
        let scrollTop = document.body.scrollTop
        let scrollLeft = document.body.scrollLeft
        console.log(modalToast.clientHeight,"modalToast")
        temDiv.style.marginTop = -(temDiv.clientHeight + scrollTop ) + "px"
        temDiv.style.marginLeft = -scrollLeft + "px"
    },10)

}


function requestImg(name,e){

    let temDiv = document.createElement("div")

    let imgs = new Image()
    imgs.src = `test-output/${name}.gv.png`
    temDiv.append(imgs)
    clearModalChildNodes(modalToast)
    createStyle(modalToast,e)
    modalToast.append(temDiv)

}


function clearModalChildNodes(modalToast){
    Array.from(modalToast.childNodes).forEach(item=>{
        modalToast.removeChild(item)
    })
}




})()
