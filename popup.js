document.addEventListener("DOMContentLoaded", () => {

    function toggleStatus(enabled, port) {
        chrome.storage.sync.set({enabled: enabled, port: port}, () => {
            toggleUI(enabled, port);
        });
    }

    function toggleUI(enabled, port) {
        const suffix = `${enabled ? "" : "_disabled"}.png`;

        document.querySelector("#enable").checked = enabled;
        document.querySelector("#port").value = port;
        document.querySelector("#port").disabled = enabled;

        chrome.action.setIcon({
            path: {
                "19": "icons/icon19" + suffix,
                "38": "icons/icon38" + suffix,
                "48": "icons/icon48" + suffix
            }
        });
    }

    document.querySelector("#enable").addEventListener("click", function () {
        const port = parseInt(document.querySelector("#port").value) || 80;

        toggleStatus(this.checked, port);
    });

    document.querySelector("#port").addEventListener("input", function () {
        if (/[^0-9]|^0/g.test(this.value)) {
            this.classList.add('error');
        } else {
            this.classList.remove('error');
        }
    });

    document.querySelector("#port").addEventListener("blur", function () {
        this.value = this.value.replace(/[^0-9]|^0/ig, '');
        this.classList.remove('error');
    });

    chrome.storage.sync.get({enabled: true, port: 80}, result => {
        toggleUI(result.enabled, result.port);
    });

});
