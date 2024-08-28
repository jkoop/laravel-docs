const markdownFiles = [];

(async () => {
    console.log("Fetch index...");
    const index = await fetch("../?json").then(r => r.json());

    console.log("Fetch files...");
    let files = [];
    for (const file of index.paths) {
        if (file.path_type != 'File' || !file.name.endsWith('.md')) continue;
        files.push({ name: file.name, content: fetch("../" + file.name).then(r => r.text()) });
    }

    console.log("Filter files...");
    for (const index in files) {
        if (fileFilter(files[index].name)) {
            continue;
        } else {
            delete files[index];
        }
    }

    console.log("Sort files...");
    for (let file of files) {
        if (file == undefined) continue;
        file.content = await file.content;
        file.title = file.content.split("\n").filter(line => line.startsWith("# "))[0]?.slice(2).trim();
    }
    files.sort((a, b) => (fileSort(a.name, a.title) + "").localeCompare(fileSort(b.name, b.title) + ""));

    console.log("Call fileMdProcessor() on each file...");
    for (let file of files) {
        if (file == undefined) continue;
        file.content = fileMdProcessor(file.name, file.content);
    }

    console.log("Convert Markdown to HTML...");
    files = files.map(file => CmarkGFM.convert(file.content)).join("\n\n");

    console.log("Copy HTML to the DOM...");
    document.body.innerHTML = files;

    console.log("Call fileHtmlProcessor()...");
    fileHtmlProcessor();

    console.log("Done! Calling PagedJS...");
    var pagesScript = document.createElement('script');
    pagesScript.setAttribute('src', 'https://unpkg.com/pagedjs/dist/paged.polyfill.js');
    document.head.appendChild(pagesScript);
})();
