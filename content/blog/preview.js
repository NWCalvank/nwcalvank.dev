const template = document.createElement("template");

template.innerHTML = `
<style>
    .card {
        display: block;
        background-color: aliceblue;
        margin: 1rem 2rem;
        padding: 0.5rem 2rem;
    }
    .date {
        color: darkslategrey;
        font-weight: 700;
    }
    .description {
        color: darkslategrey;
    }
    .link {
        text-decoration: none;
    }
    .title {
        color: dodgerblue;
    }
</style>

<a id="link" class="link">
    <div class="card">
        <h2 class="title"><slot name="title">MISSING TITLE</slot></h2>
        <p id="date" class="date"></p>
        <p class="description"><slot name="description">MISSING DESCRIPTION</slot></p>
    </div>
</a>
`;

class Preview extends HTMLElement {
    static get observedAttributes() {
        return [ "date", "link", "title"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.date = this.shadowRoot.getElementById("date");
        this.link = this.shadowRoot.getElementById("link");
        this.title = this.shadowRoot.getElementById("title");
    } 

    attributeChangedCallback(attr, oldVal, newVal) {
        if (oldVal === newVal) return;
        switch (attr) {
            case "date":
                this.date.innerHTML = newVal;
                break;
            case "link":
                this.link.href = newVal;
                break;
            case "title":
                this.title.innerHTML = newVal;
                break;
        }
    }

    connectedCallback() {
    if (!this.getAttribute("date")) {
            this.setAttribute("date", "Just Now");
        }
        if (!this.getAttribute("link")) {
            this.setAttribute("link", "not-found");
        }
        if (!this.getAttribute("title")) {
            this.setAttribute("title", "Hello World");
        }
    }
}

window.customElements.define("blog-post-preview", Preview);
