const fs = require('fs');

async function test() {
    const buffer = fs.readFileSync('demo_documents/PAN_Card_Verification.pdf');
    const formData = new FormData();
    const fileBlob = new File([buffer], "PAN_Card_Verification.pdf", { type: "application/pdf" });
    formData.append('file', fileBlob);
    formData.append('document_type', "PAN");
    
    const aiUrl = 'http://127.0.0.1:8001/api/ai/document-extract';
    const res = await fetch(aiUrl, {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

test();
