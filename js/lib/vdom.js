export function h(type, props, ...children) {
    return { 
        type,
        props: props ?? {},
        children: children.flat().filter((child) =>child !== null && child !== undefined && child !== false),
     }
}

function createElement(vNode) {
    if (vNode === null || vNode === undefined || vNode === false) {
        return document.createTextNode("");
    }

    if (typeof vNode === "string" || typeof vNode === "number") {
        return document.createTextNode(String(vNode));
    }

    const element = document.createElement(vNode.type);

    Object.entries(vNode.props ?? {}).forEach(([name, value]) => {
        if(name.startsWith('on') && typeof value === "function"){
            element[name.toLowerCase()] = value;
            return;
        }
        element.setAttribute(name, value);
    });

    (vNode.children ?? []).forEach((child) => {
        element.appendChild(createElement(child));
    });

    return element;
}

export function render(vNode, container) {
    container.replaceChildren(createElement(vNode));
}

export function updateElement (parent, newNode, oldNode, index=0) {

    if (newNode == null && oldNode != null) {
        return parent.removeChild(parent.childNodes[index]);
    }

    if (newNode != null && oldNode == null) {
        const newElement = createElement(newNode);
        const referenceNode = parent.childNodes[index] ?? null;

        return parent.insertBefore(
            newElement,
            referenceNode
        );
    }

    if ((typeof newNode === "string" && typeof oldNode === "string")||(typeof newNode === "number" && typeof oldNode === "number")) {
        if (newNode === oldNode) return;
        return parent.replaceChild(
            createElement(newNode),
            parent.childNodes[index]
        )
    }

    if (typeof newNode !== typeof oldNode) {
        return parent.replaceChild(
            createElement(newNode),
            parent.childNodes[index]
        )
    }

    updateAttributes(
        parent.childNodes[index],
        newNode.props || {},
        oldNode.props || {}
    );

    const commonLength = Math.min(oldNode.children.length, newNode.children.length);

    for (let i=0; i<commonLength; i++) {
        updateElement(
            parent.childNodes[index],
            newNode.children[i],
            oldNode.children[i],
            i
        )
    }

    for (let i=oldNode.children.length-1; i>=commonLength; i--) {
        updateElement(
            parent.childNodes[index],
            undefined,
            oldNode.children[i],
            i
        );
    }

    for (let i=commonLength; i<newNode.children.length; i++) {
        updateElement(
            parent.childNodes[index],
            newNode.children[i],
            undefined,
            i
        );
    }



}

function updateAttributes(target, newProps, oldProps) {
    for (let [attribute, value] of Object.entries(newProps)) {
        if (oldProps[attribute] === newProps[attribute]) continue;
        target.setAttribute(attribute,value);
    }

    for (let [attribute,value] of Object.entries(newProps)) {
        if (newProps[attribute] !== undefined) continue;
        target.removeAttribute(attribute);
    }

}