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
  console.log("📄 Adobe Viewer initializing...");

  const viewerDiv = document.getElementById("adobe-dc-view");
  if (!viewerDiv) {
    console.log("❌ adobe-dc-view div not found.");
    return;
  }

  if (viewerDiv.getAttribute("data-pdf-loaded") === "true") {
    console.log("⏭ Viewer already loaded. Skipping.");
    return;
  }

  const dropboxLink = viewerDiv.getAttribute("data-pdf-url");
  console.log("🔗 Dropbox Link:", dropboxLink);

  if (!dropboxLink) {
    console.log("❌ No Dropbox link found in data-pdf-url attribute.");
    return;
  }

  const urlToPDF = dropboxLink
    .replace("www.dropbox.com", "dl.dropboxusercontent.com")
    .replace("?dl=0", "");
  console.log("✅ Transformed PDF URL:", urlToPDF);

  const adobeDCView = new AdobeDC.View({
    clientId: "3ab6c765d35c454aa9aeaa529c56eafd", // ← Replace this if needed
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
  console.log("✅ Adobe Viewer initialized and marked as loaded.");
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
