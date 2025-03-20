import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { FaCloudUploadAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ko", name: "Korean" },
  // Add more languages as needed
];

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [format, setFormat] = useState("pdf");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !targetLang || !format) {
      toast.error("Please select a file, target language, and format");
      return;
    }
  
    setLoading(true);
    setDownloadUrl(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceLanguage", sourceLang);
    formData.append("targetLanguage", targetLang);
  
    try {
      const response = await axios.post("http://localhost:5000/api/translate", formData);
      toast.success("Translation complete");
      const translatedFileUrl = `http://localhost:5000${response.data.downloadUrl}`;
      setDownloadUrl(translatedFileUrl);
    } catch (error) {
      toast.error("Error in translation");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!downloadUrl || !format) {
      toast.error("Please select a download format");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${downloadUrl}`);
      console.log('response', response)
      let fileData = response.data;
      let mimeType = "text/plain";
      let fileExtension = "txt";
      console.log('file data', fileData)
  
      // Convert to selected format
      if (format === "csv") {
        fileData = fileData.split("\n").join(",");
        mimeType = "text/csv";
        fileExtension = "csv";
      } else if (format === "xml") {
        fileData = `<root>\n${fileData.split("\n").map(line => `  <item>${line}</item>`).join("\n")}\n</root>`;
        mimeType = "application/xml";
        fileExtension = "xml";
      } else if (format === "excel") {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Translated Data");
        fileData.split("\n").forEach((line, index) => {
          worksheet.getCell(`A${index + 1}`).value = line;
        });
  
        const excelBuffer = await workbook.xlsx.writeBuffer();
        fileData = excelBuffer;
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileExtension = "xlsx";
      } else if (format === "pdf") {
        const doc = new jsPDF();
        const lines = fileData.split("\n");
  
        lines.forEach((line, index) => {
          doc.text(line, 10, 10 + index * 10);
        });
  
        fileData = doc.output("blob");
        mimeType = "application/pdf";
        fileExtension = "pdf";
      }
  
      // Create a download link
      const blob = new Blob([fileData], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translated.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log('error', error)
      toast.error("Error downloading file");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl text-white font-bold mb-6">Translatify - AI Translation</h1>
      <form className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md" onSubmit={handleSubmit}>
        <label className="block text-gray-700 font-medium mb-2">Upload File</label>
        <div className="border-2 border-dashed p-4 rounded-lg flex flex-col items-center justify-center mb-4 bg-gray-100">
  <FaCloudUploadAlt size={40} className="text-gray-500 mb-2" />
  <input type="file" onChange={handleFileChange} className="hidden" id="fileUpload" />
  <label htmlFor="fileUpload" className="text-sm text-gray-600 cursor-pointer">Choose a file</label>
  {file && <p className="mt-2 text-sm text-gray-700">Selected file: {file.name}</p>}
        </div>

        <label className="block text-gray-700 font-medium mb-2">Source Language</label>
        <select
          className="w-full p-2 border rounded-lg mb-4"
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
        >
          <option value="auto">Detect Language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <label className="block text-gray-700 font-medium mb-2">Target Language</label>
        <select
          className="w-full p-2 border rounded-lg mb-4"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option value="">Select Language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? <ClipLoader color="white" size={20} /> : "Translate"}
        </button>
      </form>
      <ToastContainer />

      {downloadUrl && (
        <div className="mt-4">
          <label className="block text-white font-medium mb-2">Select Download Format</label>
          <select
            className="w-full p-2 border rounded-lg mb-4"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="xml">XML</option>
            <option value="xlsx">Excel</option>
          </select>
          <button
            onClick={handleDownload}
            className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
          >
            {loading ? <ClipLoader color="white" size={20} /> : "Download Translated File"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
