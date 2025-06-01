// Fetch Dropbox-hosted PDF as arrayBuffer
function fetchPDF(urlToPDF) {
  return new Promise((resolve) => {
    fetch(urlToPDF)
      .then((response) => response.blob())
      .then((blob) => resolve(blob.arrayBuffer()));
  });
}

// Safari fix: add arrayBuffer() if missing
(function () {
  if (typeof Blob.prototype.arrayBuffer !== "function") {
    Blob.prototype.arrayBuffer = function () {
      return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.readAsArrayBuffer(this);
      });
    };
  }
})();

// PDF Viewer Initialization
function initializeAdobeViewer() {
  const viewerDiv = document.getElementById("adobe-dc-view");
  if (!viewerDiv || viewerDiv.getAttribute("data-pdf-loaded") === "true") return;

  const dropboxLink = viewerDiv.getAttribute("data-pdf-url");
  if (!dropboxLink) return;

  const urlToPDF = dropboxLink
    .replace("www.dropbox.com", "dl.dropboxusercontent.com")
    .replace("?dl=0", "");

  const adobeDCView = new AdobeDC.View({
    clientId: "YOUR-NEW-API-KEY", // ← Replace this with your actual Adobe API key
    divId: "adobe-dc-view"
  });

  adobeDCView.previewFile({
    content: { promise: fetchPDF(urlToPDF) },
    metaData: { fileName: urlToPDF.split("/").pop() }
  }, {
    embedMode: "IN_LINE",
    defaultViewMode: "FIT_PAGE",
    showDownloadPDF: true,
    showPrintPDF: true,
    showLeftHandPanel: true,
    showAnnotationTools: true
  });

  viewerDiv.setAttribute("data-pdf-loaded", "true");
}

// Run viewer setup after SDK is ready
document.addEventListener("adobe_dc_view_sdk.ready", function () {
  initializeAdobeViewer();

  // Watch for DOM changes (Squarespace AJAX navigation)
  const observer = new MutationObserver(() => {
    initializeAdobeViewer();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Extra fallback on page fully loaded
  document.addEventListener("readystatechange", function () {
    if (document.readyState === "complete") {
      initializeAdobeViewer();
    }
  });
});
