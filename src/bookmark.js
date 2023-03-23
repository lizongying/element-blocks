(function () {
    const getLeft = e => {
        let l = e.offsetLeft
        let p = e.offsetParent
        while (p != null) {
            l += p.offsetLeft
            p = p.offsetParent
        }
        return l
    }

    const getTop = e => {
        let t = e.offsetTop
        let p = e.offsetParent
        while (p != null) {
            t += p.offsetTop
            p = p.offsetParent
        }
        return t
    }

    const getElementFromXpath = xpath => {
        const evaluator = new XPathEvaluator()
        const expression = evaluator.createExpression(xpath)
        const result = expression.evaluate(document, XPathResult.STRING_TYPE)
        if (!result) {
            return ''
        }
        return result.stringValue.trim()
    }

    const getTagIndex = el => {
        const tag = el.tagName.toLowerCase();
        const elements = el.parentNode.childNodes
        let index = 0
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].nodeType !== Node.ELEMENT_NODE || elements[i].tagName.toLowerCase() !== tag) {
                continue
            }
            index++
            if (elements[i] === el) {
                break
            }
        }
        return index
    }

    const getXpath = element => {
        const value = element.textContent.trim()
        let xpath = ''

        for (let x = 1; x < 10; x++) {
            let el = element
            for (let i = 0; el && el.nodeType === Node.ELEMENT_NODE; el = el.parentNode) {
                i++
                const tag = el.tagName.toLowerCase();
                if (i < x) {
                    const index = getTagIndex(el)
                    if (index > 1) {
                        xpath = '/' + tag + '[' + index + ']' + xpath
                        continue
                    }
                }
                xpath = '/' + tag + xpath
            }
            xpath = 'string(/' + xpath + ')'
            if (getElementFromXpath(xpath) === value) {
                break
            }
            xpath = ''
        }

        return xpath
    }

    const res = {
        'eb-image': '',
        'eb-title': '',
        'eb-title-xpath': '',
        'eb-price': '',
        'eb-price-xpath': '',
        'eb-description': '',
        'eb-description-xpath': '',
    }
    const choiceDisplay = new Set()
    choiceDisplay.add('eb-title')
    choiceDisplay.add('eb-price')
    choiceDisplay.add('eb-description')
    const minWidth = 100
    const minHeight = 100
    let element = document.body

    const styleEl = document.createElement('style')
    document.head.appendChild(styleEl)
    styleEl.sheet.insertRule('.eb-element-shadow {box-shadow: 0 0 0 3px orange;}')
    styleEl.sheet.insertRule('.eb-tips {position: fixed; top: 0; z-index: 99999999; background-color: white; opacity: 1; padding: 10px; width: 420px; font-size: 16px;}')
    styleEl.sheet.insertRule('.eb-left {left: 0;}')
    styleEl.sheet.insertRule('.eb-right {right: 0;}')
    styleEl.sheet.insertRule('.eb-tips, .eb-tips label, .eb-tips input, .eb-tips textarea, .eb-tips span, .eb-choice ul li, .eb-tips pre {margin: 0; font-size: 1em; line-height: 1.5em; color: black; font-family: CenturyGothic, Helvetica, Tahoma, Arial, sans-serif; font: CenturyGothic, Helvetica, Tahoma, Arial, sans-serif;-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; text-transform: none; letter-spacing: normal; background-color: white;}')
    styleEl.sheet.insertRule('.eb-tips label, .eb-tips input, .eb-tips textarea, .eb-tips span {padding: 0; display: inline-block; vertical-align: top;}')
    styleEl.sheet.insertRule('.eb-tips input, .eb-tips label, .eb-tips span {min-height: 1.5em; height: 1.5em;}')
    styleEl.sheet.insertRule('.eb-tips span {font-weight: normal; cursor: pointer; margin-left: 5px; visibility: hidden}')
    styleEl.sheet.insertRule('.eb-tips label {width: 70px; font-weight: bold; cursor: default;}')
    styleEl.sheet.insertRule('.eb-tips input, .eb-tips textarea {font-weight: normal; padding: 0; width: 315px; border: none; outline: none; box-shadow: none;}')
    styleEl.sheet.insertRule('.eb-tips textarea {resize: none;}')
    styleEl.sheet.insertRule('.eb-tips textarea, .eb-tips textarea:focus {height: 6em; min-height: 6em;}')
    styleEl.sheet.insertRule('.eb-tips input:focus, .eb-tips textarea:focus {border: none; outline: none; box-shadow: none; background-color: white;}')
    styleEl.sheet.insertRule('.eb-tips .image {padding: 0; margin: 0; text-align: center; border-style: none; box-shadow: none;}')
    styleEl.sheet.insertRule('.eb-tips img {display: block; margin: 0 auto; max-width: 400px; max-height: 400px; vertical-align: baseline; border-style: none; box-shadow: none;}')
    styleEl.sheet.insertRule('.eb-tips .eb-move, .eb-tips .eb-close {display: inline-block; cursor: pointer; font-weight: bold; width: 200px; height: 1.5em;}')
    styleEl.sheet.insertRule('.eb-tips .eb-close {text-align: right;}')
    styleEl.sheet.insertRule('.eb-choice {position: absolute; z-index: 88888888; background-color: white; padding: 10px; display: none; font-size: 1em;}')
    styleEl.sheet.insertRule('.eb-choice ul {padding: 0; margin: 0;}')
    styleEl.sheet.insertRule('.eb-choice ul li {list-style-type:none; font-weight: normal; cursor: pointer;}')
    styleEl.sheet.insertRule('.eb-tips span:hover, .eb-tips .eb-move:hover, .eb-tips .eb-close:hover, .eb-choice ul li:hover {color: green;}')
    styleEl.sheet.insertRule('.eb-tips pre {overflow: auto;}')

    const divTips = document.createElement('div')
    divTips.className = 'eb-tips eb-right eb-ignore'
    divTips.innerHTML = `
<div class="eb-move eb-ignore"><-</div><div class="eb-close eb-ignore">close</div>
<div class="image"><img alt="" src=""/></div>
<label class="eb-ignore" for="eb-title-show">Title:</label><input class="eb-ignore" type="text" readonly id="eb-title-show" value=""/><span class="eb-ignore" data-id="eb-title">x</span><br>
<label class="eb-ignore" for="eb-price-show">Price:</label><input class="eb-ignore" type="text" readonly id="eb-price-show" value=""/><span class="eb-ignore" data-id="eb-price">x</span><br>
<label class="eb-ignore" for="eb-description-show">Descr:</label><textarea class="eb-ignore" readonly id="eb-description-show"/></textarea><span class="eb-ignore" data-id="eb-description">x</span><br>
<pre class="eb-ignore"></pre>`
    divTips.querySelectorAll('span').forEach(v => {
        v.onclick = _ => {
            const dataId = v.getAttribute('data-id')
            divTips.querySelector('#' + dataId + '-show').value = ''
            divChoice.querySelector('#' + dataId).style.display = 'block'
            choiceDisplay.add(dataId)
            res[dataId] = ''
            divTips.querySelector('pre').innerHTML = JSON.stringify(res, null, '\t')
            v.style.visibility = 'hidden'
        }
    })
    divTips.querySelector('.eb-close').onclick = _ => {
        document.body.removeChild(divTips)
        if (divChoice) {
            document.body.removeChild(divChoice)
        }
        document.head.removeChild(styleEl)
        const bookmark = document.body.querySelector('#eb-bookmark')
        if (bookmark) {
            document.body.removeChild(bookmark)
        }
    }
    divTips.querySelector('.eb-move').onclick = e => {
        const target = e.target
        if (target.innerText === '<-') {
            target.innerText = '->'
            divTips.classList.remove('eb-right')
            divTips.classList.add('eb-left')
        } else {
            target.innerText = '<-'
            divTips.classList.remove('eb-left')
            divTips.classList.add('eb-right')
        }
    }
    document.body.appendChild(divTips)

    const divChoice = document.createElement('div')
    divChoice.className = 'eb-choice eb-ignore'
    divChoice.innerHTML = `
<ul class="eb-ignore">
<li id="eb-title" class="eb-ignore">title
<li id="eb-price" class="eb-ignore">price
<li id="eb-description" class="eb-ignore">description`
    divChoice.querySelectorAll('li').forEach(v => {
        v.onclick = _ => {
            divChoice.style.display = 'none'
            const dataId = 'eb-' + v.innerText.trim()

            const xpath = getXpath(element)
            if (xpath) {
                res[dataId + '-xpath'] = xpath
                divTips.querySelector('pre').innerHTML = JSON.stringify(res, null, '\t')
                localStorage.setItem(dataId, xpath);
            } else {
                console.log('xpath err', dataId, document.location.origin)
            }

            let value = element.textContent.trim()
            if (value) {
                let index = value.indexOf('$')
                if (index < 0) {
                    index = value.indexOf('£')
                }
                if (index < 0) {
                    index = value.indexOf('€')
                }
                if (dataId === 'eb-price' && index > 0) {
                    value = value.slice(index)
                }
                res[dataId] = value
                divTips.querySelector('pre').innerHTML = JSON.stringify(res, null, '\t')
                console.log('res', res)
                divTips.querySelector('#' + dataId + '-show').value = value
                divTips.querySelector('span[data-id="' + dataId + '"]').style.visibility = 'visible'
                v.style.display = 'none'
                choiceDisplay.delete(dataId)
            }
        }
    })
    document.body.appendChild(divChoice)

    const image = document.head.querySelector('meta[property="og:image"]')
    let src = ''
    if (image) {
        src = image.getAttribute('content')
    } else {
        let images = []
        let body = document.body
        const main = document.body.querySelector('main')
        if (main) {
            body = main
        }
        body.querySelectorAll('img').forEach(v => {
            const size = Math.floor(v.width * v.height / 10000)
            if (size) {
                images.push({element: v, size: size})
            }
        })
        images.sort((a, b) => {
            return b.size - a.size
        })
        if (images.length > 0) {
            const el = images[0].element
            src = el.currentSrc || el.src
            if (!src && el.getAttribute('data-src')) {
                src = el.getAttribute('data-src')
                src = src.replace('{width}', '1000')
                src = src.replace('{height}', '1000')
            }
        }
    }
    if (src) {
        if (src.indexOf('//') === 0) {
            src = document.location.protocol + src
        } else {
            if (src.indexOf('/') === 0) {
                src = document.location.origin + src
            }
        }
        divTips.querySelector('img').setAttribute('src', src)
        res['eb-image'] = src
        divTips.querySelector('pre').innerHTML = JSON.stringify(res, null, '\t')
    }
    const title = document.head.querySelector('meta[property="og:title"]')
    let titleValue = ''
    if (title) {
        titleValue = title.getAttribute('content')
    } else {
        const xpath = localStorage.getItem('eb-title')
        if (xpath) {
            res['eb-title-xpath'] = xpath
            titleValue = getElementFromXpath(xpath)
            if (!titleValue) {
                console.log('xpath err', 'eb-title', document.location.origin)
            }
        }
    }
    if (titleValue) {
        divTips.querySelector('#eb-title-show').value = titleValue
        divTips.querySelector('span[data-id="eb-title"]').style.visibility = 'visible'
        res['eb-title'] = titleValue
        divChoice.querySelector('#eb-title').style.display = 'none'
        choiceDisplay.delete('eb-title')
        divTips.querySelector('pre').innerHTML = JSON.stringify(res, null, '\t')
    }
    const description = document.head.querySelector('meta[property="og:description"]')
    let descriptionValue = ''
    if (description) {
        descriptionValue = description.getAttribute('content')
    } else {
        const xpath = localStorage.getItem('eb-description')
        if (xpath) {
            res['eb-description-xpath'] = xpath
            descriptionValue = getElementFromXpath(xpath)
            if (!descriptionValue) {
                console.log('xpath err', 'eb-description', document.location.origin)
            }
        }
    }
    if (descriptionValue) {
        divTips.querySelector('#eb-description-show').value = descriptionValue
        divTips.querySelector('span[data-id="eb-description"]').style.visibility = 'visible'
        res['eb-description'] = descriptionValue
        divChoice.querySelector('#eb-description').style.display = 'none'
        choiceDisplay.delete('eb-description')
        divTips.querySelector('pre').innerHTML = JSON.stringify(res, null, '\t')
    }
    let amount = document.head.querySelector('meta[property="og:price:amount"]')
    let currency = document.head.querySelector('meta[property="og:price:currency"]')
    if (!amount) {
        amount = document.head.querySelector('meta[property="product:price:amount"]')
    }
    if (!currency) {
        currency = document.head.querySelector('meta[property="product:price:currency"]')
    }
    let priceValue = ''
    if (amount && currency) {
        priceValue = currency.getAttribute('content') + amount.getAttribute('content')
    } else {
        const xpath = localStorage.getItem('eb-price')
        if (xpath) {
            res['eb-price-xpath'] = xpath
            priceValue = getElementFromXpath(xpath)
            if (!priceValue) {
                console.log('xpath err', 'eb-price', document.location.origin)
            } else {
                let index = priceValue.indexOf('$')
                if (index < 0) {
                    index = value.indexOf('£')
                }
                if (index < 0) {
                    index = value.indexOf('€')
                }
                if (index > 0) {
                    priceValue = priceValue.slice(index)
                }
            }
        }
    }
    if (priceValue) {
        priceValue = priceValue.replace('USD', '$')
        priceValue = priceValue.replace('GBP', '£')
        priceValue = priceValue.replace('EUR', '€')
        divTips.querySelector('#eb-price-show').value = priceValue
        divTips.querySelector('span[data-id="eb-price"]').style.visibility = 'visible'
        res['eb-price'] = priceValue
        divChoice.querySelector('#eb-price').style.display = 'none'
        choiceDisplay.delete('eb-price')
        divTips.querySelector('pre').innerHTML = JSON.stringify(res, null, '\t')
    }

    document.body.onmousemove = e => {
        const elementNew = e.target
        if (elementNew === element) {
            return
        }
        if (elementNew === document.body) {
            return
        }
        if (elementNew.classList.contains('eb-ignore')) {
            return
        }
        divChoice.style.display = 'none'
        element.classList.remove('eb-element-shadow')
        element = elementNew
        element.classList.add('eb-element-shadow')
        element.oncontextmenu = e1 => {
            e1.preventDefault()
            if (!choiceDisplay.size) {
                return
            }
            divChoice.style.left = getLeft(element) + 'px'
            divChoice.style.top = getTop(element) + 'px'
            if (minWidth < element.offsetWidth) {
                divChoice.style.width = element.offsetWidth + 'px'
            } else {
                divChoice.style.width = minWidth.toString()
            }
            if (minHeight < element.offsetHeight) {
                divChoice.style.height = element.offsetHeight + 'px'
            } else {
                divChoice.style.height = minHeight.toString()
            }
            divChoice.style.display = 'block'
        }
    }
})()