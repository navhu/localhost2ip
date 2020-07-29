document.addEventListener("DOMContentLoaded", () => {

    function toggleStatus(enabled) {
        chrome.storage.sync.set({enabled: enabled}, () => {
            toggleUI(enabled);
        });
    }

    function toggleUI(enabled) {
        const suffix = `${enabled ? "" : "_disabled"}.png`;

        document.querySelector("#enable").checked = enabled;

        chrome.browserAction.setIcon({
            path: {
                "19": "icons/icon19" + suffix,
                "38": "icons/icon38" + suffix,
                "48": "icons/icon48" + suffix
            }
        });
    }

    document.querySelector("#enable").addEventListener("click", function () {
        toggleStatus(this.checked);
    });

    chrome.storage.sync.get({enabled: true}, result => {
        toggleUI(result.enabled);
    });

});
