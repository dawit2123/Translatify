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
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "my", name: "Burmese" },
  { code: "ca", name: "Catalan" },
  { code: "zh", name: "Chinese" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "dz", name: "Dzongkha" },
  { code: "en", name: "English" },
  { code: "et", name: "Estonian" },
  { code: "fo", name: "Faroese" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "jv", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "ko", name: "Korean" },
  { code: "ku", name: "Kurdish" },
  { code: "ky", name: "Kyrgyz" },
  { code: "lo", name: "Lao" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Māori" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "ps", name: "Pashto" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sm", name: "Samoan" },
  { code: "gd", name: "Scottish Gaelic" },
  { code: "sr", name: "Serbian" },
  { code: "st", name: "Sesotho" },
  { code: "sn", name: "Shona" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "es", name: "Spanish" },
  { code: "su", name: "Sundanese" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "tl", name: "Tagalog" },
  { code: "tg", name: "Tajik" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "bo", name: "Tibetan" },
  { code: "tr", name: "Turkish" },
  { code: "tk", name: "Turkmen" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "xh", name: "Xhosa" },
  { code: "yi", name: "Yiddish" },
  { code: "yo", name: "Yoruba" },
  { code: "zu", name: "Zulu" }
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
          <option value="">Select a language</option>
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
