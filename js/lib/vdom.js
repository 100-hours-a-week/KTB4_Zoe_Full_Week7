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